import { CreateGradeCategoryDto } from 'src/grades/gradecategory/dto/gradecategory.dto';

export class CreateModuleDto {
  module_id?: number;
  module_name?: string;
  code?: string;
  number_of_classes?: number;
  semester_id?: number;
  gradeCategories?: CreateGradeCategoryDto[];
  exam_type?: number[];
}

export class UpdateModuleDto {
  module_id?: number;
  module_name?: string;
  code?: string;
  number_of_classes?: number;
  semester_id?: number;
  gradeCategories?: CreateGradeCategoryDto[];
  exam_type?: number[];
}
