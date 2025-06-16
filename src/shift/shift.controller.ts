// src/shift/shift.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ShiftService } from './shift.service';
import { Shift } from 'src/entities/shift.entity';
import { CreateShiftDto, UpdateShiftDto } from './dto/shift.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('shifts')
@ApiTags('shift')
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  @Post()
  async create(@Body() createShiftDto: CreateShiftDto): Promise<Shift> {
    return this.shiftService.create(createShiftDto);
  }

  @Get()
  async findAll(): Promise<Shift[]> {
    return this.shiftService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Shift> {
    return this.shiftService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateShiftDto: UpdateShiftDto,
  ): Promise<Shift> {
    return this.shiftService.update(id, updateShiftDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.shiftService.remove(id);
  }
}
