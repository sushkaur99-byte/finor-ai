import { Router } from 'express';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    app: 'FINORA AI API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

export default router;
