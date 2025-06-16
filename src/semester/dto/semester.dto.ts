export class CreateSemesterDto {
  name: string;
  code?: string;
  year?: number;
  season?: string;
  startDate?: string;
  endDate?: string;
}

export class UpdateSemesterDto {
  name?: string;
  code?: string;
  year?: number;
  season?: string;
  startDate?: string;
  endDate?: string;
}
