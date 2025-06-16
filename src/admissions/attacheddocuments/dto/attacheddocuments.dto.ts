import { IsNotEmpty, IsString } from 'class-validator';

export class AttachedDocumentsDto {
  @IsNotEmpty()
  @IsString()
  documentType: string;

  @IsNotEmpty()
  filePath: string;

  @IsString()
  file: File;

  applicationId: number;
}
