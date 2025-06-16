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
import { ApplicationdocumentsService } from './applicationdocuments.service';

@Controller('application-documents')
export class ApplicationdocumentsController {
  constructor(
    private readonly applicationdocumentsService: ApplicationdocumentsService,
  ) {}

  @Post()
  async create(@Body('name') name: string) {
    const document = await this.applicationdocumentsService.create(name);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Tạo tài liệu thành công',
      data: document,
    };
  }

  @Get()
  async findAll() {
    const documents = await this.applicationdocumentsService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách tài liệu thành công',
      data: documents,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const document = await this.applicationdocumentsService.findOne(+id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Tìm thấy tài liệu',
      data: document,
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body('name') name: string) {
    const document = await this.applicationdocumentsService.update(+id, name);
    return {
      statusCode: HttpStatus.OK,
      message: 'Cập nhật tài liệu thành công',
      data: document,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.applicationdocumentsService.remove(+id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Xóa tài liệu thành công',
    };
  }
}
