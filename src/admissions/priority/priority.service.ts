import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Priority } from '../../entities/admissions/priority.entity';
import { CreatePriorityDto, UpdatePriorityDto } from './dto/priority.dto';

@Injectable()
export class PriorityService {
  constructor(
    @InjectRepository(Priority)
    private readonly priorityRepository: Repository<Priority>,
  ) {}

  async create(createPriorityDto: CreatePriorityDto): Promise<Priority> {
    const existingPriority = await this.priorityRepository.findOne({
      where: { name: createPriorityDto.name },
    });

    if (existingPriority) {
      throw new ConflictException('Tên ưu tiên đã tồn tại');
    }

    const priority = this.priorityRepository.create(createPriorityDto);
    return await this.priorityRepository.save(priority);
  }

  async findAll(): Promise<Priority[]> {
    return await this.priorityRepository.find();
  }

  async findOne(id: number): Promise<Priority> {
    const priority = await this.priorityRepository.findOne({ where: { id } });
    if (!priority) {
      throw new NotFoundException('Không tìm thấy ưu tiên');
    }
    return priority;
  }

  async update(
    id: number,
    updatePriorityDto: UpdatePriorityDto,
  ): Promise<Priority> {
    const existingPriority = await this.findOne(id);

    if (updatePriorityDto.name) {
      const nameConflict = await this.priorityRepository.findOne({
        where: { name: updatePriorityDto.name },
      });

      if (nameConflict && nameConflict.id !== existingPriority.id) {
        throw new ConflictException('Tên ưu tiên đã tồn tại');
      }
    }

    await this.priorityRepository.update(id, updatePriorityDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const priority = await this.findOne(id);
    await this.priorityRepository.remove(priority);
  }
}
