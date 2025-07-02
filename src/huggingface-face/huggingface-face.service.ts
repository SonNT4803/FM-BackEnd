import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceService } from '../attendance/attendance.service';
import { GoogleAIService } from './google-ai.service';
import { Class } from '../entities/center/class.entity';
import { Student } from '../entities/center/student.entity';
import { Schedule } from '../entities/schedule.entity';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as https from 'https';
import * as http from 'http';

@Injectable()
export class HuggingfaceFaceService {
  private faceDescriptors: Map<number, string> = new Map();
  private readonly similarityThreshold = 0.8; // Ngưỡng tương đồng mới (cao hơn)

  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
    private readonly attendanceService: AttendanceService,
    private readonly googleAIService: GoogleAIService,
  ) {}

  /**
   * Load image from different sources (file path or base64)
   */
  private async loadImage(imageSource: string): Promise<Buffer> {
    try {
      // Nếu là base64
      if (imageSource.startsWith('data:image/')) {
        const base64Data = imageSource.replace(/^data:image\/\w+;base64,/, '');
        return Buffer.from(base64Data, 'base64');
      }

      // Nếu là URL
      if (
        imageSource.startsWith('http://') ||
        imageSource.startsWith('https://')
      ) {
        return await this.downloadImageFromUrl(imageSource);
      }

      // Nếu là đường dẫn file vật lý, tự động chuyển thành URL public nếu có domain
      // Giả sử domain là https://yourdomain.com
      const PUBLIC_DOMAIN = 'https://fm-backend-izjp.onrender.com';
      if (imageSource.startsWith('/uploads/')) {
        const url = PUBLIC_DOMAIN + imageSource;
        return await this.downloadImageFromUrl(url);
      }

      // Nếu là file path local (trường hợp đặc biệt)
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

      return fs.readFileSync(filePath);
    } catch (error) {
      console.error('Error loading image:', error);
      throw new BadRequestException(`Không thể đọc ảnh: ${error.message}`);
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

  /**
   * Check if student has valid avatar
   */
  private isValidAvatar(avatar: string): boolean {
    return !!avatar;
  }

  /**
   * Generate face descriptor from image (simplified version)
   * In a real implementation, this would use a proper face recognition model
   */
  private async generateFaceDescriptor(imageBuffer: Buffer): Promise<string> {
    try {
      // This is a simplified approach - in reality, you would use a proper face recognition model
      // For demo purposes, we'll create a hash based on image content
      const hash = crypto.createHash('sha256');
      hash.update(imageBuffer);
      return hash.digest('hex');
    } catch (error) {
      console.error('Error generating face descriptor:', error);
      throw new BadRequestException(
        `Lỗi tạo đặc trưng khuôn mặt: ${error.message}`,
      );
    }
  }

  /**
   * Calculate similarity between two face descriptors (improved)
   */
  private calculateSimilarity(
    descriptor1: string,
    descriptor2: string,
  ): number {
    // Tính Hamming distance giữa hai hash
    let distance = 0;
    const minLength = Math.min(descriptor1.length, descriptor2.length);
    for (let i = 0; i < minLength; i++) {
      if (descriptor1[i] !== descriptor2[i]) distance++;
    }
    // similarity = 1 - (distance / length)
    const similarity = 1 - distance / minLength;
    return similarity;
  }
  /**
   * Phân tích ảnh bằng Google AI
   */
  async analyzeImageWithAI(image: string, prompt?: string): Promise<any> {
    try {
      if (!this.googleAIService.isAvailable()) {
        throw new BadRequestException('Google AI service không khả dụng');
      }

      if (!image || !this.isValidAvatar(image)) {
        throw new BadRequestException('Ảnh đầu vào không hợp lệ');
      }

      const analysis = await this.googleAIService.analyzeImage(image, prompt);

      return {
        statusCode: HttpStatus.OK,
        message: 'Phân tích ảnh bằng AI thành công',
        data: {
          analysis,
          imageType: image.startsWith('data:image/') ? 'base64' : 'file',
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Error analyzing image with AI:', error);
      throw new BadRequestException(
        `Lỗi phân tích ảnh với AI: ${error.message}`,
      );
    }
  }

  /**
   * So sánh hai ảnh bằng Google AI
   */
  async compareImagesWithAI(
    image1: string,
    image2: string,
    prompt?: string,
  ): Promise<any> {
    try {
      if (!this.googleAIService.isAvailable()) {
        throw new BadRequestException('Google AI service không khả dụng');
      }

      if (!image1 || !this.isValidAvatar(image1)) {
        throw new BadRequestException('Ảnh thứ nhất không hợp lệ');
      }

      if (!image2 || !this.isValidAvatar(image2)) {
        throw new BadRequestException('Ảnh thứ hai không hợp lệ');
      }

      const comparison = await this.googleAIService.compareImages(
        image1,
        image2,
        prompt,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'So sánh ảnh bằng AI thành công',
        data: {
          comparison,
          image1Type: image1.startsWith('data:image/') ? 'base64' : 'file',
          image2Type: image2.startsWith('data:image/') ? 'base64' : 'file',
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Error comparing images with AI:', error);
      throw new BadRequestException(`Lỗi so sánh ảnh với AI: ${error.message}`);
    }
  }

  /**
   * Xác thực khuôn mặt với AI hỗ trợ
   */
  async verifyFaceWithAI(
    image: string,
    studentId: number,
    scheduleId: number,
    note?: string,
  ): Promise<any> {
    try {
      const student = await this.studentRepository.findOne({
        where: { id: studentId },
      });

      if (!student) {
        throw new BadRequestException('Không tìm thấy sinh viên');
      }

      if (!student.avatar || !this.isValidAvatar(student.avatar)) {
        throw new BadRequestException('Sinh viên không có ảnh đại diện hợp lệ');
      }

      if (!image || !this.isValidAvatar(image)) {
        throw new BadRequestException('Ảnh đầu vào không hợp lệ');
      }

      // Sử dụng cả phương pháp truyền thống và AI
      const inputImageBuffer = await this.loadImage(image);
      const inputDescriptor =
        await this.generateFaceDescriptor(inputImageBuffer);

      let registeredDescriptor = this.faceDescriptors.get(studentId);
      if (!registeredDescriptor) {
        if (!student.avatar) {
          throw new BadRequestException('Sinh viên chưa có avatar để xác thực');
        }
        const avatarBuffer = await this.loadImage(student.avatar);
        registeredDescriptor = await this.generateFaceDescriptor(avatarBuffer);
        this.faceDescriptors.set(studentId, registeredDescriptor);
      }

      const traditionalSimilarity = this.calculateSimilarity(
        registeredDescriptor,
        inputDescriptor,
      );
      let aiAnalysis = null;
      let aiConfidence = 0;
      // Sử dụng Google AI để phân tích
      if (this.googleAIService.isAvailable()) {
        try {
          const aiPrompt = `Hãy so sánh hai ảnh này và cho biết chúng có phải là cùng một người không. 
          Đưa ra tỷ lệ tương đồng từ 0-100% và giải thích lý do. 
          Nếu là cùng người, hãy nêu các đặc điểm tương đồng.`;
          aiAnalysis = await this.googleAIService.compareImages(
            student.avatar,
            image,
            aiPrompt,
          );
        } catch (aiError) {
          console.warn(
            'AI analysis failed, continuing with traditional method:',
            aiError,
          );
        }
      }

      // Quyết định dựa trên cả hai phương pháp
      let isMatch = traditionalSimilarity >= this.similarityThreshold;
      if (aiAnalysis) {
        const percentMatch = /([0-9]{1,3})%/.exec(aiAnalysis);
        if (percentMatch) {
          aiConfidence = parseInt(percentMatch[1], 10) / 100;
          if (aiConfidence >= 0.8) isMatch = true;
        } else if (aiAnalysis.toLowerCase().includes('cùng một người')) {
          isMatch = true;
          aiConfidence = 0.99;
        }
      }
      const confidence = Math.max(traditionalSimilarity, aiConfidence);

      // Tạo attendance record nếu match
      let attendance = null;
      if (isMatch) {
        const attendanceData = {
          studentId: student.id,
          classId: student.class?.id || null,
          teacherId: null, // Sẽ được cập nhật từ schedule
          scheduleId,
          status: 1, // present
          note: note || 'Xác thực bằng khuôn mặt với AI hỗ trợ',
        };
        attendance =
          await this.attendanceService.markAttendance(attendanceData);
      }

      return {
        statusCode: HttpStatus.OK,
        message: isMatch
          ? 'Xác thực khuôn mặt thành công'
          : 'Xác thực khuôn mặt thất bại',
        data: {
          isMatch,
          confidence,
          traditionalSimilarity,
          aiAnalysis,
          student: {
            id: student.id,
            name: student.name,
            studentId: student.studentId,
          },
          attendance: attendance
            ? {
                id: attendance.id,
                status: attendance.status,
                updatedAt: attendance.updatedAt,
              }
            : null,
        },
      };
    } catch (error) {
      console.error('Error verifying face with AI:', error);
      throw new BadRequestException(
        `Lỗi xác thực khuôn mặt với AI: ${error.message}`,
      );
    }
  }

  /**
   * Lấy thông tin về Google AI service
   */
  async getAIServiceInfo(): Promise<any> {
    const aiInfo = this.googleAIService.getModelInfo();

    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy thông tin AI service thành công',
      data: {
        googleAI: aiInfo,
        traditionalFaceRecognition: {
          available: true,
          registeredFaces: this.faceDescriptors.size,
          similarityThreshold: this.similarityThreshold,
        },
      },
    };
  }

  /**
   * Tạo text response từ Google AI
   */
  async generateTextWithAI(prompt: string, context?: string): Promise<any> {
    try {
      if (!this.googleAIService.isAvailable()) {
        throw new BadRequestException('Google AI service không khả dụng');
      }

      const systemPrompt =
        'Bạn là một trợ lý AI chuyên về nhận diện khuôn mặt và quản lý điểm danh. Hãy trả lời một cách chính xác và hữu ích.';
      const response = await this.googleAIService.generateTextWithContext(
        systemPrompt,
        prompt,
        context,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Tạo text với AI thành công',
        data: {
          response,
          prompt,
          context,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Error generating text with AI:', error);
      throw new BadRequestException(`Lỗi tạo text với AI: ${error.message}`);
    }
  }
}
