import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
} from 'typeorm';

@Entity('likes')
@Unique(['userId', 'postId'])
export class Like {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id' })
  userId!: number;

  @Column({ name: 'post_id' })
  postId!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
