// src/auth/permissions.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Permission } from 'src/entities/auth/permission.entity';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
