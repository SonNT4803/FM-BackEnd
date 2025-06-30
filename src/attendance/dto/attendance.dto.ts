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

// DTO cho student attendance history
export class StudentAttendanceHistoryDto {
  student: {
    id: number;
    name: string;
    studentId: string;
    class: Class;
  };
  statistics: {
    totalSessions: number;
    attendedSessions: number;
    absentSessions: number;
    lateSessions: number;
    attendanceRate: number;
  };
  attendanceHistory: Array<{
    id: number;
    status: number;
    note: string | null;
    createdAt: Date;
    updatedAt: Date;
    schedule: {
      id: number;
      date: string;
      dayOfWeek: string;
      module: any;
    };
    teacher: {
      id: number;
      name: string;
    };
    class: {
      id: number;
      name: string;
    };
  }>;
}

// DTO cho student attendance by month
export class StudentAttendanceByMonthDto {
  student: {
    id: number;
    name: string;
    studentId: string;
    class: Class;
  };
  period: {
    year: number;
    month: number;
    monthName: string;
  };
  statistics: {
    totalSessions: number;
    attendedSessions: number;
    absentSessions: number;
    lateSessions: number;
    attendanceRate: number;
  };
  attendanceHistory: Array<{
    id: number;
    status: number;
    note: string | null;
    createdAt: Date;
    updatedAt: Date;
    schedule: {
      id: number;
      date: string;
      dayOfWeek: string;
      module: any;
    };
    teacher: {
      id: number;
      name: string;
    };
    class: {
      id: number;
      name: string;
    };
  }>;
}

// DTO cho student attendance by subject
export class StudentAttendanceBySubjectDto {
  student: {
    id: number;
    name: string;
    studentId: string;
    class: Class;
  };
  attendanceBySubject: Array<{
    subject: string;
    totalSessions: number;
    attendedSessions: number;
    absentSessions: number;
    lateSessions: number;
    attendanceRate: number;
    sessions: Array<{
      id: number;
      status: number;
      note: string | null;
      createdAt: Date;
      updatedAt: Date;
      schedule: {
        id: number;
        date: string;
        dayOfWeek: string;
      };
      teacher: {
        id: number;
        name: string;
      };
    }>;
  }>;
}

// DTO cho student attendance by date
export class StudentAttendanceByDateDto {
  student: {
    id: number;
    name: string;
    studentId: string;
    class: Class;
  };
  date: {
    date: string;
    dayOfWeek: string;
    formattedDate: string;
  };
  attendanceHistory: Array<{
    id: number;
    status: number;
    note: string | null;
    schedule: {
      id: number;
      date: string;
      dayOfWeek: string;
      startTime: string;
      endTime: string;
      module: {
        id: number;
        module_name: string;
        module_code: string;
      };
    };
    teacher: {
      id: number;
      name: string;
    };
    class: {
      id: number;
      name: string;
    };
  }>;
}
