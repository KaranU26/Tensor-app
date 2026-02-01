import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.js';
import { healthRouter } from './routes/health.js';
import { stretchingRouter } from './routes/stretching.js';
import strengthRouter from './routes/strength.js';
import exercisesRouter from './routes/exercises.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/health', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/stretching', stretchingRouter);
app.use('/api/v1/strength', strengthRouter);
app.use('/api/v1/exercises', exercisesRouter);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;

