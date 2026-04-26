import express from 'express';
import cors from 'cors';
import authController from './presentation/controller/authController';
import postController from './presentation/controller/postController';
import commentController from './presentation/controller/commentController';
import likeController from './presentation/controller/likeController';
import adminController from './presentation/controller/adminController';
import superuserController from './presentation/controller/superuserController';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authController);
app.use('/api/posts', postController);
app.use('/api/posts', commentController);
app.use('/api/posts', likeController);
app.use('/api/admin', adminController);
app.use('/api/superuser/posts', superuserController);

export default app;
