import { Router, Response } from 'express';
import { UserService } from '../../application/service/UserService';
import { PostService } from '../../application/service/PostService';
import { CommentService } from '../../application/service/CommentService';
import {
  AuthRequest,
  authMiddleware,
  adminOnly,
} from '../../infrastructure/security/authMiddleware';

const router = Router();
const userService = new UserService();
const postService = new PostService();
const commentService = new CommentService();

router.get(
  '/users',
  authMiddleware,
  adminOnly,
  async (req: AuthRequest, res: Response) => {
    try {
      const users = await userService.findAll();
      res.json(users);
    } catch (error: any) {
      res.status(400).json({ error: 'Bad Request', message: error.message });
    }
  },
);

router.get(
  '/statistics',
  authMiddleware,
  adminOnly,
  async (req: AuthRequest, res: Response) => {
    try {
      const totalUsers = await userService.countUsers();
      const totalPosts = await postService.countPosts();
      const totalComments = await commentService.countComments();
      res.json({ totalUsers, totalPosts, totalComments });
    } catch (error: any) {
      res.status(400).json({ error: 'Bad Request', message: error.message });
    }
  },
);

export default router;
