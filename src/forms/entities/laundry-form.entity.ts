import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, OneToMany,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { User } from '../../users/entities/user.entity';
import { FormSection } from './form-section.entity';

export enum FormStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
}

@Entity('laundry_forms')
export class LaundryForm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Company, { eager: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'int', default: 0, name: 'pocket_count' })
  pocketCount: number;

  @Column({ type: 'int', default: 0, name: 'plastic_bags_small' })
  plasticBagsSmall: number;

  @Column({ type: 'int', default: 0, name: 'plastic_bags_large' })
  plasticBagsLarge: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'enum', enum: FormStatus, default: FormStatus.DRAFT })
  status: FormStatus;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => User, { eager: true, nullable: false })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approvedBy: User;

  @OneToMany(() => FormSection, (section) => section.form, { cascade: true })
  sections: FormSection[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
