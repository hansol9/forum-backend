import { Router, Response } from 'express';
import { PostService } from '../../application/service/PostService';
import { UserService } from '../../application/service/UserService';
import {
  AuthRequest,
  authMiddleware,
} from '../../infrastructure/security/authMiddleware';

const router = Router();
const postService = new PostService();
const userService = new UserService();

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await userService.findByUsername(req.username!);
    if (!user) throw new Error('User not found');
    const post = await postService.create(req.body, user.id);
    res.status(201).json(post);
  } catch (error: any) {
    res.status(400).json({ error: 'Bad Request', message: error.message });
  }
});

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const posts = await postService.findAll();
    res.json(posts);
  } catch (error: any) {
    res.status(400).json({ error: 'Bad Request', message: error.message });
  }
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const post = await postService.findById(Number(req.params.id));
    if (!post) throw new Error('Post not found');
    res.json(post);
  } catch (error: any) {
    res.status(400).json({ error: 'Bad Request', message: error.message });
  }
});

router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await userService.findByUsername(req.username!);
    if (!user) throw new Error('User not found');
    const post = await postService.update(
      Number(req.params.id),
      req.body,
      user.id,
    );
    res.json(post);
  } catch (error: any) {
    res.status(400).json({ error: 'Bad Request', message: error.message });
  }
});

router.delete(
  '/:id',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const user = await userService.findByUsername(req.username!);
      if (!user) throw new Error('User not found');
      await postService.delete(Number(req.params.id), user.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: 'Bad Request', message: error.message });
    }
  },
);

export default router;
