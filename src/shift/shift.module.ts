import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shift } from 'src/entities/shift.entity';
import { ShiftController } from './shift.controller';
import { ShiftService } from './shift.service';

@Module({
  imports: [TypeOrmModule.forFeature([Shift])],
  providers: [ShiftService],
  controllers: [ShiftController],
})
export class ShiftModule {}
