import { Module } from '@nestjs/common';
import { GradefinalService } from './gradefinal.service';
import { GradefinalController } from './gradefinal.controller';

@Module({
  providers: [GradefinalService],
  controllers: [GradefinalController]
})
export class GradefinalModule {}
