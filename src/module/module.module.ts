import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class } from 'src/entities/center/class.entity';
import { ExamTypeModule } from 'src/entities/center/exam.type.module.entity';
import { Courses } from 'src/entities/courses.entity';
import { GradeCategory } from 'src/entities/grades/grade.category.entity';
import { GradeComponent } from 'src/entities/grades/grade.component.entity';
import { Semester } from 'src/entities/semester.entity';
import { Module as me } from '../entities/module.entity';
import { ModuleController } from './module.controller';
import { ModuleService } from './module.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      me,
      Courses,
      Semester,
      GradeCategory,
      GradeComponent,
      ExamTypeModule,
      Class,
    ]),
  ],
  providers: [ModuleService],
  controllers: [ModuleController],
})
export class ModuleModule {}
