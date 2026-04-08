import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { FormSection } from './form-section.entity';

export enum ItemSize {
  SIMPLE = 'SIMPLE',
  DOUBLE = 'DOUBLE',
  QUEEN = 'QUEEN',
  KING = 'KING',
}

@Entity('form_items')
export class FormItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => FormSection, (section) => section.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'section_id' })
  section: FormSection;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'enum', enum: ItemSize, nullable: true })
  size: ItemSize;

  @Column({ type: 'boolean', default: false, name: 'is_colored' })
  isColored: boolean;

  @Column({ type: 'int', default: 0 })
  quantity: number;
}
