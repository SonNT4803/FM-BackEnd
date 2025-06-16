import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GradeCategory } from 'src/entities/grades/grade.category.entity';
import { GradeComponent } from 'src/entities/grades/grade.component.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GradecomponentService {
  constructor(
    @InjectRepository(GradeComponent)
    private gradeComponentRepository: Repository<GradeComponent>,
    @InjectRepository(GradeCategory)
    private gradeCategoryRepository: Repository<GradeCategory>,
  ) {}
}
