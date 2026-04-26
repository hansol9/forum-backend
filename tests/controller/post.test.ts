import 'reflect-metadata';
import request from 'supertest';
import { AppDataSource } from '../../src/infrastructure/config/database';
import app from '../../src/app';
import { User } from '../../src/domain/model/User';
import { Post } from '../../src/domain/model/Post';
import { Comment } from '../../src/domain/model/Comment';
import { Like } from '../../src/domain/model/Like';

let token: string;

beforeAll(async () => {
  await AppDataSource.initialize();
});
afterAll(async () => {
  await AppDataSource.destroy();
});

beforeEach(async () => {
  await AppDataSource.getRepository(Like).clear();
  await AppDataSource.getRepository(Comment).clear();
  await AppDataSource.getRepository(Post).clear();
  await AppDataSource.getRepository(User).clear();

  await request(app).post('/api/auth/register').send({
    username: 'testuser',
    email: 'test@example.com',
    password: 'pass123',
  });
  const login = await request(app)
    .post('/api/auth/login')
    .send({ username: 'testuser', password: 'pass123' });
  token = login.body.token;
});

describe('Post Controller', () => {
  it('should create a post', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Post', content: 'Content' });
    expect(res.status).toBe(201);
  });

  it('should get all posts', async () => {
    await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Post 1', content: 'C1' });
    const res = await request(app)
      .get('/api/posts')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });
});
