import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cohort } from 'src/entities/center/cohort.entity';

@Injectable()
export class CohortService {
  constructor(
    @InjectRepository(Cohort)
    private readonly cohortRepository: Repository<Cohort>,
  ) {}

  async create(createCohortDto: Cohort): Promise<Cohort> {
    const cohort = this.cohortRepository.create(createCohortDto);
    return await this.cohortRepository.save(cohort);
  }

  async findAll(): Promise<Cohort[]> {
    return await this.cohortRepository.find();
  }

  async findOne(id: number): Promise<Cohort> {
    const cohort = await this.cohortRepository.findOne({ where: { id } });
    if (!cohort) {
      throw new NotFoundException(`Cohort with ID ${id} not found`);
    }
    return cohort;
  }

  async update(id: number, updateCohortDto: Cohort): Promise<Cohort> {
    await this.cohortRepository.update(id, updateCohortDto);
    const updatedCohort = await this.cohortRepository.findOne({
      where: { id },
    });
    if (!updatedCohort) {
      throw new NotFoundException(`Cohort with ID ${id} not found`);
    }
    return updatedCohort;
  }

  async remove(id: number): Promise<void> {
    const result = await this.cohortRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Cohort with ID ${id} not found`);
    }
  }
}
