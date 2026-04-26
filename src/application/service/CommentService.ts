import { AppDataSource } from '../../infrastructure/config/database';
import { Comment } from '../../domain/model/Comment';
import { CommentRequest } from '../dto/CommentRequest';
import { logger } from '../../infrastructure/config/logger';

export class CommentService {
  private commentRepo = AppDataSource.getRepository(Comment);

  async create(
    request: CommentRequest,
    postId: number,
    userId: number,
  ): Promise<Comment> {
    logger.info(`Creating comment on post ${postId} by user ${userId}`);
    const comment = new Comment();
    comment.content = request.content;
    comment.postId = postId;
    comment.userId = userId;
    const savedComment = await this.commentRepo.save(comment);
    logger.info(`Comment created successfully with id: ${savedComment.id}`);
    return savedComment;
  }

  async findByPostId(postId: number): Promise<Comment[]> {
    logger.debug(`Finding comments for post: ${postId}`);
    return this.commentRepo.find({ where: { postId } });
  }

  async update(
    id: number,
    request: CommentRequest,
    userId: number,
  ): Promise<Comment> {
    logger.info(`Updating comment ${id} by user ${userId}`);
    const comment = await this.commentRepo.findOne({ where: { id } });
    if (!comment) throw new Error('Comment not found');
    if (comment.userId !== userId) {
      logger.warn(`User ${userId} not authorized to edit comment ${id}`);
      throw new Error('Not authorized to edit this comment');
    }
    comment.content = request.content;
    logger.info(`Comment ${id} updated successfully`);
    return this.commentRepo.save(comment);
  }

  async delete(id: number, userId: number): Promise<void> {
    logger.info(`Deleting comment ${id} by user ${userId}`);
    const comment = await this.commentRepo.findOne({ where: { id } });
    if (!comment) throw new Error('Comment not found');
    if (comment.userId !== userId) {
      logger.warn(`User ${userId} not authorized to delete comment ${id}`);
      throw new Error('Not authorized to delete this comment');
    }
    await this.commentRepo.remove(comment);
    logger.info(`Comment ${id} deleted successfully`);
  }

  async countComments(): Promise<number> {
    return this.commentRepo.count();
  }
}
