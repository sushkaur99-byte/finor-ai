import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import healthRoutes from './routes/health.routes.js';
import aiRoutes from './routes/ai.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Secure CORS policy: strictly allow client URL and localhost development ports
const allowedOrigins = [
  config.clientUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. server-to-server or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    return callback(new Error('CORS policy: Access denied for this origin.'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request body size limit to prevent payload flooding
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Root welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to FINORA AI API Server',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      ai: {
        categorize: 'POST /api/ai/categorize',
        insights: 'POST /api/ai/insights',
        ask: 'POST /api/ai/ask',
        budgetInsights: 'POST /api/ai/budget-insights',
      },
    },
  });
});

// API Routes
app.use('/api', healthRoutes);
app.use('/api/ai', aiRoutes);

// Error Handling
app.use(errorHandler);

// Start Server
const server = app.listen(config.port, () => {
  console.log(`🚀 FINORA AI Backend listening on port ${config.port} (${config.nodeEnv})`);
  console.log(`🔗 Health check available at: http://localhost:${config.port}/api/health`);
});

export default app;
export { server };
