import { useState, useMemo, useEffect, useCallback } from 'react'
import { Sidebar, type NavTab } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { DashboardView } from './components/views/DashboardView'
import { TransactionsView } from './components/views/TransactionsView'
import { AnalyticsView } from './components/views/AnalyticsView'
import { AIInsightsView } from './components/views/AIInsightsView'
import { BudgetsView } from './components/views/BudgetsView'
import { SettingsView } from './components/views/SettingsView'
import { TransactionFormModal } from './components/transactions/TransactionFormModal'
import { TransactionDetailModal } from './components/transactions/TransactionDetailModal'
import { DeleteConfirmModal } from './components/transactions/DeleteConfirmModal'
import { ToastContainer } from './components/common/Toast'
import { AuthView } from './components/auth/AuthView'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/useAuth'

import type {
  Transaction,
  FinancialInsight,
  MonthlyBudget,
  SavingsGoal,
  NotificationItem,
  ToastMessage
} from './types/finance'
import {
  INITIAL_AI_INSIGHTS,
  NOTIFICATIONS
} from './data/mockData'
import {
  calculateFinancialSummary,
  deriveMonthlyCashflow,
  deriveCategoryBreakdown,
  deriveSpendingTrends,
  deriveSavingsGrowth
} from './utils/formatters'
import { transactionService } from './services/transactionService'
import { budgetService } from './services/budgetService'
import { savingsGoalService } from './services/savingsGoalService'
import { Loader2 } from 'lucide-react'

function DashboardApp() {
  const { user, profile, loading: authLoading, signOut } = useAuth()

  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [transactionsLoading, setTransactionsLoading] = useState(true)

  // Budgets & Savings Goals State
  const [budgets, setBudgets] = useState<MonthlyBudget[]>([])
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])

  // Modal Dialog States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [detailTransaction, setDetailTransaction] = useState<Transaction | null>(null)
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null)

  // Secondary Data States
  const [insights, setInsights] = useState<FinancialInsight[]>(INITIAL_AI_INSIGHTS)
  const [notifications, setNotifications] = useState<NotificationItem[]>(NOTIFICATIONS)
  const [searchQuery, setSearchQuery] = useState('')

  // Toast Notification System
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // Load transactions, budgets, and savings goals from Supabase
  useEffect(() => {
    let isMounted = true

    async function loadData() {
      if (!user) {
        setTransactionsLoading(false)
        return
      }

      setTransactionsLoading(true)

      // Fetch in parallel
      const [txResult, budgetResult, goalResult] = await Promise.all([
        transactionService.getTransactions(user.id),
        budgetService.getBudgets(user.id),
        savingsGoalService.getGoals(user.id)
      ])

      if (!isMounted) return

      if (txResult.error) {
        addToast(`Notice: Using local cache (${txResult.error.message})`, 'info')
      }
      setTransactions(txResult.data)
      setBudgets(budgetResult.data)
      setSavingsGoals(goalResult.data)
      setTransactionsLoading(false)
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [user, addToast])

  // PURE DYNAMIC DERIVATIONS FROM TRANSACTION DATA
  const summary = useMemo(() => {
    return calculateFinancialSummary(transactions)
  }, [transactions])

  const monthlyCashflow = useMemo(() => {
    return deriveMonthlyCashflow(transactions)
  }, [transactions])

  const categoryData = useMemo(() => {
    return deriveCategoryBreakdown(transactions)
  }, [transactions])

  const spendingTrends = useMemo(() => {
    return deriveSpendingTrends(transactions)
  }, [transactions])

  const savingsGrowth = useMemo(() => {
    return deriveSavingsGrowth(transactions)
  }, [transactions])

  // Global search filtering across transactions
  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions
    const q = searchQuery.toLowerCase()
    return transactions.filter(
      t =>
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.paymentMethod.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
    )
  }, [transactions, searchQuery])

  // TRANSACTION ACTIONS WITH SUPABASE
  const handleOpenAddModal = () => {
    setEditingTransaction(null)
    setIsFormModalOpen(true)
  }

  const handleOpenEditModal = (tx: Transaction) => {
    setEditingTransaction(tx)
    setIsFormModalOpen(true)
  }

  const handleOpenDetailModal = (tx: Transaction) => {
    setDetailTransaction(tx)
  }

  const handleRequestDelete = (id: string) => {
    const tx = transactions.find(t => t.id === id)
    if (tx) {
      setDeletingTransaction(tx)
    }
  }

  const handleFormSubmit = async (data: Omit<Transaction, 'id'>, id?: string) => {
    if (id) {
      const { data: updated, error } = await transactionService.updateTransaction(id, data, user?.id)
      if (error || !updated) {
        addToast(`Failed to update transaction: ${error?.message || 'Unknown error'}`, 'error')
        return
      }

      setTransactions(prev => prev.map(t => (t.id === id ? updated : t)))
      addToast(`Transaction "${updated.title}" updated in database.`, 'success')

      if (detailTransaction?.id === id) {
        setDetailTransaction(updated)
      }
    } else {
      const { data: created, error } = await transactionService.addTransaction(data, user?.id)
      if (error || !created) {
        addToast(`Failed to save transaction: ${error?.message || 'Unknown error'}`, 'error')
        return
      }

      setTransactions(prev => [created, ...prev])
      addToast(`Transaction "${created.title}" saved to Supabase.`, 'success')

      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'Transaction Recorded',
        message: `${created.title}: ₹${created.amount.toLocaleString('en-IN')} saved to cloud database.`,
        time: 'Just now',
        read: false,
        type: 'transaction'
      }
      setNotifications(prev => [newNotif, ...prev])
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingTransaction) return
    const id = deletingTransaction.id
    const title = deletingTransaction.title

    const { success, error } = await transactionService.deleteTransaction(id, user?.id)
    if (!success || error) {
      addToast(`Failed to delete: ${error?.message || 'Database error'}`, 'error')
      return
    }

    setTransactions(prev => prev.filter(t => t.id !== id))
    setDeletingTransaction(null)

    if (detailTransaction?.id === id) {
      setDetailTransaction(null)
    }

    addToast(`Transaction "${title}" removed from Supabase.`, 'info')
  }

  // BUDGET MANAGEMENT ACTIONS
  const handleSaveBudget = async (budgetData: Omit<MonthlyBudget, 'id'>, id?: string) => {
    const { data: saved, error } = await budgetService.saveBudget({ ...budgetData, id }, user?.id)
    if (error || !saved) {
      addToast(`Failed to save budget envelope: ${error?.message || 'Unknown error'}`, 'error')
      return
    }

    setBudgets(prev => {
      const exists = prev.some(b => b.id === saved.id || b.month === saved.month)
      if (exists) {
        return prev.map(b => (b.id === saved.id || b.month === saved.month ? saved : b))
      }
      return [saved, ...prev]
    })
    addToast(`Monthly budget for ${saved.month} synchronized to Supabase.`, 'success')
  }

  const handleDeleteBudget = async (id: string) => {
    const { success, error } = await budgetService.deleteBudget(id, user?.id)
    if (!success || error) {
      addToast(`Failed to delete budget: ${error?.message || 'Database error'}`, 'error')
      return
    }
    setBudgets(prev => prev.filter(b => b.id !== id))
    addToast('Budget envelope removed from Supabase.', 'info')
  }

  // SAVINGS GOAL ACTIONS
  const handleSaveGoal = async (goalData: Omit<SavingsGoal, 'id'>, id?: string) => {
    const { data: saved, error } = await savingsGoalService.saveGoal({ ...goalData, id }, user?.id)
    if (error || !saved) {
      addToast(`Failed to save savings goal: ${error?.message || 'Unknown error'}`, 'error')
      return
    }

    setSavingsGoals(prev => {
      const exists = prev.some(g => g.id === saved.id)
      if (exists) {
        return prev.map(g => (g.id === saved.id ? saved : g))
      }
      return [saved, ...prev]
    })
    addToast(`Savings goal "${saved.name}" persisted to Supabase.`, 'success')
  }

  const handleDeleteGoal = async (id: string) => {
    const { success, error } = await savingsGoalService.deleteGoal(id, user?.id)
    if (!success || error) {
      addToast(`Failed to delete goal: ${error?.message || 'Database error'}`, 'error')
      return
    }
    setSavingsGoals(prev => prev.filter(g => g.id !== id))
    addToast('Savings goal removed.', 'info')
  }

  const handleRefreshInsights = () => {
    const freshInsight: FinancialInsight = {
      id: `ai-${Date.now()}`,
      title: 'Cloud Ledger Re-Calibrated',
      description: `Synchronized with Supabase database. Surplus liquidity of ₹${summary.totalSavings.toLocaleString('en-IN')} evaluated. Capital allocation velocity is optimal.`,
      category: 'recommendation',
      impactScore: 93,
      potentialSavings: Math.round(summary.totalSavings * 0.12),
      metric: 'Database Reconciled',
      badge: 'Synthesized Just Now',
      createdAt: 'Just now',
      actionable: 'Deploy surplus liquidity to preserve compounding rate.'
    }
    setInsights(prev => [freshInsight, ...prev.slice(0, 3)])
    addToast('AI Intelligence insights regenerated.', 'success')
  }

  const handleResetData = () => {
    const resetTxs = transactionService.resetLocalCache()
    setTransactions(resetTxs)
    setInsights(INITIAL_AI_INSIGHTS)
    setNotifications(NOTIFICATIONS)
    setSearchQuery('')
    addToast('Sample ledger restored to initial state.', 'info')
  }

  // 1. Initial Authentication Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#102820] text-white flex flex-col items-center justify-center p-6 selection:bg-[#D6B66C]/40">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#1D4938] to-[#102820] border border-[#D6B66C]/50 flex items-center justify-center text-[#D6B66C] shadow-2xl mb-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#D6B66C]" />
        </div>
        <h2 className="font-serif text-lg font-bold tracking-wider text-white">
          FINORA <span className="text-[#D6B66C]">AI</span>
        </h2>
        <p className="text-xs text-[#A8BBAA] mt-1 tracking-wide">
          Decrypting Private Vault Session...
        </p>
      </div>
    )
  }

  // 2. Unauthenticated Gate: Redirect to Auth View
  if (!user) {
    return <AuthView />
  }

  // 3. Authenticated Dashboard Layout
  return (
    <div className="min-h-screen bg-[#F5F1E8] text-[#17251F] flex flex-col antialiased selection:bg-[#D6B66C]/40 selection:text-[#102820]">
      {/* 1. Desktop & Mobile Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        profile={profile}
        onLogout={signOut}
      />

      {/* 2. Main Content Canvas */}
      <div className="lg:pl-72 flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <Header
          onOpenAddModal={handleOpenAddModal}
          onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          notifications={notifications}
          onMarkNotificationRead={(id: string) =>
            setNotifications(prev =>
              prev.map(n => (n.id === id ? { ...n, read: true } : n))
            )
          }
          onMarkAllNotificationsRead={() =>
            setNotifications(prev => prev.map(n => ({ ...n, read: true })))
          }
          profile={profile}
          onLogout={signOut}
        />

        {/* View Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {transactionsLoading ? (
            <div className="py-24 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#1D4938] mx-auto mb-3" />
              <p className="text-xs font-semibold text-[#17251F]">
                Synchronizing with Supabase Cloud Database...
              </p>
              <p className="text-[11px] text-[#75847B] mt-0.5">
                Fetching verified ledger transactions, budgets, and savings goals
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  summary={summary}
                  monthlyData={monthlyCashflow}
                  categoryData={categoryData}
                  spendingTrends={spendingTrends}
                  savingsGrowth={savingsGrowth}
                  insights={insights}
                  transactions={filteredTransactions}
                  budgets={budgets}
                  savingsGoals={savingsGoals}
                  onDeleteTransaction={handleRequestDelete}
                  onEditTransaction={handleOpenEditModal}
                  onViewDetails={handleOpenDetailModal}
                  onOpenAddModal={handleOpenAddModal}
                  onRefreshInsights={handleRefreshInsights}
                  onNavigateToTransactions={() => setActiveTab('transactions')}
                  onNavigateToBudgets={() => setActiveTab('budgets')}
                  onNavigateToAnalytics={() => setActiveTab('analytics')}
                />
              )}

              {activeTab === 'transactions' && (
                <TransactionsView
                  transactions={filteredTransactions}
                  onDeleteTransaction={handleRequestDelete}
                  onEditTransaction={handleOpenEditModal}
                  onViewDetails={handleOpenDetailModal}
                  onOpenAddModal={handleOpenAddModal}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsView
                  monthlyData={monthlyCashflow}
                  categoryData={categoryData}
                  spendingTrends={spendingTrends}
                  savingsGrowth={savingsGrowth}
                  transactions={transactions}
                />
              )}

              {activeTab === 'insights' && (
                <AIInsightsView
                  insights={insights}
                  transactions={transactions}
                  onRefreshInsights={handleRefreshInsights}
                />
              )}

              {activeTab === 'budgets' && (
                <BudgetsView
                  budgets={budgets}
                  savingsGoals={savingsGoals}
                  transactions={transactions}
                  onSaveBudget={handleSaveBudget}
                  onDeleteBudget={handleDeleteBudget}
                  onSaveGoal={handleSaveGoal}
                  onDeleteGoal={handleDeleteGoal}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView onResetData={handleResetData} profile={profile} />
              )}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-[#A8BBAA]/20 py-4 px-6 text-center text-xs text-[#75847B]">
          <div className="flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1D4938]" />
              <strong>FINORA AI</strong> — Autonomous Wealth & Financial Intelligence System
            </span>
            <span className="font-mono text-[11px] text-[#A8BBAA]">
              Supabase PostgreSQL Database · Row Level Security Active · INR (₹)
            </span>
          </div>
        </footer>
      </div>

      {/* 3. MODALS & TOASTS */}
      {/* Add / Edit Transaction Form Modal */}
      <TransactionFormModal
        key={editingTransaction ? `edit-${editingTransaction.id}` : `add-${isFormModalOpen}`}
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
          setEditingTransaction(null)
        }}
        onSubmit={handleFormSubmit}
        initialData={editingTransaction}
      />

      {/* View Transaction Details Modal */}
      <TransactionDetailModal
        isOpen={Boolean(detailTransaction)}
        transaction={detailTransaction}
        onClose={() => setDetailTransaction(null)}
        onEdit={handleOpenEditModal}
        onDelete={handleRequestDelete}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingTransaction)}
        transaction={deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

export function App() {
  return (
    <AuthProvider>
      <DashboardApp />
    </AuthProvider>
  )
}

export default App
