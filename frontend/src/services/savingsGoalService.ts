import { supabase, isSupabaseConfigured } from './supabaseClient'
import type { SavingsGoal } from '../types/finance'

const LOCAL_SAVINGS_GOALS_KEY = 'finora_savings_goals_v1'

const DEFAULT_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'goal-emergency-reserve',
    name: 'Sovereign Emergency Reserve',
    targetAmount: 1000000,
    currentAmount: 750000,
    targetDate: '2027-03-31',
    category: 'Emergency Cushion',
    color: '#1D4938',
    icon: 'Shield',
    notes: '6 months of total baseline family living expenses in liquid treasury funds'
  },
  {
    id: 'goal-real-estate-advance',
    name: 'Coastal Retreat Land Advance',
    targetAmount: 2500000,
    currentAmount: 1400000,
    targetDate: '2027-09-30',
    category: 'Real Estate',
    color: '#D6B66C',
    icon: 'Building2',
    notes: '20% equity down payment on Goa luxury estate'
  },
  {
    id: 'goal-vintage-horology',
    name: 'Patek Philippe Perpetual Acquisition',
    targetAmount: 1800000,
    currentAmount: 1250000,
    targetDate: '2026-12-31',
    category: 'Alternative Assets',
    color: '#102820',
    icon: 'Watch',
    notes: 'Discretionary collectible investment'
  }
]

function getLocalGoals(): SavingsGoal[] {
  try {
    const raw = localStorage.getItem(LOCAL_SAVINGS_GOALS_KEY)
    if (!raw) {
      localStorage.setItem(LOCAL_SAVINGS_GOALS_KEY, JSON.stringify(DEFAULT_SAVINGS_GOALS))
      return DEFAULT_SAVINGS_GOALS
    }
    return JSON.parse(raw)
  } catch {
    return DEFAULT_SAVINGS_GOALS
  }
}

function saveLocalGoals(goals: SavingsGoal[]) {
  try {
    localStorage.setItem(LOCAL_SAVINGS_GOALS_KEY, JSON.stringify(goals))
  } catch {
    // ignore
  }
}

function toFrontendGoal(row: any): SavingsGoal {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    targetAmount: typeof row.target_amount === 'string' ? parseFloat(row.target_amount) : Number(row.target_amount),
    currentAmount: typeof row.current_amount === 'string' ? parseFloat(row.current_amount) : Number(row.current_amount),
    targetDate: row.target_date,
    category: row.category || undefined,
    color: row.color || '#1D4938',
    icon: row.icon || 'Target',
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

class SavingsGoalService {
  async getGoals(userId?: string): Promise<{ data: SavingsGoal[]; error: Error | null }> {
    if (isSupabaseConfigured() && userId) {
      try {
        const { data, error } = await supabase
          .from('savings_goals')
          .select('*')
          .order('target_date', { ascending: true })

        if (error) {
          console.warn('Supabase getGoals error, using localStorage:', error.message)
          return { data: getLocalGoals(), error: new Error(error.message) }
        }

        const goals = (data || []).map(toFrontendGoal)
        if (goals.length === 0) {
          return { data: getLocalGoals(), error: null }
        }
        saveLocalGoals(goals)
        return { data: goals, error: null }
      } catch (err: any) {
        return { data: getLocalGoals(), error: err }
      }
    }
    return { data: getLocalGoals(), error: null }
  }

  async saveGoal(
    goalData: Omit<SavingsGoal, 'id'> & { id?: string },
    userId?: string
  ): Promise<{ data: SavingsGoal | null; error: Error | null }> {
    if (isSupabaseConfigured() && userId) {
      try {
        const payload = {
          user_id: userId,
          name: goalData.name,
          target_amount: goalData.targetAmount,
          current_amount: goalData.currentAmount,
          target_date: goalData.targetDate,
          category: goalData.category || null,
          color: goalData.color || '#1D4938',
          icon: goalData.icon || 'Target',
          notes: goalData.notes || null
        }

        if (goalData.id && !goalData.id.startsWith('goal-') && !goalData.id.startsWith('local-')) {
          const { data, error } = await supabase
            .from('savings_goals')
            .update(payload)
            .eq('id', goalData.id)
            .select()
            .single()

          if (error) throw error
          const updated = toFrontendGoal(data)
          const locals = getLocalGoals().map(g => (g.id === updated.id ? updated : g))
          saveLocalGoals(locals)
          return { data: updated, error: null }
        } else {
          const { data, error } = await supabase
            .from('savings_goals')
            .insert(payload)
            .select()
            .single()

          if (error) throw error
          const created = toFrontendGoal(data)
          const locals = [created, ...getLocalGoals()]
          saveLocalGoals(locals)
          return { data: created, error: null }
        }
      } catch (err: any) {
        console.warn('Supabase goal save failed, using local storage:', err.message)
      }
    }

    // Fallback: localStorage
    const locals = getLocalGoals()
    const id = goalData.id || `local-goal-${Date.now()}`
    const record: SavingsGoal = {
      ...goalData,
      id,
      userId: userId || 'local-user',
      createdAt: new Date().toISOString()
    }

    const existingIndex = locals.findIndex(g => g.id === id)
    if (existingIndex >= 0) {
      locals[existingIndex] = record
    } else {
      locals.unshift(record)
    }
    saveLocalGoals(locals)
    return { data: record, error: null }
  }

  async deleteGoal(id: string, userId?: string): Promise<{ success: boolean; error: Error | null }> {
    if (isSupabaseConfigured() && userId) {
      try {
        const { error } = await supabase
          .from('savings_goals')
          .delete()
          .eq('id', id)

        if (error) throw error
      } catch (err: any) {
        console.warn('Supabase goal delete failed:', err.message)
      }
    }

    const locals = getLocalGoals().filter(g => g.id !== id)
    saveLocalGoals(locals)
    return { success: true, error: null }
  }
}

export const savingsGoalService = new SavingsGoalService()

