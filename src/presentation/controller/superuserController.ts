import { Router, Response } from 'express';
import { AppDataSource } from '../../infrastructure/config/database';
import { Post } from '../../domain/model/Post';
import {
  AuthRequest,
  authMiddleware,
  superuserOnly,
} from '../../infrastructure/security/authMiddleware';

const router = Router();

router.put(
  '/:id',
  authMiddleware,
  superuserOnly,
  async (req: AuthRequest, res: Response) => {
    try {
      const postRepo = AppDataSource.getRepository(Post);
      const post = await postRepo.findOne({
        where: { id: Number(req.params.id) },
      });
      if (!post) throw new Error('Post not found');
      post.title = req.body.title;
      post.content = req.body.content;
      const updated = await postRepo.save(post);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: 'Bad Request', message: error.message });
    }
  },
);

router.delete(
  '/:id',
  authMiddleware,
  superuserOnly,
  async (req: AuthRequest, res: Response) => {
    try {
      const postRepo = AppDataSource.getRepository(Post);
      const post = await postRepo.findOne({
        where: { id: Number(req.params.id) },
      });
      if (!post) throw new Error('Post not found');
      await postRepo.remove(post);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: 'Bad Request', message: error.message });
    }
  },
);

export default router;
