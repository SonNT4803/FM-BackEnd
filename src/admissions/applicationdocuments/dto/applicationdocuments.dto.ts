import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreateApplicationDocumentDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class UpdateApplicationDocumentDto {
  @IsArray()
  @IsNotEmpty()
  applicationDocumentIds: number[];
}

export class UpdateDocumentDto {
  @IsOptional()
  @IsString()
  name?: string;
}

export class ApplicationDocumentResponseDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  createdAt: string;

  @IsString()
  updatedAt: string;
}
