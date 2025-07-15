import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AnalyzeImageDto } from './dto/analyze-image.dto';
import { CompareImagesDto } from './dto/compare-images.dto';
import { GenerateTextDto } from './dto/generate-text.dto';
import { VerifyClassDto } from './dto/verify-class.dto';
import { VerifyClassBatchDto } from './dto/verify-class-batch.dto';
import { VerifyFaceDto } from './dto/verify-face.dto';
import {
  StreamFaceRecognitionDto,
  StreamFaceRecognitionResponseDto,
} from './dto/stream-face-recognition.dto';
import { HuggingfaceFaceService } from './huggingface-face.service';

@ApiTags('huggingface-face')
@Controller('huggingface-face')
export class HuggingfaceFaceController {
  constructor(
    private readonly huggingfaceFaceService: HuggingfaceFaceService,
  ) {}

  @Post('analyze-image-ai')
  @ApiOperation({ summary: 'Phân tích ảnh bằng Google AI' })
  @ApiResponse({ status: 200, description: 'Phân tích thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async analyzeImageWithAI(@Body() analyzeImageDto: AnalyzeImageDto) {
    return await this.huggingfaceFaceService.analyzeImageWithAI(
      analyzeImageDto.image,
      analyzeImageDto.prompt,
    );
  }

  @Post('compare-images-ai')
  @ApiOperation({ summary: 'So sánh hai ảnh bằng Google AI' })
  @ApiResponse({ status: 200, description: 'So sánh thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async compareImagesWithAI(@Body() compareImagesDto: CompareImagesDto) {
    return await this.huggingfaceFaceService.compareImagesWithAI(
      compareImagesDto.image1,
      compareImagesDto.image2,
      compareImagesDto.prompt,
    );
  }

  @Post('verify-face-ai')
  @ApiOperation({ summary: 'Xác thực khuôn mặt với AI hỗ trợ' })
  @ApiResponse({ status: 200, description: 'Xác thực thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async verifyFaceWithAI(@Body() verifyFaceDto: VerifyFaceDto) {
    return await this.huggingfaceFaceService.verifyFaceWithAI(
      verifyFaceDto.image,
      verifyFaceDto.studentId,
      verifyFaceDto.scheduleId,
      verifyFaceDto.note,
    );
  }

  @Post('verify-class-faces-ai')
  @ApiOperation({
    summary: 'Xác thực nhiều khuôn mặt cùng lúc cho một lớp học',
  })
  @ApiResponse({ status: 200, description: 'Xác thực hàng loạt thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async verifyClassFacesWithAI(
    @Body() verifyClassBatchDto: VerifyClassBatchDto,
  ) {
    return await this.huggingfaceFaceService.verifyClassFacesWithAI(
      verifyClassBatchDto.images,
      verifyClassBatchDto.classId,
      verifyClassBatchDto.teacherId,
      verifyClassBatchDto.scheduleId,
    );
  }

  @Post('verify-class-face-ai')
  @ApiOperation({ summary: 'Xác thực một khuôn mặt cho một lớp học' })
  @ApiResponse({ status: 200, description: 'Xác thực thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async verifyClassFaceWithAI(@Body() verifyClassDto: VerifyClassDto) {
    return await this.huggingfaceFaceService.verifyClassFacesWithAI(
      [verifyClassDto.image],
      verifyClassDto.classId,
      verifyClassDto.teacherId,
      verifyClassDto.scheduleId,
    );
  }

  @Get('ai-service-info')
  @ApiOperation({ summary: 'Lấy thông tin về Google AI service' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
  async getAIServiceInfo() {
    return await this.huggingfaceFaceService.getAIServiceInfo();
  }

  @Post('generate-text-ai')
  @ApiOperation({ summary: 'Tạo text response từ Google AI' })
  @ApiResponse({ status: 200, description: 'Tạo text thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async generateTextWithAI(@Body() generateTextDto: GenerateTextDto) {
    return await this.huggingfaceFaceService.generateTextWithAI(
      generateTextDto.prompt,
      generateTextDto.context,
    );
  }

  @Post('stream-face-recognition')
  @ApiOperation({
    summary: 'Stream face recognition - Nhận diện khuôn mặt real-time',
  })
  @ApiResponse({
    status: 200,
    description: 'Stream recognition thành công',
    type: StreamFaceRecognitionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async streamFaceRecognition(@Body() streamDto: StreamFaceRecognitionDto) {
    return await this.huggingfaceFaceService.streamFaceRecognition(
      streamDto.classId,
      streamDto.scheduleId,
      streamDto.imageFrame,
      streamDto.note,
    );
  }

  @Post('batch-stream-face-recognition')
  @ApiOperation({
    summary: 'Batch stream face recognition - Xử lý nhiều frame cùng lúc',
  })
  @ApiResponse({
    status: 200,
    description: 'Batch stream recognition thành công',
    type: StreamFaceRecognitionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async batchStreamFaceRecognition(
    @Body()
    batchStreamDto: {
      classId: number;
      scheduleId: number;
      imageFrames: string[];
      note?: string;
    },
  ) {
    return await this.huggingfaceFaceService.batchStreamFaceRecognition(
      batchStreamDto.classId,
      batchStreamDto.scheduleId,
      batchStreamDto.imageFrames,
      batchStreamDto.note,
    );
  }

  @Get('stream-status/:classId')
  @ApiOperation({ summary: 'Lấy trạng thái stream recognition cho lớp học' })
  @ApiResponse({ status: 200, description: 'Lấy trạng thái thành công' })
  async getStreamStatus(@Param('classId', ParseIntPipe) classId: number) {
    // Lấy thông tin về số học sinh đã điểm danh trong lớp
    const students =
      await this.huggingfaceFaceService.getStudentsInClass(classId);
    const attendanceStats =
      await this.huggingfaceFaceService.getAttendanceStats(classId);

    return {
      statusCode: 200,
      message: 'Lấy trạng thái stream thành công',
      data: {
        classId,
        totalStudents: students.length,
        studentsWithAvatars: students.filter((s) => s.avatar).length,
        attendanceStats,
        timestamp: new Date().toISOString(),
      },
    };
  }
}
