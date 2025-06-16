import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from 'src/entities/auth/permission.entity';
import { Role } from 'src/entities/auth/role.entity';
import { RolePermission } from 'src/entities/auth/role.permissions.entity';
import { User } from 'src/entities/auth/user.entity';
import { UserRole } from 'src/entities/auth/user.role.entity';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      Role,
      Permission,
      RolePermission,
      User,
      UserRole,
    ]),
  ],
  providers: [RoleService],
  controllers: [RoleController],
  exports: [RoleService],
})
export class RoleModule {}
