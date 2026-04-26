import 'reflect-metadata';
import request from 'supertest';
import { AppDataSource } from '../../src/infrastructure/config/database';
import app from '../../src/app';
import { User } from '../../src/domain/model/User';
import { Post } from '../../src/domain/model/Post';
import { Comment } from '../../src/domain/model/Comment';
import { Like } from '../../src/domain/model/Like';

let token: string;
let postId: number;

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

  await request(app)
    .post('/api/auth/register')
    .send({
      username: 'testuser',
      email: 'test@example.com',
      password: 'pass123',
    });
  const login = await request(app)
    .post('/api/auth/login')
    .send({ username: 'testuser', password: 'pass123' });
  token = login.body.token;

  const post = await request(app)
    .post('/api/posts')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Test Post', content: 'C' });
  postId = post.body.id;
});

describe('Like Controller', () => {
  it('should like a post', async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/likes`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Post liked successfully');
  });

  it('should unlike a post', async () => {
    await request(app)
      .post(`/api/posts/${postId}/likes`)
      .set('Authorization', `Bearer ${token}`);
    const res = await request(app)
      .delete(`/api/posts/${postId}/likes`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
  });

  it('should get like count', async () => {
    const res = await request(app)
      .get(`/api/posts/${postId}/likes/count`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.likeCount).toBe(0);
  });

  it('should get like status', async () => {
    const res = await request(app)
      .get(`/api/posts/${postId}/likes/status`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.liked).toBe(false);
  });
});
