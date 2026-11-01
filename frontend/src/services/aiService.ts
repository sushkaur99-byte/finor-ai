import type { Transaction } from '../types/finance'

const AI_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ai`

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AICategorySuggestion {
  category: string
  explanation: string
  confidence: 'high' | 'medium' | 'low'
}

export interface AIInsightsResult {
  monthlySummary: string
  highestCategory: { name: string; amount: number; insight: string }
  trends: string
  unusualExpenses: string[]
  savingSuggestions: string[]
  incomeExpenseAnalysis: string
  savingsObservation: string
}

export interface AIAssistantResult {
  answer: string
  confidence: 'high' | 'medium' | 'low'
  disclaimer: string
}

export interface AIBudgetInsightsResult {
  executiveSummary: string
  overspendingCategories: Array<{
    category: string
    utilization: number
    advice: string
  }>
  stayWithinBudgetTips: string[]
  historicalComparison: string
  savingOpportunities: string[]
}

export interface AIServiceError {
  message: string
  setupRequired?: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Build minimal transaction summary (no personal identifiers)
// ─────────────────────────────────────────────────────────────────────────────
function buildMinimalTxList(
  transactions: Transaction[]
): Array<{ type: string; amount: number; category: string; date: string }> {
  return transactions.map(t => ({
    type: t.type,
    amount: t.amount,
    category: t.category,
    date: t.date
  }))
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Suggest Category for a Transaction
// ─────────────────────────────────────────────────────────────────────────────
export async function suggestTransactionCategory(
  title: string,
  description: string,
  type: 'income' | 'expense'
): Promise<{ data: AICategorySuggestion | null; error: AIServiceError | null }> {
  try {
    const res = await fetch(`${AI_BASE}/categorize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, type })
    })

    const json = await res.json()

    if (!res.ok || !json.success) {
      return {
        data: null,
        error: {
          message: json.error || 'Failed to get category suggestion.',
          setupRequired: json.setupRequired || false
        }
      }
    }

    return { data: json.data as AICategorySuggestion, error: null }
  } catch {
    return {
      data: null,
      error: {
        message: 'Could not connect to AI service. Make sure the backend server is running on port 5000.'
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Generate Financial Insights
// ─────────────────────────────────────────────────────────────────────────────
export async function generateAIInsights(
  transactions: Transaction[]
): Promise<{ data: AIInsightsResult | null; error: AIServiceError | null }> {
  try {
    const minimalTxList = buildMinimalTxList(transactions)

    const res = await fetch(`${AI_BASE}/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions: minimalTxList })
    })

    const json = await res.json()

    if (!res.ok || !json.success) {
      return {
        data: null,
        error: {
          message: json.error || 'Failed to generate insights.',
          setupRequired: json.setupRequired || false
        }
      }
    }

    return { data: json.data as AIInsightsResult, error: null }
  } catch {
    return {
      data: null,
      error: {
        message: 'Could not connect to AI service. Make sure the backend server is running on port 5000.'
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Ask AI Financial Assistant
// ─────────────────────────────────────────────────────────────────────────────
export async function askAIAssistant(
  question: string,
  transactions: Transaction[]
): Promise<{ data: AIAssistantResult | null; error: AIServiceError | null }> {
  try {
    const minimalTxList = buildMinimalTxList(transactions)

    const res = await fetch(`${AI_BASE}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, transactions: minimalTxList })
    })

    const json = await res.json()

    if (!res.ok || !json.success) {
      return {
        data: null,
        error: {
          message: json.error || 'Failed to get an answer.',
          setupRequired: json.setupRequired || false
        }
      }
    }

    return { data: json.data as AIAssistantResult, error: null }
  } catch {
    return {
      data: null,
      error: {
        message: 'Could not connect to AI service. Make sure the backend server is running on port 5000.'
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Generate AI Budget Insights
// ─────────────────────────────────────────────────────────────────────────────
export async function generateAIBudgetInsights(
  budgetSummary: any
): Promise<{ data: AIBudgetInsightsResult | null; error: AIServiceError | null }> {
  try {
    const res = await fetch(`${AI_BASE}/budget-insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ budgetSummary })
    })

    const json = await res.json()

    if (!res.ok || !json.success) {
      return {
        data: null,
        error: {
          message: json.error || 'Failed to generate budget insights.',
          setupRequired: json.setupRequired || false
        }
      }
    }

    return { data: json.data as AIBudgetInsightsResult, error: null }
  } catch {
    return {
      data: null,
      error: {
        message: 'Could not connect to AI service. Make sure the backend server is running on port 5000.'
      }
    }
  }
}
