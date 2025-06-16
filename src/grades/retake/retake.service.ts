import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GradeFinal } from 'src/entities/grades/grades.entity';
import { Student } from 'src/entities/center/student.entity';

@Injectable()
export class RetakeService {
  constructor(
    @InjectRepository(GradeFinal)
    private gradeFinalRepository: Repository<GradeFinal>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) {}

  async processRetake(studentId: number, moduleId: number, newGrade: number) {
    const gradeFinal = await this.gradeFinalRepository.findOne({
      where: {
        student: { id: studentId },
        module: { module_id: moduleId },
      },
      relations: ['student', 'module'],
    });

    if (!gradeFinal) {
      throw new NotFoundException('Không tìm thấy điểm của sinh viên');
    }

    // Xử lý logic thi lại và học lại
    if (gradeFinal.status === 'NEED_RETAKE') {
      // Đây là lần thi lại
      gradeFinal.average_grade = newGrade;
      if (newGrade >= 5) {
        gradeFinal.status = 'PASSED';
      } else {
        // Nếu thi lại không đạt -> phải học lại
        gradeFinal.status = 'NEED_RETAKE_CLASS';
        gradeFinal.attempt += 1;
        // Cập nhật tổng số lần học lại của sinh viên
        await this.studentRepository.update(
          { id: studentId },
          { total_retake_attempts: () => 'total_retake_attempts + 1' },
        );
      }
    } else if (gradeFinal.status === 'NEED_RETAKE_CLASS') {
      // Đang trong quá trình học lại
      gradeFinal.average_grade = newGrade;
      gradeFinal.status = newGrade >= 5 ? 'PASSED' : 'NEED_RETAKE';

      if (gradeFinal.status === 'NEED_RETAKE') {
        // Reset để bắt đầu chu trình thi lại mới
        gradeFinal.retake_date = null;
      }
    }

    return await this.gradeFinalRepository.save(gradeFinal);
  }

  async registerRetakeClass(
    studentId: number,
    moduleId: number,
    retakeDate: string,
  ) {
    const gradeFinal = await this.gradeFinalRepository.findOne({
      where: {
        student: { id: studentId },
        module: { module_id: moduleId },
      },
    });

    if (!gradeFinal || gradeFinal.status !== 'NEED_RETAKE_CLASS') {
      throw new Error('Sinh viên không đủ điều kiện đăng ký học lại');
    }

    gradeFinal.retake_date = retakeDate;
    gradeFinal.status = 'RETAKING';

    return await this.gradeFinalRepository.save(gradeFinal);
  }
}
