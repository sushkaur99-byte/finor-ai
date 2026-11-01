import React, { useMemo, useState } from 'react'
import type {
  FinancialSummary,
  MonthlyCashflow,
  CategoryBreakdownItem,
  SpendingTrendPoint,
  SavingsGrowthPoint,
  FinancialInsight,
  Transaction,
  MonthlyBudget,
  SavingsGoal
} from '../../types/finance'
import { SummaryCards } from '../dashboard/SummaryCard'
import { IncomeExpenseChart } from '../dashboard/IncomeExpenseChart'
import { ExpenseDonutChart } from '../dashboard/ExpenseDonutChart'
import { SpendingTrendChart } from '../dashboard/SpendingTrendChart'
import { SavingsGrowthChart } from '../dashboard/SavingsGrowthChart'
import { RecentTransactions } from '../dashboard/RecentTransactions'
import { AIInsightsPanel } from '../insights/AIInsightsPanel'
import { formatINR } from '../../utils/formatters'
import {
  Target,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Layers,
  CheckCircle2
} from 'lucide-react'

// Pure helper function to get current YYYY-MM without impurities during render
function getCurrentMonthString(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

interface DashboardViewProps {
  summary: FinancialSummary
  monthlyData: MonthlyCashflow[]
  categoryData: CategoryBreakdownItem[]
  spendingTrends: SpendingTrendPoint[]
  savingsGrowth: SavingsGrowthPoint[]
  insights: FinancialInsight[]
  transactions: Transaction[]
  budgets?: MonthlyBudget[]
  savingsGoals?: SavingsGoal[]
  onDeleteTransaction: (id: string) => void
  onEditTransaction: (transaction: Transaction) => void
  onViewDetails: (transaction: Transaction) => void
  onOpenAddModal: () => void
  onRefreshInsights: () => void
  onNavigateToTransactions: () => void
  onNavigateToBudgets?: () => void
  onNavigateToAnalytics?: () => void
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  monthlyData,
  categoryData,
  spendingTrends,
  savingsGrowth,
  insights,
  transactions,
  budgets = [],
  savingsGoals = [],
  onDeleteTransaction,
  onEditTransaction,
  onViewDetails,
  onOpenAddModal,
  onRefreshInsights,
  onNavigateToTransactions,
  onNavigateToBudgets,
  onNavigateToAnalytics
}) => {
  // Current month string 'YYYY-MM'
  const [currentMonthStr] = useState<string>(() => getCurrentMonthString())

  // Active budget for this month
  const activeBudget = useMemo(() => {
    return budgets.find(b => b.month === currentMonthStr) || budgets[0] || null
  }, [budgets, currentMonthStr])

  // Current month's real spend
  const currentMonthSpent = useMemo(() => {
    return transactions
      .filter(t => (t.date || '').startsWith(currentMonthStr) && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  }, [transactions, currentMonthStr])

  const overallCap = activeBudget ? activeBudget.overallLimit : 150000
  const budgetUtilization = Math.round((currentMonthSpent / overallCap) * 100)

  // Calculate important spending alerts
  const spendingAlerts = useMemo(() => {
    const alerts: Array<{ category: string; spent: number; cap: number; pct: number }> = []
    if (activeBudget && activeBudget.categoryBudgets) {
      Object.entries(activeBudget.categoryBudgets).forEach(([cat, cap]) => {
        const spent = transactions
          .filter(t => (t.date || '').startsWith(currentMonthStr) && t.type === 'expense' && t.category === cat)
          .reduce((sum, t) => sum + t.amount, 0)
        const pct = Math.round((spent / cap) * 100)
        if (pct >= 75) {
          alerts.push({ category: cat, spent, cap, pct })
        }
      })
    }
    return alerts
  }, [activeBudget, transactions, currentMonthStr])

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Four Financial Summary Cards */}
      <section aria-label="Financial Summary Cards">
        <SummaryCards summary={summary} />
      </section>

      {/* 2. Operational Budget & Savings Goals Executive Strip */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Overview Card */}
        <div className="bg-gradient-to-r from-[#102820] to-[#1D4938] text-white rounded-3xl p-6 border border-[#D6B66C]/30 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#D6B66C] flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> Monthly Envelope ({currentMonthStr})
              </span>
              {budgetUtilization >= 100 ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  Breached
                </span>
              ) : budgetUtilization >= 75 ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {budgetUtilization}% Consumed
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Controlled
                </span>
              )}
            </div>

            <div className="text-xl sm:text-2xl font-serif font-bold text-white">
              {formatINR(currentMonthSpent)}{' '}
              <span className="text-xs font-normal text-[#A8BBAA]">
                / {formatINR(overallCap)}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#16382C] h-2.5 rounded-full overflow-hidden my-3 border border-[#1D4938]">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetUtilization >= 100
                    ? 'bg-rose-500'
                    : budgetUtilization >= 75
                    ? 'bg-[#D6B66C]'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, budgetUtilization)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#A8BBAA]">
              <span>Cushion: {formatINR(Math.max(0, overallCap - currentMonthSpent))}</span>
              <span>{budgetUtilization}% Allocated</span>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-[#1D4938] flex items-center justify-between">
            <span className="text-[11px] text-[#A8BBAA]">Discretionary limit active</span>
            <button
              onClick={onNavigateToBudgets}
              className="flex items-center gap-1 text-xs font-semibold text-[#D6B66C] hover:text-white cursor-pointer"
            >
              <span>Manage Budgets</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Savings Goal Progress Card */}
        <div className="bg-white rounded-3xl p-6 border border-[#A8BBAA]/30 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#75847B] flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#1D4938]" /> Primary Savings Horizon
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1D4938]/10 text-[#1D4938]">
                {savingsGoals[0]?.category || 'Strategic Reserve'}
              </span>
            </div>

            <h4 className="text-sm font-bold text-[#17251F] mb-1">
              {savingsGoals[0]?.name || 'Sovereign Emergency Reserve'}
            </h4>
            <div className="font-mono text-xl font-bold text-[#1D4938]">
              {formatINR(savingsGoals[0]?.currentAmount || 750000)}{' '}
              <span className="text-xs font-normal text-[#75847B]">
                / {formatINR(savingsGoals[0]?.targetAmount || 1000000)}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#F5F1E8] h-2 rounded-full overflow-hidden my-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#102820] to-[#1D4938] transition-all duration-500"
                style={{
                  width: `${
                    savingsGoals[0] && savingsGoals[0].targetAmount > 0
                      ? Math.min(100, Math.round((savingsGoals[0].currentAmount / savingsGoals[0].targetAmount) * 100))
                      : 75
                  }%`
                }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#75847B]">
              <span>
                Target Completion:{' '}
                {savingsGoals[0]?.targetDate || '2027-03-31'}
              </span>
              <span className="font-semibold text-[#17251F]">
                {savingsGoals[0] && savingsGoals[0].targetAmount > 0
                  ? Math.round((savingsGoals[0].currentAmount / savingsGoals[0].targetAmount) * 100)
                  : 75}%
              </span>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-[#A8BBAA]/20 flex items-center justify-between">
            <span className="text-[11px] text-[#75847B]">
              {savingsGoals.length} Active Horizons
            </span>
            <button
              onClick={onNavigateToBudgets}
              className="flex items-center gap-1 text-xs font-semibold text-[#1D4938] hover:text-[#102820] cursor-pointer"
            >
              <span>View All Goals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Spending Alerts & Quick Links Card */}
        <div className="bg-white rounded-3xl p-6 border border-[#A8BBAA]/30 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#75847B] flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Real-time Spending Alerts
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                {spendingAlerts.length} Flagged
              </span>
            </div>

            <div className="space-y-2">
              {spendingAlerts.slice(0, 2).map(alert => (
                <div
                  key={alert.category}
                  className="p-2.5 rounded-xl bg-[#FAF8F5] border border-amber-200/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-[#17251F]">{alert.category}</span>
                    <p className="text-[10px] text-[#75847B]">
                      {formatINR(alert.spent)} of {formatINR(alert.cap)}
                    </p>
                  </div>
                  <span className={`font-mono font-bold text-xs ${
                    alert.pct >= 100 ? 'text-rose-700' : 'text-amber-700'
                  }`}>
                    {alert.pct}%
                  </span>
                </div>
              ))}

              {spendingAlerts.length === 0 && (
                <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/60 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>All category ceilings are within controlled limits.</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-[#A8BBAA]/20 flex items-center justify-between">
            <button
              onClick={onNavigateToAnalytics}
              className="flex items-center gap-1 text-xs font-semibold text-[#1D4938] hover:text-[#102820] cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Full Analytics</span>
            </button>
            <button
              onClick={onNavigateToBudgets}
              className="flex items-center gap-1 text-xs font-semibold text-[#D6B66C] hover:text-[#B39243] cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Budget Envelopes</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Primary Financial Charts Row */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <IncomeExpenseChart data={monthlyData} />
        </div>
        <div className="lg:col-span-1">
          <ExpenseDonutChart data={categoryData} />
        </div>
      </section>

      {/* 4. AI Financial Assistant Panel */}
      <section aria-label="AI Financial Intelligence">
        <AIInsightsPanel
          insights={insights}
          onRefreshInsights={onRefreshInsights}
        />
      </section>

      {/* 5. Secondary Analytics Row: Spending Trajectory & Savings Growth */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingTrendChart data={spendingTrends} />
        <SavingsGrowthChart data={savingsGrowth} />
      </section>

      {/* 6. Recent Transactions Table */}
      <section aria-label="Recent Transactions">
        <RecentTransactions
          transactions={transactions}
          onDeleteTransaction={onDeleteTransaction}
          onEditTransaction={onEditTransaction}
          onViewDetails={onViewDetails}
          onOpenAddModal={onOpenAddModal}
          onViewAll={onNavigateToTransactions}
          isFullView={false}
        />
      </section>
    </div>
  )
}
