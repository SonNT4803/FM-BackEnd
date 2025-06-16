import { Class } from 'src/entities/center/class.entity';
import { Student } from 'src/entities/center/student.entity';
import { Teacher } from 'src/entities/teacher.entity';

export class CreateAttendanceDto {
  status: number;
  note?: string;
  teacherId: number;
  studentId: number;
  classId: number;
  scheduleId: number;
}

export class UpdateAttendanceDto {
  status?: number;
  note?: string;
}

export interface AttendanceDto {
  student: Student;
  status: number;
  note: string | null;
  class: Class;
  teacher: Teacher;
}
