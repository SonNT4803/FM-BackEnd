import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParentService } from './parent.service';
import { ParentController } from './parent.controller';
import { Parent } from 'src/entities/parent.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Parent])],
  providers: [ParentService],
  controllers: [ParentController],
})
export class ParentModule {}
