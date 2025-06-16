import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ExamRoom } from 'src/entities/center/exam.room.entity';
import { ExamRoomStudent } from 'src/entities/center/exam.room.student.entity';
import { CreateExamRoomDto, UpdateExamRoomDto } from './dto/exam-room.dto';
import { ExamRoomService } from './exam_room.service';

@Controller('exam-room')
export class ExamRoomController {
  constructor(private readonly examRoomService: ExamRoomService) {}

  @Post()
  async create(@Body() createDto: CreateExamRoomDto): Promise<{
    statusCode: number;
    message: string;
    data?: ExamRoom;
  }> {
    try {
      const examRoom = await this.examRoomService.create(createDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Tạo phòng thi thành công',
        data: examRoom,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Tạo phòng thi thất bại',
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
    data?: ExamRoom[];
  }> {
    try {
      const examRooms = await this.examRoomService.findAll();
      return {
        statusCode: HttpStatus.OK,
        message: 'Lấy danh sách phòng thi thành công',
        data: examRooms,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Lấy danh sách phòng thi thất bại',
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
    data?: ExamRoom;
  }> {
    try {
      const examRoom = await this.examRoomService.findOne(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Lấy thông tin phòng thi thành công',
        data: examRoom,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Không tìm thấy phòng thi',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateDto: UpdateExamRoomDto,
  ): Promise<{
    statusCode: number;
    message: string;
    data?: ExamRoom;
  }> {
    try {
      const examRoom = await this.examRoomService.update(id, updateDto);
      return {
        statusCode: HttpStatus.OK,
        message: 'Cập nhật phòng thi thành công',
        data: examRoom,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Cập nhật phòng thi thất bại',
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
      await this.examRoomService.remove(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Xóa phòng thi thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Không tìm thấy phòng thi để xóa',
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get('exam-schedule-master/:id')
  async findByExamScheduleMasterId(@Param('id') id: number): Promise<{
    statusCode: number;
    message: string;
    data?: ExamRoom[];
  }> {
    try {
      const examRooms =
        await this.examRoomService.findByExamScheduleMasterId(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Lấy danh sách phòng thi theo lịch thi thành công',
        data: examRooms,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Lấy danh sách phòng thi theo lịch thi thất bại',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/students')
  async addStudents(
    @Param('id') id: number,
    @Body() addStudentsDto: { student_id: number[] },
  ): Promise<{
    statusCode: number;
    message: string;
    data?: any;
  }> {
    try {
      const result = await this.examRoomService.addStudentsToRoom(
        id,
        addStudentsDto.student_id,
      );
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Thêm học sinh vào phòng thi thành công',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Thêm học sinh vào phòng thi thất bại',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch(':examRoomId/students/:studentId')
  async updateStudentPresence(
    @Param('examRoomId') examRoomId: number,
    @Param('studentId') studentId: number,
    @Body() data: ExamRoomStudent,
  ): Promise<{
    statusCode: number;
    message: string;
  }> {
    try {
      await this.examRoomService.updateStudentPresence(
        examRoomId,
        studentId,
        data,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Cập nhật điểm danh thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Cập nhật điểm danh thất bại',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
