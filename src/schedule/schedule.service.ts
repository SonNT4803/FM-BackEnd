// schedule.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Class } from 'src/entities/center/class.entity';
import { Classroom } from 'src/entities/center/classroom.entity';
import { Module } from 'src/entities/module.entity';
import { Schedule } from 'src/entities/schedule.entity';
import { Shift } from 'src/entities/shift.entity';
import { Teacher } from 'src/entities/teacher.entity';
import { Between, In, Not, Repository } from 'typeorm';
import {
  ClassDayDto,
  CreateScheduleDto,
  CreateScheduleWithDaysDto,
  ScheduleCountByDayDto,
  ScheduleDto,
  UpdateScheduleDto,
} from './dto/schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(Classroom)
    private readonly classroomRepository: Repository<Classroom>,
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(Module)
    private readonly moduleRepository: Repository<Module>,
  ) {}

  async create(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    const { classId, classroomId, shiftId, date, moduleId, teacherId } =
      createScheduleDto;

    const existingSchedule = await this.scheduleRepository.findOne({
      where: {
        classroom: { id: classroomId },
        date,
        shift: { id: shiftId },
      },
    });

    if (existingSchedule) {
      throw new BadRequestException(
        `Lịch học đã tồn tại cho phòng học này vào ngày ${moment(date).format('DD-MM-YYYY')} và ca học đã chọn.`,
      );
    }

    const classEntity = await this.classRepository.findOne({
      where: { id: classId },
    });
    const classRoomEntity = await this.classroomRepository.findOne({
      where: { id: classroomId },
    });
    const shiftEntity = await this.shiftRepository.findOne({
      where: { id: shiftId },
    });
    const teacherEntity = await this.teacherRepository.findOne({
      where: { id: teacherId },
    });
    const moduleEntity = await this.moduleRepository.findOne({
      where: { module_id: moduleId },
    });

    if (
      !classEntity ||
      !classRoomEntity ||
      !shiftEntity ||
      !teacherEntity ||
      !moduleEntity
    ) {
      throw new Error(
        'Không tìm thấy lớp học, phòng học, ca học, giáo viên hoặc module.',
      );
    }

    const dayOfWeekString = moment(date).format('dddd');

    const schedule = this.scheduleRepository.create({
      class: classEntity,
      shift: shiftEntity,
      teacher: teacherEntity,
      module: moduleEntity,
      date,
      classroom: classRoomEntity,
      dayOfWeek: dayOfWeekString,
    });

    try {
      return await this.scheduleRepository.save(schedule);
    } catch (error) {
      throw new Error('Không thể tạo lịch học');
    }
  }

  async findAll(): Promise<ScheduleDto[]> {
    const schedules = await this.scheduleRepository.find({
      relations: [
        'shift',
        'class',
        'classroom',
        'teacher',
        'module',
        'attendances',
      ],
    });
    const scheduleDtos: ScheduleDto[] = schedules.map((schedule) => {
      const scheduleDto = new ScheduleDto();
      scheduleDto.id = schedule.id;
      scheduleDto.shift = schedule.shift;
      scheduleDto.class = schedule.class;
      scheduleDto.classroom = schedule.classroom;
      scheduleDto.teacher = schedule.teacher;
      scheduleDto.date = moment(schedule.date).format('DD-MM-YYYY');
      scheduleDto.module = schedule.module;
      scheduleDto.attendances = schedule.attendances;
      scheduleDto.dayOfWeek = schedule.dayOfWeek;
      return scheduleDto;
    });

    return scheduleDtos;
  }

  async findOne(id: number): Promise<Schedule> {
    try {
      return await this.scheduleRepository.findOne({
        where: { id },
        relations: [
          'shift',
          'class',
          'classroom',
          'teacher',
          'module',
          'attendances',
        ],
      });
    } catch (error) {
      console.error('Error finding schedule:', error);
      throw new NotFoundException(`Schedule with ID ${id} not found.`);
    }
  }

  async update(
    id: number,
    updateScheduleDto: UpdateScheduleDto,
  ): Promise<Schedule> {
    const existingSchedule = await this.scheduleRepository.findOne({
      where: { id },
      relations: [
        'shift',
        'class',
        'classroom',
        'teacher',
        'module',
        'attendances',
      ],
    });

    if (!existingSchedule) {
      throw new NotFoundException(`Schedule với ID ${id} không tìm thấy.`);
    }

    const { classroomId, shiftId, date } = updateScheduleDto;

    if (classroomId && shiftId && date) {
      const duplicateSchedule = await this.scheduleRepository.findOne({
        where: {
          classroom: { id: classroomId },
          date,
          shift: { id: shiftId },
          id: Not(id),
        },
      });

      if (duplicateSchedule) {
        throw new BadRequestException(
          `Lịch học trùng lặp đã tồn tại cho phòng học này vào ngày ${moment(date).format('DD-MM-YYYY')} và ca học đã chọn.`,
        );
      }
    }

    // Cập nhật các entity liên quan nếu ID thay đổi
    if (updateScheduleDto.classId) {
      const classEntity = await this.classRepository.findOne({
        where: { id: updateScheduleDto.classId },
      });
      if (!classEntity) {
        throw new BadRequestException(
          `ID lớp học không hợp lệ: ${updateScheduleDto.classId}`,
        );
      }
      existingSchedule.class = classEntity;
    }

    if (updateScheduleDto.classroomId) {
      const classRoomEntity = await this.classroomRepository.findOne({
        where: { id: updateScheduleDto.classroomId },
      });
      if (!classRoomEntity) {
        throw new BadRequestException(
          `ID phòng học không hợp lệ: ${updateScheduleDto.classroomId}`,
        );
      }
      existingSchedule.classroom = classRoomEntity;
    }

    if (updateScheduleDto.shiftId) {
      const shiftEntity = await this.shiftRepository.findOne({
        where: { id: updateScheduleDto.shiftId },
      });
      if (!shiftEntity) {
        throw new BadRequestException(
          `ID ca học không hợp lệ: ${updateScheduleDto.shiftId}`,
        );
      }
      existingSchedule.shift = shiftEntity;
    }

    if (updateScheduleDto.teacherId) {
      const teacherEntity = await this.teacherRepository.findOne({
        where: { id: updateScheduleDto.teacherId },
      });
      if (!teacherEntity) {
        throw new BadRequestException(
          `ID giáo viên không hợp lệ: ${updateScheduleDto.teacherId}`,
        );
      }
      existingSchedule.teacher = teacherEntity;
    }

    if (updateScheduleDto.moduleId) {
      const moduleEntity = await this.moduleRepository.findOne({
        where: { module_id: updateScheduleDto.moduleId },
      });
      if (!moduleEntity) {
        throw new BadRequestException(
          `ID module không hợp lệ: ${updateScheduleDto.moduleId}`,
        );
      }
      existingSchedule.module = moduleEntity;
    }

    if (updateScheduleDto.date) {
      existingSchedule.date = updateScheduleDto.date;
      const dayOfWeekString = moment(updateScheduleDto.date).format('dddd');
      existingSchedule.dayOfWeek = dayOfWeekString;
    }

    try {
      await this.scheduleRepository.save(existingSchedule);
      return existingSchedule;
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw new Error(`Không thể cập nhật lịch học: ${error.message}`);
    }
  }

  async remove(id: number): Promise<void> {
    await this.scheduleRepository.delete(id);
  }

  async getByClassId(classId: string): Promise<ScheduleDto[]> {
    const schedules = await this.scheduleRepository.find({
      where: { class: { id: Number(classId) } }, // Chuyển đổi classId thành số
      relations: [
        'shift',
        'class',
        'classroom',
        'teacher',
        'module',
        'attendances',
      ],
    });
    const scheduleDtos: ScheduleDto[] = schedules.map((schedule) => {
      const scheduleDto = new ScheduleDto();
      scheduleDto.id = schedule.id;
      scheduleDto.shift = schedule.shift;
      scheduleDto.class = schedule.class;
      scheduleDto.classroom = schedule.classroom;
      scheduleDto.teacher = schedule.teacher;
      scheduleDto.date = moment(schedule.date).format('DD-MM-YYYY');
      scheduleDto.module = schedule.module;
      scheduleDto.attendances = schedule.attendances;
      scheduleDto.dayOfWeek = schedule.dayOfWeek;
      return scheduleDto;
    });
    return scheduleDtos;
  }

  async getByTeacherId(
    teacherId: number,
    date: string,
  ): Promise<ScheduleDto[]> {
    const formatDate = moment(date).format('YYYY-MM-DD').toString();
    const schedules = await this.scheduleRepository.find({
      where: { date: formatDate, teacher: { id: teacherId } },
      relations: ['shift', 'class', 'classroom', 'teacher', 'module'],
    });

    const scheduleDtos: ScheduleDto[] = schedules.map((schedule) => {
      const scheduleDto = new ScheduleDto();
      scheduleDto.id = schedule.id;
      scheduleDto.shift = schedule.shift;
      scheduleDto.class = schedule.class;
      scheduleDto.classroom = schedule.classroom;
      scheduleDto.teacher = schedule.teacher;
      scheduleDto.date = moment(schedule.date).format('DD-MM-YYYY');
      scheduleDto.module = schedule.module;
      scheduleDto.attendances = schedule.attendances;
      scheduleDto.dayOfWeek = schedule.dayOfWeek;
      return scheduleDto;
    });
    return scheduleDtos;
  }
  async findByClassId(classId: number): Promise<Schedule[]> {
    return this.scheduleRepository.find({
      where: { class: { id: classId } },
      relations: [
        'class',
        'shift',
        'lecturer',
        'subject',
        'classroom',
        'classroom.building',
      ],
    });
  }

  async findSchedulesByClassAndDateRange(
    classId: number,
    startDate: string,
    endDate: string,
  ): Promise<Schedule[]> {
    const schedules = await this.scheduleRepository.find({
      where: {
        class: { id: classId },
        date: Between(startDate, endDate),
      },
      relations: [
        'shift',
        'class',
        'classroom',
        'teacher',
        'module',
        'attendances',
      ], // Load related entities if needed
    });
    return schedules;
  }
  async findAvailableTeachersForSchedule(
    moduleId: number,
    startDate: string,
    classDay: ClassDayDto[],
  ): Promise<Teacher[]> {
    const module = await this.moduleRepository.findOne({
      where: { module_id: moduleId },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    const numberOfClasses = module.number_of_classes;

    // Lấy tất cả các ngày và ca học từ classDay
    const scheduleDates: string[] = [];
    const allShiftIds: number[] = [];

    classDay.forEach((day) => {
      const dates = this.calculateScheduleDates(
        startDate,
        [day.selectedDays],
        numberOfClasses,
      );
      scheduleDates.push(...dates);
      allShiftIds.push(...day.shiftIds);
    });

    // Loại bỏ các shiftId trùng lặp
    const uniqueShiftIds = [...new Set(allShiftIds)];

    // Tìm các giáo viên đã có lịch dạy
    const occupiedTeachers = await this.scheduleRepository
      .createQueryBuilder('schedule')
      .select('schedule.teacherId')
      .where('schedule.shiftId IN (:...shiftIds)', { shiftIds: uniqueShiftIds })
      .andWhere('schedule.date IN (:...scheduleDates)', { scheduleDates })
      .groupBy('schedule.teacherId')
      .getRawMany();

    const occupiedTeacherIds = occupiedTeachers.map((s) => s.teacherId);

    // Tìm các giáo viên có thể dạy module này và còn trống lịch
    const availableTeachers = await this.teacherRepository
      .createQueryBuilder('teacher')
      .leftJoinAndSelect('teacher.modules', 'module')
      .leftJoin('teacher.working_shift', 'shift')
      .where('module.module_id = :moduleId', { moduleId })
      .andWhere('shift.id IN (:...shiftIds)', { shiftIds: uniqueShiftIds })
      .andWhere('teacher.id NOT IN (:...occupiedTeacherIds)', {
        occupiedTeacherIds: occupiedTeacherIds.length
          ? occupiedTeacherIds
          : [-1],
      })
      .getMany();

    return availableTeachers;
  }
  async findAvailableClassrooms(
    moduleId: number,
    startDate: string,
    classDay: ClassDayDto[],
  ): Promise<Classroom[]> {
    const module = await this.moduleRepository.findOne({
      where: { module_id: moduleId },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    const numberOfClasses = module.number_of_classes;

    // Lấy tất cả các ngày và ca học từ classDay
    const scheduleDates: string[] = [];
    const allShiftIds: number[] = [];

    classDay.forEach((day) => {
      const dates = this.calculateScheduleDates(
        startDate,
        [day.selectedDays],
        numberOfClasses,
      );
      scheduleDates.push(...dates);
      allShiftIds.push(...day.shiftIds);
    });

    // Loại bỏ các shiftId trùng lặp
    const uniqueShiftIds = [...new Set(allShiftIds)];

    // Tìm các phòng học đã được sử dụng
    const occupiedClassrooms = await this.scheduleRepository
      .createQueryBuilder('schedule')
      .select('schedule.classroomId')
      .where('schedule.shiftId IN (:...shiftIds)', { shiftIds: uniqueShiftIds })
      .andWhere('schedule.date IN (:...scheduleDates)', { scheduleDates })
      .groupBy('schedule.classroomId')
      .getRawMany();

    const occupiedClassroomIds = occupiedClassrooms.map((s) => s.classroomId);

    // Tìm các phòng học còn trống
    const availableClassrooms = await this.classroomRepository
      .createQueryBuilder('classroom')
      .where('classroom.id NOT IN (:...occupiedClassroomIds)', {
        occupiedClassroomIds: occupiedClassroomIds.length
          ? occupiedClassroomIds
          : [-1],
      })
      .getMany();

    return availableClassrooms;
  }
  private validateStartDate(startDate: Date): void {
    // Đặt thời gian về 00:00:00 để chỉ so sánh ngày
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Ngày hôm nay (00:00:00 theo giờ địa phương)

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Ngày mai

    // Kiểm tra xem ngày phải lớn hơn hoặc bằng ngày mai
    if (startDate < tomorrow) {
      throw new BadRequestException(
        'Ngày phải là ngày trong tương lai (sau hôm nay)',
      );
    }
  }
  private calculateScheduleDates(
    startDate: string,
    selectedDays: string[],
    numberOfClasses: number,
  ): string[] {
    const start = new Date(startDate);
    const daysOfWeek = this.convertDaysToNumbers(selectedDays);
    const scheduleDates: string[] = [];

    let classesScheduled = 0;
    while (classesScheduled < numberOfClasses) {
      if (daysOfWeek.includes(start.getDay())) {
        scheduleDates.push(start.toISOString().split('T')[0]);
        classesScheduled++;
      }
      start.setDate(start.getDate() + 1);
    }
    return scheduleDates;
  }
  private convertDaysToNumbers(selectedDays: string[]): number[] {
    const dayMap = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };
    return selectedDays.map((day) => dayMap[day]);
  }

  async autoCreateByCoursesFamily(
    classId: number,
    createScheduleDtos: CreateScheduleWithDaysDto[],
  ): Promise<Schedule[]> {
    const classEntity = await this.classRepository.findOne({
      where: { id: classId },
      relations: ['coursesFamily.courses', 'coursesFamily'],
    });

    if (!classEntity) {
      throw new Error('Không tìm thấy lớp học');
    }

    const coursesFamily = classEntity.coursesFamily;
    if (
      !coursesFamily ||
      !Array.isArray(coursesFamily.courses) ||
      !coursesFamily.courses.length
    ) {
      throw new Error(
        'Không tìm thấy coursesFamily hoặc courses trong lớp học này',
      );
    }

    // Tạo một map để lưu trữ tất cả các slot thời gian đã được sử dụng
    const timeSlots = new Map<
      string,
      {
        teacherId: number;
        classroomId: number;
        moduleId: number;
      }
    >();

    // Thêm trước vòng lặp kiểm tra
    const shiftMap = new Map<number, string>();
    const moduleMap = new Map<number, string>();

    // Lấy thông tin về tất cả các ca học và module được sử dụng
    const allShiftIds = Array.from(
      new Set(
        createScheduleDtos.flatMap((dto) =>
          dto.createScheduleDto.classDay.flatMap((day) => day.shiftIds),
        ),
      ),
    );
    const allModuleIds = createScheduleDtos.map(
      (dto) => dto.createScheduleDto.moduleId,
    );

    const shifts = await this.shiftRepository.findByIds(allShiftIds);
    shifts.forEach((shift) => shiftMap.set(shift.id, shift.name));

    const modules = await this.moduleRepository.findBy({
      module_id: In(allModuleIds),
    });
    modules.forEach((module) =>
      moduleMap.set(module.module_id, module.module_name),
    );

    // Kiểm tra xung đột lịch trước khi tạo
    for (const createScheduleDto of createScheduleDtos) {
      const { startDate, moduleId, classroomId, teacherId, classDay } =
        createScheduleDto.createScheduleDto;

      this.validateStartDate(new Date(startDate));

      const module = await this.moduleRepository.findOne({
        where: { module_id: moduleId },
      });
      if (!module) {
        throw new Error(`Không tìm thấy module với id: ${moduleId}`);
      }

      let currentDate = new Date(startDate);
      const numberOfClasses = module.number_of_classes;
      let classesChecked = 0;

      while (classesChecked < numberOfClasses) {
        const dayOfWeekString = currentDate.toLocaleString('en-US', {
          weekday: 'long',
        });

        const dayInfo = classDay.find(
          (day) => day.selectedDays === dayOfWeekString,
        );

        if (dayInfo) {
          const dateString = currentDate.toISOString().split('T')[0];

          for (const shiftId of dayInfo.shiftIds) {
            // Tạo key duy nhất cho mỗi slot thời gian
            const timeSlotKey = `${dateString}-${shiftId}`;

            // Kiểm tra xem slot thời gian này đã được sử dụng chưa
            const existingSlot = timeSlots.get(timeSlotKey);
            if (existingSlot) {
              const shiftName = shiftMap.get(shiftId) || `Ca ${shiftId}`;
              const currentModuleName =
                moduleMap.get(moduleId) || `Module ${moduleId}`;
              const existingModuleName =
                moduleMap.get(existingSlot.moduleId) ||
                `Module ${existingSlot.moduleId}`;

              throw new Error(
                `Không thể tạo lịch cho môn "${currentModuleName}" vào ngày ${dateString}, ${shiftName} vì đã có môn "${existingModuleName}" được lên lịch vào thời điểm này.`,
              );
            }

            // Kiểm tra xem giáo viên có trùng lịch không
            const teacherKey = `${dateString}-${shiftId}-${teacherId}`;
            const existingTeacherSlot = Array.from(timeSlots.values()).find(
              (slot) =>
                slot.teacherId === teacherId &&
                timeSlots.get(`${dateString}-${shiftId}`) !== undefined,
            );
            if (existingTeacherSlot) {
              throw new Error(
                `Giáo viên ${teacherId} đã có lịch dạy vào ngày ${dateString}, ca ${shiftId}.`,
              );
            }

            // Kiểm tra xem phòng học có trùng lịch không
            const classroomKey = `${dateString}-${shiftId}-${classroomId}`;
            const existingClassroomSlot = Array.from(timeSlots.values()).find(
              (slot) =>
                slot.classroomId === classroomId &&
                timeSlots.get(`${dateString}-${shiftId}`) !== undefined,
            );
            if (existingClassroomSlot) {
              throw new Error(
                `Phòng học ${classroomId} đã được sử dụng vào ngày ${dateString}, ca ${shiftId}.`,
              );
            }

            // Lưu slot thời gian này vào map
            timeSlots.set(timeSlotKey, {
              teacherId,
              classroomId,
              moduleId,
            });
          }
          classesChecked++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    const schedules: Schedule[] = [];
    for (const createScheduleDto of createScheduleDtos) {
      const { startDate, moduleId, classroomId, teacherId, classDay } =
        createScheduleDto.createScheduleDto;

      const module = await this.moduleRepository.findOne({
        where: { module_id: moduleId },
      });
      const teacher = await this.teacherRepository.findOne({
        where: { id: teacherId },
      });
      const classroom = await this.classroomRepository.findOne({
        where: { id: classroomId },
      });

      let currentDate = new Date(startDate);
      let classesCreated = 0;
      const totalClassesNeeded = module.number_of_classes;

      // Tính tổng số buổi học mỗi tuần (tính cả số ca học mỗi ngày)
      const totalSessionsPerWeek = classDay.reduce(
        (total, day) => total + day.shiftIds.length,
        0,
      );

      while (classesCreated < totalClassesNeeded) {
        const dayOfWeekString = currentDate.toLocaleString('en-US', {
          weekday: 'long',
        });

        const dayInfo = classDay.find(
          (day) => day.selectedDays === dayOfWeekString,
        );

        if (dayInfo) {
          // Tạo bản ghi cho mỗi ca học trong ngày
          for (const shiftId of dayInfo.shiftIds) {
            // Kiểm tra xem đã đủ số buổi học chưa
            if (classesCreated >= totalClassesNeeded) {
              break;
            }

            const schedule = this.scheduleRepository.create({
              class: { id: classId },
              module,
              teacher,
              classroom,
              date: currentDate.toISOString().split('T')[0],
              shift: { id: shiftId },
              dayOfWeek: dayOfWeekString,
            });

            schedules.push(await this.scheduleRepository.save(schedule));
            classesCreated++;
          }
        }

        // Nếu đã đủ số buổi học cần thiết, dừng vòng lặp
        if (classesCreated >= totalClassesNeeded) {
          break;
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return schedules;
  }

  async getScheduleCountByDayInMonth(
    date: string,
    teacherId: number,
  ): Promise<ScheduleCountByDayDto[]> {
    // Parse the date string correctly using moment
    const parsedDate = moment(date);

    if (!parsedDate.isValid()) {
      throw new Error('Invalid date provided');
    }

    // Get the start and end dates of the month
    const startDate = parsedDate.clone().startOf('month').format('YYYY-MM-DD');
    const endDate = parsedDate.clone().endOf('month').format('YYYY-MM-DD');
    const schedules = await this.scheduleRepository.find({
      where: {
        date: Between(startDate, endDate),
        teacher: { id: teacherId },
      },
    });

    const scheduleCountByDay = schedules.reduce(
      (acc, schedule) => {
        const day = new Date(schedule.date).getDate();
        if (!acc[day]) {
          acc[day] = 0;
        }
        acc[day]++;
        return acc;
      },
      {} as { [key: number]: number },
    );

    return Object.entries(scheduleCountByDay).map(([day, count]) => ({
      day: Number(day),
      count: count,
    })) as ScheduleCountByDayDto[];
  }
}
