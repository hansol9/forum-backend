import 'reflect-metadata';
import { AppDataSource } from './infrastructure/config/database';
import app from './app';
import { logger } from './infrastructure/config/logger';

const PORT = 8080;

AppDataSource.initialize()
  .then(() => {
    logger.info('Database connected successfully');
    app.listen(PORT, () => {
      logger.info(`Forum Backend API running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    logger.error(`Database connection failed: ${error.message}`);
  });
