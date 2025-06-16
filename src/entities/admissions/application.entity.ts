import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseAiEntity } from '../base.entity';
import { Student } from '../center/student.entity';
import { AdmissionProgram } from './admission.program.entity';
import { ApplicationStatus } from '../enum/application-status.enum';
import { AttachedDocuments } from './attached.documents.entity';
import { CoursesFamily } from '../courses.family.entity';
import { Parent } from '../parent.entity';
import { StudentProfile } from '../center/student.profile.entity';
import { IntensiveCare } from './intensive.care.entity';

@Entity('application')
export class Application extends BaseAiEntity {
  @Column({ length: 100, nullable: true })
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ length: 10, nullable: true })
  gender: string;

  @Column({ type: 'date', nullable: true })
  birthdate: string;

  @Column({ length: 15, nullable: true })
  phone: string;

  @Column({ type: 'enum', enum: ApplicationStatus })
  status: ApplicationStatus;

  @Column({ nullable: true })
  cardId: string;

  @Column({ nullable: true })
  permanentResidence: string;

  @OneToOne(() => Student, (student) => student.application)
  student: Student;

  @OneToMany(
    () => AttachedDocuments,
    (attachedDocuments) => attachedDocuments.application,
  )
  attachedDocuments: AttachedDocuments[];

  @ManyToOne(() => AdmissionProgram, (admission) => admission.id, {
    nullable: true,
  })
  admissionProgram: AdmissionProgram;

  @ManyToOne(
    () => CoursesFamily,
    (coursesFamily) => coursesFamily.application,
    {
      nullable: true,
    },
  )
  coursesFamily: CoursesFamily;

  @OneToMany(() => Parent, (parent) => parent.application)
  parent: Parent[];

  @OneToOne(
    () => StudentProfile,
    (studentProfile) => studentProfile.application,
  )
  @JoinColumn()
  studentProfile: StudentProfile;

  @OneToMany(() => IntensiveCare, (intensiveCare) => intensiveCare.application)
  intensiveCare: IntensiveCare[];
}
