import 'reflect-metadata';
import { AppDataSource } from '../../src/infrastructure/config/database';
import { UserService } from '../../src/application/service/UserService';
import { User } from '../../src/domain/model/User';

let userService: UserService;

beforeAll(async () => {
  await AppDataSource.initialize();
  userService = new UserService();
});

afterAll(async () => {
  await AppDataSource.destroy();
});

beforeEach(async () => {
  await AppDataSource.getRepository(User).clear();
});

describe('UserService', () => {
  it('should register a new user', async () => {
    const result = await userService.register({
      username: 'testuser',
      email: 'test@example.com',
      password: 'pass123',
    });
    expect(result.username).toBe('testuser');
    expect(result.email).toBe('test@example.com');
  });

  it('should throw error for duplicate username', async () => {
    await userService.register({
      username: 'testuser',
      email: 't1@example.com',
      password: 'pass',
    });
    await expect(
      userService.register({
        username: 'testuser',
        email: 't2@example.com',
        password: 'pass',
      }),
    ).rejects.toThrow('Username already exists');
  });

  it('should find user by username', async () => {
    await userService.register({
      username: 'testuser',
      email: 'test@example.com',
      password: 'pass',
    });
    const result = await userService.findByUsername('testuser');
    expect(result).not.toBeNull();
  });
});
