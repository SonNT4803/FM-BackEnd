import { Module } from '@nestjs/common';
import { SemesterService } from './semester.service';
import { SemesterController } from './semester.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Semester } from 'src/entities/semester.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Semester])],
  providers: [SemesterService],
  controllers: [SemesterController],
})
export class SemesterModule {}
