import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { LaundryForm } from './laundry-form.entity';
import { FormItem } from './form-item.entity';

export enum SectionName {
  TOWELS = 'TOWELS',
  BED_SHEETS = 'BED_SHEETS',
  COVERS = 'COVERS',
  OTHER = 'OTHER',
}

@Entity('form_sections')
export class FormSection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => LaundryForm, (form) => form.sections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'form_id' })
  form: LaundryForm;

  @Column({ type: 'enum', enum: SectionName, name: 'section_name' })
  sectionName: SectionName;

  @Column({ type: 'varchar', length: 10, name: 'filled_by_initials', nullable: true })
  filledByInitials: string;

  @OneToMany(() => FormItem, (item) => item.section, { cascade: true })
  items: FormItem[];
}
