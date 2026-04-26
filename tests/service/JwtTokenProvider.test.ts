import { JwtTokenProvider } from '../../src/infrastructure/security/JwtTokenProvider';

describe('JwtTokenProvider', () => {
  it('should generate a token', () => {
    const token = JwtTokenProvider.generateToken('testuser', 'USER');
    expect(token).toBeDefined();
    expect(token.length).toBeGreaterThan(0);
  });

  it('should get username from token', () => {
    const token = JwtTokenProvider.generateToken('testuser', 'USER');
    expect(JwtTokenProvider.getUsername(token)).toBe('testuser');
  });

  it('should get role from token', () => {
    const token = JwtTokenProvider.generateToken('testuser', 'ADMIN');
    expect(JwtTokenProvider.getRole(token)).toBe('ADMIN');
  });

  it('should validate valid token', () => {
    const token = JwtTokenProvider.generateToken('testuser', 'USER');
    expect(JwtTokenProvider.validateToken(token)).toBe(true);
  });

  it('should reject invalid token', () => {
    expect(JwtTokenProvider.validateToken('invalid.token')).toBe(false);
  });
});
