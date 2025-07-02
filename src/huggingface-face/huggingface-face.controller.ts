import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RegisterStudentDto } from './dto/register-student.dto';
import { VerifyClassDto } from './dto/verify-class.dto';
import { VerifyFaceDto } from './dto/verify-face.dto';
import { HuggingfaceFaceService } from './huggingface-face.service';

@ApiTags('huggingface-face')
@Controller('huggingface-face')
export class HuggingfaceFaceController {
  constructor(
    private readonly huggingfaceFaceService: HuggingfaceFaceService,
  ) {}

  @Post('register-student')
  @ApiOperation({ summary: 'Đăng ký khuôn mặt cho sinh viên (Hugging Face)' })
  @ApiResponse({ status: 200, description: 'Đăng ký thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async registerStudentFace(@Body() registerStudentDto: RegisterStudentDto) {
    return await this.huggingfaceFaceService.registerStudentFace(
      registerStudentDto.studentId,
    );
  }

  @Post('verify-face')
  @ApiOperation({ summary: 'Xác thực khuôn mặt sinh viên (Hugging Face)' })
  @ApiResponse({ status: 200, description: 'Xác thực thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async verifyFace(@Body() verifyFaceDto: VerifyFaceDto) {
    return await this.huggingfaceFaceService.verifyFace(
      verifyFaceDto.image,
      verifyFaceDto.studentId,
      verifyFaceDto.scheduleId,
      verifyFaceDto.note,
    );
  }

  @Post('verify-class')
  @ApiOperation({ summary: 'Xác thực khuôn mặt cho cả lớp (Hugging Face)' })
  @ApiResponse({ status: 200, description: 'Xác thực thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async verifyClass(@Body() verifyClassDto: VerifyClassDto) {
    return this.huggingfaceFaceService.verifyClass(
      verifyClassDto.image,
      verifyClassDto.classId,
      verifyClassDto.teacherId,
      verifyClassDto.scheduleId,
    );
  }

  @Delete('delete-student/:studentId')
  @ApiOperation({ summary: 'Xóa khuôn mặt sinh viên (Hugging Face)' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async deleteStudentFace(@Param('studentId', ParseIntPipe) studentId: number) {
    return await this.huggingfaceFaceService.deleteStudentFace(studentId);
  }

  @Get('status')
  @ApiOperation({ summary: 'Lấy thống kê sinh viên đã đăng ký (Hugging Face)' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
  async getRegisteredStudentsCount() {
    return await this.huggingfaceFaceService.getRegisteredStudentsCount();
  }

  @Get('test-avatar/:studentId')
  @ApiOperation({
    summary: 'Kiểm tra format ảnh đại diện của sinh viên (Hugging Face)',
  })
  @ApiResponse({ status: 200, description: 'Kiểm tra thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async testAvatarFormat(@Param('studentId', ParseIntPipe) studentId: number) {
    return await this.huggingfaceFaceService.testAvatarFormat(studentId);
  }
}
