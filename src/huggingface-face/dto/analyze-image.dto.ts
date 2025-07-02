import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class AnalyzeImageDto {
  @ApiProperty({
    description: 'Ảnh cần phân tích (base64 hoặc URL)',
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
  })
  @IsString()
  image: string;

  @ApiProperty({
    description: 'Prompt tùy chỉnh cho việc phân tích (tùy chọn)',
    example: 'Hãy mô tả chi tiết về khuôn mặt trong ảnh này',
    required: false,
  })
  @IsOptional()
  @IsString()
  prompt?: string;
}
