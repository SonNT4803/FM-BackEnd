import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Module } from 'src/entities/module.entity';
import { Shift } from 'src/entities/shift.entity';
import { In, Repository } from 'typeorm';
import { Teacher } from '../entities/teacher.entity';
import { CreateTeacherDto, UpdateTeacherDto } from './dto/teacher.dto';

@Injectable()
export class TeacherService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
    @InjectRepository(Module)
    private readonly moduleRepository: Repository<Module>,
  ) {}

  async create(createTeacherDto: CreateTeacherDto): Promise<Teacher> {
    let shifts: any = [];
    if (createTeacherDto.working_shift) {
      shifts = await this.shiftRepository.findBy({
        id: In(createTeacherDto.working_shift),
      });
    }

    // Tìm kiếm các Module theo IDs
    // Sử dụng createTeacherDto.modules nếu tồn tại, ngược lại sử dụng createTeacherDto.modules_ids
    const moduleIds = createTeacherDto.modules;
    const modules = await this.moduleRepository.findBy({
      module_id: In(moduleIds),
    });

    // Tạo mới đối tượng Teacher với các Shift và Module đã tìm
    const teacher = this.teacherRepository.create({
      ...createTeacherDto,
      working_shift: shifts,
      modules: modules,
    });

    // Lưu đối tượng Teacher vào cơ sở dữ liệu
    return await this.teacherRepository.save(teacher);
  }

  async findAll(): Promise<Teacher[]> {
    return await this.teacherRepository.find({
      relations: ['working_shift', 'modules'],
    });
  }

  async findOne(id: number): Promise<Teacher> {
    return await this.teacherRepository.findOne({
      where: { id },
      relations: ['working_shift', 'modules'],
    });
  }

  async update(
    id: number,
    updateTeacherDto: UpdateTeacherDto,
  ): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({
      where: { id },
      relations: ['working_shift', 'modules'],
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    Object.assign(teacher, updateTeacherDto);

    if (updateTeacherDto.working_shift) {
      const shifts = await this.shiftRepository.find({
        where: { id: In(updateTeacherDto.working_shift) },
      });
      teacher.working_shift = shifts;
    }

    if (updateTeacherDto.modules) {
      const modules = await this.moduleRepository.find({
        where: { module_id: In(updateTeacherDto.modules) },
      });
      teacher.modules = modules;
    }

    return this.teacherRepository.save(teacher);
  }

  async remove(id: number): Promise<void> {
    await this.teacherRepository.delete(id);
  }
}
