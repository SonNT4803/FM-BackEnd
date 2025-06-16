import { EvaluationLevel } from 'src/entities/enum/evaluation-level.enum';

export class CreateEvaluationDto {
  studentId?: number;
  teacherId?: number;
  level?: EvaluationLevel;
  comments?: string;
}

export class UpdateEvaluationDto {
  studentId?: number;
  teacherId?: number;
  level?: EvaluationLevel;
  comments?: string;
}
