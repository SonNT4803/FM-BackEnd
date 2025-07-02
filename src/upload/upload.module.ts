import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class } from 'src/entities/center/class.entity';
import { Student } from 'src/entities/center/student.entity';
import { Classroom } from 'src/entities/center/classroom.entity';
import { Shift } from 'src/entities/shift.entity';
import { Schedule } from 'src/entities/schedule.entity';
import { User } from 'src/entities/auth/user.entity';
import { UserRole } from 'src/entities/auth/user.role.entity';
import { Teacher } from 'src/entities/teacher.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Class,
      Student,
      Classroom,
      Shift,
      Schedule,
      User,
      UserRole,
      Teacher,
    ]),
  ],
  providers: [UploadService],
  controllers: [UploadController],
})
export class UploadModule {}
