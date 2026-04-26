import 'reflect-metadata';
import { AppDataSource } from '../../src/infrastructure/config/database';
import { LikeService } from '../../src/application/service/LikeService';
import { PostService } from '../../src/application/service/PostService';
import { UserService } from '../../src/application/service/UserService';
import { Like } from '../../src/domain/model/Like';
import { Post } from '../../src/domain/model/Post';
import { User } from '../../src/domain/model/User';

let likeService: LikeService;
let testUserId: number;
let testPostId: number;

beforeAll(async () => {
  await AppDataSource.initialize();
  likeService = new LikeService();
  const userService = new UserService();
  const postService = new PostService();

  await AppDataSource.getRepository(Like).clear();
  await AppDataSource.getRepository(Post).clear();
  await AppDataSource.getRepository(User).clear();

  const user = await userService.register({
    username: 'testuser',
    email: 'test@example.com',
    password: 'pass',
  });
  testUserId = user.id;
  const post = await postService.create(
    { title: 'Test', content: 'C' },
    testUserId,
  );
  testPostId = post.id;
});

afterAll(async () => {
  await AppDataSource.destroy();
});

beforeEach(async () => {
  await AppDataSource.getRepository(Like).clear();
});

describe('LikeService', () => {
  it('should like a post', async () => {
    const result = await likeService.likePost(testPostId, testUserId);
    expect(result.postId).toBe(testPostId);
    expect(result.userId).toBe(testUserId);
  });

  it('should throw error for duplicate like', async () => {
    await likeService.likePost(testPostId, testUserId);
    await expect(likeService.likePost(testPostId, testUserId)).rejects.toThrow(
      'Already liked',
    );
  });

  it('should unlike a post', async () => {
    await likeService.likePost(testPostId, testUserId);
    await likeService.unlikePost(testPostId, testUserId);
    const count = await likeService.countByPostId(testPostId);
    expect(count).toBe(0);
  });

  it('should throw error unliking non-existing like', async () => {
    await expect(
      likeService.unlikePost(testPostId, testUserId),
    ).rejects.toThrow('Like not found');
  });

  it('should count likes', async () => {
    await likeService.likePost(testPostId, testUserId);
    const count = await likeService.countByPostId(testPostId);
    expect(count).toBe(1);
  });

  it('should return true when liked', async () => {
    await likeService.likePost(testPostId, testUserId);
    const result = await likeService.isLikedByUser(testPostId, testUserId);
    expect(result).toBe(true);
  });

  it('should return false when not liked', async () => {
    const result = await likeService.isLikedByUser(testPostId, testUserId);
    expect(result).toBe(false);
  });
});
