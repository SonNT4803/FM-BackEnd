import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Get,
  Delete,
} from '@nestjs/common';
import { GradeCategory } from 'src/entities/grades/grade.category.entity';
import {
  CreateGradeCategoryDto,
  UpdateGradeCategoryDto,
} from './dto/gradecategory.dto';
import { GradecategoryService } from './gradecategory.service';

@Controller('gradecategory')
export class GradecategoryController {
  constructor(private readonly gradecategoryService: GradecategoryService) {}

  @Post()
  async create(
    @Body() createGradeCategoryDto: CreateGradeCategoryDto,
  ): Promise<{ statusCode: number; message: string; data?: GradeCategory }> {
    try {
      const gradeCategory = await this.gradecategoryService.create(
        createGradeCategoryDto,
      );
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Tạo GradeCategory thành công',
        data: gradeCategory,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Tạo GradeCategory thất bại',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  async findAll(): Promise<{
    statusCode: number;
    message: string;
    data: GradeCategory[];
  }> {
    try {
      const gradeCategories = await this.gradecategoryService.findAll();
      return {
        statusCode: HttpStatus.OK,
        message: 'Lấy danh sách GradeCategory thành công',
        data: gradeCategories,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Lấy danh sách GradeCategory thất bại',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':id')
  async findOne(
    @Param('id') id: number,
  ): Promise<{ statusCode: number; message: string; data?: GradeCategory }> {
    try {
      const gradeCategory = await this.gradecategoryService.findOne(id);
      if (!gradeCategory) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: `GradeCategory với ID ${id} không tồn tại`,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Lấy GradeCategory thành công',
        data: gradeCategory,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Lấy GradeCategory thất bại',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateGradeCategoryDto: UpdateGradeCategoryDto,
  ): Promise<{ statusCode: number; message: string; data?: GradeCategory }> {
    try {
      const updatedGradeCategory = await this.gradecategoryService.update(
        id,
        updateGradeCategoryDto,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Cập nhật GradeCategory thành công',
        data: updatedGradeCategory,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Cập nhật GradeCategory thất bại',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  async remove(
    @Param('id') id: number,
  ): Promise<{ statusCode: number; message: string }> {
    try {
      await this.gradecategoryService.remove(id);
      return {
        statusCode: HttpStatus.NO_CONTENT,
        message: 'Xóa GradeCategory thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Xóa GradeCategory thất bại',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('student/:studentId/module/:moduleId')
  async getStudentGrades(
    @Param('studentId') studentId: number,
    @Param('moduleId') moduleId: number,
  ): Promise<{ statusCode: number; message: string; data: any }> {
    try {
      const result = await this.gradecategoryService.getStudentGrades(
        studentId,
        moduleId,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Lấy điểm của sinh viên thành công',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Lấy điểm của sinh viên thất bại',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('/assign-grades')
  async assignGradesForStudents(
    @Body()
    gradesData: {
      studentId: number;
      moduleId: number;
      gradeComponentId: number;
      score: number;
    }[],
  ): Promise<{ statusCode: number; message: string; data: any }> {
    try {
      const results =
        await this.gradecategoryService.assignGradesForStudents(gradesData);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Nhập điểm thành công',
        data: results,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Nhập điểm thất bại',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
