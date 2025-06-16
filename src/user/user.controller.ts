import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserDTO } from 'src/auth/dto/user.dto';
import { PaginationDto } from './dto/pagination.dto';
import { UserService } from './user.service';

@Controller('users')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<{ data: UserDTO[]; total: number }> {
    const { page, limit } = paginationDto;
    return this.userService.findAll(page, limit);
  }
}
