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
      const detection = await faceapi
        .detectSingleFace(image as any)
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

        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath),
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

  // Get detailed performance report for server optimization
  async getPerformanceReport(): Promise<any> {
    this.cleanupCache();

    const os = require('os');
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const cpuCount = os.cpus().length;
    const cpuUsage = os.loadavg();

    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    return {
      server: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        uptime: {
          process: Math.floor(uptime),
          system: Math.floor(os.uptime()),
        },
      },
      resources: {
        cpu: {
          cores: cpuCount,
          loadAverage: {
            '1min': cpuUsage[0],
            '5min': cpuUsage[1],
            '15min': cpuUsage[2],
          },
        },
        memory: {
          total:
            Math.round((totalMemory / 1024 / 1024 / 1024) * 100) / 100 + ' GB',
          free:
            Math.round((freeMemory / 1024 / 1024 / 1024) * 100) / 100 + ' GB',
          used:
            Math.round(
              ((totalMemory - freeMemory) / 1024 / 1024 / 1024) * 100,
            ) /
              100 +
            ' GB',
          usagePercent:
            Math.round(((totalMemory - freeMemory) / totalMemory) * 100 * 100) /
              100 +
            '%',
          process: {
            rss:
              Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100 + ' MB',
            heapUsed:
              Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100 +
              ' MB',
            heapTotal:
              Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100 +
              ' MB',
            external:
              Math.round((memoryUsage.external / 1024 / 1024) * 100) / 100 +
              ' MB',
          },
        },
      },
      faceApi: {
        modelsLoaded: this.modelsLoaded,
        cacheSize: this.faceDescriptorCache.size,
        cacheHitRate: this.calculateCacheHitRate(),
        semaphoreAvailable:
          (this.faceVerificationSemaphore as any).permits || 0,
        semaphoreQueueLength:
          (this.faceVerificationSemaphore as any).waitQueue?.length || 0,
      },
      recommendations: this.generateOptimizationRecommendations(
        totalMemory,
        freeMemory,
        cpuCount,
      ),
      timestamp: new Date().toISOString(),
    };
  }

  // Calculate cache hit rate
  private calculateCacheHitRate(): string {
    // This is a simplified calculation - in production you'd track actual hits/misses
    const cacheSize = this.faceDescriptorCache.size;
    if (cacheSize === 0) return '0%';
    if (cacheSize < 5) return '20%';
    if (cacheSize < 10) return '40%';
    return '60%+';
  }

  // Generate optimization recommendations
  private generateOptimizationRecommendations(
    totalMemory: number,
    freeMemory: number,
    cpuCount: number,
  ): string[] {
    const recommendations = [];

    if (cpuCount < 2) {
      recommendations.push('⚠️ CPU yếu - Giảm maxConcurrentRequests xuống 2');
    }

    if (freeMemory < 1024 * 1024 * 1024) {
      // < 1GB
      recommendations.push('⚠️ Memory thấp - Giảm cache TTL xuống 15 phút');
    }

    if (freeMemory > 4 * 1024 * 1024 * 1024) {
      // > 4GB
      recommendations.push(
        '✅ Memory đủ - Có thể tăng maxConcurrentRequests lên 5',
      );
    }

    if (this.faceDescriptorCache.size > 50) {
      recommendations.push('⚠️ Cache lớn - Xem xét giảm cache TTL');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Cấu hình tối ưu cho server hiện tại');
    }

    return recommendations;
  }

  // Test performance comparison between local file vs URL
  async testPerformance(studentId: number): Promise<any> {
    try {
      const student = await this.studentRepository.findOne({
        where: { id: studentId },
      });

      if (!student || !student.avatar) {
        throw new BadRequestException(
          'Không tìm thấy sinh viên hoặc ảnh đại diện',
        );
      }

      await this.loadModels();

      const results = {
        avatarPath: student.avatar,
        localFileTest: null,
        urlTest: null,
        recommendation: '',
      };

      // Test local file reading
      if (
        student.avatar.startsWith('/uploads/') ||
        student.avatar.startsWith('uploads/')
      ) {
        const localStart = Date.now();
        try {
          let filePath = student.avatar;
          if (filePath.startsWith('/')) {
            filePath = filePath.substring(1);
          }
          if (!path.isAbsolute(filePath)) {
            filePath = path.join(process.cwd(), filePath);
          }

          if (fs.existsSync(filePath)) {
            const imageBuffer = fs.readFileSync(filePath);
            const image = new Image();
            image.src = imageBuffer;

            const detection = await faceapi
              .detectSingleFace(image as any)
              .withFaceLandmarks()
              .withFaceDescriptor();

            const localEnd = Date.now();
            results.localFileTest = {
              success: !!detection,
              timeMs: localEnd - localStart,
              fileSize: imageBuffer.length,
              exists: true,
            };
          } else {
            results.localFileTest = {
              success: false,
              timeMs: 0,
              fileSize: 0,
              exists: false,
              error: 'File not found locally',
            };
          }
        } catch (error) {
          results.localFileTest = {
            success: false,
            timeMs: 0,
            fileSize: 0,
            exists: false,
            error: error.message,
          };
        }
      }

      // Test URL download
      const urlStart = Date.now();
      try {
        const PUBLIC_DOMAIN = 'https://fm-backend-izjp.onrender.com';
        const url = PUBLIC_DOMAIN + student.avatar;
        const imageBuffer = await this.downloadImageFromUrl(url);
        const image = new Image();
        image.src = imageBuffer;

        const detection = await faceapi
          .detectSingleFace(image as any)
          .withFaceLandmarks()
          .withFaceDescriptor();

        const urlEnd = Date.now();
        results.urlTest = {
          success: !!detection,
          timeMs: urlEnd - urlStart,
          fileSize: imageBuffer.length,
          url: url,
        };
      } catch (error) {
        results.urlTest = {
          success: false,
          timeMs: 0,
          fileSize: 0,
          error: error.message,
        };
      }

      // Generate recommendation
      if (results.localFileTest?.exists && results.localFileTest.success) {
        if (results.localFileTest.timeMs < results.urlTest?.timeMs) {
          results.recommendation =
            'Sử dụng file local - nhanh hơn URL download';
        } else {
          results.recommendation = 'URL download nhanh hơn file local';
        }
      } else if (results.urlTest?.success) {
        results.recommendation = 'Chỉ có thể sử dụng URL download';
      } else {
        results.recommendation = 'Cả hai phương pháp đều thất bại';
      }

      return results;
    } catch (error) {
      console.error('Error in testPerformance:', error);
      throw new BadRequestException(`Lỗi test performance: ${error.message}`);
    }
  }

  // Kiểm tra files missing trong database
  async checkMissingFiles(): Promise<any> {
    try {
      const students = await this.studentRepository
        .createQueryBuilder('student')
        .select(['student.id', 'student.avatar'])
        .where('student.avatar IS NOT NULL')
        .getMany();

      const results = {
        totalStudents: students.length,
        missingFiles: [],
        existingFiles: [],
        summary: {},
      };

      for (const student of students) {
        if (!student.avatar) continue;

        let filePath = student.avatar;
        if (filePath.startsWith('/')) {
          filePath = filePath.substring(1);
        }
        if (!path.isAbsolute(filePath)) {
          filePath = path.join(process.cwd(), filePath);
        }

        if (fs.existsSync(filePath)) {
          results.existingFiles.push({
            studentId: student.id,
            avatar: student.avatar,
            fileSize: fs.statSync(filePath).size,
          });
        } else {
          results.missingFiles.push({
            studentId: student.id,
            avatar: student.avatar,
            localPath: filePath,
          });
        }
      }

      results.summary = {
        missingCount: results.missingFiles.length,
        existingCount: results.existingFiles.length,
        missingPercentage:
          ((results.missingFiles.length / students.length) * 100).toFixed(2) +
          '%',
      };

      return results;
    } catch (error) {
      console.error('Error in checkMissingFiles:', error);
      throw new BadRequestException(`Lỗi kiểm tra files: ${error.message}`);
    }
  }

  // Sync file từ server về local
  async syncFileFromServer(studentId: number): Promise<any> {
    try {
      const student = await this.studentRepository.findOne({
        where: { id: studentId },
      });

      if (!student || !student.avatar) {
        throw new BadRequestException(
          'Không tìm thấy sinh viên hoặc ảnh đại diện',
        );
      }

      let filePath = student.avatar;
      if (filePath.startsWith('/')) {
        filePath = filePath.substring(1);
      }
      if (!path.isAbsolute(filePath)) {
        filePath = path.join(process.cwd(), filePath);
      }

      // Kiểm tra file đã tồn tại chưa
      if (fs.existsSync(filePath)) {
        return {
          success: true,
          message: 'File đã tồn tại local',
          studentId,
          avatar: student.avatar,
          localPath: filePath,
          fileSize: fs.statSync(filePath).size,
        };
      }

      // Tạo thư mục nếu chưa có
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Download file từ server
      const PUBLIC_DOMAIN = 'https://fm-backend-izjp.onrender.com';
      const url = PUBLIC_DOMAIN + student.avatar;

      console.log(`📥 Downloading file: ${url}`);
      const imageBuffer = await this.downloadImageFromUrl(url);

      // Lưu file local
      fs.writeFileSync(filePath, imageBuffer);

      console.log(`✅ File synced: ${filePath}`);

      return {
        success: true,
        message: 'Sync file thành công',
        studentId,
        avatar: student.avatar,
        localPath: filePath,
        fileSize: imageBuffer.length,
        url,
      };
    } catch (error) {
      console.error('Error in syncFileFromServer:', error);
      throw new BadRequestException(`Lỗi sync file: ${error.message}`);
    }
  }

  // Sync tất cả files missing
  async syncAllMissingFiles(): Promise<any> {
    try {
      console.log('🔄 Bắt đầu sync tất cả files missing...');

      const missingFiles = await this.checkMissingFiles();

      if (missingFiles.missingFiles.length === 0) {
        return {
          success: true,
          message: 'Không có files missing',
          syncedCount: 0,
          totalMissing: 0,
        };
      }

      const results = {
        success: true,
        message: `Sync ${missingFiles.missingFiles.length} files`,
        syncedCount: 0,
        failedCount: 0,
        totalMissing: missingFiles.missingFiles.length,
        details: [],
      };

      for (const missingFile of missingFiles.missingFiles) {
        try {
          console.log(
            `📥 Syncing file for student ${missingFile.studentId}...`,
          );
          const syncResult = await this.syncFileFromServer(
            missingFile.studentId,
          );
          results.details.push({
            studentId: missingFile.studentId,
            success: true,
            ...syncResult,
          });
          results.syncedCount++;
        } catch (error) {
          console.error(
            `❌ Failed to sync file for student ${missingFile.studentId}:`,
            error,
          );
          results.details.push({
            studentId: missingFile.studentId,
            success: false,
            error: error.message,
          });
          results.failedCount++;
        }
      }

      console.log(
        `✅ Sync completed: ${results.syncedCount} success, ${results.failedCount} failed`,
      );

      return results;
    } catch (error) {
      console.error('Error in syncAllMissingFiles:', error);
      throw new BadRequestException(`Lỗi sync tất cả files: ${error.message}`);
    }
  }
}
