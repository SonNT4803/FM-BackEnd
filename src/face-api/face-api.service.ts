import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../entities/center/student.entity';
import { Class } from '../entities/center/class.entity';
import { AttendanceService } from '../attendance/attendance.service';
import * as faceapi from 'face-api.js';
import { Canvas, Image, ImageData } from 'canvas';
import * as path from 'path';
import * as fs from 'fs';
import * as sharp from 'sharp';
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
        let buffer = Buffer.from(base64Data, 'base64');
        // Resize và auto-orient bằng sharp
        buffer = await sharp(buffer)
          .rotate() // auto-orient theo EXIF
          .resize({ width: 800, height: 800, fit: 'inside' }) // resize max 800px
          .toBuffer();
        // Lưu file debug
        fs.writeFileSync('debug_input.jpg', buffer);
        console.log(
          'Debug: Saved input image to debug_input.jpg, size:',
          buffer.length,
        );
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

      const avatarStart = student.avatar.substring(0, 100);
      const isDataUrl = student.avatar.startsWith('data:image/');
      const isFilePath =
        student.avatar.startsWith('/uploads/') ||
        student.avatar.startsWith('uploads/');

      return {
        hasAvatar: true,
        isDataUrl,
        isFilePath,
        avatarStart,
        avatarLength: student.avatar.length,
        fullAvatarPath: student.avatar,
        message: isDataUrl
          ? 'Ảnh đúng format (data URL)'
          : isFilePath
            ? 'Ảnh đúng format (file path) - có thể sử dụng cho face verification'
            : 'Ảnh không đúng format (cần là data URL hoặc file path)',
      };
    } catch (error) {
      console.error('Error in testAvatarFormat:', error);
      throw new BadRequestException(`Lỗi kiểm tra ảnh: ${error.message}`);
    }
  }

  // Method để test face detection với ảnh avatar đã lưu
  async testFaceDetection(studentId: number): Promise<any> {
    try {
      console.log('=== TEST FACE DETECTION ===');
      console.log('Student ID:', studentId);

      await this.loadModels();

      const student = await this.studentRepository.findOne({
        where: { id: studentId },
      });

      if (!student) {
        throw new BadRequestException('Không tìm thấy sinh viên');
      }

      if (!student.avatar) {
        return {
          success: false,
          message: 'Sinh viên không có ảnh đại diện',
        };
      }

      console.log('Student avatar path:', student.avatar);

      console.log('Loading reference image...');
      const referenceImage = await this.loadImage(student.avatar);
      console.log('Reference image loaded successfully');

      console.log('Detecting face in reference image...');
      const referenceDetection = await faceapi
        .detectSingleFace(referenceImage as any)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!referenceDetection) {
        console.log('No face detected in reference image');
        return {
          success: false,
          message: 'Không phát hiện được khuôn mặt trong ảnh đại diện',
          avatarPath: student.avatar,
        };
      }

      console.log('Face detected in reference image');
      return {
        success: true,
        message: 'Phát hiện được khuôn mặt trong ảnh đại diện',
        avatarPath: student.avatar,
        faceDetection: {
          confidence: referenceDetection.detection.score,
          landmarks: referenceDetection.landmarks
            ? 'Available'
            : 'Not available',
          descriptor: referenceDetection.descriptor
            ? 'Available'
            : 'Not available',
        },
      };
    } catch (error) {
      console.error('Error in testFaceDetection:', error);
      return {
        success: false,
        message: `Lỗi test face detection: ${error.message}`,
        error: error.message,
      };
    }
  }

  async verifyFace(
    image: string,
    studentId: number,
    scheduleId: number,
    note?: string,
  ): Promise<any> {
    try {
      console.log('=== FACE VERIFICATION START ===');
      console.log('Student ID:', studentId);
      console.log('Schedule ID:', scheduleId);
      console.log(
        'Input image type:',
        image
          ? image.startsWith('data:image/')
            ? 'data URL'
            : 'file path'
          : 'null',
      );

      await this.loadModels();

      const student = await this.studentRepository.findOne({
        where: { id: studentId },
      });

      if (!student || !student?.avatar) {
        throw new BadRequestException(
          'Không tìm thấy sinh viên hoặc ảnh đại diện',
        );
      }

      console.log('Student avatar path:', student.avatar);

      // Remove strict data URL validation - let loadImage handle both formats
      if (!image) {
        throw new BadRequestException('Ảnh đầu vào không hợp lệ');
      }

      console.log('Loading input image...');
      const inputImage = await this.loadImage(image);
      console.log('Input image loaded successfully');

      console.log('Loading reference image...');
      const referenceImage = await this.loadImage(student.avatar);
      console.log('Reference image loaded successfully');

      console.log('Detecting face in input image...');
      const inputDetection = await faceapi
        .detectSingleFace(inputImage as any)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!inputDetection) {
        console.log('No face detected in input image');
        throw new BadRequestException(
          'Không phát hiện được khuôn mặt trong ảnh đầu vào',
        );
      }
      console.log('Face detected in input image');

      console.log('Detecting face in reference image...');
      const referenceDetection = await faceapi
        .detectSingleFace(referenceImage as any)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!referenceDetection) {
        console.log('No face detected in reference image');
        throw new BadRequestException(
          'Không phát hiện được khuôn mặt trong ảnh đại diện',
        );
      }
      console.log('Face detected in reference image');

      const distance = faceapi.euclideanDistance(
        inputDetection.descriptor,
        referenceDetection.descriptor,
      );

      console.log('Face distance:', distance);

      // Ngưỡng khoảng cách để xác định là cùng một người
      const threshold = 0.6;
      const matched = distance < threshold;

      // Nếu matched, lưu điểm danh vào DB
      if (matched) {
        // Lấy classId và teacherId từ student và schedule nếu cần
        const classId = student.class ? student.class.id : undefined;
        // Nếu cần lấy teacherId từ schedule hoặc truyền từ FE, bạn có thể bổ sung logic lấy teacherId phù hợp
        let teacherId = undefined;
        // Nếu student có teacher hoặc bạn có thể lấy từ schedule, hãy bổ sung logic ở đây
        // Ở đây tạm để undefined, bạn cần truyền đúng teacherId từ FE hoặc lấy từ DB
        if (!classId) {
          console.warn('Không tìm thấy classId cho student');
        }
        if (!teacherId) {
          console.warn(
            'Bạn cần truyền teacherId vào verifyFace hoặc lấy từ schedule',
          );
        }
        await this.attendanceService.markAttendance({
          classId,
          studentId,
          teacherId,
          scheduleId,
          status: 1, // 1 = điểm danh thành công
          note,
        });
      }
      return {
        success: matched,
        message: matched
          ? 'Điểm danh thành công'
          : 'Khuôn mặt không trùng khớp',
        studentId,
        scheduleId,
        matched,
        distance,
        timestamp: new Date().toISOString(),
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
      if (!image) {
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
