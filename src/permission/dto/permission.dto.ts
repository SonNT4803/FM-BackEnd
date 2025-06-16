import { IsOptional } from 'class-validator';
// src/permission/dto/permission.dto.ts
import { IsString } from 'class-validator';

export class PermissionDto {
  @IsOptional()
  id?: number;

  @IsString()
  module: string;
  @IsString()
  action: string;
}
