import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionDto } from './dto/permission.dto';
import { Permission } from 'src/entities/auth/permission.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async createPermission(module: string, action: string): Promise<Permission> {
    const permission = this.permissionRepository.create({ module, action });
    return this.permissionRepository.save(permission);
  }

  async findAllPermissions(): Promise<PermissionDto[]> {
    const permissions = await this.permissionRepository.find();
    return permissions.map((permission) => ({
      id: permission.id,
      module: permission.module,
      action: permission.action,
    }));
  }
  async findPermissionById(id: number): Promise<Permission> {
    return this.permissionRepository.findOne({ where: { id } });
  }
}
