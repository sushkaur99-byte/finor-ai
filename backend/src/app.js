import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import healthRoutes from './routes/health.routes.js';
import aiRoutes from './routes/ai.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Secure Dynamic CORS policy
// Accepts configured CLIENT_URL, standard localhost ports, and all Vercel preview/production deployments
app.use(cors({
  origin: (origin, callback) => {
    // 1. Allow non-browser requests (e.g. server-to-server, mobile, curl)
    if (!origin) return callback(null, true);

    // 2. Allow explicitly configured clientUrl
    if (config.clientUrl && origin === config.clientUrl) {
      return callback(null, true);
    }

    // 3. Allow local development ports
    if (
      origin === 'http://localhost:5173' ||
      origin === 'http://127.0.0.1:5173' ||
      origin === 'http://localhost:3000' ||
      origin === 'http://localhost:4173'
    ) {
      return callback(null, true);
    }

    // 4. Allow any Vercel preview/production app (e.g. https://*.vercel.app)
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    // 5. In development mode, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    return callback(new Error(`CORS policy: Access denied for origin ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Request body size limit
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Root welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to FINORA AI API Server (Vercel Serverless Ready)',
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

// Direct health route for convenience at root
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    app: 'FINORA AI API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api', healthRoutes);
app.use('/api/ai', aiRoutes);

// Error Handling
app.use(errorHandler);

export default app;

