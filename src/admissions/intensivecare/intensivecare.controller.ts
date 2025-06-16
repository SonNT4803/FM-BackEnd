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
import { IntensiveCareService } from './intensivecare.service';
import {
  CreateIntensiveCareDto,
  UpdateIntensiveCareDto,
} from './dto/intensive.care.dto';

@Controller('intensive-care')
export class IntensiveCareController {
  constructor(private readonly intensiveCareService: IntensiveCareService) {}

  @Post()
  async create(@Body() createIntensiveCareDto: CreateIntensiveCareDto) {
    const intensiveCare = await this.intensiveCareService.create(
      createIntensiveCareDto,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Tạo hồ sơ chăm sóc đặc biệt thành công',
      data: intensiveCare,
    };
  }

  @Get()
  async findAll() {
    const intensiveCares = await this.intensiveCareService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách hồ sơ chăm sóc đặc biệt thành công',
      data: intensiveCares,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const intensiveCare = await this.intensiveCareService.findOne(+id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy thông tin hồ sơ chăm sóc đặc biệt thành công',
      data: intensiveCare,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateIntensiveCareDto: UpdateIntensiveCareDto,
  ) {
    const intensiveCare = await this.intensiveCareService.update(
      +id,
      updateIntensiveCareDto,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Cập nhật hồ sơ chăm sóc đặc biệt thành công',
      data: intensiveCare,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.intensiveCareService.remove(+id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Xóa hồ sơ chăm sóc đặc biệt thành công',
    };
  }
}
