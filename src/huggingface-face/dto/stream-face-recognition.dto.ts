import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class StreamFaceRecognitionDto {
  @ApiProperty({
    description: 'ID của lớp học',
    example: 1,
  })
  @IsNumber()
  classId: number;

  @ApiProperty({
    description: 'ID của lịch học (schedule)',
    example: 1,
  })
  @IsNumber()
  scheduleId: number;

  @ApiProperty({
    description: 'Base64 encoded image frame từ camera stream',
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
  })
  @IsString()
  imageFrame: string;

  @ApiProperty({
    description: 'Ghi chú tùy chọn',
    example: 'Stream recognition session',
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;
}

export class StreamFaceRecognitionResponseDto {
  @ApiProperty({
    description: 'Kết quả nhận diện',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Danh sách học sinh được nhận diện',
    example: [
      {
        studentId: 1,
        studentName: 'Nguyễn Văn A',
        confidence: 0.95,
        timestamp: '2024-01-15T10:30:00Z',
      },
    ],
  })
  recognizedStudents: Array<{
    studentId: number;
    studentName: string;
    confidence: number;
    timestamp: string;
  }>;

  @ApiProperty({
    description: 'Số lượng khuôn mặt được phát hiện',
    example: 3,
  })
  totalFacesDetected: number;

  @ApiProperty({
    description: 'Thông báo',
    example: 'Đã nhận diện 3 học sinh trong lớp',
  })
  message: string;
}
