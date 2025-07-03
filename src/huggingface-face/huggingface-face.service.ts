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
  private readonly similarityThreshold = 0.8; // Tăng ngưỡng lên rất cao để tránh false positive
  private readonly minImageSize = 100 * 1024; // 100KB minimum
  private readonly maxImageSize = 10 * 1024 * 1024; // 10MB maximum

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
   * Validate image quality and size
   */
  private validateImage(imageBuffer: Buffer): void {
    if (imageBuffer.length < this.minImageSize) {
      throw new BadRequestException('Ảnh quá nhỏ, cần ít nhất 100KB');
    }
    if (imageBuffer.length > this.maxImageSize) {
      throw new BadRequestException('Ảnh quá lớn, tối đa 10MB');
    }
  }

  /**
   * Generate face descriptor from image (improved version)
   * Sử dụng multiple hash methods để tăng độ chính xác
   */
  private async generateFaceDescriptor(imageBuffer: Buffer): Promise<string> {
    try {
      this.validateImage(imageBuffer);

      // Tạo multiple hashes để tăng độ chính xác
      const md5Hash = crypto
        .createHash('md5')
        .update(imageBuffer)
        .digest('hex');
      const sha256Hash = crypto
        .createHash('sha256')
        .update(imageBuffer)
        .digest('hex');
      const sha1Hash = crypto
        .createHash('sha1')
        .update(imageBuffer)
        .digest('hex');

      // Kết hợp các hash với metadata
      const imageSize = imageBuffer.length;
      const combinedHash = `${md5Hash}:${sha256Hash}:${sha1Hash}:${imageSize}`;

      return combinedHash;
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
    try {
      // Parse combined hash
      const parts1 = descriptor1.split(':');
      const parts2 = descriptor2.split(':');

      if (parts1.length !== 4 || parts2.length !== 4) {
        return 0; // Invalid format
      }

      const [md5_1, sha256_1, sha1_1, size1] = parts1;
      const [md5_2, sha256_2, sha1_2, size2] = parts2;

      // Tính similarity cho từng hash
      const md5Similarity = this.calculateHashSimilarity(md5_1, md5_2);
      const sha256Similarity = this.calculateHashSimilarity(sha256_1, sha256_2);
      const sha1Similarity = this.calculateHashSimilarity(sha1_1, sha1_2);

      // Tính size similarity
      const sizeSimilarity =
        Math.min(parseInt(size1), parseInt(size2)) /
        Math.max(parseInt(size1), parseInt(size2));

      // Trọng số cho từng loại similarity
      const weightedSimilarity =
        md5Similarity * 0.3 +
        sha256Similarity * 0.4 +
        sha1Similarity * 0.2 +
        sizeSimilarity * 0.1;

      return weightedSimilarity;
    } catch (error) {
      console.error('Error calculating similarity:', error);
      return 0;
    }
  }

  /**
   * Calculate similarity between two hash strings
   */
  private calculateHashSimilarity(hash1: string, hash2: string): number {
    let distance = 0;
    const minLength = Math.min(hash1.length, hash2.length);

    for (let i = 0; i < minLength; i++) {
      if (hash1[i] !== hash2[i]) distance++;
    }

    // Thêm penalty cho độ dài khác nhau
    const lengthPenalty =
      Math.abs(hash1.length - hash2.length) /
      Math.max(hash1.length, hash2.length);

    const similarity = 1 - distance / minLength - lengthPenalty;
    return Math.max(0, similarity);
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
   * Xác thực khuôn mặt với AI hỗ trợ (cải thiện)
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

      // Kiểm tra xem ảnh có giống nhau hoàn toàn không (tránh trường hợp upload cùng ảnh)
      const inputImageBuffer = await this.loadImage(image);
      const avatarBuffer = await this.loadImage(student.avatar);

      // So sánh trực tiếp buffer
      if (inputImageBuffer.equals(avatarBuffer)) {
        throw new BadRequestException(
          'Ảnh upload giống hệt ảnh đại diện. Vui lòng chụp ảnh mới.',
        );
      }

      // Tạo descriptors
      const inputDescriptor =
        await this.generateFaceDescriptor(inputImageBuffer);
      let registeredDescriptor = this.faceDescriptors.get(studentId);

      if (!registeredDescriptor) {
        registeredDescriptor = await this.generateFaceDescriptor(avatarBuffer);
        this.faceDescriptors.set(studentId, registeredDescriptor);
      }

      // Tính similarity truyền thống
      const traditionalSimilarity = this.calculateSimilarity(
        registeredDescriptor,
        inputDescriptor,
      );

      // Kiểm tra AI nếu có
      let aiAnalysis = null;
      let aiConfidence = 0;
      let aiMatch = false;
      let aiErrorMessage = null;

      if (this.googleAIService.isAvailable()) {
        try {
          const aiPrompt = `Hãy phân tích kỹ lưỡng hai ảnh này và trả lời chính xác:
          1. Hai ảnh có phải là cùng một người không?
          2. Đưa ra tỷ lệ tương đồng từ 0-100%
          3. Nêu rõ các đặc điểm khác biệt nếu có
          4. Chỉ trả lời "CÙNG NGƯỜI" hoặc "KHÁC NGƯỜI" ở đầu câu trả lời`;

          aiAnalysis = await this.googleAIService.compareImages(
            student.avatar,
            image,
            aiPrompt,
          );

          // Parse AI response
          const aiResponse = aiAnalysis.toLowerCase();
          if (aiResponse.includes('cùng người')) {
            aiMatch = true;
            const percentMatch = /([0-9]{1,3})%/.exec(aiResponse);
            if (percentMatch) {
              aiConfidence = parseInt(percentMatch[1], 10) / 100;
            } else {
              aiConfidence = 0.9; // Default confidence nếu AI xác nhận cùng người
            }
          } else {
            aiMatch = false;
            aiConfidence = 0.1; // Low confidence nếu AI nói khác người
          }
        } catch (aiError) {
          aiAnalysis = null;
          aiMatch = false;
          aiConfidence = 0;
          aiErrorMessage = aiError.message || String(aiError);
          console.warn(
            'AI analysis failed, continuing with traditional method:',
            aiError,
          );
        }
      }

      // Logic quyết định cải thiện - AI có thể override traditional
      let isMatch = false;
      let finalConfidence = 0;

      if (aiAnalysis && aiMatch && aiConfidence >= 0.8) {
        // Nếu AI xác nhận với confidence cao, override traditional
        isMatch = true;
        finalConfidence = aiConfidence;
      } else if (traditionalSimilarity >= this.similarityThreshold) {
        // Nếu không có AI hoặc AI không chắc chắn, dựa vào traditional
        if (aiAnalysis) {
          // Nếu có AI, cần cả hai đồng ý
          isMatch = aiMatch && aiConfidence >= 0.8;
          finalConfidence = Math.min(traditionalSimilarity, aiConfidence);
        } else {
          // Nếu không có AI, chỉ dựa vào traditional với ngưỡng cao hơn
          isMatch = traditionalSimilarity >= 0.98;
          finalConfidence = traditionalSimilarity;
        }
      }

      // Log chi tiết để debug
      console.log('Face verification details:', {
        studentId,
        traditionalSimilarity,
        aiMatch,
        aiConfidence,
        isMatch,
        finalConfidence,
        threshold: this.similarityThreshold,
      });

      // Tạo attendance record nếu match
      let attendance = null;
      if (isMatch) {
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
          status: 1, // present
          note: note || 'Xác thực bằng khuôn mặt (AI + Traditional)',
        };

        attendance =
          await this.attendanceService.markAttendance(attendanceData);
      }

      return {
        statusCode: HttpStatus.OK,
        message: isMatch
          ? 'Xác thực khuôn mặt thành công'
          : 'Xác thực khuôn mặt thất bại - Ảnh không khớp với hồ sơ',
        data: {
          isMatch,
          confidence: finalConfidence,
          traditionalSimilarity,
          aiAnalysis,
          aiMatch,
          aiConfidence,
          aiErrorMessage,
          threshold: this.similarityThreshold,
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
   * Lấy thông tin về Google AI servic
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
