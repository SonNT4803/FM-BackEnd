import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Module } from 'src/entities/module.entity';
import { CreateModuleDto, UpdateModuleDto } from './dto/module.dto';
import { ModuleService } from './module.service';

@Controller('module')
@ApiTags('module')
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Post()
  async create(
    @Body() createModuleDto: CreateModuleDto,
  ): Promise<{ statusCode: number; message: string; data?: Module }> {
    try {
      const module = await this.moduleService.create(createModuleDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Tạo Module thành công',
        data: module,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Tạo Module thất bại',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('/code/:code')
  async getModuleByCode(
    @Param('code') code: string,
  ): Promise<{ statusCode: number; message: string; data?: CreateModuleDto }> {
    try {
      const module = await this.moduleService.getModuleByCode(code);
      return {
        statusCode: HttpStatus.OK,
        message: 'Lấy thông tin Module thành công',
        data: module,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Lấy thông tin Module thất bại',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  async findAll(): Promise<{
    statusCode: number;
    message: string;
    data?: CreateModuleDto[];
  }> {
    try {
      const modules = await this.moduleService.findAll();
      return {
        statusCode: HttpStatus.OK,
        message: 'Lấy danh sách Module thành công',
        data: modules,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Lấy danh sách Module thất bại',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':id')
  async findOne(
    @Param('id') id: number,
  ): Promise<{ statusCode: number; message: string; data?: CreateModuleDto }> {
    try {
      const module = await this.moduleService.findOne(+id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Lấy thông tin Module thành công',
        data: module,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Lấy thông tin Module thất bại',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateModuleDto: UpdateModuleDto,
  ): Promise<{ statusCode: number; message: string; data?: Module }> {
    try {
      const updatedModule = await this.moduleService.update(
        +id,
        updateModuleDto,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Cập nhật Module thành công',
        data: updatedModule,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Cập nhật Module thất bại',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  async remove(
    @Param('id') id: number,
  ): Promise<{ statusCode: number; message: string }> {
    try {
      await this.moduleService.remove(+id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Xóa Module thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Xóa Module thất bại',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('/class/:classId/term/:termNumber')
  async getModulesByClassAndTerm(
    @Param('classId') classId: number,
    @Param('termNumber') termNumber: number,
  ): Promise<{ statusCode: number; message: string; data: Module[] }> {
    const modules = await this.moduleService.getModulesByClassAndTerm(
      classId,
      termNumber,
    );
    return {
      statusCode: 200,
      message: 'Lấy danh sách Module thành công',
      data: modules,
    };
  }
}
