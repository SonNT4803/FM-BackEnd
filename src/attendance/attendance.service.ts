// src/attendance/attendance.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from 'src/entities/attendance.entity';
import { Class } from 'src/entities/center/class.entity';
import { Schedule } from 'src/entities/schedule.entity';
import { Student } from 'src/entities/center/student.entity';
import { Teacher } from 'src/entities/teacher.entity';
import { Repository } from 'typeorm';
import {
  AttendanceDto,
  CreateAttendanceDto,
  UpdateAttendanceDto,
} from './dto/attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    // Kiểm tra sự tồn tại của lớp học, sinh viên, giáo viên và lịch trình
    const classEntity = await this.classRepository.findOne({
      where: { id: createAttendanceDto.classId },
    });
    const studentEntity = await this.studentRepository.findOne({
      where: { id: createAttendanceDto.classId },
    });
    const teacherEntity = await this.teacherRepository.findOne({
      where: { id: createAttendanceDto.teacherId },
    });
    const scheduleEntity = await this.scheduleRepository.findOne({
      where: { id: createAttendanceDto.scheduleId },
    });

    // Nếu bất kỳ ID nào không hợp lệ, ném lỗi
    if (!classEntity || !studentEntity || !teacherEntity || !scheduleEntity) {
      throw new Error(
        'Invalid IDs provided for class, student, teacher, or schedule.',
      );
    }
    const attendance = this.attendanceRepository.create({
      class: classEntity,
      student: studentEntity,
      teacher: teacherEntity,
      schedule: scheduleEntity,
      status: createAttendanceDto.status,
      note: createAttendanceDto.note,
    });

    try {
      return await this.attendanceRepository.save(attendance);
    } catch (error) {
      console.error('Error saving attendance:', error);
      throw new Error('Could not create attendance record');
    }
  }

  async markAttendance(
    createAttendanceDto: CreateAttendanceDto,
  ): Promise<Attendance> {
    const classEntity = await this.classRepository.findOne({
      where: { id: createAttendanceDto.classId },
    });
    const studentEntity = await this.studentRepository.findOne({
      where: { id: createAttendanceDto.studentId },
    });
    const teacherEntity = await this.teacherRepository.findOne({
      where: { id: createAttendanceDto.teacherId },
    });
    const scheduleEntity = await this.scheduleRepository.findOne({
      where: { id: createAttendanceDto.scheduleId },
    });

    // Kiểm tra tính hợp lệ
    if (!classEntity || !studentEntity || !teacherEntity || !scheduleEntity) {
      throw new Error(
        'Invalid IDs provided for class, student, teacher, or schedule.',
      );
    }

    // Kiểm tra xem đã có điểm danh cho sinh viên trong lịch này chưa
    const existingAttendance = await this.attendanceRepository.findOne({
      where: {
        student: { id: createAttendanceDto.studentId },
        schedule: { id: createAttendanceDto.scheduleId },
      },
    });

    if (existingAttendance) {
      existingAttendance.status = createAttendanceDto.status;
      existingAttendance.note = createAttendanceDto.note;
      existingAttendance.updatedAt = new Date();
      return await this.attendanceRepository.save(existingAttendance);
    }
    // Tạo mới bản ghi attendance
    const attendance = this.attendanceRepository.create({
      class: classEntity,
      student: studentEntity,
      teacher: teacherEntity,
      schedule: scheduleEntity,
      status: createAttendanceDto.status,
      note: createAttendanceDto.note,
    });
    try {
      return await this.attendanceRepository.save(attendance);
    } catch (error) {
      console.error('Error saving attendance:', error);
      throw new Error('Could not mark attendance');
    }
  }

  async findAll(): Promise<Attendance[]> {
    return this.attendanceRepository.find({
      relations: [
        'teacher',
        'student',
        'class',
        'schedule',
        'attendanceHistories',
      ],
    });
  }
  async findOne(id: number): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findOne({
      where: { id },
      relations: [
        'teacher',
        'student',
        'class',
        'schedule',
        'attendanceHistories',
      ],
    });
    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }
    return attendance;
  }

  async update(
    id: number,
    updateAttendanceDto: UpdateAttendanceDto,
  ): Promise<Attendance> {
    const attendance = await this.findOne(id);
    Object.assign(attendance, updateAttendanceDto);
    return this.attendanceRepository.save(attendance);
  }

  async remove(id: number): Promise<void> {
    const attendance = await this.findOne(id);
    await this.attendanceRepository.remove(attendance);
  }

  async findByScheduleId(scheduleId: number): Promise<AttendanceDto[]> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId },
      relations: ['class', 'teacher'],
    });
    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${scheduleId} not found`);
    }

    const students = await this.studentRepository.find({
      where: { class: { id: schedule.class.id } },
      order: { id: 'ASC' },
    });

    const attendances = await this.attendanceRepository.find({
      where: { schedule: { id: scheduleId } },
      relations: ['student'],
    });

    const attendanceDtos: AttendanceDto[] = students.map((student) => {
      const foundAttendance = attendances.find(
        (att) => att.student.id === student.id,
      );
      return {
        teacher: schedule.teacher,
        class: schedule.class,
        student: student,
        status: foundAttendance ? foundAttendance.status : 0,
        note: foundAttendance ? foundAttendance.note : null,
      };
    });

    return attendanceDtos;
  }

  async markMultipleAttendance(
    createAttendanceDtos: CreateAttendanceDto[],
  ): Promise<Attendance[]> {
    const attendances: Attendance[] = [];
    for (const createAttendanceDto of createAttendanceDtos) {
      if (
        !createAttendanceDto.classId ||
        !createAttendanceDto.studentId ||
        !createAttendanceDto.teacherId ||
        !createAttendanceDto.scheduleId
      ) {
        throw new Error(
          `Invalid IDs provided for student ID ${createAttendanceDto.studentId}.`,
        );
      }

      // Kiểm tra xem đã có điểm danh cho sinh viên trong lịch này chưa
      const existingAttendance = await this.attendanceRepository.findOne({
        where: {
          student: { id: createAttendanceDto.studentId },
          schedule: { id: createAttendanceDto.scheduleId },
        },
      });

      if (existingAttendance) {
        // Cập nhật điểm danh nếu đã tồn tại
        existingAttendance.status = createAttendanceDto.status;
        existingAttendance.note = createAttendanceDto.note;
        existingAttendance.updatedAt = new Date();
        attendances.push(
          await this.attendanceRepository.save(existingAttendance),
        );
      } else {
        // Tạo mới bản ghi attendance
        const attendance = this.attendanceRepository.create({
          class: { id: createAttendanceDto.classId },
          student: { id: createAttendanceDto.studentId },
          teacher: { id: createAttendanceDto.teacherId },
          schedule: { id: createAttendanceDto.scheduleId },
          status: createAttendanceDto.status,
          note: createAttendanceDto.note,
        });
        attendances.push(await this.attendanceRepository.save(attendance));
      }
    }

    return attendances;
  }

  async markAttendanceByFace(
    studentIds: number[],
    classId: number,
    status: number,
    teacherId: number,
    scheduleId: number,
  ) {
    // Tìm thông tin cần thiết
    const classEntity = await this.classRepository.findOne({
      where: { id: classId },
    });
    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherId },
    });
    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId },
    });

    if (!classEntity || !teacher || !schedule) {
      throw new Error('Invalid class, teacher or schedule information');
    }

    const attendances: Attendance[] = [];
    for (const studentId of studentIds) {
      // Kiểm tra xem đã có điểm danh cho sinh viên trong lịch này chưa
      const existingAttendance = await this.attendanceRepository.findOne({
        where: {
          student: { id: studentId },
          schedule: { id: scheduleId },
        },
      });

      if (existingAttendance) {
        // Cập nhật điểm danh nếu đã tồn tại
        existingAttendance.status = status;
        existingAttendance.updatedAt = new Date();
        attendances.push(
          await this.attendanceRepository.save(existingAttendance),
        );
      } else {
        const student = await this.studentRepository.findOne({
          where: { id: studentId },
        });

        if (student) {
          const attendance = this.attendanceRepository.create({
            student,
            class: classEntity,
            teacher,
            schedule,
            status,
          });
          attendances.push(await this.attendanceRepository.save(attendance));
        }
      }
    }

    return attendances;
  }
}
