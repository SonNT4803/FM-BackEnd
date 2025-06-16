import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parent } from 'src/entities/parent.entity';
import { CreateParentDto, UpdateParentDto } from './dto/parent.dto';

@Injectable()
export class ParentService {
  constructor(
    @InjectRepository(Parent)
    private readonly parentRepository: Repository<Parent>,
  ) {}

  async create(createParentDto: CreateParentDto): Promise<Parent> {
    const parent = this.parentRepository.create(createParentDto);
    return this.parentRepository.save(parent);
  }

  async findAll(): Promise<Parent[]> {
    return this.parentRepository.find();
  }

  async findOne(id: number): Promise<Parent> {
    const parent = await this.parentRepository.findOne({ where: { id } });
    if (!parent) {
      throw new NotFoundException(`Parent with ID ${id} not found`);
    }
    return parent;
  }

  async update(id: number, updateParentDto: UpdateParentDto): Promise<Parent> {
    await this.parentRepository.update(id, updateParentDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.parentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Parent with ID ${id} not found`);
    }
  }
}
