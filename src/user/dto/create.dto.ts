import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'Username for the user', example: 'john_doe' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Password for the user', example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john@example.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Role ID for the user', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  roleId: number;
}

export class CreateUserResponseDto {
  @ApiProperty({ description: 'User ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Username', example: 'john_doe' })
  username: string;

  @ApiProperty({ description: 'Email address', example: 'john@example.com' })
  email: string;

  @ApiProperty({ description: 'User active status', example: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Created date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}
