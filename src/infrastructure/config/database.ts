import { DataSource } from 'typeorm';
import { User } from '../../domain/model/User';
import { Post } from '../../domain/model/Post';
import { Comment } from '../../domain/model/Comment';
import { Like } from '../../domain/model/Like';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
  logging: false,
  entities: [User, Post, Comment, Like],
});
