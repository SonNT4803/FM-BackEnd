import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/auth/role.entity';

@Injectable()
export class RoleSeed {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async seed(): Promise<void> {
    console.log('🌱 Starting role seeding...');

    const defaultRoles = [
      { name: 'ADMIN' },
      { name: 'TEACHER' },
      { name: 'STUDENT' },
    ];

    for (const roleData of defaultRoles) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: roleData.name },
      });

      if (!existingRole) {
        const newRole = this.roleRepository.create(roleData);
        await this.roleRepository.save(newRole);
        console.log(`✅ Created role: ${roleData.name}`);
      } else {
        console.log(`⏭️  Role ${roleData.name} already exists, skipping...`);
      }
    }

    console.log('🎉 Role seeding completed!');
  }

  async clear(): Promise<void> {
    console.log('🗑️  Clearing all roles...');
    await this.roleRepository.clear();
    console.log('✅ All roles cleared!');
  }
}
