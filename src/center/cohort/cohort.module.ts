import { Module } from '@nestjs/common';
import { CohortService } from './cohort.service';
import { CohortController } from './cohort.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cohort } from 'src/entities/center/cohort.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cohort])],
  providers: [CohortService],
  controllers: [CohortController],
})
export class CohortModule {}
