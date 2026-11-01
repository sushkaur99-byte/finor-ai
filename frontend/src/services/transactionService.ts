import { supabase, isSupabaseConfigured } from './supabaseClient'
import type { Transaction } from '../types/finance'
import { INITIAL_TRANSACTIONS } from '../data/mockData'

const LOCAL_STORAGE_KEY = 'finora_transactions_v2'
const MIGRATION_DONE_KEY = 'finora_migrated_to_supabase_user_'

function toFrontendTransaction(row: any): Transaction {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    amount: typeof row.amount === 'string' ? parseFloat(row.amount) : Number(row.amount),
    type: row.type,
    category: row.category,
    date: row.transaction_date,
    paymentMethod: row.payment_method,
    description: row.description || undefined,
    aiCategorized: row.ai_categorized ?? false,
    status: row.status || 'completed',
    createdAt: row.created_at
  }
}

function toSupabaseRow(data: Omit<Transaction, 'id'>, userId: string) {
  return {
    user_id: userId,
    title: data.title,
    amount: data.amount,
    type: data.type,
    category: data.category,
    transaction_date: data.date,
    payment_method: data.paymentMethod,
    description: data.description || null,
    ai_categorized: data.aiCategorized ?? true,
    status: data.status || 'completed'
  }
}

/**
 * Enterprise Transaction Data Service
 * Primary Layer: Supabase PostgreSQL Database with Row Level Security.
 * Fallback & Cache Layer: Browser localStorage.
 */
class TransactionService {
  /**
   * Fetch all transactions for the authenticated user from Supabase.
   * If local unmigrated transactions exist, migrates them seamlessly.
   */
  async getTransactions(userId?: string): Promise<{ data: Transaction[]; error: Error | null }> {
    const configured = isSupabaseConfigured()

    // 1. If Supabase is configured and we have an authenticated user
    if (configured && userId) {
      try {
        // Query user's transactions from Supabase (Row Level Security enforced)
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('transaction_date', { ascending: false })

        if (error) {
          console.error('Supabase query error:', error)
          // Fall back to local cache if network/database table is still initializing
          const cached = this.getLocalCache()
          return { data: cached, error: new Error(error.message) }
        }

        // If user has 0 records in Supabase, check if they have existing localStorage records to migrate
        const migrationKey = `${MIGRATION_DONE_KEY}${userId}`
        const alreadyMigrated = localStorage.getItem(migrationKey)

        if ((!data || data.length === 0) && !alreadyMigrated) {
          const localTxs = this.getLocalCache()
          if (localTxs.length > 0) {
            console.log(`Migrating ${localTxs.length} local transactions to Supabase for user ${userId}...`)
            await this.migrateLocalTransactionsToSupabase(localTxs, userId)
            localStorage.setItem(migrationKey, 'true')

            // Re-fetch migrated records
            const { data: refetched } = await supabase
              .from('transactions')
              .select('*')
              .order('transaction_date', { ascending: false })

            if (refetched && refetched.length > 0) {
              const mapped = refetched.map(toFrontendTransaction)
              this.setLocalCache(mapped)
              return { data: mapped, error: null }
            }
          }
        }

        const mapped = (data || []).map(toFrontendTransaction)
        this.setLocalCache(mapped)
        return { data: mapped, error: null }
      } catch (err: any) {
        console.warn('Finora TransactionService: Network error connecting to Supabase', err)
        return { data: this.getLocalCache(), error: err }
      }
    }

    // 2. Fallback mode: Supabase not configured or guest/demo mode
    return { data: this.getLocalCache(), error: null }
  }

  /**
   * Add a new transaction into Supabase.
   */
  async addTransaction(
    data: Omit<Transaction, 'id'>,
    userId?: string
  ): Promise<{ data: Transaction | null; error: Error | null }> {
    const configured = isSupabaseConfigured()

    if (configured && userId) {
      try {
        const payload = toSupabaseRow(data, userId)
        const { data: created, error } = await supabase
          .from('transactions')
          .insert(payload)
          .select()
          .single()

        if (error) {
          console.error('Supabase insert error:', error)
          return { data: null, error: new Error(error.message) }
        }

        const mapped = toFrontendTransaction(created)
        // Update local cache
        const current = this.getLocalCache()
        this.setLocalCache([mapped, ...current])
        return { data: mapped, error: null }
      } catch (err: any) {
        return { data: null, error: err }
      }
    }

    // LocalStorage fallback
    const localTx: Transaction = {
      ...data,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: userId || 'local-user',
      createdAt: new Date().toISOString()
    }
    const current = this.getLocalCache()
    this.setLocalCache([localTx, ...current])
    return { data: localTx, error: null }
  }

  /**
   * Update an existing transaction in Supabase.
   */
  async updateTransaction(
    id: string,
    updates: Partial<Transaction>,
    userId?: string
  ): Promise<{ data: Transaction | null; error: Error | null }> {
    const configured = isSupabaseConfigured()

    if (configured && userId) {
      try {
        const payload: any = {}
        if (updates.title !== undefined) payload.title = updates.title
        if (updates.amount !== undefined) payload.amount = updates.amount
        if (updates.type !== undefined) payload.type = updates.type
        if (updates.category !== undefined) payload.category = updates.category
        if (updates.date !== undefined) payload.transaction_date = updates.date
        if (updates.paymentMethod !== undefined) payload.payment_method = updates.paymentMethod
        if (updates.description !== undefined) payload.description = updates.description || null
        if (updates.status !== undefined) payload.status = updates.status

        const { data: updated, error } = await supabase
          .from('transactions')
          .update(payload)
          .eq('id', id)
          .select()
          .single()

        if (error) {
          console.error('Supabase update error:', error)
          return { data: null, error: new Error(error.message) }
        }

        const mapped = toFrontendTransaction(updated)
        // Update local cache
        const current = this.getLocalCache()
        this.setLocalCache(current.map(t => (t.id === id ? mapped : t)))
        return { data: mapped, error: null }
      } catch (err: any) {
        return { data: null, error: err }
      }
    }

    // Local fallback
    const current = this.getLocalCache()
    const index = current.findIndex(t => t.id === id)
    if (index === -1) {
      return { data: null, error: new Error('Transaction not found') }
    }
    const updated = { ...current[index], ...updates, id }
    current[index] = updated
    this.setLocalCache(current)
    return { data: updated, error: null }
  }

  /**
   * Delete a transaction from Supabase.
   */
  async deleteTransaction(id: string, userId?: string): Promise<{ success: boolean; error: Error | null }> {
    const configured = isSupabaseConfigured()

    if (configured && userId) {
      try {
        const { error } = await supabase
          .from('transactions')
          .delete()
          .eq('id', id)

        if (error) {
          console.error('Supabase delete error:', error)
          return { success: false, error: new Error(error.message) }
        }

        // Update local cache
        const current = this.getLocalCache()
        this.setLocalCache(current.filter(t => t.id !== id))
        return { success: true, error: null }
      } catch (err: any) {
        return { success: false, error: err }
      }
    }

    // Local fallback
    const current = this.getLocalCache()
    this.setLocalCache(current.filter(t => t.id !== id))
    return { success: true, error: null }
  }

  /**
   * Migrate existing localStorage records into Supabase for an authenticated user.
   */
  async migrateLocalTransactionsToSupabase(transactions: Transaction[], userId: string): Promise<void> {
    try {
      const rows = transactions.map(t => ({
        user_id: userId,
        title: t.title,
        amount: t.amount,
        type: t.type,
        category: t.category,
        transaction_date: t.date,
        payment_method: t.paymentMethod,
        description: t.description || null,
        ai_categorized: t.aiCategorized ?? true,
        status: t.status || 'completed'
      }))

      // Batch insert into Supabase
      const { error } = await supabase.from('transactions').insert(rows)
      if (error) {
        console.warn('Batch migration to Supabase warning:', error.message)
      } else {
        console.log(`Successfully migrated ${rows.length} transactions into Supabase table.`)
      }
    } catch (e) {
      console.warn('Migration error:', e)
    }
  }

  /**
   * Local storage helpers for cache & offline stability
   */
  getLocalCache(): Transaction[] {
    try {
      const serialized = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (!serialized) {
        this.setLocalCache(INITIAL_TRANSACTIONS)
        return INITIAL_TRANSACTIONS
      }
      const parsed = JSON.parse(serialized)
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_TRANSACTIONS
    } catch {
      return INITIAL_TRANSACTIONS
    }
  }

  setLocalCache(transactions: Transaction[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transactions))
    } catch (err) {
      console.warn('Failed to update localStorage cache', err)
    }
  }

  resetLocalCache(): Transaction[] {
    this.setLocalCache(INITIAL_TRANSACTIONS)
    return INITIAL_TRANSACTIONS
  }
}

export const transactionService = new TransactionService()
