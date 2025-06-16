import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Building } from 'src/entities/center/building.entity';
import { Classroom } from 'src/entities/center/classroom.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ClassroomService {
  constructor(
    @InjectRepository(Classroom)
    private classroomRepository: Repository<Classroom>,
    @InjectRepository(Building)
    private buildingRepository: Repository<Building>,
  ) {}

  async create(name: string, buildingId: number): Promise<Classroom> {
    const building = await this.buildingRepository.findOne({
      where: { id: buildingId },
    });
    if (!building) {
      throw new NotFoundException(`Building with ID ${buildingId} not found`);
    }

    const classroom = this.classroomRepository.create({ name, building });
    return this.classroomRepository.save(classroom);
  }

  async findAll(): Promise<Classroom[]> {
    return this.classroomRepository.find();
  }

  async findOne(id: number): Promise<Classroom> {
    const classroom = await this.classroomRepository.findOne({ where: { id } });
    if (!classroom) {
      throw new NotFoundException(`Classroom with ID ${id} not found`);
    }
    return classroom;
  }

  async update(
    id: number,
    name: string,
    buildingId: number,
  ): Promise<Classroom> {
    const classroom = await this.findOne(id);
    const building = await this.buildingRepository.findOne({
      where: { id: buildingId },
    });

    if (!building) {
      throw new NotFoundException(`Building with ID ${buildingId} not found`);
    }

    classroom.name = name;
    classroom.building = building;
    return this.classroomRepository.save(classroom);
  }

  async remove(id: number): Promise<void> {
    const classroom = await this.findOne(id);
    await this.classroomRepository.remove(classroom);
  }

  async getClassroomsByBuildingId(buildingId: number): Promise<Classroom[]> {
    const building = await this.buildingRepository.findOne({
      where: { id: buildingId },
    });

    if (!building) {
      throw new NotFoundException(`Building with ID ${buildingId} not found`);
    }

    const classrooms = await this.classroomRepository.find({
      where: { building: { id: buildingId } },
    });
    return classrooms;
  }
}
