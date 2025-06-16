import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ExamtypeService } from './examtype.service';
import { ExamType } from 'src/entities/center/exam.type.entity';
@Controller('examtypes')
export class ExamtypeController {
  constructor(private readonly examtypeService: ExamtypeService) {}

  @Post()
  async create(
    @Body() createExamtypeDto: ExamType,
  ): Promise<{ statusCode: number; message: string; data?: ExamType }> {
    try {
      const examtype = await this.examtypeService.create(createExamtypeDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Tạo thành công',
        data: examtype,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Tạo không thành công',
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
    data?: ExamType[];
  }> {
    try {
      const allExamtypes = await this.examtypeService.findAll();
      return {
        statusCode: HttpStatus.OK,
        message: 'Ok',
        data: allExamtypes,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Không tìm thấy',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get('/:id')
  async findOne(
    @Param('id') id: number,
  ): Promise<{ statusCode: number; message: string; data?: ExamType }> {
    try {
      const examtype = await this.examtypeService.findOne(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'OK',
        data: examtype,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Không tìm thấy',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put('/:id')
  async update(
    @Param('id') id: number,
    @Body() updateExamtypeDto: ExamType,
  ): Promise<{ statusCode: number; message: string; data?: ExamType }> {
    try {
      const updatedExamtype = await this.examtypeService.update(
        id,
        updateExamtypeDto,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Updated',
        data: updatedExamtype,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Lỗi khi edit',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('/:id')
  async remove(
    @Param('id') id: number,
  ): Promise<{ statusCode: number; message: string }> {
    try {
      await this.examtypeService.remove(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Xóa thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Không tìm thấy với id: ' + id,
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
