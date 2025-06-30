// src/attendance/attendance.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from 'src/entities/attendance.entity';
import { Class } from 'src/entities/center/class.entity';
import { Schedule } from 'src/entities/schedule.entity';
import { Shift } from 'src/entities/shift.entity';
import { Student } from 'src/entities/center/student.entity';
import { Teacher } from 'src/entities/teacher.entity';
import { Repository } from 'typeorm';
import {
  AttendanceDto,
  CreateAttendanceDto,
  UpdateAttendanceDto,
  StudentAttendanceByDateDto,
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
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
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

  async findByScheduleId(scheduleId: number): Promise<any> {
    // Lấy schedule với teacher và class một lần duy nhất
    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId },
      relations: ['class', 'teacher'],
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${scheduleId} not found`);
    }

    // Lấy tất cả students của class một lần
    const students = await this.studentRepository.find({
      where: { class: { id: schedule.class.id } },
      order: { id: 'ASC' },
    });

    // Lấy tất cả attendances cho schedule này một lần
    const attendances = await this.attendanceRepository.find({
      where: { schedule: { id: scheduleId } },
      relations: ['student'],
    });

    // Tạo map để tìm kiếm nhanh hơn
    const attendanceMap = new Map(
      attendances.map((att) => [att.student.id, att]),
    );

    // Tạo danh sách students với attendance status
    const studentsWithAttendance = students.map((student) => {
      const foundAttendance = attendanceMap.get(student.id);
      return {
        student: student,
        status: foundAttendance ? foundAttendance.status : 0,
        note: foundAttendance ? foundAttendance.note : null,
      };
    });

    // Trả về format tối ưu: teacher và class chỉ một lần
    return {
      teacher: schedule.teacher,
      class: schedule.class,
      scheduleId: scheduleId,
      students: studentsWithAttendance,
      totalStudents: students.length,
      totalAttended: studentsWithAttendance.filter((s) => s.status === 1)
        .length,
    };
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

  // Method để student xem lịch sử điểm danh của mình
  async getStudentAttendanceHistory(studentId: number): Promise<any> {
    // Kiểm tra student có tồn tại không
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      relations: ['class'],
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // Lấy tất cả attendance records của student
    const attendances = await this.attendanceRepository.find({
      where: { student: { id: studentId } },
      relations: ['schedule', 'teacher', 'class'],
      order: { updatedAt: 'DESC' },
    });

    // Tính toán thống kê
    const totalSessions = attendances.length;
    const attendedSessions = attendances.filter(
      (att) => att.status === 1,
    ).length;
    const absentSessions = attendances.filter((att) => att.status === 0).length;
    const lateSessions = attendances.filter((att) => att.status === 2).length;
    const attendanceRate =
      totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0;

    return {
      student: {
        id: student.id,
        name: student.name,
        studentId: student.studentId,
        class: student.class,
      },
      statistics: {
        totalSessions,
        attendedSessions,
        absentSessions,
        lateSessions,
        attendanceRate: Math.round(attendanceRate * 100) / 100, // Làm tròn 2 chữ số thập phân
      },
      attendanceHistory: attendances.map((att) => ({
        id: att.id,
        status: att.status,
        note: att.note,
        createdAt: att.updatedAt,
        updatedAt: att.updatedAt,
        schedule: {
          id: att.schedule.id,
          date: att.schedule.date,
          dayOfWeek: att.schedule.dayOfWeek,
          shift: {
            id: att.schedule.shift?.id,
            name: att.schedule.shift?.name,
            startTime: att.schedule.shift?.startTime,
            endTime: att.schedule.shift?.endTime,
          },
          module: {
            id: att.schedule.module.module_id,
            module_name: att.schedule.module.module_name,
            module_code: att.schedule.module.code,
          },
        },
        teacher: {
          id: att.teacher.id,
          name: att.teacher.name,
        },
        class: {
          id: att.class.id,
          name: att.class.name,
        },
      })),
    };
  }

  // Method để student xem điểm danh theo tháng
  async getStudentAttendanceByMonth(
    studentId: number,
    year: number,
    month: number,
  ): Promise<any> {
    // Kiểm tra student có tồn tại không
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      relations: ['class'],
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // Tạo date range cho tháng
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Lấy attendance records trong tháng
    const attendances = await this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.schedule', 'schedule')
      .leftJoinAndSelect('attendance.teacher', 'teacher')
      .leftJoinAndSelect('attendance.class', 'class')
      .where('attendance.student.id = :studentId', { studentId })
      .andWhere('schedule.date >= :startDate', { startDate })
      .andWhere('schedule.date <= :endDate', { endDate })
      .orderBy('schedule.date', 'ASC')
      .getMany();

    // Tính toán thống kê theo tháng
    const totalSessions = attendances.length;
    const attendedSessions = attendances.filter(
      (att) => att.status === 1,
    ).length;
    const absentSessions = attendances.filter((att) => att.status === 0).length;
    const lateSessions = attendances.filter((att) => att.status === 2).length;
    const attendanceRate =
      totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0;

    return {
      student: {
        id: student.id,
        name: student.name,
        studentId: student.studentId,
        class: student.class,
      },
      period: {
        year,
        month,
        monthName: new Date(year, month - 1).toLocaleString('vi-VN', {
          month: 'long',
        }),
      },
      statistics: {
        totalSessions,
        attendedSessions,
        absentSessions,
        lateSessions,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
      },
      attendanceHistory: attendances.map((att) => ({
        id: att.id,
        status: att.status,
        note: att.note,
        createdAt: att.updatedAt,
        updatedAt: att.updatedAt,
        schedule: {
          id: att.schedule.id,
          date: att.schedule.date,
          dayOfWeek: att.schedule.dayOfWeek,
          shift: {
            id: att.schedule.shift?.id,
            name: att.schedule.shift?.name,
            startTime: att.schedule.shift?.startTime,
            endTime: att.schedule.shift?.endTime,
          },
          module: {
            id: att.schedule.module.module_id,
            module_name: att.schedule.module.module_name,
            module_code: att.schedule.module.code,
          },
        },
        teacher: {
          id: att.teacher.id,
          name: att.teacher.name,
        },
        class: {
          id: att.class.id,
          name: att.class.name,
        },
      })),
    };
  }

  // Method để student xem điểm danh theo môn học
  async getStudentAttendanceBySubject(
    studentId: number,
    subject?: string,
  ): Promise<any> {
    // Kiểm tra student có tồn tại không
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      relations: ['class'],
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // Tạo query builder
    let queryBuilder = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.schedule', 'schedule')
      .leftJoinAndSelect('attendance.teacher', 'teacher')
      .leftJoinAndSelect('attendance.class', 'class')
      .where('attendance.student.id = :studentId', { studentId });

    // Thêm filter theo môn học nếu có
    if (subject) {
      queryBuilder = queryBuilder.andWhere(
        'schedule.module.module_name LIKE :subject',
        { subject: `%${subject}%` },
      );
    }

    const attendances = await queryBuilder
      .orderBy('schedule.date', 'DESC')
      .getMany();

    // Nhóm theo môn học
    const attendanceBySubject = attendances.reduce((acc, att) => {
      const subjectName = att.schedule.module.module_name;
      if (!acc[subjectName]) {
        acc[subjectName] = {
          subject: subjectName,
          totalSessions: 0,
          attendedSessions: 0,
          absentSessions: 0,
          lateSessions: 0,
          attendanceRate: 0,
          sessions: [],
        };
      }

      acc[subjectName].totalSessions++;
      if (att.status === 1) acc[subjectName].attendedSessions++;
      else if (att.status === 0) acc[subjectName].absentSessions++;
      else if (att.status === 2) acc[subjectName].lateSessions++;

      acc[subjectName].sessions.push({
        id: att.id,
        status: att.status,
        note: att.note,
        createdAt: att.updatedAt,
        updatedAt: att.updatedAt,
        schedule: {
          id: att.schedule.id,
          date: att.schedule.date,
          dayOfWeek: att.schedule.dayOfWeek,
          shift: {
            id: att.schedule.shift?.id,
            name: att.schedule.shift?.name,
            startTime: att.schedule.shift?.startTime,
            endTime: att.schedule.shift?.endTime,
          },
          module: {
            id: att.schedule.module.module_id,
            module_name: att.schedule.module.module_name,
            module_code: att.schedule.module.code,
          },
        },
        teacher: {
          id: att.teacher.id,
          name: att.teacher.name,
        },
      });

      return acc;
    }, {});

    // Tính attendance rate cho từng môn học
    Object.values(attendanceBySubject).forEach((subjectData: any) => {
      subjectData.attendanceRate =
        subjectData.totalSessions > 0
          ? Math.round(
              (subjectData.attendedSessions / subjectData.totalSessions) *
                10000,
            ) / 100
          : 0;
    });

    return {
      student: {
        id: student.id,
        name: student.name,
        studentId: student.studentId,
        class: student.class,
      },
      attendanceBySubject: Object.values(attendanceBySubject),
    };
  }

  // Method để student xem điểm danh theo ngày cụ thể
  async getStudentAttendanceByDate(
    studentId: number,
    date: string,
  ): Promise<StudentAttendanceByDateDto> {
    // Kiểm tra student có tồn tại không
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      relations: ['class'],
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // Parse date string thành Date object
    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      throw new Error('Invalid date format. Please use YYYY-MM-DD format');
    }

    // Tạo date range cho ngày cụ thể (từ 00:00:00 đến 23:59:59)
    const startDate = new Date(targetDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999);

    // Lấy attendance records trong ngày cụ thể
    const attendances = await this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.schedule', 'schedule')
      .leftJoinAndSelect('schedule.shift', 'shift')
      .leftJoinAndSelect('attendance.teacher', 'teacher')
      .leftJoinAndSelect('attendance.class', 'class')
      .leftJoinAndSelect('schedule.module', 'module')
      .where('attendance.student.id = :studentId', { studentId })
      .andWhere('schedule.date >= :startDate', { startDate })
      .andWhere('schedule.date <= :endDate', { endDate })
      .orderBy('shift.startTime', 'ASC')
      .getMany();
    return {
      student: {
        id: student.id,
        name: student.name,
        studentId: student.studentId,
        class: student.class,
      },
      date: {
        date: date,
        dayOfWeek: targetDate.toLocaleDateString('vi-VN', { weekday: 'long' }),
        formattedDate: targetDate.toLocaleDateString('vi-VN'),
      },
      attendanceHistory: attendances.map((att) => ({
        id: att.id,
        status: att.status,
        note: att.note,
        schedule: {
          id: att.schedule.id,
          date: att.schedule.date,
          dayOfWeek: att.schedule.dayOfWeek,
          shift: {
            id: att.schedule.shift?.id,
            name: att.schedule.shift?.name,
            startTime: att.schedule.shift?.startTime,
            endTime: att.schedule.shift?.endTime,
          },
          module: {
            id: att.schedule.module.module_id,
            module_name: att.schedule.module.module_name,
            module_code: att.schedule.module.code,
          },
        },
        teacher: {
          id: att.teacher.id,
          name: att.teacher.name,
        },
        class: {
          id: att.class.id,
          name: att.class.name,
        },
      })),
    };
  }

  // Method để tìm student theo userId (cho mobile app)
  async findStudentByUserId(userId: number): Promise<Student | null> {
    return await this.studentRepository
      .createQueryBuilder('student')
      .where('student.userId = :userId', { userId })
      .getOne();
  }
}
