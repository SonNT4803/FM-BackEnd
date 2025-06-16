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
import { ExamScheduleMasterService } from './exam_schedule_master.service';
import {
  CreateExamScheduleMasterDto,
  UpdateExamScheduleMasterDto,
} from './dto/exam-schedule-master.dto';
import { ExamScheduleMaster } from 'src/entities/center/exam.schedule.master.entity';

@Controller('exam-schedule-master')
export class ExamScheduleMasterController {
  constructor(
    private readonly examScheduleMasterService: ExamScheduleMasterService,
  ) {}

  @Post()
  async create(
    @Body() createExamScheduleDto: CreateExamScheduleMasterDto,
  ): Promise<{
    statusCode: number;
    message: string;
    data?: ExamScheduleMaster;
  }> {
    try {
      const schedule = await this.examScheduleMasterService.create(
        createExamScheduleDto,
      );
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Tạo lịch thi thành công',
        data: schedule,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Tạo lịch thi thất bại',
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
    data?: ExamScheduleMaster[];
  }> {
    try {
      const schedules = await this.examScheduleMasterService.findAll();
      return {
        statusCode: HttpStatus.OK,
        message: 'Lấy danh sách lịch thi thành công',
        data: schedules,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Lấy danh sách lịch thi thất bại',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<{
    statusCode: number;
    message: string;
    data?: ExamScheduleMaster;
  }> {
    try {
      const schedule = await this.examScheduleMasterService.findOne(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Lấy thông tin lịch thi thành công',
        data: schedule,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Không tìm thấy lịch thi',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateExamScheduleDto: UpdateExamScheduleMasterDto,
  ): Promise<{
    statusCode: number;
    message: string;
    data?: ExamScheduleMaster;
  }> {
    try {
      const schedule = await this.examScheduleMasterService.update(
        id,
        updateExamScheduleDto,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Cập nhật lịch thi thành công',
        data: schedule,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Cập nhật lịch thi thất bại',
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
      await this.examScheduleMasterService.remove(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Xóa lịch thi thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Không tìm thấy lịch thi để xóa',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
