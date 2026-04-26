import 'reflect-metadata';
import request from 'supertest';
import { AppDataSource } from '../../src/infrastructure/config/database';
import app from '../../src/app';
import { User } from '../../src/domain/model/User';

beforeAll(async () => {
  await AppDataSource.initialize();
});
afterAll(async () => {
  await AppDataSource.destroy();
});
beforeEach(async () => {
  await AppDataSource.getRepository(User).clear();
});

describe('Auth Controller', () => {
  it('should register a user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'pass123',
      });
    expect(res.status).toBe(201);
    expect(res.body.username).toBe('testuser');
  });

  it('should reject duplicate username', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 't1@example.com',
        password: 'pass',
      });
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 't2@example.com',
        password: 'pass',
      });
    expect(res.status).toBe(400);
  });

  it('should login successfully', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'pass123',
      });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'pass123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.role).toBe('USER');
  });

  it('should reject wrong password', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'pass123',
      });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'wrong' });
    expect(res.status).toBe(400);
  });

  it('should reject non-existing user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'nobody', password: 'pass' });
    expect(res.status).toBe(400);
  });
});
