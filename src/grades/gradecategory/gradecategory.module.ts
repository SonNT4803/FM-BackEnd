import { GradecategoryService } from './gradecategory.service';
import { GradecategoryController } from './gradecategory.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradeCategory } from 'src/entities/grades/grade.category.entity';
import { Student } from 'src/entities/center/student.entity';
import { StudentModuleGradeComponent } from 'src/entities/grades/student.module.gc.entity';
import { GradeComponent } from 'src/entities/grades/grade.component.entity';
import { Module as module } from 'src/entities/module.entity';
import { Module } from '@nestjs/common';
import { GradeFinal } from 'src/entities/grades/grades.entity';
import { RetakeService } from '../retake/retake.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GradeCategory,
      Student,
      StudentModuleGradeComponent,
      GradeComponent,
      module,
      GradeFinal,
    ]),
  ],
  providers: [GradecategoryService, RetakeService],
  controllers: [GradecategoryController],
})
export class GradecategoryModule {}
