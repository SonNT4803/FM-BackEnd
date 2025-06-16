export class CreateExamScheduleMasterDto {
  module_id: number;
  exam_type_id: number;
  exam_date?: string;
  start_time?: string;
  end_time?: string;
  retake_date?: string;
  retake_start_time?: string;
  retake_end_time?: string;
  created_at?: string;
}

export class UpdateExamScheduleMasterDto extends CreateExamScheduleMasterDto {}
