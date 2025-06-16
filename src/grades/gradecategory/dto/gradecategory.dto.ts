import { IsNotEmpty, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { CreateGradeComponentDto } from 'src/grades/gradecomponent/dto/gradecomponent.dto';

export class CreateGradeCategoryDto {
  id?: number;
  name?: string;
  weight?: number;
  gradeComponents?: CreateGradeComponentDto[];
}

export class UpdateGradeCategoryDto extends CreateGradeCategoryDto {}

export class GradeInputDto {
  @IsNotEmpty()
  studentId: number;

  @IsNotEmpty()
  moduleId: number;

  @IsOptional()
  gradeComponentId?: number;

  @IsOptional()
  @IsNumber()
  score?: number;

  @IsOptional()
  @IsNumber()
  average_grade?: number;

  @IsOptional()
  remarks?: string;

  @IsOptional()
  @IsBoolean()
  isResit?: boolean;
}

export class GradeResponseDto {
  student: {
    id: number;
    name: string;
  };
  module: {
    module_id: number;
    module_name: string;
  };
  grades: {
    id: number | null;
    score: number | null;
    resit_score: number | null;
    gradeComponent: {
      id: number;
      name: string;
      isResit: boolean;
      gradeCategory: {
        id: number;
        name: string;
        weight: number;
      };
    };
  }[];
  finalGrade: {
    id: number;
    average_grade: number;
    status: string;
    remarks: string;
    attempt: number;
  } | null;
}
