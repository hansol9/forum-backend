import { Router, Response } from 'express';
import { CommentService } from '../../application/service/CommentService';
import { UserService } from '../../application/service/UserService';
import {
  AuthRequest,
  authMiddleware,
} from '../../infrastructure/security/authMiddleware';

const router = Router();
const commentService = new CommentService();
const userService = new UserService();

router.post(
  '/:postId/comments',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const user = await userService.findByUsername(req.username!);
      if (!user) throw new Error('User not found');
      const comment = await commentService.create(
        req.body,
        Number(req.params.postId),
        user.id,
      );
      res.status(201).json(comment);
    } catch (error: any) {
      res.status(400).json({ error: 'Bad Request', message: error.message });
    }
  },
);

router.get(
  '/:postId/comments',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const comments = await commentService.findByPostId(
        Number(req.params.postId),
      );
      res.json(comments);
    } catch (error: any) {
      res.status(400).json({ error: 'Bad Request', message: error.message });
    }
  },
);

router.put(
  '/:postId/comments/:commentId',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const user = await userService.findByUsername(req.username!);
      if (!user) throw new Error('User not found');
      const comment = await commentService.update(
        Number(req.params.commentId),
        req.body,
        user.id,
      );
      res.json(comment);
    } catch (error: any) {
      res.status(400).json({ error: 'Bad Request', message: error.message });
    }
  },
);

router.delete(
  '/:postId/comments/:commentId',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const user = await userService.findByUsername(req.username!);
      if (!user) throw new Error('User not found');
      await commentService.delete(Number(req.params.commentId), user.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: 'Bad Request', message: error.message });
    }
  },
);

export default router;
