export class CreateExamRoomDto {
  exam_schedule_master_id?: number;
  classroom_id?: number;
  teacher_id?: number;
  capacity?: number;
}

export class UpdateExamRoomDto {
  classroom_id?: number;
  teacher_id?: number;
  capacity?: number;
}
