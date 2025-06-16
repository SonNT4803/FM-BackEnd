// src/role/dto/role.dto.ts
import { IsString, IsArray, IsOptional } from 'class-validator';
import { PermissionDto } from 'src/permission/dto/permission.dto';

export class RoleDto {
  @IsOptional()
  id?: number;

  @IsString()
  name: string;

  @IsArray()
  permissions: PermissionDto[];
}
