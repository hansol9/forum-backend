import { AppDataSource } from '../../infrastructure/config/database';
import { Post } from '../../domain/model/Post';
import { PostRequest } from '../dto/PostRequest';
import { logger } from '../../infrastructure/config/logger';

export class PostService {
  private postRepo = AppDataSource.getRepository(Post);

  async create(request: PostRequest, userId: number): Promise<Post> {
    logger.info(`Creating new post: '${request.title}' by user ${userId}`);
    const post = new Post();
    post.title = request.title;
    post.content = request.content;
    post.userId = userId;
    const savedPost = await this.postRepo.save(post);
    logger.info(`Post created successfully with id: ${savedPost.id}`);
    return savedPost;
  }

  async findById(id: number): Promise<Post | null> {
    logger.debug(`Finding post by id: ${id}`);
    return this.postRepo.findOne({ where: { id } });
  }

  async findAll(): Promise<Post[]> {
    logger.debug('Finding all posts');
    return this.postRepo.find({ order: { createdAt: 'DESC' } });
  }

  async update(
    id: number,
    request: PostRequest,
    userId: number,
  ): Promise<Post> {
    logger.info(`Updating post ${id} by user ${userId}`);
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) throw new Error('Post not found');
    if (post.userId !== userId) {
      logger.warn(`User ${userId} not authorized to edit post ${id}`);
      throw new Error('Not authorized to edit this post');
    }
    post.title = request.title;
    post.content = request.content;
    logger.info(`Post ${id} updated successfully`);
    return this.postRepo.save(post);
  }

  async delete(id: number, userId: number): Promise<void> {
    logger.info(`Deleting post ${id} by user ${userId}`);
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) throw new Error('Post not found');
    if (post.userId !== userId) {
      logger.warn(`User ${userId} not authorized to delete post ${id}`);
      throw new Error('Not authorized to delete this post');
    }
    await this.postRepo.remove(post);
    logger.info(`Post ${id} deleted successfully`);
  }

  async countPosts(): Promise<number> {
    return this.postRepo.count();
  }
}
