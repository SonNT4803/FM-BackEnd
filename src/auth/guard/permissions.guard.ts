// src/auth/permissions.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleService } from '../../role/role.service';
import { Permission } from 'src/entities/auth/permission.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly roleService: RoleService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<Permission[]>(
      'permissions',
      context.getHandler(),
    );
    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Nếu người dùng không có thông tin vai trò, trả về false
    if (!user || !user.roles) {
      return false;
    }

    // Lấy tất cả quyền của các vai trò của người dùng
    const permissions = await this.roleService.getPermissionsForRoles(user.roles);

    // Kiểm tra xem người dùng có quyền yêu cầu không
    return requiredPermissions.some(permission =>
      permissions.some(p => p.id === permission.id),
    );
  }
}


