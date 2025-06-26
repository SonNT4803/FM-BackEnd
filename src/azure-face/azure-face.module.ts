import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AzureFaceController } from './azure-face.controller';
import { AzureFaceService } from './azure-face.service';
import { Student } from '../entities/center/student.entity';
import { Class } from '../entities/center/class.entity';
import { Schedule } from '../entities/schedule.entity';
import { AttendanceModule } from '../attendance/attendance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, Class, Schedule]),
    AttendanceModule,
  ],
  controllers: [AzureFaceController],
  providers: [AzureFaceService],
  exports: [AzureFaceService],
})
export class AzureFaceModule {}
