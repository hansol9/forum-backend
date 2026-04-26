import { AppDataSource } from '../../infrastructure/config/database';
import { User, Role } from '../../domain/model/User';
import { RegisterRequest } from '../dto/RegisterRequest';
import { logger } from '../../infrastructure/config/logger';
import bcrypt from 'bcryptjs';

export class UserService {
  private userRepo = AppDataSource.getRepository(User);

  async register(request: RegisterRequest): Promise<User> {
    logger.info(`Registering new user: ${request.username}`);

    const existingUsername = await this.userRepo.findOne({
      where: { username: request.username },
    });
    if (existingUsername) {
      logger.warn(
        `Registration failed: username '${request.username}' already exists`,
      );
      throw new Error('Username already exists');
    }

    const existingEmail = await this.userRepo.findOne({
      where: { email: request.email },
    });
    if (existingEmail) {
      logger.warn(
        `Registration failed: email '${request.email}' already exists`,
      );
      throw new Error('Email already exists');
    }

    const user = new User();
    user.username = request.username;
    user.email = request.email;
    user.password = await bcrypt.hash(request.password, 10);
    user.role = Role.USER;

    const savedUser = await this.userRepo.save(user);
    logger.info(`User registered successfully: ${savedUser.username}`);
    return savedUser;
  }

  async findByUsername(username: string): Promise<User | null> {
    logger.debug(`Finding user by username: ${username}`);
    return this.userRepo.findOne({ where: { username } });
  }

  async findById(id: number): Promise<User | null> {
    logger.debug(`Finding user by id: ${id}`);
    return this.userRepo.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    logger.debug('Finding all users');
    return this.userRepo.find();
  }

  async countUsers(): Promise<number> {
    return this.userRepo.count();
  }
}
