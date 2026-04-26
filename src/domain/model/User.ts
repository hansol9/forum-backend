import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPERUSER = 'SUPERUSER',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, length: 50 })
  username!: string;

  @Column({ unique: true, length: 100 })
  email!: string;

  @Column()
  password!: string;

  @Column({ type: 'varchar', default: Role.USER })
  role!: Role;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
