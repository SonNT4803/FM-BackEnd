import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FaceRecognitionController } from './face-recognition.controller';
import { Student } from '../entities/center/student.entity';
import { FaceRecognitionService } from './face-recognition.service';
import { Class } from 'src/entities/center/class.entity';
import { AttendanceService } from 'src/attendance/attendance.service';
import { Attendance } from 'src/entities/attendance.entity';
import { Teacher } from 'src/entities/teacher.entity';
import { Schedule } from 'src/entities/schedule.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, Class, Attendance, Teacher, Schedule]),
  ],
  controllers: [FaceRecognitionController],
  providers: [FaceRecognitionService, AttendanceService],
  exports: [FaceRecognitionService],
})
export class FaceRecognitionModule {}
