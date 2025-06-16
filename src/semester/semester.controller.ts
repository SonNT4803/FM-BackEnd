import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SemesterService } from './semester.service';
import { CreateSemesterDto, UpdateSemesterDto } from './dto/semester.dto';

@ApiTags('Semesters')
@Controller('semesters')
export class SemesterController {
  constructor(private readonly semesterService: SemesterService) {}

  @Post()
  async create(
    @Body() createSemesterDto: CreateSemesterDto,
  ): Promise<{ statusCode: HttpStatus; message: string; data: any }> {
    try {
      const result = await this.semesterService.create(createSemesterDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Semester created successfully',
        data: result,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message || 'Failed to create semester',
        data: null,
      };
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<{
    statusCode: HttpStatus;
    message: string;
    data: any;
  }> {
    try {
      const result = await this.semesterService.findAll();
      return {
        statusCode: HttpStatus.OK,
        message: 'Semesters retrieved successfully',
        data: result,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to retrieve semesters',
        data: null,
      };
    }
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ statusCode: HttpStatus; message: string; data: any }> {
    const result = await this.semesterService.findOne(id);
    if (!result) {
      throw new NotFoundException('Semester not found');
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Semester retrieved successfully',
      data: result,
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSemesterDto: UpdateSemesterDto,
  ): Promise<{ statusCode: HttpStatus; message: string; data?: any }> {
    try {
      const result = await this.semesterService.update(id, updateSemesterDto);
      return {
        statusCode: HttpStatus.OK,
        message: 'Semester updated successfully',
        data: result,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message || 'Failed to update semester',
        data: null,
      };
    }
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ statusCode: HttpStatus; message: string }> {
    try {
      await this.semesterService.remove(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Semester deleted successfully',
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message || 'Failed to delete semester',
      };
    }
  }
}
