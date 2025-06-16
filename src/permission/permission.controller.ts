// src/permission/permission.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PermissionDto } from './dto/permission.dto';
import { PermissionService } from './permission.service';

@Controller('permissions')
@ApiTags('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  //   @Post()
  //   async createPermission(@Body() createPermissionDto: CreatePermissionDto): Promise<Permission> {
  //     return this.permissionService.createPermission(createPermissionDto);
  //   }

  @Get()
  async findAllPermissions(): Promise<PermissionDto[]> {
    return this.permissionService.findAllPermissions();
  }

  @Get(':id')
  async findPermissionById(@Param('id') id: number): Promise<PermissionDto> {
    return this.permissionService.findPermissionById(id);
  }
}
