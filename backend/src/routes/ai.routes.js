import express from 'express'
import rateLimit from 'express-rate-limit'
import {
  suggestCategoryHandler,
  generateInsightsHandler,
  askAssistantHandler,
  budgetInsightsHandler
} from '../controllers/ai.controller.js'

const router = express.Router()

// AI Rate Limiter: Max 30 requests per 15 minutes per IP to prevent quota depletion and abuse
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 AI queries per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many AI requests from this network. Please wait a few minutes before trying again.',
    rateLimited: true
  }
})

// Apply rate limiting across all AI routes
router.use(aiLimiter)

// POST /api/ai/categorize — AI category suggestion for a transaction
router.post('/categorize', suggestCategoryHandler)

// POST /api/ai/insights — AI financial insights from user transactions
router.post('/insights', generateInsightsHandler)

// POST /api/ai/ask — AI financial assistant Q&A
router.post('/ask', askAssistantHandler)

// POST /api/ai/budget-insights — AI budget & spending recommendations
router.post('/budget-insights', budgetInsightsHandler)

export default router
