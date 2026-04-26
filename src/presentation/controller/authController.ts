import { Router, Request, Response } from 'express';
import { UserService } from '../../application/service/UserService';
import { JwtTokenProvider } from '../../infrastructure/security/JwtTokenProvider';
import bcrypt from 'bcryptjs';

const router = Router();
const userService = new UserService();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const user = await userService.register(req.body);
    res
      .status(201)
      .json({
        message: 'User registered successfully',
        username: user.username,
      });
  } catch (error: any) {
    res.status(400).json({ error: 'Bad Request', message: error.message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user = await userService.findByUsername(username);
    if (!user) throw new Error('Invalid username or password');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid username or password');

    const token = JwtTokenProvider.generateToken(user.username, user.role);
    res.json({ token, username: user.username, role: user.role });
  } catch (error: any) {
    res.status(400).json({ error: 'Bad Request', message: error.message });
  }
});

export default router;
