import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import * as path from 'path';
import { AttendanceService } from 'src/attendance/attendance.service';
import { Repository } from 'typeorm';
import { Class } from '../entities/center/class.entity';
import { Student } from '../entities/center/student.entity';

@Injectable()
export class FaceRecognitionService {
  // private readonly PYTHON_SERVER_URL = 'https://face.lht-jsc.com.vn';
  private readonly PYTHON_SERVER_URL = 'http://localhost:5001';

  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
    private readonly attendanceService: AttendanceService,
  ) {}

  async verifyFace(image: string, studentId: number): Promise<boolean> {
    try {
      const student = await this.studentRepository.findOne({
        where: { id: studentId },
      });

      if (!student || !student?.avatar) {
        throw new BadRequestException(
          'Không tìm thấy sinh viên hoặc ảnh đại diện',
        );
      }

      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      const img2Path = path.join(process.cwd(), student.avatar);

      try {
        const response = await axios.post(
          `${this.PYTHON_SERVER_URL}/verify-face`,
          {
            image: base64Data,
            reference_image: img2Path,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        if (response.data.error) {
          throw new BadRequestException(response.data.error);
        }

        return response.data.verified;
      } catch (error) {
        if (error.response?.data?.error) {
          throw new BadRequestException(
            `Lỗi từ server xác thực: ${error.response.data.error}`,
          );
        }
        if (error.code === 'ECONNREFUSED') {
          throw new BadRequestException(
            'Không thể kết nối đến server xác thực khuôn mặt. Vui lòng thử lại sau.',
          );
        }
        throw new BadRequestException(
          `Lỗi xác thực khuôn mặt: ${error.message || 'Lỗi không xác định'}`,
        );
      }
    } catch (error) {
      console.error('Error in verifyFace:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Lỗi xử lý: ${error.message || 'Lỗi không xác định'}`,
      );
    }
  }

  async verifyClass(
    image: string,
    classId: number,
    teacherId: number,
    scheduleId: number,
  ): Promise<any> {
    try {
      // Lấy danh sách học sinh trong lớp
      const classInfo = await this.classRepository.findOne({
        where: { id: classId },
        relations: ['students'],
      });
      if (!classInfo || !classInfo.students.length) {
        throw new BadRequestException(
          'Không tìm thấy lớp học hoặc lớp không có học sinh',
        );
      }

      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      try {
        const response = await axios.post(
          `${this.PYTHON_SERVER_URL}/verify-class`,
          {
            image: base64Data,
            students: classInfo.students.map((student) => ({
              id: student.id,
              avatar: student.avatar
                ? path.join(process.cwd(), student.avatar)
                : null,
            })),
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        // Lọc ra chỉ những sinh viên được xác thực thành công
        const verifiedStudents = response.data.results
          .filter((result) => result.verified === true)
          .map((result) => result.studentId);

        if (verifiedStudents.length > 0) {
          await this.attendanceService.markAttendanceByFace(
            verifiedStudents,
            classId,
            1,
            teacherId,
            scheduleId,
          );
        }

        if (response.data.error) {
          throw new BadRequestException(response.data.error);
        }

        return response.data;
      } catch (error) {
        if (error.response?.data?.error) {
          throw new BadRequestException(
            `Lỗi từ server xác thực: ${error.response.data.error}`,
          );
        }
        if (error.code === 'ECONNREFUSED') {
          throw new BadRequestException(
            'Không thể kết nối đến server xác thực khuôn mặt. Vui lòng thử lại sau.',
          );
        }
        throw new BadRequestException(
          `Lỗi xác thực khuôn mặt: ${error.message || 'Lỗi không xác định'}`,
        );
      }
    } catch (error) {
      console.error('Error in verifyClass:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Lỗi xử lý: ${error.message || 'Lỗi không xác định'}`,
      );
    }
  }

  async verifyClassStream(image: string, classId: number): Promise<any> {
    try {
      const classInfo = await this.classRepository.findOne({
        where: { id: classId },
        relations: ['students'],
      });

      if (!classInfo || !classInfo.students.length) {
        throw new BadRequestException(
          'Không tìm thấy lớp học hoặc lớp không có học sinh',
        );
      }

      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

      try {
        const response = await axios.post(
          `${this.PYTHON_SERVER_URL}/verify-class-stream`,
          {
            image: base64Data,
            students: classInfo.students.map((student) => ({
              id: student.id,
              avatar: student.avatar
                ? path.join(process.cwd(), student.avatar)
                : null,
            })),
          },
          {
            headers: { 'Content-Type': 'application/json' },
          },
        );

        if (response.data.error) {
          throw new BadRequestException(response.data.error);
        }

        return {
          results: response.data.results,
          total_faces_detected: response.data.total_faces_detected,
        };
      } catch (error) {
        if (error.response?.data?.error) {
          throw new BadRequestException(
            `Lỗi từ server xác thực: ${error.response.data.error}`,
          );
        }
        throw error;
      }
    } catch (error) {
      console.error('Error in verifyClassStream:', error);
      throw error;
    }
  }
}
