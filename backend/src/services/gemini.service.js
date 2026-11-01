import { GoogleGenerativeAI } from '@google/generative-ai'
import { config } from '../config/index.js'

// --- Category Lists (must match frontend exactly) ---
const EXPENSE_CATEGORIES = [
  'Food',
  'Shopping',
  'Transport',
  'Bills & Utilities',
  'Entertainment',
  'Healthcare',
  'Education',
  'Housing',
  'Other'
]

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Business', 'Investment', 'Other']

/**
 * Returns true if GEMINI_API_KEY is configured in environment.
 */
export function isGeminiConfigured() {
  return Boolean(config.gemini.apiKey && config.gemini.apiKey.trim().length > 0)
}

/**
 * Creates and returns a configured Gemini model instance.
 * Throws if API key is not set.
 */
function getModel() {
  if (!isGeminiConfigured()) {
    throw new Error(
      'GEMINI_API_KEY is not configured. Add it to backend/.env to enable AI features.'
    )
  }
  const genAI = new GoogleGenerativeAI(config.gemini.apiKey)
  return genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
      maxOutputTokens: 1024
    }
  })
}

/**
 * Safely parse a JSON string. Returns null on failure.
 */
function safeParseJSON(text) {
  try {
    const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. AI CATEGORY SUGGESTION
// ─────────────────────────────────────────────────────────────────────────────
export async function suggestCategory(title, description, type) {
  const model = getModel()

  const allowedCategories =
    type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  const prompt = `You are a financial transaction categorization assistant for an Indian personal finance app.

A user has entered the following transaction:
- Title: "${title}"
- Description: "${description || '(none provided)'}"
- Type: ${type}

Your task is to pick EXACTLY ONE category from this allowed list:
${allowedCategories.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Rules:
1. You MUST choose only from the list above. Do not invent new categories.
2. If no category clearly fits, choose "Other".
3. Return valid JSON only.

Return this exact JSON structure:
{
  "category": "<one of the allowed categories>",
  "explanation": "<one sentence explaining why this category fits>",
  "confidence": "<high | medium | low>"
}`

  const result = await model.generateContent(prompt)
  const text = result.response.text()
  const parsed = safeParseJSON(text)

  if (!parsed || !parsed.category) {
    throw new Error('Gemini returned an invalid response for category suggestion.')
  }

  if (!allowedCategories.includes(parsed.category)) {
    const match = allowedCategories.find(
      c => c.toLowerCase() === parsed.category.toLowerCase()
    )
    parsed.category = match || 'Other'
    parsed.explanation = match
      ? parsed.explanation
      : `Category was corrected to "Other" because the AI suggestion was not in the allowed list.`
  }

  return {
    category: parsed.category,
    explanation: parsed.explanation || '',
    confidence: parsed.confidence || 'medium'
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. AI FINANCIAL INSIGHTS
// ─────────────────────────────────────────────────────────────────────────────
export async function generateInsights(transactionSummary) {
  const model = getModel()

  const prompt = `You are a professional financial analyst AI for an Indian personal finance application called FINORA AI.

Analyze the following user transaction summary and generate structured financial insights in INR (Indian Rupees ₹).

Transaction Summary:
- Total Income: ₹${transactionSummary.totalIncome.toLocaleString('en-IN')}
- Total Expenses: ₹${transactionSummary.totalExpenses.toLocaleString('en-IN')}
- Total Savings: ₹${transactionSummary.totalSavings.toLocaleString('en-IN')}
- Savings Rate: ${transactionSummary.savingsRate.toFixed(1)}%
- Total Transactions Analyzed: ${transactionSummary.transactionCount}

Category Breakdown (expenses):
${transactionSummary.categoryBreakdown.map(c => `  - ${c.category}: ₹${c.amount.toLocaleString('en-IN')} (${c.count} transactions)`).join('\n')}

Monthly Cash Flow (last months):
${transactionSummary.recentMonths.map(m => `  - ${m.month}: Income ₹${m.income.toLocaleString('en-IN')}, Expenses ₹${m.expenses.toLocaleString('en-IN')}`).join('\n')}

Rules:
- Use ONLY the data provided. Never invent transactions or figures.
- If data is insufficient (e.g., 0 transactions), clearly say so in each field.
- All amounts must be in Indian Rupees (₹).
- Keep insights concise and actionable.
- Treat all recommendations as general observations, not professional financial advice.

Return this exact JSON structure:
{
  "monthlySummary": "<2-3 sentence summary of overall financial health>",
  "highestCategory": {
    "name": "<category name>",
    "amount": <number>,
    "insight": "<one sentence insight about this spending category>"
  },
  "trends": "<2-3 sentence description of spending trends across months>",
  "unusualExpenses": ["<observation 1>", "<observation 2>"],
  "savingSuggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"],
  "incomeExpenseAnalysis": "<2-3 sentence analysis of income vs expenses ratio>",
  "savingsObservation": "<1-2 sentence observation about savings rate and goals>"
}`

  const result = await model.generateContent(prompt)
  const text = result.response.text()
  const parsed = safeParseJSON(text)

  if (!parsed || !parsed.monthlySummary) {
    throw new Error('Gemini returned an invalid insights response.')
  }

  return {
    monthlySummary: parsed.monthlySummary || '',
    highestCategory: parsed.highestCategory || { name: 'N/A', amount: 0, insight: '' },
    trends: parsed.trends || '',
    unusualExpenses: Array.isArray(parsed.unusualExpenses) ? parsed.unusualExpenses : [],
    savingSuggestions: Array.isArray(parsed.savingSuggestions) ? parsed.savingSuggestions : [],
    incomeExpenseAnalysis: parsed.incomeExpenseAnalysis || '',
    savingsObservation: parsed.savingsObservation || ''
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. AI FINANCIAL ASSISTANT (Q&A)
// ─────────────────────────────────────────────────────────────────────────────
export async function answerFinancialQuestion(question, transactionSummary) {
  const model = getModel()

  const prompt = `You are a helpful financial assistant AI for FINORA AI, an Indian personal finance app.

The user has asked: "${question}"

Use ONLY the following transaction data to answer. Do not invent numbers or transactions.

Transaction Summary:
- Total Income: ₹${transactionSummary.totalIncome.toLocaleString('en-IN')}
- Total Expenses: ₹${transactionSummary.totalExpenses.toLocaleString('en-IN')}
- Total Savings: ₹${transactionSummary.totalSavings.toLocaleString('en-IN')}
- Savings Rate: ${transactionSummary.savingsRate.toFixed(1)}%
- Total Transactions: ${transactionSummary.transactionCount}

Category Breakdown:
${transactionSummary.categoryBreakdown.map(c => `  - ${c.category}: ₹${c.amount.toLocaleString('en-IN')} (${c.count} transactions)`).join('\n')}

Monthly Cash Flow:
${transactionSummary.recentMonths.map(m => `  - ${m.month}: Income ₹${m.income.toLocaleString('en-IN')}, Expenses ₹${m.expenses.toLocaleString('en-IN')}`).join('\n')}

Rules:
- Answer using ONLY the data above.
- If the data does not have enough information to answer, say so clearly.
- Keep answers concise (2-4 sentences).
- Use Indian Rupee (₹) formatting for all amounts.
- Include a confidence level based on data availability.

Return this exact JSON:
{
  "answer": "<your answer to the user's question>",
  "confidence": "<high | medium | low>",
  "disclaimer": "General observations only, not professional financial advice."
}`

  const result = await model.generateContent(prompt)
  const text = result.response.text()
  const parsed = safeParseJSON(text)

  if (!parsed || !parsed.answer) {
    throw new Error('Gemini returned an invalid response for the financial question.')
  }

  return {
    answer: parsed.answer || '',
    confidence: parsed.confidence || 'medium',
    disclaimer:
      parsed.disclaimer || 'General observations only, not professional financial advice.'
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. AI BUDGET & SPENDING INSIGHTS
// ─────────────────────────────────────────────────────────────────────────────
export async function generateBudgetInsights(budgetSummary) {
  const model = getModel()

  const prompt = `You are an elite budget advisor for FINORA AI.
Analyze the user's actual budget vs spending telemetry:

Month: ${budgetSummary.month}
Overall Budget Ceiling: ₹${budgetSummary.overallLimit.toLocaleString('en-IN')}
Total Spent This Month: ₹${budgetSummary.totalSpent.toLocaleString('en-IN')}
Budget Utilization: ${budgetSummary.utilizationPct.toFixed(1)}%
Remaining Envelope Cushion: ₹${budgetSummary.remainingCushion.toLocaleString('en-IN')}

Category Budget Performance:
${budgetSummary.categories.map(c => `  - ${c.category}: Spent ₹${c.spent.toLocaleString('en-IN')} of Cap ₹${c.limit.toLocaleString('en-IN')} (${c.utilization.toFixed(1)}% consumed)`).join('\n')}

Previous Month Comparison:
- Last Month Expenses: ₹${budgetSummary.prevMonthExpenses.toLocaleString('en-IN')}
- Current Month Expenses: ₹${budgetSummary.totalSpent.toLocaleString('en-IN')}
- Variance: ${budgetSummary.monthOverMonthDiff >= 0 ? '+' : ''}₹${budgetSummary.monthOverMonthDiff.toLocaleString('en-IN')}

Tasks:
1. Identify any categories where spending exceeds 75% or 90% or breaches 100%.
2. Suggest 2-3 specific, realistic tactics to stay strictly within remaining envelopes.
3. Contrast spending with previous months.
4. Pinpoint high-impact saving opportunities.

Return this exact JSON:
{
  "executiveSummary": "<2 sentences evaluating overall budget discipline>",
  "overspendingCategories": [
    {
      "category": "<category name>",
      "utilization": <number>,
      "advice": "<specific containment tip>"
    }
  ],
  "stayWithinBudgetTips": ["<actionable tip 1>", "<actionable tip 2>"],
  "historicalComparison": "<1-2 sentences comparing with previous month trend>",
  "savingOpportunities": ["<opportunity 1>", "<opportunity 2>"]
}`

  const result = await model.generateContent(prompt)
  const text = result.response.text()
  const parsed = safeParseJSON(text)

  if (!parsed || !parsed.executiveSummary) {
    throw new Error('Gemini returned an invalid budget insights response.')
  }

  return {
    executiveSummary: parsed.executiveSummary || '',
    overspendingCategories: Array.isArray(parsed.overspendingCategories) ? parsed.overspendingCategories : [],
    stayWithinBudgetTips: Array.isArray(parsed.stayWithinBudgetTips) ? parsed.stayWithinBudgetTips : [],
    historicalComparison: parsed.historicalComparison || '',
    savingOpportunities: Array.isArray(parsed.savingOpportunities) ? parsed.savingOpportunities : []
  }
}
