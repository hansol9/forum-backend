import 'reflect-metadata';
import { AppDataSource } from '../../src/infrastructure/config/database';
import { CommentService } from '../../src/application/service/CommentService';
import { PostService } from '../../src/application/service/PostService';
import { UserService } from '../../src/application/service/UserService';
import { Comment } from '../../src/domain/model/Comment';
import { Post } from '../../src/domain/model/Post';
import { User } from '../../src/domain/model/User';

let commentService: CommentService;
let testUserId: number;
let testPostId: number;

beforeAll(async () => {
  await AppDataSource.initialize();
  commentService = new CommentService();
  const userService = new UserService();
  const postService = new PostService();

  await AppDataSource.getRepository(Comment).clear();
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
  await AppDataSource.getRepository(Comment).clear();
});

describe('CommentService', () => {
  it('should create a comment', async () => {
    const result = await commentService.create(
      { content: 'Test Comment' },
      testPostId,
      testUserId,
    );
    expect(result.content).toBe('Test Comment');
    expect(result.postId).toBe(testPostId);
  });

  it('should find comments by post id', async () => {
    await commentService.create({ content: 'C1' }, testPostId, testUserId);
    await commentService.create({ content: 'C2' }, testPostId, testUserId);
    const result = await commentService.findByPostId(testPostId);
    expect(result.length).toBe(2);
  });

  it('should update comment', async () => {
    const comment = await commentService.create(
      { content: 'Old' },
      testPostId,
      testUserId,
    );
    const result = await commentService.update(
      comment.id,
      { content: 'Updated' },
      testUserId,
    );
    expect(result.content).toBe('Updated');
  });

  it('should throw error updating other user comment', async () => {
    const comment = await commentService.create(
      { content: 'Test' },
      testPostId,
      testUserId,
    );
    await expect(
      commentService.update(comment.id, { content: 'X' }, 999),
    ).rejects.toThrow('Not authorized');
  });

  it('should throw error updating non-existing comment', async () => {
    await expect(
      commentService.update(999, { content: 'X' }, testUserId),
    ).rejects.toThrow('Comment not found');
  });

  it('should delete comment', async () => {
    const comment = await commentService.create(
      { content: 'Delete' },
      testPostId,
      testUserId,
    );
    await commentService.delete(comment.id, testUserId);
    const result = await commentService.findByPostId(testPostId);
    expect(result.length).toBe(0);
  });

  it('should throw error deleting other user comment', async () => {
    const comment = await commentService.create(
      { content: 'Test' },
      testPostId,
      testUserId,
    );
    await expect(commentService.delete(comment.id, 999)).rejects.toThrow(
      'Not authorized',
    );
  });

  it('should throw error deleting non-existing comment', async () => {
    await expect(commentService.delete(999, testUserId)).rejects.toThrow(
      'Comment not found',
    );
  });

  it('should count comments', async () => {
    await commentService.create({ content: 'Test' }, testPostId, testUserId);
    const count = await commentService.countComments();
    expect(count).toBe(1);
  });
});
