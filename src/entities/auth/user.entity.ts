import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseAiEntity } from '../base.entity';

@Entity('users')
export class User extends BaseAiEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  email?: string;

  @Column({ default: true, nullable: true })
  isActive: boolean;
}
