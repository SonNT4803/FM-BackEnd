import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntensiveCare } from 'src/entities/admissions/intensive.care.entity';
import { IntensiveCareController } from './intensivecare.controller';
import { IntensiveCareService } from './intensivecare.service';
import { Application } from 'src/entities/admissions/application.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IntensiveCare, Application])],
  providers: [IntensiveCareService],
  controllers: [IntensiveCareController],
})
export class IntensivecareModule {}
