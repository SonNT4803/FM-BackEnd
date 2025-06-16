import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Module } from 'src/entities/module.entity';
import { ClassService } from './class.service';
import { CreateClassDto } from './dto/classes.dto';
import { Class } from 'src/entities/center/class.entity';

@ApiTags('Classes')
@Controller('classes')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Post()
  async create(
    @Body() classEntity: CreateClassDto,
  ): Promise<{ statusCode: HttpStatus; message: string; data: any }> {
    try {
      const studentCount = classEntity.studentCount;
      const result = await this.classService.create({
        ...classEntity,
        studentCount,
      });
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Created',
        data: result,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message || 'Failed to create class',
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
      const result = await this.classService.findAll();
      return {
        statusCode: HttpStatus.OK,
        message: 'Ok',
        data: result,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to retrieve classes',
        data: null,
      };
    }
  }

  @Get('/deleted')
  @HttpCode(HttpStatus.OK)
  async findAllDeletedClass(): Promise<{
    statusCode: HttpStatus;
    message: string;
    data: any;
  }> {
    try {
      const result = await this.classService.findAllDeletedClass();
      return {
        statusCode: HttpStatus.OK,
        message: 'Ok',
        data: result,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to retrieve deleted classes',
        data: null,
      };
    }
  }

  @Patch(':id')
  async updateClass(
    @Param('id', ParseIntPipe) classId: number,
    @Body() updateData: Partial<CreateClassDto>,
  ): Promise<{ statusCode: HttpStatus; message: string; data: Class }> {
    try {
      const updatedClass = await this.classService.updateClass(
        classId,
        updateData,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Class updated successfully',
        data: updatedClass,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update class',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // @Patch(':id/restore')
  // async restore(
  //   @Param('id', ParseIntPipe) classId: number,
  // ): Promise<{ statusCode: HttpStatus; message: string }> {
  //   try {
  //     await this.classService.restore(classId);
  //     return {
  //       statusCode: HttpStatus.OK,
  //       message: 'Restored',
  //     };
  //   } catch (error) {
  //     return {
  //       statusCode: HttpStatus.BAD_REQUEST,
  //       message: error.message || 'Failed to restore class',
  //     };
  //   }
  // }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<{ statusCode: HttpStatus; message: string; data: any }> {
    const result = await this.classService.findOne(+id);

    if (!result) {
      throw new NotFoundException('Class not found');
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Class retrieved successfully',
      data: result,
    };
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
  ): Promise<{ statusCode: HttpStatus; message: string }> {
    try {
      await this.classService.remove(+id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Deleted',
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message || 'Failed to delete class',
      };
    }
  }

  @Get('/modules/:id')
  async getModulesByCoursesFamilyOfClass(
    @Param('id') classId: number,
  ): Promise<Module[]> {
    return await this.classService.getModulesByCoursesFamilyOfClass(classId);
  }
}
