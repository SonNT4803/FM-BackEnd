import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Courses } from 'src/entities/courses.entity';
import { CoursesFamily } from 'src/entities/courses.family.entity';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { Module as me } from 'src/entities/module.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Courses, CoursesFamily, me])],
  providers: [CoursesService],
  controllers: [CoursesController],
})
export class CoursesModule {}
