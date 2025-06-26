import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FaceApiService } from './face-api.service';

@ApiTags('face-api')
@Controller('face-api')
export class FaceApiController {
  constructor(private readonly faceApiService: FaceApiService) {}

  @Get('test-avatar/:studentId')
  async testAvatarFormat(@Param('studentId') studentId: number) {
    return this.faceApiService.testAvatarFormat(studentId);
  }

  @Get('test-face-detection/:studentId')
  async testFaceDetection(@Param('studentId') studentId: number) {
    return this.faceApiService.testFaceDetection(studentId);
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
    return await this.faceApiService.verifyFace(
      body.image,
      body.studentId,
      body.scheduleId,
      body.note,
    );
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
    return this.faceApiService.verifyClass(
      body.image,
      body.classId,
      body.teacherId,
      body.scheduleId,
    );
  }
}
