import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HuggingfaceFaceService } from './huggingface-face.service';
import { GoogleAIService } from './google-ai.service';
import { Student } from '../entities/center/student.entity';
import { Class } from '../entities/center/class.entity';
import { Schedule } from '../entities/schedule.entity';
import { Attendance } from '../entities/attendance.entity';
import { Teacher } from '../entities/teacher.entity';
import { Shift } from '../entities/shift.entity';
import { AttendanceService } from '../attendance/attendance.service';
import { HuggingfaceFaceController } from './huggingface-face.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Student,
      Class,
      Schedule,
      Attendance,
      Teacher,
      Shift,
    ]),
  ],
  controllers: [HuggingfaceFaceController],
  providers: [HuggingfaceFaceService, GoogleAIService, AttendanceService],
  exports: [HuggingfaceFaceService, GoogleAIService, AttendanceService],
})
export class HuggingfaceFaceModule {}
