import { IntensiveCareDto } from 'src/admissions/intensivecare/dto/intensive.care.dto';
import { ApplicationStatus } from 'src/entities/enum/application-status.enum';

export class ApplicationDto {
  name: string;
  email?: string;
  gender?: string;
  birthdate?: string;
  phone?: string;
  status: ApplicationStatus;
  admissionProgramId?: number;
  courses_family_id?: number;
  permanentResidence?: string;
  parentId?: number[];
  studentProfileId?: number;
  cardId?: string;
  priorityId?: number;
  tick?: boolean;
}

export class CreateApplicationDTO {
  name: string;
  email?: string;
  gender?: string;
  birthdate?: string;
  phone?: string;
  status: ApplicationStatus;
  admissionProgramId: number;
  courses_family_id: number;
  permanentResidence?: string;
  parentId?: number[];
  studentProfileId?: number;
  cardId: string;
  priorityId?: number;
  intensiveCareList?: IntensiveCareDto[];
  tick?: boolean;
}

export class UpdateInformationApplicationDTO {
  name: string;
  email?: string;
  gender?: string;
  birthdate?: string;
  phone?: string;
  courses_family_id: number;
  permanentResidence?: string;
  cardId: string;
}
