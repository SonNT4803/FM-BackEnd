import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamType } from 'src/entities/center/exam.type.entity';

@Injectable()
export class ExamtypeService {
  constructor(
    @InjectRepository(ExamType)
    private readonly examtypeRepository: Repository<ExamType>,
  ) {}

  async create(createExamtypeDto: ExamType): Promise<ExamType> {
    const examtype = this.examtypeRepository.create(createExamtypeDto);
    return await this.examtypeRepository.save(examtype);
  }

  async findAll(): Promise<ExamType[]> {
    return await this.examtypeRepository.find();
  }

  async findOne(id: number): Promise<ExamType> {
    const examtype = await this.examtypeRepository.findOne({ where: { id } });
    if (!examtype) {
      throw new NotFoundException(`Examtype with ID ${id} not found`);
    }
    return examtype;
  }

  async update(id: number, updateExamtypeDto: ExamType): Promise<ExamType> {
    await this.examtypeRepository.update(id, updateExamtypeDto);
    const updatedExamtype = await this.examtypeRepository.findOne({
      where: { id },
    });
    if (!updatedExamtype) {
      throw new NotFoundException(`Examtype with ID ${id} not found`);
    }
    return updatedExamtype;
  }

  async remove(id: number): Promise<void> {
    const result = await this.examtypeRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Examtype with ID ${id} not found`);
    }
  }
}
