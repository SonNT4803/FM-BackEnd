import { Injectable, BadRequestException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../entities/center/student.entity';
import { Class } from '../entities/center/class.entity';
import { AttendanceService } from '../attendance/attendance.service';
import * as faceapi from 'face-api.js';
import { Canvas, Image, ImageData } from 'canvas';
import * as path from 'path';
import * as fs from 'fs';
import { Schedule } from 'src/entities/schedule.entity';

// Configure face-api.js to use canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData } as any);

@Injectable()
export class FaceApiService {
  private modelsLoaded = false;
  private readonly modelPath = path.join(process.cwd(), 'models');

  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
    private readonly attendanceService: AttendanceService,
  ) {
    // Ensure models directory exists
    if (!fs.existsSync(this.modelPath)) {
      fs.mkdirSync(this.modelPath, { recursive: true });
    }
  }

  private async loadModels() {
    if (!this.modelsLoaded) {
      try {
        const modelPath = path.resolve(process.cwd(), 'models');
        console.log('Loading models from:', modelPath);

        await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
        await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
        await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);

        this.modelsLoaded = true;
        console.log('Models loaded successfully');
      } catch (error) {
        console.error('Error loading models:', error);
        throw new BadRequestException(
          'Không thể tải models. Vui lòng kiểm tra thư mục models/',
        );
      }
    }
  }

  private async loadImage(imageOrPath: string): Promise<Image> {
    try {
      // Nếu là base64 data url
      if (imageOrPath.startsWith('data:image/')) {
        const base64Data = imageOrPath.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        return await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = (err) =>
            reject(new Error('Failed to load image: ' + err));
          img.src = buffer;
        });
      }

      // Nếu là đường dẫn file
      let filePath = imageOrPath;
      if (filePath.startsWith('/')) {
        filePath = filePath.substring(1); // Bỏ dấu / đầu
      }
      filePath = path.join(process.cwd(), filePath);
      if (!fs.existsSync(filePath)) {
        throw new Error('File not found: ' + filePath);
      }
      const buffer = fs.readFileSync(filePath);
      return await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (err) =>
          reject(new Error('Failed to load image: ' + err));
        img.src = buffer;
      });
    } catch (error) {
      console.error('Error in loadImage:', error);
      throw new BadRequestException('Không thể đọc ảnh: ' + error.message);
    }
  }
  // Method để test format ảnh avatar
  async testAvatarFormat(studentId: number): Promise<any> {
    try {
      const student = await this.studentRepository.findOne({
        where: { id: studentId },
      });

      if (!student) {
        throw new BadRequestException('Không tìm thấy sinh viên');
      }

      if (!student.avatar) {
        return {
          hasAvatar: false,
          message: 'Sinh viên không có ảnh đại diện',
        };
      }

      const avatarStart = student.avatar.substring(0, 50);
      const isDataUrl = student.avatar.startsWith('data:image/');

      return {
        hasAvatar: true,
        isDataUrl,
        avatarStart,
        avatarLength: student.avatar.length,
        message: isDataUrl
          ? 'Ảnh đúng format'
          : 'Ảnh không đúng format (cần bắt đầu bằng data:image/)',
      };
    } catch (error) {
      console.error('Error in testAvatarFormat:', error);
      throw new BadRequestException(`Lỗi kiểm tra ảnh: ${error.message}`);
    }
  }

  async verifyFace(
    image: string,
    studentId: number,
    scheduleId: number,
    note?: string,
  ): Promise<any> {
    try {
      await this.loadModels();

      const student = await this.studentRepository.findOne({
        where: { id: studentId },
      });

      if (!student || !student?.avatar) {
        throw new BadRequestException(
          'Không tìm thấy sinh viên hoặc ảnh đại diện',
        );
      }

      if (!image || !image.startsWith('data:image/')) {
        throw new BadRequestException('Ảnh đầu vào không hợp lệ');
      }

      const inputImage = await this.loadImage(image);
      const referenceImage = await this.loadImage(student.avatar);

      const inputDetection = await faceapi
        .detectSingleFace(inputImage as any)
        .withFaceLandmarks()
        .withFaceDescriptor();

      const referenceDetection = await faceapi
        .detectSingleFace(referenceImage as any)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!inputDetection || !referenceDetection) {
        throw new BadRequestException(
          'Không phát hiện được khuôn mặt trong ảnh',
        );
      }

      const distance = faceapi.euclideanDistance(
        inputDetection.descriptor,
        referenceDetection.descriptor,
      );

      const threshold = 0.6;
      const verified = distance < threshold;

      if (!verified) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Xác thực khuôn mặt thất bại',
          data: { verified: false },
        };
      }

      const schedule = await this.scheduleRepository.findOne({
        where: { id: scheduleId },
        relations: ['class', 'teacher'],
      });

      if (!schedule) {
        throw new BadRequestException(
          `Không tìm thấy lịch học với ID ${scheduleId}`,
        );
      }

      const attendanceData = {
        studentId,
        classId: schedule.class.id,
        scheduleId: schedule.id,
        teacherId: schedule.teacher.id,
        status: 1,
        note: note || 'Điểm danh bằng xác thực khuôn mặt',
      };

      await this.attendanceService.markAttendance(attendanceData);

      return {
        statusCode: HttpStatus.OK,
        message: 'Xác thực khuôn mặt thành công',
        data: {
          verified: true,
        },
      };
    } catch (error) {
      console.error('Error in verifyFace:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Lỗi xác thực khuôn mặt: ${error.message}`);
    }
  }

  async verifyClass(
    image: string,
    classId: number,
    teacherId: number,
    scheduleId: number,
  ): Promise<any> {
    try {
      await this.loadModels();

      const classInfo = await this.classRepository.findOne({
        where: { id: classId },
        relations: ['students'],
      });

      if (!classInfo || !classInfo.students.length) {
        throw new BadRequestException(
          'Không tìm thấy lớp học hoặc lớp không có học sinh',
        );
      }

      // Validate input image
      if (!image || !image.startsWith('data:image/')) {
        throw new BadRequestException('Ảnh đầu vào không hợp lệ');
      }

      const inputImage = await this.loadImage(image);
      const inputDetection = await faceapi
        .detectAllFaces(inputImage as any)
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (!inputDetection.length) {
        throw new BadRequestException(
          'Không phát hiện được khuôn mặt trong ảnh',
        );
      }

      const results = [];
      const verifiedStudents = [];

      for (const student of classInfo.students) {
        if (!student.avatar) {
          results.push({
            studentId: student.id,
            verified: false,
            reason: 'Không có ảnh đại diện',
          });
          continue;
        }

        try {
          const referenceImage = await this.loadImage(student.avatar);
          const referenceDetection = await faceapi
            .detectSingleFace(referenceImage as any)
            .withFaceLandmarks()
            .withFaceDescriptor();

          if (!referenceDetection) {
            results.push({
              studentId: student.id,
              verified: false,
              reason: 'Không phát hiện khuôn mặt trong ảnh đại diện',
            });
            continue;
          }

          let isVerified = false;
          for (const face of inputDetection) {
            const distance = faceapi.euclideanDistance(
              face.descriptor,
              referenceDetection.descriptor,
            );
            if (distance < 0.6) {
              isVerified = true;
              break;
            }
          }

          if (isVerified) {
            verifiedStudents.push(student.id);
          }

          results.push({
            studentId: student.id,
            verified: isVerified,
          });
        } catch (error) {
          results.push({
            studentId: student.id,
            verified: false,
            reason: 'Lỗi xử lý ảnh đại diện',
          });
        }
      }

      if (verifiedStudents.length > 0) {
        await this.attendanceService.markAttendanceByFace(
          verifiedStudents,
          classId,
          1,
          teacherId,
          scheduleId,
        );
      }

      return {
        results,
        total_faces_detected: inputDetection.length,
        verified_count: verifiedStudents.length,
      };
    } catch (error) {
      console.error('Error in verifyClass:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Lỗi xác thực khuôn mặt lớp học: ${error.message}`,
      );
    }
  }
}
