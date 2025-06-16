export class CreateIntensiveCareDto {
  description?: string;
  applicationId?: number;
  studentId?: number;
}

export class UpdateIntensiveCareDto {
  description?: string;
}

export class IntensiveCareDto {
  description?: string;
  priorityId?: number;
}
