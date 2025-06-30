import { Module } from '@nestjs/common';
import { Attendance } from 'src/entities/attendance.entity';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class } from 'src/entities/center/class.entity';
import { Student } from 'src/entities/center/student.entity';
import { Teacher } from 'src/entities/teacher.entity';
import { Schedule } from 'src/entities/schedule.entity';
import { Shift } from 'src/entities/shift.entity';
import { StudentModule } from '../center/student/student.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Attendance,
      Class,
      Student,
      Teacher,
      Schedule,
      Shift,
    ]),
    StudentModule,
  ],
  providers: [AttendanceService],
  controllers: [AttendanceController],
  exports: [AttendanceService],
})
export class AttendanceModule {}
