import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Permission } from 'src/entities/auth/permission.entity';
import { Role } from 'src/entities/auth/role.entity';
import { RolePermission } from 'src/entities/auth/role.permissions.entity';
import { In, Repository } from 'typeorm';
import { PermissionDto } from '../permission/dto/permission.dto';
import { RoleDto } from './dto/role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
  ) {}

  async findAllRoles(): Promise<RoleDto[]> {
    const roles = await this.roleRepository.find();
    return Promise.all(roles.map(async (role) => this.toDto(role)));
  }

  async findRoleById(id: number): Promise<RoleDto> {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    return this.toDto(role);
  }

  private async toDto(role: Role): Promise<RoleDto> {
    // Lấy các RolePermission liên quan đến vai trò
    const rolePermissions = await this.rolePermissionRepository.find({
      where: { role: { id: role.id } },
      relations: ['permission'],
    });

    // Chuyển đổi các quyền liên quan sang PermissionDto
    const permissions: PermissionDto[] = rolePermissions.map((rp) => ({
      id: rp.permission.id,
      module: rp.permission.module,
      action: rp.permission.action,
    }));

    // Tạo DTO cho Role
    const dto = new RoleDto();
    dto.id = role.id;
    dto.name = role.name;
    dto.permissions = permissions;

    return dto;
  }

  async getPermissionsForRoles(roles: Role[]): Promise<Permission[]> {
    const roleIds = roles.map((role) => role.id);

    // Lấy tất cả RolePermission liên quan đến các vai trò
    const rolePermissions = await this.rolePermissionRepository.find({
      where: { role: { id: In(roleIds) } },
      relations: ['permission'],
    });

    // Trả về danh sách quyền từ RolePermission
    return Array.from(new Set(rolePermissions.map((rp) => rp.permission)));
  }
}
