import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  NotFoundException,
  UploadedFile,
  UseInterceptors,
  ConflictException,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto, UpdateStudentDto } from './dto/student.dto';
import { Student } from 'src/entities/center/student.entity';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('students')
@ApiTags('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createStudentDto: CreateStudentDto,
  ): Promise<{ statusCode: HttpStatus; message: string; data: Student }> {
    const student = await this.studentService.create(createStudentDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Sinh viên đã được tạo thành công',
      data: student,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<{
    statusCode: HttpStatus;
    message: string;
    data: Student[];
  }> {
    const students = await this.studentService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Đã lấy danh sách sinh viên thành công',
      data: students,
    };
  }

  @Get('/without-class')
  @HttpCode(HttpStatus.OK)
  async findStudentsWithoutClass(): Promise<{
    statusCode: HttpStatus;
    message: string;
    data: Student[];
  }> {
    const students = await this.studentService.findStudentsWithoutClass();
    return {
      statusCode: HttpStatus.OK,
      message: 'Đã lấy danh sách sinh viên không có lớp thành công',
      data: students,
    };
  }

  @Get('class/:classId')
  @HttpCode(HttpStatus.OK)
  async getStudentsByClassId(
    @Param('classId') classId: number,
  ): Promise<{ statusCode: HttpStatus; message: string; data: Student[] }> {
    const students = await this.studentService.findByClassId(classId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Đã lấy danh sách sinh viên theo lớp thành công',
      data: students,
    };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: number,
  ): Promise<{ statusCode: HttpStatus; message: string; data: Student }> {
    const student = await this.studentService.findOne(id);
    if (!student) {
      throw new NotFoundException('Sinh viên không tồn tại');
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Đã lấy thông tin sinh viên thành công',
      data: student,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateStudentDto: UpdateStudentDto,
  ): Promise<{ statusCode: HttpStatus; message: string; data: Student }> {
    const student = await this.studentService.update(id, updateStudentDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Đã cập nhật thông tin sinh viên thành công',
      data: student,
    };
  }

  @Delete(':id')
  async remove(
    @Param('id') id: number,
  ): Promise<{ statusCode: HttpStatus; message: string }> {
    await this.studentService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Sinh viên đã được xóa thành công',
    };
  }

  @Post('/assign-class')
  @HttpCode(HttpStatus.CREATED)
  async createStudentWithClass(
    @Body() createStudentWithClassDto: { classId: number; studentId: number[] },
  ): Promise<{ statusCode: HttpStatus; message: string; data: Student[] }> {
    const students = await this.studentService.createStudentWithClass(
      createStudentWithClassDto,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Đã gán sinh viên vào lớp thành công',
      data: students,
    };
  }

  @Post(':id/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (_, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async uploadAvatar(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{
    statusCode: HttpStatus;
    message: string;
    data: { avatarUrl: string };
  }> {
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    await this.studentService.updateAvatar(id, avatarUrl);
    return {
      statusCode: HttpStatus.OK,
      message: 'Avatar đã được cập nhật thành công',
      data: { avatarUrl },
    };
  }

  @Delete(':id/avatar')
  async deleteAvatar(
    @Param('id') id: number,
  ): Promise<{ statusCode: HttpStatus; message: string }> {
    await this.studentService.deleteAvatar(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Avatar đã được xóa thành công',
    };
  }

  @Get('module/:moduleId')
  @HttpCode(HttpStatus.OK)
  async findStudentsByModule(@Param('moduleId') moduleId: number): Promise<{
    statusCode: HttpStatus;
    message: string;
    data: Student[];
  }> {
    const students = await this.studentService.findStudentsByModule(moduleId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách sinh viên theo môn học thành công',
      data: students,
    };
  }

  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  async findStudentsByUserId(@Param('userId') userId: number): Promise<{
    statusCode: HttpStatus;
    message: string;
    data: Student;
  }> {
    const student = await this.studentService.findStudentByUserId(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'success',
      data: student,
    };
  }

  @Get('check-pass/:moduleCode/:studentId')
  @HttpCode(HttpStatus.OK)
  async checkPass(
    @Param('moduleCode') moduleCode: string,
    @Param('studentId') studentId: number,
  ): Promise<{
    statusCode: HttpStatus;
    message: string;
    data: { classId: number; className: string }[];
  }> {
    try {
      const result = await this.studentService.checkPass(moduleCode, studentId);

      if (result === null) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Sinh viên chưa hoàn thành môn học này',
          data: [],
        };
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Sinh viên có thể đăng ký học lại môn học này',
        data: result,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        return {
          statusCode: HttpStatus.OK,
          message: error.message,
          data: [],
        };
      }
      throw error;
    }
  }
}
