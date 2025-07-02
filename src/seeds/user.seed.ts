import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from '../entities/auth/user.entity';
import { Role } from '../entities/auth/role.entity';
import { UserRole } from '../entities/auth/user.role.entity';

@Injectable()
export class UserSeed {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  async seed(): Promise<void> {
    console.log('🌱 Starting user seeding...');

    // Tìm role ADMIN
    const adminRole = await this.roleRepository.findOne({
      where: { name: 'ADMIN' },
    });

    if (!adminRole) {
      console.log('⚠️  ADMIN role not found, skipping user seeding...');
      return;
    }

    // Kiểm tra xem user admin đã tồn tại chưa
    const existingAdmin = await this.userRepository.findOne({
      where: { username: 'admin' },
    });

    if (!existingAdmin) {
      // Tạo user admin mặc định
      const hashedPassword = await bcrypt.hash('123456', 10);

      const adminUser = this.userRepository.create({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@example.com',
        isActive: true,
      });

      const savedAdminUser = await this.userRepository.save(adminUser);

      // Gán role ADMIN cho user
      const userRole = this.userRoleRepository.create({
        user: savedAdminUser,
        role: adminRole,
      });

      await this.userRoleRepository.save(userRole);
      console.log('✅ Created admin user: admin (password: 123456)');
    } else {
      console.log('⏭️  Admin user already exists, skipping...');
    }

    console.log('🎉 User seeding completed!');
  }

  async clear(): Promise<void> {
    console.log('🗑️  Clearing all users...');
    await this.userRepository.clear();
    console.log('✅ All users cleared!');
  }
}
