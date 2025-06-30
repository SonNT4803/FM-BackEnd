// create-schedule.dto.ts
import { PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { Attendance } from 'src/entities/attendance.entity';
import { Class } from 'src/entities/center/class.entity';
import { Classroom } from 'src/entities/center/classroom.entity';
import { Module } from 'src/entities/module.entity';
import { Shift } from 'src/entities/shift.entity';
import { Teacher } from 'src/entities/teacher.entity';

export class ClassDayDto {
  selectedDays: string;
  shiftIds: number[];
}

export class CreateAutoScheduleDto {
  moduleId: number;
  classroomId: number;
  teacherId: number;
  classId: number;
  startDate: string;
  classDay: ClassDayDto[];
}

export class CreateScheduleWithDaysDto {
  createScheduleDto: CreateAutoScheduleDto;
}

export class AutoGenerateScheduleDto {
  schedules: CreateScheduleWithDaysDto[];
}

export class CreateScheduleDto {
  shiftId: number;
  classId: number;
  classroomId: number;
  teacherId: number;
  date: string;
  moduleId: number;
  dayOfWeek: string;
  startDate: string;
}
export class UpdateScheduleDto extends PartialType(CreateScheduleDto) {}

// Simplified interfaces for cleaner response
export interface SimplifiedShift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
}

export interface SimplifiedClass {
  id: number;
  name: string;
  status: string;
}

export interface SimplifiedBuilding {
  id: number;
  name: string;
}

export interface SimplifiedClassroom {
  id: number;
  name: string;
  building: SimplifiedBuilding;
}

export interface SimplifiedTeacher {
  id: number;
  name: string;
  email: string;
}

export interface SimplifiedModule {
  module_id: number;
  module_name: string;
  code: string;
}

export interface SimplifiedAttendance {
  id: number;
  status: number;
  note: string | null;
  updatedAt: Date | null;
  teacher: {
    id: number;
    name: string;
  };
}

export class ScheduleDto {
  id: number;
  shift?: Shift;
  class?: Class;
  classroom?: Classroom;
  teacher?: Teacher;
  date?: string;
  dayOfWeek?: string;
  module?: Module;
  attendances?: Attendance[];
}

// New DTO for student schedule with simplified data
export class StudentScheduleDto {
  id: number;
  shift: SimplifiedShift;
  class: SimplifiedClass;
  classroom: SimplifiedClassroom;
  teacher: SimplifiedTeacher;
  date: string;
  dayOfWeek: string;
  module: SimplifiedModule;
  attendances: SimplifiedAttendance[];
}

export class ScheduleCountByDayDto {
  day: number;
  count: number;
}

export class FindAvailableClassroomsDto {
  moduleId: number;
  shiftId: number;
  startDate: string;
  selectedDays: string[];
}

export class FindSchedulesDto {
  @IsOptional()
  @IsInt()
  classId?: number;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}
