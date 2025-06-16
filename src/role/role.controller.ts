// src/role/role.controller.ts
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/guard/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { RoleDto } from './dto/role.dto';
import { RoleService } from './role.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('roles')
@ApiTags('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  //   @Post()
  //   async createRole(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
  //     return this.roleService.createRole(createRoleDto);
  //   }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('Admin')
  async findAllRoles(): Promise<RoleDto[]> {
    return this.roleService.findAllRoles();
  }

  @Get(':id')
  async findRoleById(@Param('id') id: number): Promise<RoleDto> {
    return this.roleService.findRoleById(id);
  }
}
