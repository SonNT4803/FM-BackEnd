import { Body, Controller, Get, Param, Post, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { AttendanceDto, CreateAttendanceDto } from './dto/attendance.dto';

@Controller('attendance')
@ApiTags('Attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('schedule/:scheduleId')
  async findByScheduleId(@Param('scheduleId') scheduleId: number) {
    const result = await this.attendanceService.findByScheduleId(scheduleId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách điểm danh theo lịch học thành công',
      data: result,
    };
  }

  @Post('mark')
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
}
