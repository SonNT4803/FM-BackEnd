// schedule.controller.ts
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
  Query,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Classroom } from 'src/entities/center/classroom.entity';
import { Schedule } from 'src/entities/schedule.entity';
import { Teacher } from 'src/entities/teacher.entity';
import { Repository } from 'typeorm';
import {
  AutoGenerateScheduleDto,
  ClassDayDto,
  CreateScheduleDto,
  FindAvailableClassroomsDto,
  ScheduleCountByDayDto,
  ScheduleDto,
  UpdateScheduleDto,
} from './dto/schedule.dto';
import { ScheduleService } from './schedule.service';

@Controller('schedules')
@ApiTags('Schedule')
export class ScheduleController {
  constructor(
    private readonly scheduleService: ScheduleService,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    private readonly jwtService: JwtService,
  ) {}

  @Post()
  create(@Body() createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    return this.scheduleService.create(createScheduleDto);
  }

  @Get('available-teachers')
  async findAvailableTeachers(
    @Query('moduleId') moduleId: number,
    @Query('startDate') startDate: string,
    @Query('classDay') classDay: string,
  ): Promise<Teacher[]> {
    const parsedClassDay = JSON.parse(classDay) as ClassDayDto[];
    return this.scheduleService.findAvailableTeachersForSchedule(
      moduleId,
      startDate,
      parsedClassDay,
    );
  }

  @Get('available-classrooms')
  async findAvailableClassrooms(
    @Query('moduleId') moduleId: number,
    @Query('startDate') startDate: string,
    @Query('classDay') classDay: string,
  ): Promise<Classroom[]> {
    const parsedClassDay = JSON.parse(classDay) as ClassDayDto[];
    return this.scheduleService.findAvailableClassrooms(
      moduleId,
      startDate,
      parsedClassDay,
    );
  }

  @Post('/auto/:classId')
  async autoGenerateSchedule(
    @Param('classId') classId: number,
    @Body() autoGenerateScheduleDto: AutoGenerateScheduleDto,
  ): Promise<Schedule[]> {
    const { schedules } = autoGenerateScheduleDto;

    try {
      return await this.scheduleService.autoCreateByCoursesFamily(
        classId,
        schedules,
      );
    } catch (error) {
      // Xử lý lỗi và trả về thông báo lỗi
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message || 'Đã xảy ra lỗi trong quá trình tạo lịch.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  findAll(): Promise<ScheduleDto[]> {
    return this.scheduleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Schedule> {
    return this.scheduleService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ): Promise<Schedule> {
    return this.scheduleService.update(+id, updateScheduleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.scheduleService.remove(+id);
  }

  @Get('class/:classId')
  getByClassId(@Param('classId') classId: string): Promise<ScheduleDto[]> {
    return this.scheduleService.getByClassId(classId);
  }

  @Get('teacher/:date')
  async getByTeacherId(
    @Param('date') date: string,
    @Request() request: Request,
  ): Promise<ScheduleDto[]> {
    const teacherId = await this.extractTeacherIdFromToken(request);
    return this.scheduleService.getByTeacherId(teacherId, date);
  }

  @Get('count-by-day/:date')
  async getScheduleCountByDayInMonth(
    @Param('date') date: string,
    @Request() request: Request,
  ): Promise<ScheduleCountByDayDto[]> {
    let teacherId: number = 0;
    const token = request.headers['authorization'].split(' ')[1];
    if (token) {
      try {
        // Giải mã token và lấy thông tin người dùng
        const decoded = this.jwtService.verify(token);
        const teacher = await this.teacherRepository.findOne({
          where: { userId: decoded.sub },
        });
        if (teacher) {
          teacherId = teacher.id;
        } else {
          throw new UnauthorizedException('You are not teacher');
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        throw new UnauthorizedException();
      }
      return this.scheduleService.getScheduleCountByDayInMonth(date, teacherId);
    }
  }

  @Get('class/:classId/schedules')
  async findSchedulesByClassAndDateRange(
    @Param('classId') classId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<Schedule[]> {
    return this.scheduleService.findSchedulesByClassAndDateRange(
      +classId,
      startDate,
      endDate,
    );
  }

  private async extractTeacherIdFromToken(request: Request): Promise<number> {
    const token = request.headers['authorization']?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const decoded = this.jwtService.verify(token);
      const teacher = await this.teacherRepository.findOne({
        where: { userId: decoded.sub },
      });
      if (!teacher) {
        throw new UnauthorizedException('You are not a teacher');
      }
      return teacher.id;
    } catch (error) {
      console.error('Token verification failed:', error);
      throw new UnauthorizedException();
    }
  }
}
