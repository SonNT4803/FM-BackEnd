import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, IsArray } from 'class-validator';

export class VerifyClassBatchDto {
  @ApiProperty({
    description: 'Danh sách ảnh khuôn mặt (base64 hoặc đường dẫn file)',
    example: [
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
    ],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  images: string[];

  @ApiProperty({
    description: 'ID của lớp học',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  classId: number;

  @ApiProperty({
    description: 'ID của giáo viên',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  teacherId: number;

  @ApiProperty({
    description: 'ID của lịch học',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  scheduleId: number;
}
