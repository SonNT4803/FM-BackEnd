import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Canvas, Image, ImageData } from 'canvas';
import * as faceapi from 'face-api.js';
import * as fs from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';
import { AttendanceService } from '../attendance/attendance.service';
import { Class } from '../entities/center/class.entity';
import { Student } from '../entities/center/student.entity';
import * as https from 'https';
import * as http from 'http';
import { Schedule } from 'src/entities/schedule.entity';

// Try to use GPU acceleration if available
try {
  const tf = require('@tensorflow/tfjs-node-gpu');
  console.log('🚀 GPU acceleration enabled');
} catch (error) {
  try {
    const tf = require('@tensorflow/tfjs-node');
    console.log('⚡ CPU acceleration enabled');
  } catch (error) {
    console.log('⚠️ Using default TensorFlow.js (slower)');
  }
}

// Configure face-api.js to use canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData } as any);

// Simple semaphore implementation for limiting concurrent requests
class Semaphore {
  private permits: number;
  private waitQueue: Array<() => void> = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      this.waitQueue.push(resolve);
    });
  }

  release(): void {
    if (this.waitQueue.length > 0) {
      const resolve = this.waitQueue.shift()!;
      resolve();
    } else {
      this.permits++;
    }
  }
}

@Injectable()
export class FaceApiService {
  private modelsLoaded = false;
  private readonly modelPath = path.join(process.cwd(), 'models');

  // Limit concurrent face verification requests to prevent server overload
  private readonly faceVerificationSemaphore = new Semaphore(3);

  // Cache for face descriptors to avoid recomputing
  private readonly faceDescriptorCache = new Map<string, Float32Array>();
  private readonly cacheExpiry = new Map<string, number>();
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes

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

    // Preload models when service starts to avoid delay on first request
    this.preloadModels();
  }

  // Preload models in background
  private async preloadModels(): Promise<void> {
    try {
      console.log('Preloading face detection models...');
      await this.loadModels();
      console.log('Models preloaded successfully');
    } catch (error) {
      console.error('Failed to preload models:', error);
    }
  }

  // Clean up expired cache entries
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, expiry] of this.cacheExpiry.entries()) {
      if (now > expiry) {
        this.faceDescriptorCache.delete(key);
        this.cacheExpiry.delete(key);
      }
    }
  }

  // Get cached face descriptor or compute and cache it
  private async getCachedFaceDescriptor(
    imageSource: string,
  ): Promise<Float32Array | null> {
    this.cleanupCache();

    const cacheKey = imageSource;
    const cached = this.faceDescriptorCache.get(cacheKey);
    if (cached) {
      console.log('✅ Using cached face descriptor');
      return cached;
    }

    try {
      console.log('🔄 Computing face descriptor...');
      const startTime = Date.now();

      const image = await this.loadImage(imageSource);

      // Use TinyFaceDetector for faster processing
      const detection = await faceapi
        .detectSingleFace(image as any, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      const computeTime = Date.now() - startTime;
      console.log(`⏱️ Face detection completed in ${computeTime}ms`);

      if (detection && detection.descriptor) {
        this.faceDescriptorCache.set(cacheKey, detection.descriptor);
        this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL);
        console.log('💾 Face descriptor cached');
        return detection.descriptor;
      }
    } catch (error) {
      console.error('❌ Error computing face descriptor:', error);
    }

    return null;
  }

  // Optimized model loading for server environment
  private async loadModels() {
    if (!this.modelsLoaded) {
      try {
        const modelPath = path.resolve(process.cwd(), 'models');
        console.log('Loading models from:', modelPath);

        // Load models in parallel for better performance
        const startTime = Date.now();

        // Use TinyFaceDetector for faster processing on server
        // Use TinyFaceDetector for faster processing on server
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromDisk(modelPath),
          faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath), // <-- thêm dòng này
          faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath),
          faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath),
        ]);

        const loadTime = Date.now() - startTime;
        console.log(`Models loaded successfully in ${loadTime}ms`);

        this.modelsLoaded = true;
      } catch (error) {
        console.error('Error loading models:', error);
        throw new BadRequestException(
          'Không thể tải models. Vui lòng kiểm tra thư mục models/',
        );
      }
    }
  }

  private async downloadImageFromUrl(url: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      client
        .get(url, (res) => {
          if (res.statusCode !== 200) {
            reject(
              new Error(`Failed to get image. Status code: ${res.statusCode}`),
            );
            return;
          }
          const data: Uint8Array[] = [];
          res.on('data', (chunk) => data.push(chunk));
          res.on('end', () => resolve(Buffer.concat(data)));
        })
        .on('error', reject);
    });
  }

  private async loadImage(imageSource: string): Promise<Image> {
    try {
      let imageBuffer: Buffer;
      let sourceType = '';

      // Nếu là base64
      if (imageSource.startsWith('data:image/')) {
        sourceType = 'base64';
        const base64Data = imageSource.replace(/^data:image\/\w+;base64,/, '');
        imageBuffer = Buffer.from(base64Data, 'base64');
      }
      // Nếu là file path local - ưu tiên đọc file trực tiếp
      else if (
        imageSource.startsWith('/uploads/') ||
        imageSource.startsWith('uploads/')
      ) {
        let filePath = imageSource;
        if (filePath.startsWith('/')) {
          filePath = filePath.substring(1);
        }
        if (!path.isAbsolute(filePath)) {
          filePath = path.join(process.cwd(), filePath);
        }

        console.log(`🔍 Kiểm tra file local: ${filePath}`);

        if (fs.existsSync(filePath)) {
          sourceType = 'local';
          console.log(`✅ Đọc file local: ${filePath}`);
          imageBuffer = fs.readFileSync(filePath);
        } else {
          sourceType = 'url-fallback';
          console.log(
            `❌ File local không tồn tại, download từ URL: ${imageSource}`,
          );
          // Fallback: download từ URL nếu file không tồn tại
          const PUBLIC_DOMAIN = 'https://fm-backend-izjp.onrender.com';
          const url = PUBLIC_DOMAIN + imageSource;
          imageBuffer = await this.downloadImageFromUrl(url);
        }
      }
      // Nếu là URL
      else if (
        imageSource.startsWith('http://') ||
        imageSource.startsWith('https://')
      ) {
        sourceType = 'url';
        imageBuffer = await this.downloadImageFromUrl(imageSource);
      }
      // Nếu là file path local (trường hợp đặc biệt)
      else {
        sourceType = 'local-path';
        let filePath = imageSource;
        if (filePath.startsWith('/')) {
          filePath = filePath.substring(1);
        }
        if (!path.isAbsolute(filePath)) {
          filePath = path.join(process.cwd(), filePath);
        }

        if (!fs.existsSync(filePath)) {
          throw new Error(`File not found: ${filePath}`);
        }

        imageBuffer = fs.readFileSync(filePath);
      }

      console.log(
        `📊 Image source: ${sourceType}, size: ${(imageBuffer.length / 1024).toFixed(2)}KB`,
      );

      // Chuyển đổi Buffer thành Image object
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          console.log(
            `✅ Image loaded successfully: ${img.width}x${img.height}`,
          );
          resolve(img);
        };
        img.onerror = (err) => {
          console.error(`❌ Failed to load image: ${err}`);
          reject(new Error(`Failed to load image: ${err}`));
        };
        img.src = imageBuffer;
      });
    } catch (error) {
      console.error('Error loading image:', error);
      throw new BadRequestException(`Không thể đọc ảnh: ${error.message}`);
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
    // Acquire semaphore to limit concurrent requests
    await this.faceVerificationSemaphore.acquire();

    try {
      console.log('=== FACE VERIFICATION START ===');
      console.log('Student ID:', studentId);
      console.log('Schedule ID:', scheduleId);

      // Set timeout for the entire operation
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Face verification timeout')), 30000); // 30 seconds
      });

      const verificationPromise = this.performFaceVerification(
        image,
        studentId,
        scheduleId,
        note,
      );

      const result = await Promise.race([verificationPromise, timeoutPromise]);
      return result;
    } catch (error) {
      console.error('Error in verifyFace:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Lỗi xác thực khuôn mặt: ${error.message}`);
    } finally {
      // Always release the semaphore
      this.faceVerificationSemaphore.release();
    }
  }

  private async performFaceVerification(
    image: string,
    studentId: number,
    scheduleId: number,
    note?: string,
  ): Promise<any> {
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

    if (!image) {
      throw new BadRequestException('Ảnh đầu vào không hợp lệ');
    }

    // Use cached face descriptors when possible
    console.log('Getting input face descriptor...');
    const inputDescriptor = await this.getCachedFaceDescriptor(image);

    if (!inputDescriptor) {
      throw new BadRequestException(
        'Không phát hiện được khuôn mặt trong ảnh đầu vào',
      );
    }

    console.log('Getting reference face descriptor...');
    const referenceDescriptor = await this.getCachedFaceDescriptor(
      student.avatar,
    );

    if (!referenceDescriptor) {
      throw new BadRequestException(
        'Không phát hiện được khuôn mặt trong ảnh đại diện',
      );
    }

    const distance = faceapi.euclideanDistance(
      inputDescriptor,
      referenceDescriptor,
    );

    console.log('Face distance:', distance);

    // Ngưỡng khoảng cách để xác định là cùng một người
    const threshold = 0.6;
    const matched = distance < threshold;

    // Nếu matched, lưu điểm danh vào DB
    if (matched) {
      const schedule = await this.scheduleRepository.findOne({
        where: { id: scheduleId },
        relations: ['class', 'teacher'],
      });

      if (!schedule) {
        throw new BadRequestException('Không tìm thấy lịch học');
      }

      const attendanceData = {
        studentId: student.id,
        classId: schedule.class?.id || null,
        teacherId: schedule.teacher?.id || null,
        scheduleId,
        status: 1,
        note: 'Xác thực bằng khuôn mặt',
      };

      await this.attendanceService.markAttendance(attendanceData);
    }

    return {
      success: matched,
      message: matched ? 'Điểm danh thành công' : 'Khuôn mặt không trùng khớp',
      studentId,
      scheduleId,
      matched,
      distance,
      timestamp: new Date().toISOString(),
    };
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

  // Get server status information
  async getStatus(): Promise<any> {
    this.cleanupCache();

    return {
      modelsLoaded: this.modelsLoaded,
      cacheSize: this.faceDescriptorCache.size,
      cacheEntries: Array.from(this.faceDescriptorCache.keys()).slice(0, 5), // Show first 5 cache keys
      semaphoreAvailable: (this.faceVerificationSemaphore as any).permits || 0,
      timestamp: new Date().toISOString(),
      memoryUsage: process.memoryUsage(),
    };
  }
}
