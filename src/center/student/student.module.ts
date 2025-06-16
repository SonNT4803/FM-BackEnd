// src/student/student.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { Class } from 'src/entities/center/class.entity';
import { Student } from 'src/entities/center/student.entity';
import { Shift } from 'src/entities/shift.entity';
import { CoursesFamily } from 'src/entities/courses.family.entity';
import { Parent } from 'src/entities/parent.entity';
import { Module as ModuleEntity } from 'src/entities/module.entity';
import { GradeFinal } from 'src/entities/grades/grades.entity';
import { Schedule } from 'src/entities/schedule.entity';
import { StudentResit } from 'src/entities/student-resit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Student,
      Class,
      CoursesFamily,
      Shift,
      Parent,
      ModuleEntity,
      GradeFinal,
      Schedule,
      StudentResit,
    ]),
  ],
  controllers: [StudentController],
  providers: [StudentService],
})
export class StudentModule {}
