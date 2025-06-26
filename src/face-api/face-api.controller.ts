import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FaceApiService } from './face-api.service';

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
