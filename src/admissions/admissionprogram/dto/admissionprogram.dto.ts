import { IsArray, IsDateString, IsNumber, IsString } from 'class-validator';

export class CreateAdmissionProgramDto {
  @IsString()
  name?: string;

  @IsString()
  description?: string;

  @IsDateString()
  startDate?: string;

  @IsDateString()
  endDate?: string;

  @IsDateString()
  startRegistration?: string;

  @IsDateString()
  endRegistration?: string;

  @IsNumber()
  quota?: number;

  @IsArray()
  applicationDocuments?: {
    id: number;
    name?: string;
  }[];

  @IsArray()
  promotions?: {
    id: number;
    name?: string;
  }[];

  @IsArray()
  promotionId?: number[];
}

export class UpdateAdmissionProgramDto extends CreateAdmissionProgramDto {}
