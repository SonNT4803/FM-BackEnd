import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Evaluation } from 'src/entities/evaluation.entity';
import { Repository } from 'typeorm';
import { CreateEvaluationDto } from './dto/evaluation.dto';

@Injectable()
export class EvaluationService {
  constructor(
    @InjectRepository(Evaluation)
    private readonly evaluationRepository: Repository<Evaluation>,
  ) {}

  async createMultiple(evaluations: CreateEvaluationDto[]) {
    if (!Array.isArray(evaluations)) {
      throw new Error('Evaluations must be an array');
    }

    const results = [];

    for (const evaluation of evaluations) {
      try {
        // Tìm kiếm đánh giá hiện có
        let existingEvaluation = await this.evaluationRepository
          .createQueryBuilder('evaluation')
          .leftJoinAndSelect('evaluation.student', 'student')
          .leftJoinAndSelect('evaluation.teacher', 'teacher')
          .where('student.id = :studentId', { studentId: evaluation.studentId })
          .getOne();

        if (existingEvaluation) {
          // Nếu tồn tại, cập nhật
          const updated = await this.evaluationRepository.save({
            id: existingEvaluation.id,
            level: evaluation.level,
            comments: evaluation.comments,
            student: existingEvaluation.student,
            teacher: existingEvaluation.teacher,
          });
          results.push(updated);
        } else {
          // Nếu chưa tồn tại, tạo mới
          const newEvaluation = this.evaluationRepository.create({
            student: { id: evaluation.studentId },
            teacher: { id: evaluation.teacherId || 1 }, // Giả sử có teacherId mặc định là 1
            level: evaluation.level,
            comments: evaluation.comments,
          });
          const saved = await this.evaluationRepository.save(newEvaluation);
          results.push(saved);
        }
      } catch (error) {
        console.error('Error processing evaluation:', error);
        throw error;
      }
    }

    return results;
  }

  async findAll(): Promise<Evaluation[]> {
    return this.evaluationRepository.find({
      relations: ['student', 'teacher'],
    });
  }

  async findOne(id: number): Promise<Evaluation> {
    const evaluation = await this.evaluationRepository.findOne({
      where: { id },
      relations: ['student', 'teacher'],
    });
    if (!evaluation) {
      throw new NotFoundException(`Không tìm thấy hồ sơ đánh giá với ID ${id}`);
    }
    return evaluation;
  }

  async getEvaluationsByClass(classId: number): Promise<Evaluation[]> {
    return this.evaluationRepository.find({
      where: { student: { class: { id: classId } } },
      relations: ['student', 'teacher'],
    });
  }

  async remove(id: number): Promise<void> {
    const evaluation = await this.findOne(id);
    await this.evaluationRepository.remove(evaluation);
  }
}
