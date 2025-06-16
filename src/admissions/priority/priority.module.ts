import { Module } from '@nestjs/common';
import { PriorityService } from './priority.service';
import { PriorityController } from './priority.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Priority } from 'src/entities/admissions/priority.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Priority])],
  providers: [PriorityService],
  controllers: [PriorityController],
})
export class PriorityModule {}
