import React, { useState, useMemo } from 'react'
import type { MonthlyBudget, SavingsGoal, Transaction } from '../../types/finance'
import { formatINR } from '../../utils/formatters'
import {
  Target,
  AlertTriangle,
  CheckCircle,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  RefreshCw,
  TrendingDown,
  Building2,
  Coffee,
  Laptop,
  ShoppingBag,
  HeartPulse,
  Briefcase,
  Car,
  Tv,
  HelpCircle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react'
import { BudgetModal } from '../budgets/BudgetModal'
import { SavingsGoalModal } from '../budgets/SavingsGoalModal'
import { generateAIBudgetInsights, type AIBudgetInsightsResult } from '../../services/aiService'

interface BudgetsViewProps {
  budgets: MonthlyBudget[]
  savingsGoals: SavingsGoal[]
  transactions: Transaction[]
  onSaveBudget: (budget: Omit<MonthlyBudget, 'id'>, id?: string) => void
  onDeleteBudget: (id: string) => void
  onSaveGoal: (goal: Omit<SavingsGoal, 'id'>, id?: string) => void
  onDeleteGoal: (id: string) => void
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  budgets,
  savingsGoals,
  transactions,
  onSaveBudget,
  onDeleteBudget,
  onSaveGoal,
  onDeleteGoal
}) => {
  // Current Selected Month (e.g. '2026-11')
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    return `${y}-${m}`
  })

  // Modal States
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<MonthlyBudget | null>(null)

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null)

  // AI Budget Insights State
  const [aiBudgetInsights, setAiBudgetInsights] = useState<AIBudgetInsightsResult | null>(null)
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  // Find active budget for selected month
  const activeBudget = useMemo(() => {
    return budgets.find(b => b.month === selectedMonth) || null
  }, [budgets, selectedMonth])

  // Calculate actual spending in selected month from real transactions
  const monthTransactions = useMemo(() => {
    return transactions.filter(t => (t.date || '').startsWith(selectedMonth))
  }, [transactions, selectedMonth])

  const totalSpentInMonth = useMemo(() => {
    return monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  }, [monthTransactions])

  // Category wise spending in selected month
  const categorySpendingMap = useMemo(() => {
    const map: Record<string, number> = {}
    monthTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const cat = t.category || 'Other'
        map[cat] = (map[cat] || 0) + t.amount
      })
    return map
  }, [monthTransactions])

  // Aggregate metrics
  const overallLimit = activeBudget ? activeBudget.overallLimit : 150000
  const remainingCushion = overallLimit - totalSpentInMonth
  const overallPercentage = Math.round((totalSpentInMonth / overallLimit) * 100)

  // Month-over-month comparison calculation
  const prevMonthStr = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number)
    const prevDate = new Date(y, m - 2, 1)
    const py = prevDate.getFullYear()
    const pm = String(prevDate.getMonth() + 1).padStart(2, '0')
    return `${py}-${pm}`
  }, [selectedMonth])

  const prevMonthSpent = useMemo(() => {
    return transactions
      .filter(t => (t.date || '').startsWith(prevMonthStr) && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  }, [transactions, prevMonthStr])

  // Navigate months
  const handleShiftMonth = (offset: number) => {
    const [y, m] = selectedMonth.split('-').map(Number)
    const d = new Date(y, m - 1 + offset, 1)
    const ny = d.getFullYear()
    const nm = String(d.getMonth() + 1).padStart(2, '0')
    setSelectedMonth(`${ny}-${nm}`)
    setAiBudgetInsights(null)
  }

  // Generate AI Budget Insights
  const handleGenerateBudgetAI = async () => {
    setIsAiLoading(true)
    setAiError(null)

    const categoriesList = activeBudget
      ? Object.entries(activeBudget.categoryBudgets).map(([cat, limit]) => ({
          category: cat,
          limit,
          spent: categorySpendingMap[cat] || 0,
          utilization: limit > 0 ? ((categorySpendingMap[cat] || 0) / limit) * 100 : 0
        }))
      : []

    const summaryPayload = {
      month: selectedMonth,
      overallLimit,
      totalSpent: totalSpentInMonth,
      utilizationPct: overallPercentage,
      remainingCushion,
      categories: categoriesList,
      prevMonthExpenses: prevMonthSpent,
      monthOverMonthDiff: totalSpentInMonth - prevMonthSpent
    }

    const res = await generateAIBudgetInsights(summaryPayload)
    setIsAiLoading(false)

    if (res.error) {
      setAiError(res.error.message)
    } else if (res.data) {
      setAiBudgetInsights(res.data)
    }
  }

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Housing':
        return <Building2 className="w-4 h-4 text-[#1D4938]" />
      case 'Food':
        return <Coffee className="w-4 h-4 text-[#D6B66C]" />
      case 'Shopping':
        return <ShoppingBag className="w-4 h-4 text-[#102820]" />
      case 'Transport':
        return <Car className="w-4 h-4 text-[#265F4A]" />
      case 'Bills & Utilities':
        return <Laptop className="w-4 h-4 text-[#B39243]" />
      case 'Entertainment':
        return <Tv className="w-4 h-4 text-[#75847B]" />
      case 'Healthcare':
        return <HeartPulse className="w-4 h-4 text-rose-700" />
      case 'Education':
        return <Briefcase className="w-4 h-4 text-[#2A6850]" />
      default:
        return <HelpCircle className="w-4 h-4 text-[#75847B]" />
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Header with Month Selector and Create Envelope CTA */}
      <div className="bg-white rounded-3xl p-6 border border-[#A8BBAA]/30 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#1D4938]/10 text-[#1D4938] border border-[#1D4938]/20">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#17251F]">
              Discretionary & Operational Budgets
            </h2>
            <p className="text-xs text-[#75847B]">
              Rigorous monthly expenditure ceilings configured to safeguard compounding velocity
            </p>
          </div>
        </div>

        {/* Month Picker & Create Action */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-[#F5F1E8] rounded-xl border border-[#A8BBAA]/40 p-1">
            <button
              onClick={() => handleShiftMonth(-1)}
              className="p-1 rounded-lg hover:bg-white text-[#17251F] transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 text-xs font-bold text-[#17251F] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#1D4938]" />
              <span>{selectedMonth}</span>
            </div>
            <button
              onClick={() => handleShiftMonth(1)}
              className="p-1 rounded-lg hover:bg-white text-[#17251F] transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              setEditingBudget(activeBudget)
              setIsBudgetModalOpen(true)
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1D4938] text-[#D6B66C] hover:bg-[#102820] text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{activeBudget ? 'Adjust Envelope' : 'Create Envelope'}</span>
          </button>
        </div>
      </div>

      {/* 2. Aggregate Envelope Overview Banner */}
      <div className="bg-gradient-to-r from-[#102820] to-[#1D4938] text-white rounded-3xl p-6 sm:p-7 border border-[#D6B66C]/30 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1D4938]/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-bold tracking-wider text-[#D6B66C]">
                Monthly Envelope for {selectedMonth}
              </span>
              {overallPercentage >= 100 ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-rose-400" /> Ceiling Breached
                </span>
              ) : overallPercentage >= 90 ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-400" /> 90% Threshold Warning
                </span>
              ) : overallPercentage >= 75 ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-yellow-400" /> 75% Approaching
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-400" /> Controlled Discipline
                </span>
              )}
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
              {formatINR(totalSpentInMonth)}{' '}
              <span className="text-sm font-normal text-[#A8BBAA]">
                spent of {formatINR(overallLimit)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-[#16382C] px-3.5 py-1.5 rounded-xl border border-[#D6B66C]/20 text-xs font-semibold text-[#D6B66C]">
              <ShieldCheck className="w-4 h-4 text-[#D6B66C]" />
              <span>
                {remainingCushion >= 0 ? `${formatINR(remainingCushion)} Remaining Cushion` : `${formatINR(Math.abs(remainingCushion))} Deficit`}
              </span>
            </div>

            {activeBudget && (
              <button
                onClick={() => onDeleteBudget(activeBudget.id)}
                className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/20 text-[#A8BBAA] hover:text-rose-300 transition-colors"
                title="Delete Budget"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-[#16382C] h-3.5 rounded-full overflow-hidden p-0.5 border border-[#1D4938]">
            <div
              className={`h-full rounded-full transition-all duration-500 shadow-sm ${
                overallPercentage >= 100
                  ? 'bg-rose-500'
                  : overallPercentage >= 90
                  ? 'bg-amber-500'
                  : overallPercentage >= 75
                  ? 'bg-[#D6B66C]'
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, overallPercentage)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#A8BBAA] mt-2">
            <span>Utilization: {overallPercentage}%</span>
            <span>
              Previous Month Burn: {formatINR(prevMonthSpent)} ({totalSpentInMonth >= prevMonthSpent ? '+' : ''}{formatINR(totalSpentInMonth - prevMonthSpent)})
            </span>
          </div>
        </div>
      </div>

      {/* 3. Category Budgets Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif text-lg font-bold text-[#17251F]">
            Category Expenditure Ceilings
          </h3>
          <span className="text-xs text-[#75847B]">
            {activeBudget ? Object.keys(activeBudget.categoryBudgets).length : 0} Allocated Envelopes
          </span>
        </div>

        {activeBudget && Object.keys(activeBudget.categoryBudgets).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(activeBudget.categoryBudgets).map(([category, limit]) => {
              const spent = categorySpendingMap[category] || 0
              const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0
              const isOver = pct >= 100
              const isCrit = pct >= 90 && pct < 100
              const isWarn = pct >= 75 && pct < 90

              return (
                <div
                  key={category}
                  className="bg-white rounded-2xl p-5 border border-[#A8BBAA]/30 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-[#F5F1E8] border border-[#A8BBAA]/30">
                          {getCategoryIcon(category)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-[#17251F]">{category}</h4>
                          <span className="text-[10px] text-[#75847B]">Verified Ledger Node</span>
                        </div>
                      </div>

                      {isOver ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-3 h-3 text-rose-600" /> Over Budget
                        </span>
                      ) : isCrit ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          <AlertTriangle className="w-3 h-3 text-amber-600" /> 90% Spent
                        </span>
                      ) : isWarn ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-800 border border-yellow-200">
                          <AlertTriangle className="w-3 h-3 text-yellow-600" /> 75% Approaching
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-600" /> Safe Pace
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline justify-between my-2 font-mono">
                      <div className="text-xl font-bold text-[#17251F]">
                        {formatINR(spent)}
                      </div>
                      <div className="text-xs text-[#75847B]">Cap: {formatINR(limit)}</div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#F5F1E8] h-2.5 rounded-full overflow-hidden my-2">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOver
                            ? 'bg-rose-600'
                            : isCrit
                            ? 'bg-amber-500'
                            : isWarn
                            ? 'bg-[#D6B66C]'
                            : 'bg-[#1D4938]'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#75847B] mt-1">
                      <span>{pct}% Consumed</span>
                      <span>{formatINR(Math.max(0, limit - spent))} Remaining</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-white border border-[#A8BBAA]/30 text-center">
            <Target className="w-8 h-8 text-[#A8BBAA] mx-auto mb-2" />
            <h4 className="text-sm font-bold text-[#17251F]">No Category Caps for {selectedMonth}</h4>
            <p className="text-xs text-[#75847B] max-w-sm mx-auto mt-1 mb-4">
              Configure spending limits on Food, Shopping, Transport, and other categories to activate real-time warnings.
            </p>
            <button
              onClick={() => {
                setEditingBudget(activeBudget)
                setIsBudgetModalOpen(true)
              }}
              className="px-4 py-2 rounded-xl bg-[#1D4938] text-[#D6B66C] text-xs font-semibold cursor-pointer"
            >
              Configure Category Budgets
            </button>
          </div>
        )}
      </div>

      {/* 4. Savings Goals Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#A8BBAA]/30 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#A8BBAA]/20 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#D6B66C]/20 border border-[#D6B66C]/30 text-[#B39243]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#17251F]">
                Strategic Savings Goals
              </h3>
              <p className="text-xs text-[#75847B]">
                Track capital accumulation towards target horizons in Supabase
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingGoal(null)
              setIsGoalModalOpen(true)
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1D4938] text-[#D6B66C] hover:bg-[#102820] text-xs font-semibold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Savings Goal</span>
          </button>
        </div>

        {savingsGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
            {savingsGoals.map(goal => {
              const progressPct = goal.targetAmount > 0
                ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
                : 0

              return (
                <div
                  key={goal.id}
                  className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#A8BBAA]/30 flex flex-col justify-between hover:border-[#1D4938]/40 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#1D4938]/10 text-[#1D4938]">
                        {goal.category || 'Wealth Creation'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingGoal(goal)
                            setIsGoalModalOpen(true)
                          }}
                          className="text-[#75847B] hover:text-[#17251F] text-xs"
                          title="Edit Goal"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDeleteGoal(goal.id)}
                          className="text-[#75847B] hover:text-rose-600 text-xs"
                          title="Delete Goal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-[#17251F] mb-1">{goal.name}</h4>
                    <div className="font-mono text-lg font-bold text-[#1D4938]">
                      {formatINR(goal.currentAmount)}{' '}
                      <span className="text-xs font-normal text-[#75847B]">
                        / {formatINR(goal.targetAmount)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-white h-2 rounded-full overflow-hidden my-2.5 border border-[#A8BBAA]/20">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${progressPct}%`,
                          backgroundColor: goal.color || '#1D4938'
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#75847B]">
                      <span className="font-semibold text-[#17251F]">{progressPct}% Achieved</span>
                      <span>Target: {goal.targetDate}</span>
                    </div>

                    {goal.notes && (
                      <p className="text-[11px] text-[#75847B] mt-2 italic line-clamp-1">
                        {goal.notes}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-[#75847B]">
            No savings goals established yet. Create a goal to track your wealth milestones.
          </div>
        )}
      </div>

      {/* 5. AI Budget Advisor (Gemini Powered) */}
      <div className="bg-gradient-to-br from-[#102820] to-[#16382C] text-white rounded-3xl p-6 sm:p-7 border border-[#D6B66C]/40 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1D4938] gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1D4938] to-[#2E755B] border border-[#D6B66C]/40 flex items-center justify-center text-[#D6B66C]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-white">
                  Gemini AI Budget Intelligence
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#D6B66C]/20 text-[#D6B66C] border border-[#D6B66C]/40">
                  Real Telemetry
                </span>
              </div>
              <p className="text-xs text-[#A8BBAA]">
                Detects overspending nodes and calculates targeted containment maneuvers
              </p>
            </div>
          </div>

          <button
            onClick={handleGenerateBudgetAI}
            disabled={isAiLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D6B66C] to-[#BC9948] hover:from-[#E5CA85] hover:to-[#D6B66C] text-[#102820] font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
            <span>{isAiLoading ? 'Synthesizing...' : 'Analyze Budget with AI'}</span>
          </button>
        </div>

        {aiError && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs">
            {aiError}
          </div>
        )}

        {aiBudgetInsights ? (
          <div className="mt-5 space-y-4">
            <div className="p-4 rounded-2xl bg-[#102820]/80 border border-[#1D4938]">
              <span className="text-[10px] uppercase font-bold text-[#D6B66C] block mb-1">
                Executive Synthesis
              </span>
              <p className="text-xs text-[#F5F1E8] leading-relaxed">
                {aiBudgetInsights.executiveSummary}
              </p>
              <div className="pt-2 mt-2 border-t border-[#1D4938]/80 text-[11px] text-[#A8BBAA] flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-[#D6B66C]" />
                <span>{aiBudgetInsights.historicalComparison}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Overspending Categories */}
              <div className="p-4 rounded-2xl bg-[#102820]/80 border border-[#1D4938]">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    Overspending Nodes Flagged
                  </h4>
                </div>
                {aiBudgetInsights.overspendingCategories.length > 0 ? (
                  <ul className="space-y-2 text-xs text-[#F5F1E8]">
                    {aiBudgetInsights.overspendingCategories.map((node, i) => (
                      <li key={i} className="p-2 rounded-xl bg-[#16382C]/60 border border-[#1D4938]">
                        <div className="flex items-center justify-between font-bold text-[#D6B66C] mb-0.5">
                          <span>{node.category}</span>
                          <span>{node.utilization.toFixed(0)}% Utilized</span>
                        </div>
                        <p className="text-[11px] text-[#A8BBAA]">{node.advice}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-[#A8BBAA]">All categories are within safe operational limits.</p>
                )}
              </div>

              {/* Tactical Recommendations */}
              <div className="p-4 rounded-2xl bg-[#102820]/80 border border-[#1D4938]">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[#D6B66C]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    Actionable Containment Tactics
                  </h4>
                </div>
                <ul className="space-y-1.5 text-xs text-[#F5F1E8]">
                  {aiBudgetInsights.stayWithinBudgetTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#D6B66C] font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                  {aiBudgetInsights.savingOpportunities.map((opp, i) => (
                    <li key={`opp-${i}`} className="flex items-start gap-2 text-emerald-200">
                      <span className="text-emerald-400 font-bold">✦</span>
                      <span>{opp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 p-5 rounded-2xl bg-[#102820]/50 border border-[#1D4938] text-center">
            <Cpu className="w-6 h-6 text-[#D6B66C] mx-auto mb-1.5 opacity-80" />
            <p className="text-xs text-[#A8BBAA]">
              Click &quot;Analyze Budget with AI&quot; to prompt Gemini to evaluate this month&apos;s burn pacing vs previous cycles.
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <BudgetModal
        key={editingBudget ? `budget-${editingBudget.id}` : `new-budget-${selectedMonth}`}
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        onSave={onSaveBudget}
        initialData={editingBudget}
        currentMonth={selectedMonth}
      />

      <SavingsGoalModal
        key={editingGoal ? `goal-${editingGoal.id}` : `new-goal-${isGoalModalOpen}`}
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={onSaveGoal}
        initialData={editingGoal}
      />
    </div>
  )
}
