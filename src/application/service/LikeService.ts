import { AppDataSource } from '../../infrastructure/config/database';
import { Like } from '../../domain/model/Like';
import { logger } from '../../infrastructure/config/logger';

export class LikeService {
  private likeRepo = AppDataSource.getRepository(Like);

  async likePost(postId: number, userId: number): Promise<Like> {
    logger.info(`User ${userId} liking post ${postId}`);
    const existing = await this.likeRepo.findOne({ where: { userId, postId } });
    if (existing) {
      logger.warn(`User ${userId} already liked post ${postId}`);
      throw new Error('Already liked this post');
    }
    const like = new Like();
    like.postId = postId;
    like.userId = userId;
    logger.info(`Post ${postId} liked successfully by user ${userId}`);
    return this.likeRepo.save(like);
  }

  async unlikePost(postId: number, userId: number): Promise<void> {
    logger.info(`User ${userId} unliking post ${postId}`);
    const like = await this.likeRepo.findOne({ where: { userId, postId } });
    if (!like) throw new Error('Like not found');
    await this.likeRepo.remove(like);
    logger.info(`Post ${postId} unliked successfully by user ${userId}`);
  }

  async countByPostId(postId: number): Promise<number> {
    return this.likeRepo.count({ where: { postId } });
  }

  async isLikedByUser(postId: number, userId: number): Promise<boolean> {
    const like = await this.likeRepo.findOne({ where: { userId, postId } });
    return like !== null;
  }
}
