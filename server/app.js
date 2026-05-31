import { config } from 'dotenv';
config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import errorMiddleware from './middlewares/error.middleware.js';
import githubRoutes from './routes/github.routes.js';

const app = express();

// Built-in Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Third-party Middlewares
app.use(
  cors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:5173'],
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(cookieParser());

// Server Status Check Route
app.get('/ping', (_req, res) => {
  res.send('Pong');
});

// Routes
app.use('/api/v1/github', githubRoutes);

// Default catch-all route - 404
app.all('*', (_req, res) => {
  res.status(404).json({ success: false, message: 'OOPS!!! 404 Route Not Found' });
});

// Custom error handling middleware
app.use(errorMiddleware);

export default app;
