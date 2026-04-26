import 'reflect-metadata';
import { AppDataSource } from '../../src/infrastructure/config/database';
import { UserService } from '../../src/application/service/UserService';
import { User, Role } from '../../src/domain/model/User';

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
      password: 'password123',
    });
    expect(result.username).toBe('testuser');
    expect(result.email).toBe('test@example.com');
    expect(result.role).toBe(Role.USER);
    expect(result.password).not.toBe('password123');
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

  it('should throw error for duplicate email', async () => {
    await userService.register({
      username: 'user1',
      email: 'test@example.com',
      password: 'pass',
    });
    await expect(
      userService.register({
        username: 'user2',
        email: 'test@example.com',
        password: 'pass',
      }),
    ).rejects.toThrow('Email already exists');
  });

  it('should find user by username', async () => {
    await userService.register({
      username: 'testuser',
      email: 'test@example.com',
      password: 'pass',
    });
    const result = await userService.findByUsername('testuser');
    expect(result).not.toBeNull();
    expect(result!.username).toBe('testuser');
  });

  it('should return null for non-existing username', async () => {
    const result = await userService.findByUsername('nonexistent');
    expect(result).toBeNull();
  });

  it('should find user by id', async () => {
    const user = await userService.register({
      username: 'testuser',
      email: 'test@example.com',
      password: 'pass',
    });
    const result = await userService.findById(user.id);
    expect(result).not.toBeNull();
    expect(result!.id).toBe(user.id);
  });

  it('should find all users', async () => {
    await userService.register({
      username: 'user1',
      email: 'u1@example.com',
      password: 'pass',
    });
    await userService.register({
      username: 'user2',
      email: 'u2@example.com',
      password: 'pass',
    });
    const result = await userService.findAll();
    expect(result.length).toBe(2);
  });

  it('should count users', async () => {
    await userService.register({
      username: 'user1',
      email: 'u1@example.com',
      password: 'pass',
    });
    const count = await userService.countUsers();
    expect(count).toBe(1);
  });
});
