import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CompareImagesDto {
  @ApiProperty({
    description: 'Ảnh thứ nhất (base64 hoặc URL)',
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
  })
  @IsString()
  image1: string;

  @ApiProperty({
    description: 'Ảnh thứ hai (base64 hoặc URL)',
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
  })
  @IsString()
  image2: string;

  @ApiProperty({
    description: 'Prompt tùy chỉnh cho việc so sánh (tùy chọn)',
    example:
      'Hãy so sánh hai ảnh này và cho biết chúng có phải là cùng một người không',
    required: false,
  })
  @IsOptional()
  @IsString()
  prompt?: string;
}
