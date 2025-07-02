import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class GenerateTextDto {
  @ApiProperty({
    description: 'Prompt để tạo text response',
    example: 'Giải thích về nhận diện khuôn mặt trong hệ thống điểm danh',
  })
  @IsString()
  prompt: string;

  @ApiProperty({
    description: 'Context bổ sung cho prompt (tùy chọn)',
    example: 'Trong hệ thống điểm danh sinh viên sử dụng AI',
    required: false,
  })
  @IsOptional()
  @IsString()
  context?: string;
}
