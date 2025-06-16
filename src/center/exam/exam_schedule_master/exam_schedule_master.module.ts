import { Module } from '@nestjs/common';
import { ExamScheduleMasterService } from './exam_schedule_master.service';
import { ExamScheduleMasterController } from './exam_schedule_master.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamScheduleMaster } from 'src/entities/center/exam.schedule.master.entity';
import { Module as ModuleEntity } from 'src/entities/module.entity';
import { ExamType } from 'src/entities/center/exam.type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExamScheduleMaster, ModuleEntity, ExamType]),
  ],
  providers: [ExamScheduleMasterService],
  controllers: [ExamScheduleMasterController],
})
export class ExamScheduleMasterModule {}
