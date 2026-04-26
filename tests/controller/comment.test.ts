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

describe('Comment Controller', () => {
  it('should create a comment', async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Test Comment' });
    expect(res.status).toBe(201);
    expect(res.body.content).toBe('Test Comment');
  });

  it('should get comments by post', async () => {
    await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'C1' });
    const res = await request(app)
      .get(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it('should update a comment', async () => {
    const create = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Old' });
    const res = await request(app)
      .put(`/api/posts/${postId}/comments/${create.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.content).toBe('Updated');
  });

  it('should delete a comment', async () => {
    const create = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Delete' });
    const res = await request(app)
      .delete(`/api/posts/${postId}/comments/${create.body.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
  });
});
