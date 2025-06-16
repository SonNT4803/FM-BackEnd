import { PartialType } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsOptional,
    IsString
} from 'class-validator';

export class CreateStudentProfileDto {
  @IsNotEmpty()
  @IsString()
  highSchool: string;

  @IsOptional()
  @IsString()
  university?: string;

  @IsOptional()
  @IsString()
  workingCompany?: string;

  @IsOptional()
  @IsString()
  companyAddress?: string;

  @IsOptional()
  @IsString()
  companyPosition?: string;

  @IsOptional()
  @IsString()
  portfolio?: string;

  studentId?: number;
  applicationId?: number;
}

export class UpdateStudentProfileDto extends PartialType(CreateStudentProfileDto) {}
