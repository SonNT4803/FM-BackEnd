import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { AttendanceDto, CreateAttendanceDto } from './dto/attendance.dto';

@Controller('attendance')
@ApiTags('Attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('schedule/:scheduleId')
  @ApiOperation({ summary: 'Lấy danh sách điểm danh theo lịch học' })
  @ApiParam({ name: 'scheduleId', description: 'ID của lịch học' })
  async findByScheduleId(@Param('scheduleId') scheduleId: number) {
    const result = await this.attendanceService.findByScheduleId(scheduleId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách điểm danh theo lịch học thành công',
      data: result,
    };
  }

  @Post('mark')
  @ApiOperation({ summary: 'Điểm danh cho sinh viên' })
  async markAttendance(@Body() createAttendanceDto: CreateAttendanceDto) {
    const result =
      await this.attendanceService.markAttendance(createAttendanceDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Điểm danh thành công',
      data: result,
    };
  }

  @Post('mark/multiple')
  @ApiOperation({ summary: 'Điểm danh nhiều sinh viên cùng lúc' })
  async markMultipleAttendance(
    @Body() createAttendanceDtos: CreateAttendanceDto[],
  ) {
    const result =
      await this.attendanceService.markMultipleAttendance(createAttendanceDtos);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Điểm danh nhiều sinh viên thành công',
      data: result,
    };
  }

  // Endpoint cho student xem lịch sử điểm danh
  @Get('student/:studentId/history')
  @ApiOperation({ summary: 'Xem lịch sử điểm danh của sinh viên' })
  @ApiParam({ name: 'studentId', description: 'ID của sinh viên' })
  async getStudentAttendanceHistory(@Param('studentId') studentId: number) {
    const result =
      await this.attendanceService.getStudentAttendanceHistory(studentId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy lịch sử điểm danh thành công',
      data: result,
    };
  }

  // Endpoint cho student xem điểm danh theo tháng
  @Get('student/:studentId/monthly')
  @ApiOperation({ summary: 'Xem điểm danh của sinh viên theo tháng' })
  @ApiParam({ name: 'studentId', description: 'ID của sinh viên' })
  @ApiQuery({ name: 'year', description: 'Năm', example: 2024 })
  @ApiQuery({ name: 'month', description: 'Tháng (1-12)', example: 12 })
  async getStudentAttendanceByMonth(
    @Param('studentId') studentId: number,
    @Query('year') year: number,
    @Query('month') month: number,
  ) {
    const result = await this.attendanceService.getStudentAttendanceByMonth(
      studentId,
      year,
      month,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy điểm danh theo tháng thành công',
      data: result,
    };
  }

  // Endpoint cho student xem điểm danh theo môn học
  @Get('student/:studentId/subject')
  @ApiOperation({ summary: 'Xem điểm danh của sinh viên theo môn học' })
  @ApiParam({ name: 'studentId', description: 'ID của sinh viên' })
  @ApiQuery({
    name: 'subject',
    description: 'Tên môn học (tùy chọn)',
    required: false,
  })
  async getStudentAttendanceBySubject(
    @Param('studentId') studentId: number,
    @Query('subject') subject?: string,
  ) {
    const result = await this.attendanceService.getStudentAttendanceBySubject(
      studentId,
      subject,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy điểm danh theo môn học thành công',
      data: result,
    };
  }

  // Endpoint cho student xem điểm danh theo ngày cụ thể
  @Get('student/:studentId/:date')
  @ApiOperation({ summary: 'Xem điểm danh của sinh viên theo ngày cụ thể' })
  @ApiParam({ name: 'studentId', description: 'ID của sinh viên' })
  @ApiParam({
    name: 'date',
    description: 'Ngày (YYYY-MM-DD)',
    example: '2025-7-2',
  })
  async getStudentAttendanceByDate(
    @Param('studentId') studentId: number,
    @Param('date') date: string,
  ) {
    const result = await this.attendanceService.getStudentAttendanceByDate(
      studentId,
      date,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy điểm danh theo ngày thành công',
      data: result,
    };
  }

  // ========== MOBILE ENDPOINTS (sử dụng userId) ==========

  // Endpoint cho mobile - xem lịch sử điểm danh theo userId
  @Get('user/:userId/history')
  @ApiOperation({
    summary: 'Xem lịch sử điểm danh của sinh viên theo userId (Mobile)',
  })
  @ApiParam({ name: 'userId', description: 'ID của user (từ access token)' })
  async getUserAttendanceHistory(@Param('userId') userId: number) {
    const result =
      await this.attendanceService.getStudentAttendanceHistory(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy lịch sử điểm danh thành công',
      data: result,
    };
  }

  // Endpoint cho mobile - xem điểm danh theo tháng và userId
  @Get('user/:userId/monthly')
  @ApiOperation({
    summary: 'Xem điểm danh của sinh viên theo tháng và userId (Mobile)',
  })
  @ApiParam({ name: 'userId', description: 'ID của user (từ access token)' })
  @ApiQuery({ name: 'year', description: 'Năm', example: 2024 })
  @ApiQuery({ name: 'month', description: 'Tháng (1-12)', example: 12 })
  async getUserAttendanceByMonth(
    @Param('userId') userId: number,
    @Query('year') year: number,
    @Query('month') month: number,
  ) {
    const result = await this.attendanceService.getStudentAttendanceByMonth(
      userId,
      year,
      month,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy điểm danh theo tháng thành công',
      data: result,
    };
  }

  // Endpoint cho mobile - xem điểm danh theo môn học và userId
  @Get('user/:userId/subject')
  @ApiOperation({
    summary: 'Xem điểm danh của sinh viên theo môn học và userId (Mobile)',
  })
  @ApiParam({ name: 'userId', description: 'ID của user (từ access token)' })
  @ApiQuery({
    name: 'subject',
    description: 'Tên môn học (tùy chọn)',
    required: false,
  })
  async getUserAttendanceBySubject(
    @Param('userId') userId: number,
    @Query('subject') subject?: string,
  ) {
    const result = await this.attendanceService.getStudentAttendanceBySubject(
      userId,
      subject,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy điểm danh theo môn học thành công',
      data: result,
    };
  }

  // Endpoint cho mobile - xem điểm danh theo ngày và userId
  @Get('user/:userId/date/:date')
  @ApiOperation({
    summary: 'Xem điểm danh của sinh viên theo ngày và userId (Mobile)',
  })
  @ApiParam({ name: 'userId', description: 'ID của user (từ access token)' })
  @ApiParam({
    name: 'date',
    description: 'Ngày (YYYY-MM-DD)',
    example: '2025-7-2',
  })
  async getUserAttendanceByDate(
    @Param('userId') userId: number,
    @Param('date') date: string,
  ) {
    const student = await this.attendanceService.findStudentByUserId(userId);
    if (!student) {
      return {
        statusCode: 404,
        message: 'Không tìm thấy sinh viên cho user này',
        data: null,
      };
    }
    const result = await this.attendanceService.getStudentAttendanceByDate(
      student.id,
      date,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy điểm danh theo ngày thành công',
      data: result,
    };
  }
}
