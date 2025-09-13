import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import boardsRoutes from './routes/board.js';
import listsRoutes from './routes/list.js';
import tasksRoutes from './routes/task.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));

app.use('/api/auth', authRoutes);
app.use('/api/boards', boardsRoutes);
app.use('/api/lists', listsRoutes);
app.use('/api/tasks', tasksRoutes);

app.get('/', (req, res) => res.json({ ok: true, msg: 'Realtime Task Manager API' }));

export default app;
