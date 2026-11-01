import {
  isGeminiConfigured,
  suggestCategory,
  generateInsights,
  answerFinancialQuestion,
  generateBudgetInsights
} from '../services/gemini.service.js'

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Build a minimal transaction summary from raw transaction array
// Only category totals + month totals — no user IDs or payment instruments
// ─────────────────────────────────────────────────────────────────────────────
function buildTransactionSummary(transactions) {
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

  const savings = income - expenses
  const savingsRate = income > 0 ? (savings / income) * 100 : 0

  // Category breakdown (expenses only)
  const categoryMap = {}
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const cat = t.category || 'Other'
      if (!categoryMap[cat]) categoryMap[cat] = { amount: 0, count: 0 }
      categoryMap[cat].amount += Number(t.amount) || 0
      categoryMap[cat].count += 1
    })

  const categoryBreakdown = Object.entries(categoryMap)
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.amount - a.amount)

  // Monthly cash flow (last 6 months)
  const monthMap = {}
  transactions.forEach(t => {
    const d = t.date || t.transaction_date
    if (!d) return
    const month = d.slice(0, 7) // "YYYY-MM"
    if (!monthMap[month]) monthMap[month] = { income: 0, expenses: 0 }
    if (t.type === 'income') monthMap[month].income += Number(t.amount) || 0
    else monthMap[month].expenses += Number(t.amount) || 0
  })

  const recentMonths = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, data]) => ({ month, ...data }))

  return {
    totalIncome: income,
    totalExpenses: expenses,
    totalSavings: savings,
    savingsRate,
    categoryBreakdown,
    recentMonths,
    transactionCount: transactions.length
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Handler 1: POST /api/ai/categorize
// ─────────────────────────────────────────────────────────────────────────────
export async function suggestCategoryHandler(req, res, next) {
  try {
    if (!isGeminiConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'AI features are not configured. Please add GEMINI_API_KEY to the backend .env file.',
        setupRequired: true
      })
    }

    const { title, description, type } = req.body

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Transaction title is required.'
      })
    }

    if (!type || !['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Transaction type must be "income" or "expense".'
      })
    }

    const result = await suggestCategory(
      title.trim(),
      typeof description === 'string' ? description.trim() : '',
      type
    )

    return res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Handler 2: POST /api/ai/insights
// ─────────────────────────────────────────────────────────────────────────────
export async function generateInsightsHandler(req, res, next) {
  try {
    if (!isGeminiConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'AI features are not configured. Please add GEMINI_API_KEY to the backend .env file.',
        setupRequired: true
      })
    }

    const { transactions } = req.body

    if (!Array.isArray(transactions)) {
      return res.status(400).json({
        success: false,
        error: 'transactions must be an array.'
      })
    }

    if (transactions.length === 0) {
      return res.json({
        success: true,
        data: {
          monthlySummary:
            'No transactions found. Add some transactions to generate financial insights.',
          highestCategory: { name: 'N/A', amount: 0, insight: 'No data available.' },
          trends: 'No spending data available yet.',
          unusualExpenses: [],
          savingSuggestions: [
            'Start by recording your income and expense transactions to receive personalized insights.'
          ],
          incomeExpenseAnalysis: 'No transaction data available for analysis.',
          savingsObservation: 'Add transactions to track your savings progress.'
        }
      })
    }

    const summary = buildTransactionSummary(transactions)
    const insights = await generateInsights(summary)

    return res.json({ success: true, data: insights })
  } catch (err) {
    next(err)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Handler 3: POST /api/ai/ask
// ─────────────────────────────────────────────────────────────────────────────
export async function askAssistantHandler(req, res, next) {
  try {
    if (!isGeminiConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'AI features are not configured. Please add GEMINI_API_KEY to the backend .env file.',
        setupRequired: true
      })
    }

    const { question, transactions } = req.body

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'A question is required.'
      })
    }

    if (!Array.isArray(transactions)) {
      return res.status(400).json({
        success: false,
        error: 'transactions must be an array.'
      })
    }

    if (transactions.length === 0) {
      return res.json({
        success: true,
        data: {
          answer:
            'You have no transactions recorded yet. Please add some income and expense transactions before I can answer financial questions.',
          confidence: 'high',
          disclaimer: 'General observations only, not professional financial advice.'
        }
      })
    }

    const summary = buildTransactionSummary(transactions)
    const result = await answerFinancialQuestion(question.trim(), summary)

    return res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Handler 4: POST /api/ai/budget-insights
// Body: { budgetSummary: { month, overallLimit, totalSpent, ... } }
// ─────────────────────────────────────────────────────────────────────────────
export async function budgetInsightsHandler(req, res, next) {
  try {
    if (!isGeminiConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'AI features are not configured. Please add GEMINI_API_KEY to the backend .env file.',
        setupRequired: true
      })
    }

    const { budgetSummary } = req.body

    if (!budgetSummary || typeof budgetSummary !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'budgetSummary object is required.'
      })
    }

    const result = await generateBudgetInsights(budgetSummary)
    return res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}
