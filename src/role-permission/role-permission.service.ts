import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RolePermission } from 'src/entities/auth/role.permissions.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class RolePermissionService {
  constructor(
    @InjectRepository(RolePermission)
    private readonly rolePermissionsRepository: Repository<RolePermission>,
  ) {}

  async findPermissionsByRoles(roleIds: number[]): Promise<string[]> {
    const rolePermissions = await this.rolePermissionsRepository.find({
      where: { role: { id: In(roleIds) } },
      relations: ['permission'], // Join với bảng Permission
    });

    // Lấy danh sách tên permissions
    return rolePermissions.map(
      (rp) => rp.permission.module + '-' + rp.permission.action,
    );
  }
}
