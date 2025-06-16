import { GradeComponentStatus } from 'src/entities/enum/gradecomponent.enum';

export class CreateGradeComponentDto {
  id?: number;
  name?: string;
  weight?: number;
  status?: GradeComponentStatus;
}

export class UpdateGradeComponentDto extends CreateGradeComponentDto {}
