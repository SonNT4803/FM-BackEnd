// src/auth/auth.module.ts
import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PermissionModule } from 'src/permission/permission.module';
import { RoleModule } from 'src/role/role.module';
import { UserRoleModule } from 'src/user-role/user-role.module';
import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './auth.controller';
import { jwtConstants } from './const';
import { AuthGuard } from './guard/auth.guard';
import { PermissionsGuard } from './guard/permissions.guard';
import { RolesGuard } from './guard/roles.guard';
import { RolePermissionModule } from 'src/role-permission/role-permission.module';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: jwtConstants,
      signOptions: { expiresIn: '365d' },
    }),
    UserModule,
    RoleModule,
    PermissionModule,
    RolePermissionModule,
    UserRoleModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RolesGuard,
    PermissionsGuard,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
