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

let superuserToken: string;
let userToken: string;
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

  const userRepo = AppDataSource.getRepository(User);
  const postRepo = AppDataSource.getRepository(Post);

  const user = new User();
  user.username = 'regular';
  user.email = 'regular@example.com';
  user.password = await bcrypt.hash('password', 10);
  user.role = Role.USER;
  const savedUser = await userRepo.save(user);

  const superuser = new User();
  superuser.username = 'superuser';
  superuser.email = 'super@example.com';
  superuser.password = await bcrypt.hash('password', 10);
  superuser.role = Role.SUPERUSER;
  await userRepo.save(superuser);

  const post = new Post();
  post.title = 'User Post';
  post.content = 'Content';
  post.userId = savedUser.id;
  const savedPost = await postRepo.save(post);
  postId = savedPost.id;

  superuserToken = JwtTokenProvider.generateToken('superuser', 'SUPERUSER');
  userToken = JwtTokenProvider.generateToken('regular', 'USER');
});

describe('Superuser Controller', () => {
  it('should edit any post', async () => {
    const res = await request(app)
      .put(`/api/superuser/posts/${postId}`)
      .set('Authorization', `Bearer ${superuserToken}`)
      .send({ title: 'Edited', content: 'New content' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Edited');
  });

  it('should delete any post', async () => {
    const res = await request(app)
      .delete(`/api/superuser/posts/${postId}`)
      .set('Authorization', `Bearer ${superuserToken}`);
    expect(res.status).toBe(204);
  });

  it('should reject non-superuser', async () => {
    const res = await request(app)
      .put(`/api/superuser/posts/${postId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Hack', content: 'Hack' });
    expect(res.status).toBe(403);
  });

  it('should return 400 for non-existing post', async () => {
    const res = await request(app)
      .put('/api/superuser/posts/999')
      .set('Authorization', `Bearer ${superuserToken}`)
      .send({ title: 'X', content: 'X' });
    expect(res.status).toBe(400);
  });
});
