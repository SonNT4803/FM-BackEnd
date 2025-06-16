import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Semester } from 'src/entities/semester.entity';
import { Repository } from 'typeorm';
import { CreateSemesterDto, UpdateSemesterDto } from './dto/semester.dto';

@Injectable()
export class SemesterService {
  constructor(
    @InjectRepository(Semester)
    private semesterRepository: Repository<Semester>,
  ) {}

  create(createSemesterDto: CreateSemesterDto): Promise<Semester> {
    const semester = this.semesterRepository.create(createSemesterDto);
    return this.semesterRepository.save(semester);
  }

  findAll(): Promise<Semester[]> {
    return this.semesterRepository.find();
  }

  async findOne(id: number): Promise<Semester> {
    const semester = await this.semesterRepository.findOne({ where: { id } });
    if (!semester) throw new NotFoundException('Semester not found');
    return semester;
  }

  async update(
    id: number,
    updateSemesterDto: UpdateSemesterDto,
  ): Promise<Semester> {
    await this.semesterRepository.update(id, updateSemesterDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.semesterRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Semester not found');
    }
  }
}
