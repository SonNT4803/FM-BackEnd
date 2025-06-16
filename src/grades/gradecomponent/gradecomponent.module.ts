import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradeComponent } from 'src/entities/grades/grade.component.entity';
import { GradecomponentController } from './gradecomponent.controller';
import { GradecomponentService } from './gradecomponent.service';
import { GradeCategory } from 'src/entities/grades/grade.category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GradeComponent, GradeCategory])],
  providers: [GradecomponentService],
  controllers: [GradecomponentController],
})
export class GradecomponentModule {}
