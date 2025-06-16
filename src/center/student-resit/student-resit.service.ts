import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StudentResit } from 'src/entities/student-resit.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StudentResitService {
  constructor(
    @InjectRepository(StudentResit)
    private studentResitRepository: Repository<StudentResit>,
  ) {}

  async create(
    createStudentResitDto: Partial<StudentResit>,
  ): Promise<StudentResit> {
    const studentResit = this.studentResitRepository.create({
      ...createStudentResitDto,
      status: 'PENDING',
    });
    return await this.studentResitRepository.save(studentResit);
  }

  async findAll(): Promise<StudentResit[]> {
    return await this.studentResitRepository.find();
  }

  async findOne(id: number): Promise<StudentResit> {
    const studentResit = await this.studentResitRepository.findOne({
      where: { id },
    });
    if (!studentResit) {
      throw new NotFoundException(
        `Không tìm thấy đơn đăng ký học lại với ID ${id}`,
      );
    }
    return studentResit;
  }

  async update(
    id: number,
    updateStudentResitDto: Partial<StudentResit>,
  ): Promise<StudentResit> {
    const studentResit = await this.findOne(id);
    Object.assign(studentResit, updateStudentResitDto);
    return await this.studentResitRepository.save(studentResit);
  }

  async remove(id: number): Promise<void> {
    const result = await this.studentResitRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Không tìm thấy đơn đăng ký học lại với ID ${id}`,
      );
    }
  }
}
