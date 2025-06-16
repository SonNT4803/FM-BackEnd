import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IntensiveCare } from 'src/entities/admissions/intensive.care.entity';
import { Repository } from 'typeorm';
import {
  CreateIntensiveCareDto,
  UpdateIntensiveCareDto,
} from './dto/intensive.care.dto';
import { Application } from 'src/entities/admissions/application.entity';

@Injectable()
export class IntensiveCareService {
  constructor(
    @InjectRepository(IntensiveCare)
    private intensiveCareRepository: Repository<IntensiveCare>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
  ) {}

  async create(
    createIntensiveCareDto: CreateIntensiveCareDto,
  ): Promise<IntensiveCare> {
    const intensiveCare = this.intensiveCareRepository.create(
      createIntensiveCareDto,
    );

    if (createIntensiveCareDto.applicationId) {
      intensiveCare.application = await this.applicationRepository.findOne({
        where: { id: createIntensiveCareDto.applicationId },
      });
    }

    return await this.intensiveCareRepository.save(intensiveCare);
  }

  async findAll(): Promise<IntensiveCare[]> {
    return await this.intensiveCareRepository.find({
      relations: ['application', 'student'],
    });
  }

  async findOne(id: number): Promise<IntensiveCare> {
    const intensiveCare = await this.intensiveCareRepository.findOne({
      where: { id },
      relations: ['application', 'student'],
    });
    if (!intensiveCare) {
      throw new NotFoundException('Intensive care record not found');
    }
    return intensiveCare;
  }

  async update(
    id: number,
    updateIntensiveCareDto: UpdateIntensiveCareDto,
  ): Promise<IntensiveCare> {
    await this.intensiveCareRepository.update(id, updateIntensiveCareDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.intensiveCareRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Intensive care record not found');
    }
  }
}
