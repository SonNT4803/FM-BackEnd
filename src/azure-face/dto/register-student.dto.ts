import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterStudentDto {
  @ApiProperty({
    description: 'ID của sinh viên',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  studentId: number;
}
