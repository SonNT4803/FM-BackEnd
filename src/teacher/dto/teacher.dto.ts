// create-teacher.dto.ts
import { PartialType } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Module } from 'src/entities/module.entity';
import { Shift } from 'src/entities/shift.entity';

export class CreateTeacherDto {
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsNotEmpty()
  birthdate: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  working_date: Date;

  working_shift?: Shift[];

  modules?: Module[];
}

export class UpdateTeacherDto extends PartialType(CreateTeacherDto) { }
