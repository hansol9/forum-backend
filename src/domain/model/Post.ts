import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 200 })
  title!: string;

  @Column('text')
  content!: string;

  @Column({ name: 'user_id' })
  userId!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt!: Date;
}
