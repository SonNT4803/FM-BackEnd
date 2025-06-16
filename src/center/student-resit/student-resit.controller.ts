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
import { ApiTags } from '@nestjs/swagger';
import { StudentResit } from 'src/entities/student-resit.entity';
import { StudentResitService } from './student-resit.service';

@Controller('student-resit')
@ApiTags('student-resit')
export class StudentResitController {
  constructor(private readonly studentResitService: StudentResitService) {}

  @Post()
  async create(
    @Body() createStudentResitDto: Partial<StudentResit>,
  ): Promise<{ statusCode: number; message: string; data?: StudentResit }> {
    try {
      const studentResit = await this.studentResitService.create(
        createStudentResitDto,
      );
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Tạo đơn đăng ký học lại thành công',
        data: studentResit,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Tạo đơn đăng ký học lại thất bại',
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
    data?: StudentResit[];
  }> {
    try {
      const studentResits = await this.studentResitService.findAll();
      return {
        statusCode: HttpStatus.OK,
        message: 'Lấy danh sách đơn đăng ký học lại thành công',
        data: studentResits,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Lấy danh sách đơn đăng ký học lại thất bại',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':id')
  async findOne(
    @Param('id') id: number,
  ): Promise<{ statusCode: number; message: string; data?: StudentResit }> {
    try {
      const studentResit = await this.studentResitService.findOne(+id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Lấy thông tin đơn đăng ký học lại thành công',
        data: studentResit,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Lấy thông tin đơn đăng ký học lại thất bại',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateStudentResitDto: Partial<StudentResit>,
  ): Promise<{ statusCode: number; message: string; data?: StudentResit }> {
    try {
      const updatedStudentResit = await this.studentResitService.update(
        +id,
        updateStudentResitDto,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Cập nhật đơn đăng ký học lại thành công',
        data: updatedStudentResit,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Cập nhật đơn đăng ký học lại thất bại',
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
      await this.studentResitService.remove(+id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Xóa đơn đăng ký học lại thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Xóa đơn đăng ký học lại thất bại',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
