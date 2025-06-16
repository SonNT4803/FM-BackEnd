import {
  Controller,
  Post,
  Body,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FaceRecognitionService } from './face-recognition.service';
@Controller('face-recognition')
export class FaceRecognitionController {
  constructor(
    private readonly faceRecognitionService: FaceRecognitionService,
  ) {}

  @Post('verify')
  async verifyFace(@Body() body: { image: string; studentId: number }) {
    try {
      const isVerified = await this.faceRecognitionService.verifyFace(
        body.image,
        body.studentId,
      );

      return {
        statusCode: HttpStatus.OK,
        message: isVerified
          ? 'Xác thực khuôn mặt thành công'
          : 'Xác thực khuôn mặt thất bại',
        data: { verified: isVerified },
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
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
    try {
      const verificationResults = await this.faceRecognitionService.verifyClass(
        body.image,
        body.classId,
        body.teacherId,
        body.scheduleId,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Kết quả xác thực lớp học',
        data: verificationResults,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('verify-class-stream')
  async verifyClassStream(@Body() data: { image: string; classId: number }) {
    return this.faceRecognitionService.verifyClassStream(
      data.image,
      data.classId,
    );
  }
}
