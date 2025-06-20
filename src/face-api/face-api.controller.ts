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
@ApiBearerAuth('JWT-auth')
export class FaceApiController {
  constructor(private readonly faceApiService: FaceApiService) {}

  @Get('test-avatar/:studentId')
  async testAvatarFormat(@Param('studentId') studentId: number) {
    return this.faceApiService.testAvatarFormat(studentId);
  }

  @Post('verify-face')
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
