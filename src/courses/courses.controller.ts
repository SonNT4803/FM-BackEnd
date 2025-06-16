import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Patch,
  Delete,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Courses } from 'src/entities/courses.entity';
import { ApiTags } from '@nestjs/swagger';

@Controller('courses')
@ApiTags('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // Create a new course
  @Post()
  async create(
    @Body('course_name') course_name: string,
    @Body('course_code') course_code: string,
    @Body('modules') modulesId: Array<number>,
  ): Promise<Courses> {
    return this.coursesService.create(course_name, course_code, modulesId);
  }

  // Get all courses
  @Get()
  async findAll(): Promise<Courses[]> {
    return this.coursesService.findAll();
  }

  // Get a single course by ID
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Courses> {
    return this.coursesService.findOne(+id);
  }

  // Update a course by ID
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body('course_name') course_name: string,
    @Body('course_code') course_code: string,
    @Body('modules') modulesId: Array<number>,
  ): Promise<Courses> {
    return this.coursesService.update(+id, course_name, course_code, modulesId);
  }

  // Delete a course by ID
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.coursesService.remove(+id);
  }
}
