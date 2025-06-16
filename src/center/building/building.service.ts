import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Building } from 'src/entities/center/building.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BuildingService {
  constructor(
    @InjectRepository(Building)
    private buildingRepository: Repository<Building>,
  ) {}

  async create(name: string): Promise<Building> {
    const building = this.buildingRepository.create({ name });
    return this.buildingRepository.save(building);
  }

  async findAll(): Promise<Building[]> {
    return this.buildingRepository.find();
  }

  async findOne(id: number): Promise<Building> {
    const building = await this.buildingRepository.findOne({ where: { id } });
    if (!building) {
      throw new NotFoundException(`Building with ID ${id} not found`);
    }
    return building;
  }

  async update(id: number, name: string): Promise<Building> {
    const building = await this.findOne(id);
    building.name = name;
    return this.buildingRepository.save(building);
  }

  async remove(id: number): Promise<void> {
    const building = await this.findOne(id);
    await this.buildingRepository.remove(building);
  }
}
