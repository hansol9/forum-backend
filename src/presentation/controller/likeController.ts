import { Router, Response } from 'express';
import { LikeService } from '../../application/service/LikeService';
import { UserService } from '../../application/service/UserService';
import {
  AuthRequest,
  authMiddleware,
} from '../../infrastructure/security/authMiddleware';

const router = Router();
const likeService = new LikeService();
const userService = new UserService();

router.post(
  '/:postId/likes',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const user = await userService.findByUsername(req.username!);
      if (!user) throw new Error('User not found');
      await likeService.likePost(Number(req.params.postId), user.id);
      res.json({ message: 'Post liked successfully' });
    } catch (error: any) {
      res.status(400).json({ error: 'Bad Request', message: error.message });
    }
  },
);

router.delete(
  '/:postId/likes',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const user = await userService.findByUsername(req.username!);
      if (!user) throw new Error('User not found');
      await likeService.unlikePost(Number(req.params.postId), user.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: 'Bad Request', message: error.message });
    }
  },
);

router.get(
  '/:postId/likes/count',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const count = await likeService.countByPostId(Number(req.params.postId));
      res.json({ postId: Number(req.params.postId), likeCount: count });
    } catch (error: any) {
      res.status(400).json({ error: 'Bad Request', message: error.message });
    }
  },
);

router.get(
  '/:postId/likes/status',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const user = await userService.findByUsername(req.username!);
      if (!user) throw new Error('User not found');
      const liked = await likeService.isLikedByUser(
        Number(req.params.postId),
        user.id,
      );
      res.json({ postId: Number(req.params.postId), liked });
    } catch (error: any) {
      res.status(400).json({ error: 'Bad Request', message: error.message });
    }
  },
);

export default router;
