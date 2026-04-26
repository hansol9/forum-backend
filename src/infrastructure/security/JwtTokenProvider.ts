import jwt from 'jsonwebtoken';

const SECRET = 'myForumSecretKeyThatIsAtLeast256BitsLongForHS256Algorithm2025';
const EXPIRATION = '24h';

export class JwtTokenProvider {
  static generateToken(username: string, role: string): string {
    return jwt.sign({ username, role }, SECRET, { expiresIn: EXPIRATION });
  }

  static getUsername(token: string): string {
    const decoded = jwt.verify(token, SECRET) as any;
    return decoded.username;
  }

  static getRole(token: string): string {
    const decoded = jwt.verify(token, SECRET) as any;
    return decoded.role;
  }

  static validateToken(token: string): boolean {
    try {
      jwt.verify(token, SECRET);
      return true;
    } catch {
      return false;
    }
  }
}
