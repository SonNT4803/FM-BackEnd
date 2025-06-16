import { Cohort } from 'src/entities/center/cohort.entity';
import { StudentStatus } from 'src/entities/enum/student-study-status.enum';
// src/student/dto/create-student.dto.ts
export class CreateStudentDto {
  id?: number;
  studentId?: string;
  name: string;
  email: string;
  gender?: string;
  birthdate: string; // Định dạng 'YYYY-MM-DD'
  phone?: string;
  classId?: number; // ID của lớp (Class)
  courses_family_id: number;
  permanentResidence?: string; // Thêm hộ khẩu thường trú
  cohort?: Cohort; // Thêm khoá học
  status?: StudentStatus;
  cardId?: string;
  avatar?: string;
}

// src/student/dto/update-student.dto.ts
export class UpdateStudentDto {
  studentId?: string;
  name?: string;
  email?: string;
  gender?: string;
  birthdate?: string; // Định dạng 'YYYY-MM-DD'
  phone?: string;
  classId?: number; // ID của lớp (Class)
  courses_family_id?: number;
  permanentResidence?: string; // Thêm hộ khẩu thường trú
  cohort?: Cohort; // Thêm khoá học
  status?: StudentStatus;
  cardId?: string;
  avatar?: string;
}
