import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Patch,
  Delete,
} from '@nestjs/common';
import { ClassroomService } from './classroom.service';
import { Classroom } from 'src/entities/center/classroom.entity';
import { ApiTags } from '@nestjs/swagger';

@Controller('classroom')
@ApiTags('Classroom')
export class ClassroomController {
  constructor(private readonly classroomService: ClassroomService) {}

  @Get('building/:id/classrooms')
  async getClassroomsByBuilding(@Param('id') id: number): Promise<Classroom[]> {
    const classrooms = await this.classroomService.getClassroomsByBuildingId(id);
    return classrooms; 
  }

  @Post()
  async create(
    @Body('name') name: string,
    @Body('buildingId') buildingId: number,
  ): Promise<Classroom> {
    return this.classroomService.create(name, buildingId);
  }

  @Get()
  async findAll(): Promise<Classroom[]> {
    return this.classroomService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Classroom> {
    return this.classroomService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body('name') name: string,
    @Body('buildingId') buildingId: number,
  ): Promise<Classroom> {
    return this.classroomService.update(+id, name, buildingId);
  }

  // Delete a classroom by ID
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.classroomService.remove(+id);
  }
}
