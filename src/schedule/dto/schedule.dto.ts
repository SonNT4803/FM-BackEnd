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
