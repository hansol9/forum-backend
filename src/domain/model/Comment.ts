import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text')
  content!: string;

  @Column({ name: 'user_id' })
  userId!: number;

  @Column({ name: 'post_id' })
  postId!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt!: Date;
}
