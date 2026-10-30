import express from 'express';
import cors from 'cors';
import { PORT, CORS_ORIGIN } from './config/env.js';
import { initializeDatabase } from './config/db.js';

import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import sourceRoutes from './routes/sources.js';
import chatRoutes from './routes/chat.js';
import synthesisRoutes from './routes/synthesis.js';
import exportRoutes from './routes/export.js';

const app = express();

// CORS configuration
const allowedOrigins = CORS_ORIGIN
  ? CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      // Allow configured origins, all vercel preview/prod domains, or localhost
      if (
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing with generous limits for research documents and large payloads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ResearchHub AI Backend',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:id/sources', sourceRoutes);
app.use('/api/projects/:id/chat', chatRoutes);
app.use('/api/projects/:id', synthesisRoutes);
app.use('/api/projects/:id', exportRoutes);

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({ error: `Not Found: ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error occurred.',
  });
});

// Server Initialization
async function startServer() {
  try {
    console.log('Initializing database schema...');
    await initializeDatabase();
    console.log('Database successfully connected and initialized.');

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 ResearchHub AI Backend running on port ${PORT}`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`🌐 CORS origin: ${CORS_ORIGIN || 'http://localhost:5173'}`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

