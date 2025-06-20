import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../entities/center/student.entity';
import { Class } from '../entities/center/class.entity';
import { AttendanceModule } from '../attendance/attendance.module';
import { FaceApiService } from './face-api.service';
import { FaceApiController } from './face-api.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Student, Class]), AttendanceModule],
  controllers: [FaceApiController],
  providers: [FaceApiService],
  exports: [FaceApiService],
})
export class FaceApiModule {}
