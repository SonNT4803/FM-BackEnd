import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../entities/auth/role.entity';
import { User } from '../entities/auth/user.entity';
import { UserRole } from '../entities/auth/user.role.entity';
import { RoleSeed } from './role.seed';
import { UserSeed } from './user.seed';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role, User, UserRole])],
  providers: [RoleSeed, UserSeed, SeedService],
  exports: [SeedService],
})
export class SeedModule {}
