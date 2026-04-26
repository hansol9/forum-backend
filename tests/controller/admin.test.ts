import 'reflect-metadata';
import request from 'supertest';
import { AppDataSource } from '../../src/infrastructure/config/database';
import app from '../../src/app';
import { User, Role } from '../../src/domain/model/User';
import { Post } from '../../src/domain/model/Post';
import { Comment } from '../../src/domain/model/Comment';
import { Like } from '../../src/domain/model/Like';
import { JwtTokenProvider } from '../../src/infrastructure/security/JwtTokenProvider';
import bcrypt from 'bcryptjs';

let adminToken: string;
let userToken: string;

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

  const admin = new User();
  admin.username = 'admin';
  admin.email = 'admin@example.com';
  admin.password = await bcrypt.hash('password', 10);
  admin.role = Role.ADMIN;
  await AppDataSource.getRepository(User).save(admin);

  adminToken = JwtTokenProvider.generateToken('admin', 'ADMIN');
  userToken = JwtTokenProvider.generateToken('admin', 'USER');
});

describe('Admin Controller', () => {
  it('should get all users', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it('should get statistics', async () => {
    const res = await request(app)
      .get('/api/admin/statistics')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.totalUsers).toBe(1);
  });

  it('should reject non-admin', async () => {
    const res = await request(app)
      .get('/api/admin/statistics')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('should reject no token', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.status).toBe(403);
  });
});
