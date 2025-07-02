import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class VerifyClassDto {
  @ApiProperty({
    description: 'Ảnh khuôn mặt (base64 hoặc đường dẫn file)',
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
  })
  @IsString()
  @IsNotEmpty()
  image: string;

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
