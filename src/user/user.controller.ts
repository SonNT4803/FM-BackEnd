import {
  Controller,
  Get,
  Param,
  Query,
  Post,
  Body,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserDTO } from 'src/auth/dto/user.dto';
import { PaginationDto } from './dto/pagination.dto';
import { CreateUserDto, CreateUserResponseDto } from './dto/create.dto';
import { UserService } from './user.service';
import { User } from 'src/entities/auth/user.entity';

@Controller('users')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<CreateUserResponseDto> {
    try {
      const user = await this.userService.createUser(
        createUserDto.username,
        createUserDto.password,
        createUserDto.roleId,
        createUserDto.email,
      );

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        isActive: user.isActive,
        createdAt: user.createdAt,
      };
    } catch (error) {
      if (error.message.includes('already exists')) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<{ data: UserDTO[]; total: number }> {
    const { page, limit } = paginationDto;
    return this.userService.findAll(page, limit);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<User> {
    return this.userService.findUserById(id);
  }
}
