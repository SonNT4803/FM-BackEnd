import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { PriorityService } from './priority.service';
import { CreatePriorityDto, UpdatePriorityDto } from './dto/priority.dto';

@Controller('priority')
export class PriorityController {
  constructor(private readonly priorityService: PriorityService) {}

  @Post()
  async create(@Body() createPriorityDto: CreatePriorityDto) {
    const priority = await this.priorityService.create(createPriorityDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Tạo ưu tiên thành công',
      data: priority,
    };
  }

  @Get()
  async findAll() {
    const priorities = await this.priorityService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách ưu tiên thành công',
      data: priorities,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const priority = await this.priorityService.findOne(+id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy thông tin ưu tiên thành công',
      data: priority,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePriorityDto: UpdatePriorityDto,
  ) {
    const priority = await this.priorityService.update(+id, updatePriorityDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Cập nhật ưu tiên thành công',
      data: priority,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.priorityService.remove(+id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Xóa ưu tiên thành công',
    };
  }
}
