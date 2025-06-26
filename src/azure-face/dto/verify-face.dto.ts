import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyFaceDto {
  @ApiProperty({
    description: 'Ảnh khuôn mặt dưới dạng base64 data URL',
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
  })
  @IsString()
  @IsNotEmpty()
  image: string;

  @ApiProperty({
    description: 'ID của sinh viên',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  studentId: number;

  @ApiProperty({
    description: 'ID của lịch học',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  scheduleId: number;

  @ApiProperty({
    description: 'Ghi chú (tùy chọn)',
    example: 'Xác thực bằng khuôn mặt',
    required: false,
  })
  @IsString()
  @IsOptional()
  note?: string;
}
