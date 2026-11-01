export type TransactionType = 'income' | 'expense'

export type ExpenseCategory =
  | 'Food'
  | 'Shopping'
  | 'Transport'
  | 'Bills & Utilities'
  | 'Entertainment'
  | 'Healthcare'
  | 'Education'
  | 'Housing'
  | 'Other'

export type IncomeCategory =
  | 'Salary'
  | 'Freelance'
  | 'Business'
  | 'Investment'
  | 'Other'

export type TransactionCategory = ExpenseCategory | IncomeCategory | string

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
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

export const INCOME_CATEGORIES: IncomeCategory[] = [
  'Salary',
  'Freelance',
  'Business',
  'Investment',
  'Other'
]

export interface Transaction {
  id: string
  userId?: string
  title: string
  description?: string
  amount: number
  type: TransactionType
  category: TransactionCategory
  date: string
  paymentMethod: string
  createdAt?: string
  aiCategorized?: boolean
  status?: 'completed' | 'pending' | 'flagged'
}

export interface SupabaseTransactionRow {
  id: string
  user_id: string
  title: string
  amount: number
  type: 'income' | 'expense'
  category: string
  transaction_date: string
  payment_method: string
  description?: string | null
  ai_categorized?: boolean
  status?: 'completed' | 'pending' | 'flagged'
  created_at?: string
  updated_at?: string
}

export interface UserProfile {
  id: string
  email: string
  fullName?: string
  tier?: string
}

export interface FinancialInsight {
  id: string
  title: string
  description: string
  category: 'savings' | 'alert' | 'investment' | 'recommendation'
  impactScore?: number
  potentialSavings?: number
  metric?: string
  badge?: string
  createdAt: string
  actionable?: string
}

export interface BudgetGoal {
  id: string
  category: string
  monthlyLimit: number
  currentSpent: number
  color: string
  iconName: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Monthly Budget Model (Full Month Envelope + Category Ceilings)
// ─────────────────────────────────────────────────────────────────────────────
export interface MonthlyBudget {
  id: string
  userId?: string
  month: string // 'YYYY-MM'
  overallLimit: number
  categoryBudgets: Record<string, number> // { "Food": 15000, "Transport": 8000 }
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface SupabaseBudgetRow {
  id: string
  user_id: string
  month: string
  overall_limit: number
  category_budgets: Record<string, number>
  notes?: string | null
  created_at?: string
  updated_at?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Savings Goal Model
// ─────────────────────────────────────────────────────────────────────────────
export interface SavingsGoal {
  id: string
  userId?: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  category?: string
  color?: string
  icon?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface SupabaseSavingsGoalRow {
  id: string
  user_id: string
  name: string
  target_amount: number
  current_amount: number
  target_date: string
  category?: string | null
  color?: string | null
  icon?: string | null
  notes?: string | null
  created_at?: string
  updated_at?: string
}

export interface MonthlyCashflow {
  month: string
  income: number
  expenses: number
  savings: number
}

export interface CategoryBreakdownItem {
  name: string
  amount: number
  percentage: number
  color: string
  count: number
}

export interface SpendingTrendPoint {
  day: string
  spending: number
  budgetBenchmark: number
}

export interface SavingsGrowthPoint {
  month: string
  actual: number
  projected: number
}

export interface FinancialSummary {
  totalBalance: number
  totalIncome: number
  totalExpenses: number
  totalSavings: number
  savingsRate: number
  balanceGrowth: number
  incomeGrowth: number
  expensesGrowth: number
  savingsGrowth: number
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  type: 'alert' | 'insight' | 'transaction' | 'system'
}

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}
