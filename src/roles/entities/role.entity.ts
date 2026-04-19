import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string; // e.g. 'EMPLOYEE', 'MANAGER', 'ADMIN'

  @Column({ type: 'simple-json', nullable: true })
  permissions: any; // Dynamic JSON object mapping views to actions

  @Column({ name: 'permissions_mobile', type: 'simple-json', nullable: true })
  permissions_mobile: any; // Mobile-specific permissions JSON

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
