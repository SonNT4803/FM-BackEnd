import { Controller } from '@nestjs/common';
import { GradecomponentService } from './gradecomponent.service';

@Controller('gradecomponent')
export class GradecomponentController {
  constructor(private readonly gradecomponentService: GradecomponentService) {}
}
