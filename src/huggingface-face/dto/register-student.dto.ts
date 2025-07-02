import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class RegisterStudentDto {
  @ApiProperty({
    description: 'ID của sinh viên',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  studentId: number;
}
