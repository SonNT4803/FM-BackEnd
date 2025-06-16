import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Promotion } from './promotion.entity';
import { AdmissionProgram } from './admission.program.entity';

@Entity('program_promotions')
export class ProgramPromotion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => AdmissionProgram, (program) => program.id, {
    onDelete: 'CASCADE',
  })
  program: AdmissionProgram;

  @ManyToOne(() => Promotion, (promotion) => promotion.id, {
    onDelete: 'CASCADE',
  })
  promotion: Promotion;
}
