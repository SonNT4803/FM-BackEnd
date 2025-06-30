import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../entities/auth/role.entity';
import { RoleSeed } from './role.seed';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  providers: [RoleSeed, SeedService],
  exports: [SeedService],
})
export class SeedModule {}
