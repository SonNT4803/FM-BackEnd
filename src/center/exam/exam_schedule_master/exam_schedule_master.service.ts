import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { ExamScheduleMaster } from 'src/entities/center/exam.schedule.master.entity';
import { Module } from 'src/entities/module.entity';
import { ExamType } from 'src/entities/center/exam.type.entity';
import {
  CreateExamScheduleMasterDto,
  UpdateExamScheduleMasterDto,
} from './dto/exam-schedule-master.dto';

@Injectable()
export class ExamScheduleMasterService {
  constructor(
    @InjectRepository(ExamScheduleMaster)
    private examScheduleMasterRepository: Repository<ExamScheduleMaster>,
    @InjectRepository(Module)
    private moduleRepository: Repository<Module>,
    @InjectRepository(ExamType)
    private examTypeRepository: Repository<ExamType>,
  ) {}

  async create(
    createExamScheduleDto: CreateExamScheduleMasterDto,
  ): Promise<ExamScheduleMaster> {
    const { module_id, exam_type_id, exam_date, start_time, ...rest } =
      createExamScheduleDto;

    const module = await this.moduleRepository.findOne({
      where: { module_id: module_id },
    });
    if (!module) {
      throw new NotFoundException(`Module với ID ${module_id} không tồn tại`);
    }

    const examType = await this.examTypeRepository.findOne({
      where: { id: exam_type_id },
    });
    if (!examType) {
      throw new NotFoundException(
        `Loại kỳ thi với ID ${exam_type_id} không tồn tại`,
      );
    }

    const existingExamWithType =
      await this.examScheduleMasterRepository.findOne({
        where: {
          module: { module_id: module_id },
          exam_type: { id: exam_type_id },
          exam_date: exam_date,
        },
        relations: ['module', 'exam_type'],
      });

    if (existingExamWithType) {
      const existingStartTime = this.convertTimeToMinutes(
        existingExamWithType.start_time,
      );
      const existingEndTime = this.convertTimeToMinutes(
        existingExamWithType.end_time,
      );
      const newStartTime = this.convertTimeToMinutes(start_time);
      const newEndTime = this.convertTimeToMinutes(rest.end_time);

      if (
        (newStartTime >= existingStartTime &&
          newStartTime <= existingEndTime) ||
        (newEndTime >= existingStartTime && newEndTime <= existingEndTime) ||
        (newStartTime <= existingStartTime && newEndTime >= existingEndTime)
      ) {
        throw new Error(
          `Môn học ${module.code} đã có lịch thi loại ${examType.name} trong khoảng thời gian này (${existingExamWithType.start_time} - ${existingExamWithType.end_time}). Không thể tạo thêm.`,
        );
      }
    }

    const examSchedule = this.examScheduleMasterRepository.create({
      module,
      exam_type: examType,
      exam_date,
      start_time,
      ...rest,
    });

    return await this.examScheduleMasterRepository.save(examSchedule);
  }

  async findAll(): Promise<ExamScheduleMaster[]> {
    return await this.examScheduleMasterRepository.find({
      relations: ['module', 'exam_type', 'exam_rooms'],
    });
  }

  async findOne(id: number): Promise<ExamScheduleMaster> {
    const schedule = await this.examScheduleMasterRepository.findOne({
      where: { id },
      relations: ['module', 'exam_type', 'exam_rooms'],
    });

    if (!schedule) {
      throw new NotFoundException(`Lịch thi với ID ${id} không tồn tại`);
    }

    return schedule;
  }

  async update(
    id: number,
    updateExamScheduleDto: UpdateExamScheduleMasterDto,
  ): Promise<ExamScheduleMaster> {
    const { module_id, exam_type_id, exam_date, start_time, ...rest } =
      updateExamScheduleDto;
    const schedule = await this.findOne(id);

    const existingExams = await this.examScheduleMasterRepository.find({
      where: {
        module: { module_id: module_id || schedule.module.module_id },
        exam_type: { id: exam_type_id || schedule.exam_type.id },
        exam_date: exam_date || schedule.exam_date,
        id: Not(id),
      },
      relations: ['module', 'exam_type'],
    });

    const newStartTime = this.convertTimeToMinutes(
      start_time || schedule.start_time,
    );
    const newEndTime = this.convertTimeToMinutes(
      rest.end_time || schedule.end_time,
    );

    for (const existingExam of existingExams) {
      const existingStartTime = this.convertTimeToMinutes(
        existingExam.start_time,
      );
      const existingEndTime = this.convertTimeToMinutes(existingExam.end_time);

      if (
        (newStartTime >= existingStartTime &&
          newStartTime <= existingEndTime) ||
        (newEndTime >= existingStartTime && newEndTime <= existingEndTime) ||
        (newStartTime <= existingStartTime && newEndTime >= existingEndTime)
      ) {
        throw new Error(
          `Môn học ${schedule.module.code} đã có lịch thi loại ${schedule.exam_type.name} trong khoảng thời gian này (${existingExam.start_time} - ${existingExam.end_time}). Không thể cập nhật.`,
        );
      }
    }

    // Cập nhật thông tin module và exam_type nếu cần
    if (module_id) {
      const module = await this.moduleRepository.findOne({
        where: { module_id },
      });
      if (!module) {
        throw new NotFoundException(`Module với ID ${module_id} không tồn tại`);
      }
      schedule.module = module;
    }

    if (exam_type_id) {
      const examType = await this.examTypeRepository.findOne({
        where: { id: exam_type_id },
      });
      if (!examType) {
        throw new NotFoundException(
          `Loại kỳ thi với ID ${exam_type_id} không tồn tại`,
        );
      }
      schedule.exam_type = examType;
    }

    Object.assign(schedule, rest);

    return await this.examScheduleMasterRepository.save(schedule);
  }

  async remove(id: number): Promise<void> {
    const schedule = await this.findOne(id);
    await this.examScheduleMasterRepository.remove(schedule);
  }

  private convertTimeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':');
    return parseInt(hours) * 60 + parseInt(minutes);
  }
}
