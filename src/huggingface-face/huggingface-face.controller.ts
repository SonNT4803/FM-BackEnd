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
import { VerifyFaceDto } from './dto/verify-face.dto';
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
}
