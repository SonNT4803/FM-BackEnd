import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class } from 'src/entities/center/class.entity';
import { CoursesFamily } from 'src/entities/courses.family.entity';
import { Student } from 'src/entities/center/student.entity';
import { Shift } from 'src/entities/shift.entity';
import { Schedule } from 'src/entities/schedule.entity';
import { Courses } from 'src/entities/courses.entity';
import { ClassController } from './class.controller';
import { ClassService } from './class.service';
import { Cohort } from 'src/entities/center/cohort.entity';
import { Semester } from 'src/entities/semester.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Class,
      CoursesFamily,
      Student,
      Shift,
      Schedule,
      Courses,
      Cohort,
      Semester,
    ]),
  ],
  providers: [ClassService],
  controllers: [ClassController],
  exports: [ClassService], // Exports service if other modules need to use it
})
export class ClassModule {}
