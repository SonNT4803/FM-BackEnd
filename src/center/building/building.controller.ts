import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Building } from 'src/entities/center/building.entity';
import { BuildingService } from './building.service';

@Controller('building')
@ApiTags('building')
export class BuildingController {
  constructor(private readonly buildingService: BuildingService) {}

  // Create a new building
  @Post()
  async create(@Body('name') name: string): Promise<Building> {
    return this.buildingService.create(name);
  }

  // Get all buildings
  @Get()
  async findAll(): Promise<Building[]> {
    return this.buildingService.findAll();
  }

  // Get a single building by ID
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Building> {
    return this.buildingService.findOne(+id);
  }

  // Update a building by ID
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body('name') name: string,
  ): Promise<Building> {
    return this.buildingService.update(+id, name);
  }

  // Delete a building by ID
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.buildingService.remove(+id);
  }
}
