import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Patch,
  Delete,
} from '@nestjs/common';
import { CoursesFamilyService } from './coursesfamily.service';
import { CoursesFamily } from 'src/entities/courses.family.entity';
import { ApiTags } from '@nestjs/swagger';

@Controller('coursesfamily')
@ApiTags('coursesfamily')
export class CoursesFamilyController {
  constructor(private readonly coursesFamilyService: CoursesFamilyService) {}

  // Create a new CoursesFamily
  @Post()
  async create(
    @Body('course_family_name') course_family_name: string,
    @Body('year') year: string,
    @Body('code') code: string,
    @Body('courses') courseIds: Array<number>,
  ): Promise<CoursesFamily> {
    return this.coursesFamilyService.create(
      course_family_name,
      year,
      courseIds,
      code,
    );
  }

  // Get all CoursesFamily
  @Get()
  async findAll(): Promise<CoursesFamily[]> {
    return this.coursesFamilyService.findAll();
  }

  // Get a single CoursesFamily by ID
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<CoursesFamily> {
    return this.coursesFamilyService.findOne(+id);
  }

  // Update a CoursesFamily by ID
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body('course_family_name') course_family_name: string,
    @Body('year') year: string,
    @Body('code') code: string,
    @Body('courses') coursesId: Array<number>,
  ): Promise<CoursesFamily> {
    return this.coursesFamilyService.update(
      +id,
      course_family_name,
      year,
      code,
      coursesId,
    );
  }

  // Delete a CoursesFamily by ID
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.coursesFamilyService.remove(+id);
  }
}
