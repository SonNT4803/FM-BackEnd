import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ParentService } from './parent.service';
import { CreateParentDto, UpdateParentDto } from './dto/parent.dto';

@Controller('parent')
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  @Post()
  async create(@Body() createParentDto: CreateParentDto) {
    return this.parentService.create(createParentDto);
  }

  @Get()
  async findAll() {
    return this.parentService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.parentService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateParentDto: UpdateParentDto,
  ) {
    return this.parentService.update(id, updateParentDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.parentService.remove(id);
  }
}
