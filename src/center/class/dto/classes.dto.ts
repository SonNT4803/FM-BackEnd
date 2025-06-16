import {
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsEnum,
  IsDate,
} from 'class-validator';
import { ClassStatus } from 'src/entities/enum/class_status.enum';

export class ClassesDto {
  id?: number;
  name: string;
  count: number;
}

export class CreateClassDto {
  name: string;

  @IsNotEmpty()
  courses_family_id: number;

  tick: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  studentCount?: number;

  @IsOptional()
  @IsEnum(ClassStatus)
  status?: ClassStatus;

  @IsOptional()
  @IsDate()
  admissionDate?: string;

  @IsOptional()
  semester_id?: number;

  @IsOptional()
  @IsInt()
  cohort_id?: number;
}
