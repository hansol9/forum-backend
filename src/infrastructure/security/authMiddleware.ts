import { Request, Response, NextFunction } from 'express';
import { JwtTokenProvider } from './JwtTokenProvider';

export interface AuthRequest extends Request {
  username?: string;
  role?: string;
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(403).json({ error: 'Forbidden', message: 'No token provided' });
    return;
  }

  const token = header.substring(7);

  if (!JwtTokenProvider.validateToken(token)) {
    res.status(403).json({ error: 'Forbidden', message: 'Invalid token' });
    return;
  }

  req.username = JwtTokenProvider.getUsername(token);
  req.role = JwtTokenProvider.getRole(token);
  next();
}

export function adminOnly(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  if (req.role !== 'ADMIN') {
    res
      .status(403)
      .json({ error: 'Forbidden', message: 'Admin access required' });
    return;
  }
  next();
}

export function superuserOnly(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  if (req.role !== 'SUPERUSER') {
    res
      .status(403)
      .json({ error: 'Forbidden', message: 'Superuser access required' });
    return;
  }
  next();
}
