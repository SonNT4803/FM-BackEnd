import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { AttendanceDto, CreateAttendanceDto } from './dto/attendance.dto';

@Controller('attendance')
@ApiTags('Attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('schedule/:scheduleId')
  async findByScheduleId(
    @Param('scheduleId') scheduleId: number,
  ): Promise<AttendanceDto[]> {
    return this.attendanceService.findByScheduleId(scheduleId);
  }

  @Post('mark')
  async markAttendance(
    @Body() createAttendanceDto: CreateAttendanceDto,
  ): Promise<AttendanceDto> {
    return this.attendanceService.markAttendance(createAttendanceDto);
  }

  @Post('mark/multiple')
  async markMultipleAttendance(
    @Body() createAttendanceDtos: CreateAttendanceDto[],
  ): Promise<AttendanceDto[]> {
    return this.attendanceService.markMultipleAttendance(createAttendanceDtos);
  }
}
