import { supabase, isSupabaseConfigured } from './supabaseClient'
import type { MonthlyBudget } from '../types/finance'

const LOCAL_BUDGETS_KEY = 'finora_budgets_v1'

const DEFAULT_MONTHLY_BUDGETS: MonthlyBudget[] = [
  {
    id: 'default-budget-2026-11',
    month: '2026-11',
    overallLimit: 145000,
    categoryBudgets: {
      Housing: 55000,
      Food: 25000,
      Shopping: 20000,
      Transport: 15000,
      'Bills & Utilities': 12000,
      Entertainment: 10000,
      Healthcare: 8000
    },
    notes: 'Standard Q4 wealth maintenance envelope'
  }
]

function getLocalBudgets(): MonthlyBudget[] {
  try {
    const raw = localStorage.getItem(LOCAL_BUDGETS_KEY)
    if (!raw) {
      localStorage.setItem(LOCAL_BUDGETS_KEY, JSON.stringify(DEFAULT_MONTHLY_BUDGETS))
      return DEFAULT_MONTHLY_BUDGETS
    }
    return JSON.parse(raw)
  } catch {
    return DEFAULT_MONTHLY_BUDGETS
  }
}

function saveLocalBudgets(budgets: MonthlyBudget[]) {
  try {
    localStorage.setItem(LOCAL_BUDGETS_KEY, JSON.stringify(budgets))
  } catch {
    // ignore
  }
}

function toFrontendBudget(row: any): MonthlyBudget {
  return {
    id: row.id,
    userId: row.user_id,
    month: row.month,
    overallLimit: typeof row.overall_limit === 'string' ? parseFloat(row.overall_limit) : Number(row.overall_limit),
    categoryBudgets: typeof row.category_budgets === 'object' && row.category_budgets !== null ? row.category_budgets : {},
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

class BudgetService {
  async getBudgets(userId?: string): Promise<{ data: MonthlyBudget[]; error: Error | null }> {
    if (isSupabaseConfigured() && userId) {
      try {
        const { data, error } = await supabase
          .from('budgets')
          .select('*')
          .order('month', { ascending: false })

        if (error) {
          console.warn('Supabase getBudgets error, using localStorage fallback:', error.message)
          return { data: getLocalBudgets(), error: new Error(error.message) }
        }

        const budgets = (data || []).map(toFrontendBudget)
        if (budgets.length === 0) {
          // If no cloud records, return local defaults
          return { data: getLocalBudgets(), error: null }
        }
        saveLocalBudgets(budgets)
        return { data: budgets, error: null }
      } catch (err: any) {
        return { data: getLocalBudgets(), error: err }
      }
    }
    return { data: getLocalBudgets(), error: null }
  }

  async getBudgetForMonth(month: string, userId?: string): Promise<{ data: MonthlyBudget | null; error: Error | null }> {
    const { data: allBudgets, error } = await this.getBudgets(userId)
    if (error) return { data: null, error }
    const match = allBudgets.find(b => b.month === month) || null
    return { data: match, error: null }
  }

  async saveBudget(
    budgetData: Omit<MonthlyBudget, 'id'> & { id?: string },
    userId?: string
  ): Promise<{ data: MonthlyBudget | null; error: Error | null }> {
    if (isSupabaseConfigured() && userId) {
      try {
        const payload = {
          user_id: userId,
          month: budgetData.month,
          overall_limit: budgetData.overallLimit,
          category_budgets: budgetData.categoryBudgets,
          notes: budgetData.notes || null
        }

        if (budgetData.id && !budgetData.id.startsWith('default-')) {
          const { data, error } = await supabase
            .from('budgets')
            .update(payload)
            .eq('id', budgetData.id)
            .select()
            .single()

          if (error) throw error
          const updated = toFrontendBudget(data)
          const locals = getLocalBudgets().map(b => (b.id === updated.id ? updated : b))
          saveLocalBudgets(locals)
          return { data: updated, error: null }
        } else {
          // Check if budget for month already exists to upsert
          const { data, error } = await supabase
            .from('budgets')
            .upsert(payload, { onConflict: 'user_id,month' })
            .select()
            .single()

          if (error) throw error
          const created = toFrontendBudget(data)
          const locals = [created, ...getLocalBudgets().filter(b => b.month !== created.month)]
          saveLocalBudgets(locals)
          return { data: created, error: null }
        }
      } catch (err: any) {
        console.warn('Supabase budget save failed, saving to localStorage:', err.message)
      }
    }

    // Fallback: localStorage
    const locals = getLocalBudgets()
    const id = budgetData.id || `local-budget-${Date.now()}`
    const record: MonthlyBudget = {
      ...budgetData,
      id,
      userId: userId || 'local-user',
      createdAt: new Date().toISOString()
    }

    const existingIndex = locals.findIndex(b => b.month === record.month || b.id === id)
    if (existingIndex >= 0) {
      locals[existingIndex] = record
    } else {
      locals.unshift(record)
    }
    saveLocalBudgets(locals)
    return { data: record, error: null }
  }

  async deleteBudget(id: string, userId?: string): Promise<{ success: boolean; error: Error | null }> {
    if (isSupabaseConfigured() && userId) {
      try {
        const { error } = await supabase
          .from('budgets')
          .delete()
          .eq('id', id)

        if (error) throw error
      } catch (err: any) {
        console.warn('Supabase budget delete failed:', err.message)
      }
    }

    const locals = getLocalBudgets().filter(b => b.id !== id)
    saveLocalBudgets(locals)
    return { success: true, error: null }
  }
}

export const budgetService = new BudgetService()

