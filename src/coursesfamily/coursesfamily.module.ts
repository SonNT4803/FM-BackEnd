import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Courses } from 'src/entities/courses.entity';
import { CoursesFamily } from 'src/entities/courses.family.entity';
import { CoursesFamilyController } from './coursesfamily.controller';
import { CoursesFamilyService } from './coursesfamily.service';

@Module({
  imports: [TypeOrmModule.forFeature([Courses, CoursesFamily])],
  providers: [CoursesFamilyService],
  controllers: [CoursesFamilyController],
})
export class CoursesfamilyModule {}
