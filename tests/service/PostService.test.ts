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
    expect(result.userId).toBe(testUserId);
  });

  it('should find post by id', async () => {
    const post = await postService.create(
      { title: 'Test', content: 'Content' },
      testUserId,
    );
    const result = await postService.findById(post.id);
    expect(result).not.toBeNull();
    expect(result!.title).toBe('Test');
  });

  it('should return null for non-existing post', async () => {
    const result = await postService.findById(999);
    expect(result).toBeNull();
  });

  it('should find all posts', async () => {
    await postService.create({ title: 'Post 1', content: 'C1' }, testUserId);
    await postService.create({ title: 'Post 2', content: 'C2' }, testUserId);
    const result = await postService.findAll();
    expect(result.length).toBe(2);
  });

  it('should update post', async () => {
    const post = await postService.create(
      { title: 'Old', content: 'Old' },
      testUserId,
    );
    const result = await postService.update(
      post.id,
      { title: 'New', content: 'New' },
      testUserId,
    );
    expect(result.title).toBe('New');
  });

  it('should throw error updating other user post', async () => {
    const post = await postService.create(
      { title: 'Test', content: 'C' },
      testUserId,
    );
    await expect(
      postService.update(post.id, { title: 'X', content: 'X' }, 999),
    ).rejects.toThrow('Not authorized');
  });

  it('should throw error updating non-existing post', async () => {
    await expect(
      postService.update(999, { title: 'X', content: 'X' }, testUserId),
    ).rejects.toThrow('Post not found');
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

  it('should throw error deleting other user post', async () => {
    const post = await postService.create(
      { title: 'Test', content: 'C' },
      testUserId,
    );
    await expect(postService.delete(post.id, 999)).rejects.toThrow(
      'Not authorized',
    );
  });

  it('should throw error deleting non-existing post', async () => {
    await expect(postService.delete(999, testUserId)).rejects.toThrow(
      'Post not found',
    );
  });

  it('should count posts', async () => {
    await postService.create({ title: 'Test', content: 'C' }, testUserId);
    const count = await postService.countPosts();
    expect(count).toBe(1);
  });
});
