import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { UserDTO } from 'src/auth/dto/user.dto';
import { Role } from 'src/entities/auth/role.entity';
import { User } from 'src/entities/auth/user.entity';
import { UserRole } from 'src/entities/auth/user.role.entity';
import { Teacher } from 'src/entities/teacher.entity';
import { RolePermissionService } from 'src/role-permission/role-permission.service';
import { UserRoleService } from 'src/user-role/user-role.service';
import { Repository } from 'typeorm';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    private readonly userRoleService: UserRoleService,
    private readonly rolePermissionService: RolePermissionService,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: UserDTO[]; total: number }> {
    const [users, total] = await this.userRepository.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
    });

    // Ánh xạ từng user sang UserDTO
    const data: UserDTO[] = await Promise.all(
      users.map(async (user) => {
        const userRoles = await this.userRoleService.findUserRoleById(user.id);
        const roles = userRoles.map((userRole) => userRole.role.name);

        const permissions =
          await this.rolePermissionService.findPermissionsByRoles(
            userRoles.map((userRole) => userRole.role.id),
          );
        return {
          id: user.id,
          username: user.username,
          roles,
          email: user.email,
          permissions: permissions,
        };
      }),
    );

    return {
      data,
      total,
    };
  }

  async createUser(
    username: string,
    password: string,
    roleId: number,
  ): Promise<User> {
    // Tìm xem role có tồn tại không
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });

    if (!role) {
      throw new Error(`Role with ID ${roleId} does not exist`);
    }

    const user = this.userRepository.create({
      username,
      password,
      email: username + '@example.com',
    });
    const savedUser = await this.userRepository.save(user);

    const userRole = this.userRoleRepository.create({
      user: savedUser,
      role: role,
    });

    await this.userRoleRepository.save(userRole);

    // Nếu roleId là 2, tạo thêm Teacher
    if (roleId === 2) {
      const teacher = this.teacherRepository.create({
        userId: user.id,
        email: user.email,
        name: user.username,
        birthdate: '2004-11-05',
        working_date: new Date(),
      });

      await this.teacherRepository.save(teacher);
    }

    return savedUser;
  }

  async updateUser(
    userId: number,
    username?: string,
    password?: string,
    roleId?: number,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} does not exist`);
    }

    if (roleId) {
      const role = await this.roleRepository.findOne({
        where: { id: roleId },
      });

      if (!role) {
        throw new Error(`Role with ID ${roleId} does not exist`);
      }

      let userRole = await this.userRoleRepository.findOne({
        where: { user: user },
      });

      if (userRole) {
        userRole.role = role;
      } else {
        userRole = this.userRoleRepository.create({
          user: user,
          role: role,
        });
      }
      await this.userRoleRepository.save(userRole);
    }

    if (username) user.username = username;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }
    return this.userRepository.save(user);
  }

  async findUserById(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findUserByUsername(username: string): Promise<User> {
    return this.userRepository.findOne({
      where: { username },
    });
  }
}
