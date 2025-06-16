// src/user-role/user-role.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from 'src/entities/auth/user.role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserRoleService {
  constructor(
    @InjectRepository(UserRole)
    public readonly userRoleRepository: Repository<UserRole>,
  ) {}

  async createUserRole(userId: number, roleId: number) {
    const userRole = new UserRole();
    userRole.user = { id: userId } as any;
    userRole.role = { id: roleId } as any;
    return await this.userRoleRepository.save(userRole);
  }

  async findUserRoleById(id: number) {
    return await this.userRoleRepository.find({
      where: { user: { id } },
      relations: ['role'],
    });
  }
}
