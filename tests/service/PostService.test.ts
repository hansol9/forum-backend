import 'reflect-metadata';
import { AppDataSource } from '../../src/infrastructure/config/database';
import { PostService } from '../../src/application/service/PostService';
import { UserService } from '../../src/application/service/UserService';
import { Post } from '../../src/domain/model/Post';
import { User } from '../../src/domain/model/User';

let postService: PostService;
let userService: UserService;
let testUserId: number;

beforeAll(async () => {
  await AppDataSource.initialize();
  postService = new PostService();
  userService = new UserService();
});

afterAll(async () => {
  await AppDataSource.destroy();
});

beforeEach(async () => {
  await AppDataSource.getRepository(Post).clear();
  await AppDataSource.getRepository(User).clear();
  const user = await userService.register({
    username: 'testuser',
    email: 'test@example.com',
    password: 'pass',
  });
  testUserId = user.id;
});

describe('PostService', () => {
  it('should create a post', async () => {
    const result = await postService.create(
      { title: 'Test', content: 'Content' },
      testUserId,
    );
    expect(result.title).toBe('Test');
  });

  it('should find all posts', async () => {
    await postService.create({ title: 'Post 1', content: 'C1' }, testUserId);
    await postService.create({ title: 'Post 2', content: 'C2' }, testUserId);
    const result = await postService.findAll();
    expect(result.length).toBe(2);
  });

  it('should delete post', async () => {
    const post = await postService.create(
      { title: 'Delete', content: 'C' },
      testUserId,
    );
    await postService.delete(post.id, testUserId);
    const result = await postService.findById(post.id);
    expect(result).toBeNull();
  });
});
