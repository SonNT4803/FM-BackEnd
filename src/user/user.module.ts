// src/user/user.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teacher } from 'src/entities/teacher.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRoleModule } from 'src/user-role/user-role.module';
import { PermissionModule } from 'src/permission/permission.module';
import { RolePermissionModule } from 'src/role-permission/role-permission.module';
import { User } from 'src/entities/auth/user.entity';
import { Role } from 'src/entities/auth/role.entity';
import { UserRole } from 'src/entities/auth/user.role.entity';
import { Permission } from 'src/entities/auth/permission.entity';

@Module({
  imports: [
    UserRoleModule,
    PermissionModule,
    RolePermissionModule,
    TypeOrmModule.forFeature([User, Role, UserRole, Teacher, Permission]),
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
