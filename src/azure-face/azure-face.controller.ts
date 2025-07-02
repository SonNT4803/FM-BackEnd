import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Delete,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AzureFaceService } from './azure-face.service';
import { RegisterStudentDto } from './dto/register-student.dto';
import { VerifyFaceDto } from './dto/verify-face.dto';
import { VerifyClassDto } from './dto/verify-class.dto';

@ApiTags('azure-face')
@Controller('azure-face')
@ApiBearerAuth('JWT-auth')
export class AzureFaceController {
  constructor(private readonly azureFaceService: AzureFaceService) {}

  @Post('register-student')
  @ApiOperation({ summary: 'Đăng ký khuôn mặt cho sinh viên' })
  @ApiResponse({ status: 200, description: 'Đăng ký thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async registerStudentFace(@Body() registerStudentDto: RegisterStudentDto) {
    return await this.azureFaceService.registerStudentFace(
      registerStudentDto.studentId,
    );
  }

  @Post('verify-face')
  @ApiOperation({ summary: 'Xác thực khuôn mặt sinh viên' })
  @ApiResponse({ status: 200, description: 'Xác thực thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async verifyFace(@Body() verifyFaceDto: VerifyFaceDto) {
    return await this.azureFaceService.verifyFace(
      verifyFaceDto.image,
      verifyFaceDto.studentId,
      verifyFaceDto.scheduleId,
      verifyFaceDto.note,
    );
  }

  @Post('verify-class')
  @ApiOperation({ summary: 'Xác thực khuôn mặt cho cả lớp' })
  @ApiResponse({ status: 200, description: 'Xác thực thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async verifyClass(@Body() verifyClassDto: VerifyClassDto) {
    return this.azureFaceService.verifyClass(
      verifyClassDto.image,
      verifyClassDto.classId,
      verifyClassDto.teacherId,
      verifyClassDto.scheduleId,
    );
  }

  @Post('verify-face-direct')
  @ApiOperation({
    summary:
      'Xác thực khuôn mặt sinh viên (so sánh trực tiếp avatar và ảnh upload, không cần đăng ký trước)',
  })
  @ApiResponse({ status: 200, description: 'Xác thực thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async verifyFaceDirect(@Body() verifyFaceDto: VerifyFaceDto) {
    return await this.azureFaceService.verifyFaceDirect(
      verifyFaceDto.image,
      verifyFaceDto.studentId,
      verifyFaceDto.scheduleId,
      verifyFaceDto.note,
    );
  }

  @Delete('delete-student/:studentId')
  @ApiOperation({ summary: 'Xóa khuôn mặt sinh viên' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async deleteStudentFace(@Param('studentId', ParseIntPipe) studentId: number) {
    return await this.azureFaceService.deleteStudentFace(studentId);
  }

  @Get('status')
  @ApiOperation({ summary: 'Lấy trạng thái nhóm người' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
  async getPersonGroupStatus() {
    return await this.azureFaceService.getPersonGroupStatus();
  }

  @Get('test-avatar/:studentId')
  @ApiOperation({ summary: 'Kiểm tra format ảnh đại diện của sinh viên' })
  @ApiResponse({ status: 200, description: 'Kiểm tra thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async testAvatarFormat(@Param('studentId', ParseIntPipe) studentId: number) {
    return await this.azureFaceService.testAvatarFormat(studentId);
  }
}
