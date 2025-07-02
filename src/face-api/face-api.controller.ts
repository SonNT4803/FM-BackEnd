import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FaceApiService } from './face-api.service';

// Simple in-memory rate limiter
class RateLimiter {
  private requests = new Map<string, number[]>();
  private readonly windowMs = 60000; // 1 minute
  private readonly maxRequests = 10; // max 10 requests per minute per IP

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, [now]);
      return true;
    }

    const userRequests = this.requests.get(identifier)!;
    const recentRequests = userRequests.filter((time) => time > windowStart);

    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    return true;
  }

  cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [identifier, requests] of this.requests.entries()) {
      const recentRequests = requests.filter((time) => time > windowStart);
      if (recentRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, recentRequests);
      }
    }
  }
}

const rateLimiter = new RateLimiter();

// Clean up old entries every minute
setInterval(() => rateLimiter.cleanup(), 60000);

@ApiTags('face-api')
@Controller('face-api')
export class FaceApiController {
  constructor(private readonly faceApiService: FaceApiService) {}

  @Get('test-avatar/:studentId')
  async testAvatarFormat(@Param('studentId') studentId: number) {
    const result = await this.faceApiService.testAvatarFormat(studentId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Kiểm tra format ảnh avatar thành công',
      data: result,
    };
  }

  @Get('test-face-detection/:studentId')
  async testFaceDetection(@Param('studentId') studentId: number) {
    const result = await this.faceApiService.testFaceDetection(studentId);
    return {
      statusCode: HttpStatus.OK,
      message: result.success
        ? 'Test face detection thành công'
        : 'Test face detection thất bại',
      data: result,
    };
  }

  @Get('status')
  async getStatus() {
    const status = await this.faceApiService.getStatus();
    return {
      statusCode: HttpStatus.OK,
      message: 'Trạng thái server face-api',
      data: status,
    };
  }

  @Post('verify-face')
  @ApiBearerAuth('JWT-auth')
  async verifyFace(
    @Body()
    body: {
      image: string;
      studentId: number;
      scheduleId: number;
      note?: string;
    },
  ) {
    // Rate limiting - using a simple identifier (you might want to use actual IP or user ID)
    const identifier = `verify-face-${body.studentId}`;
    if (!rateLimiter.isAllowed(identifier)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút.',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Validate input
    if (!body.image || !body.studentId || !body.scheduleId) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Thiếu thông tin bắt buộc: image, studentId, scheduleId',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate image size (prevent very large images)
    if (body.image.length > 10 * 1024 * 1024) {
      // 10MB limit
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Ảnh quá lớn. Kích thước tối đa là 10MB.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.faceApiService.verifyFace(
      body.image,
      body.studentId,
      body.scheduleId,
      body.note,
    );
    return {
      statusCode: HttpStatus.OK,
      message: result.success ? 'Điểm danh thành công' : 'Điểm danh thất bại',
      data: result,
    };
  }

  @Post('verify-class')
  @ApiBearerAuth('JWT-auth')
  async verifyClass(
    @Body()
    body: {
      image: string;
      classId: number;
      teacherId: number;
      scheduleId: number;
    },
  ) {
    // Rate limiting for class verification
    const identifier = `verify-class-${body.classId}`;
    if (!rateLimiter.isAllowed(identifier)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút.',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Validate input
    if (!body.image || !body.classId || !body.teacherId || !body.scheduleId) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message:
            'Thiếu thông tin bắt buộc: image, classId, teacherId, scheduleId',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate image size
    if (body.image.length > 15 * 1024 * 1024) {
      // 15MB limit for class photos
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Ảnh quá lớn. Kích thước tối đa là 15MB.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.faceApiService.verifyClass(
      body.image,
      body.classId,
      body.teacherId,
      body.scheduleId,
    );
    return {
      statusCode: HttpStatus.OK,
      message: `Xác thực thành công ${result.verified_count} sinh viên trong tổng số ${result.total_faces_detected} khuôn mặt được phát hiện`,
      data: result,
    };
  }
}
