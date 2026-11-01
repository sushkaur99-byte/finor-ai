import React, { useMemo } from 'react'
import type {
  MonthlyCashflow,
  CategoryBreakdownItem,
  SpendingTrendPoint,
  SavingsGrowthPoint,
  Transaction
} from '../../types/finance'
import { IncomeExpenseChart } from '../dashboard/IncomeExpenseChart'
import { ExpenseDonutChart } from '../dashboard/ExpenseDonutChart'
import { SpendingTrendChart } from '../dashboard/SpendingTrendChart'
import { SavingsGrowthChart } from '../dashboard/SavingsGrowthChart'
import { formatINR, formatDate } from '../../utils/formatters'
import {
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Layers,
  Award,
  DollarSign
} from 'lucide-react'

interface AnalyticsViewProps {
  monthlyData: MonthlyCashflow[]
  categoryData: CategoryBreakdownItem[]
  spendingTrends: SpendingTrendPoint[]
  savingsGrowth: SavingsGrowthPoint[]
  transactions?: Transaction[]
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  monthlyData,
  categoryData,
  spendingTrends,
  savingsGrowth,
  transactions = []
}) => {
  // 1. Calculate Real Dynamic Statistics from Transactions
  const expenseTransactions = useMemo(() => {
    return transactions.filter(t => t.type === 'expense')
  }, [transactions])

  const incomeTransactions = useMemo(() => {
    return transactions.filter(t => t.type === 'income')
  }, [transactions])

  const totalIncome = useMemo(() => {
    return incomeTransactions.reduce((sum, t) => sum + t.amount, 0)
  }, [incomeTransactions])

  const totalExpense = useMemo(() => {
    return expenseTransactions.reduce((sum, t) => sum + t.amount, 0)
  }, [expenseTransactions])

  const savingsRate = useMemo(() => {
    if (totalIncome <= 0) return 0
    const net = totalIncome - totalExpense
    return Math.max(0, Math.round((net / totalIncome) * 100))
  }, [totalIncome, totalExpense])

  // 2. Top Five Expense Categories
  const topFiveCategories = useMemo(() => {
    return [...categoryData]
      .filter(c => c.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
  }, [categoryData])

  // 3. Highest Individual Expenses
  const highestIndividualExpenses = useMemo(() => {
    return [...expenseTransactions]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6)
  }, [expenseTransactions])

  // 4. Weekly Spending Breakdown (Grouped by Day of Week: Mon-Sun)
  const weeklyPatterns = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const totals: Record<string, number> = {
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
      Sun: 0
    }

    expenseTransactions.forEach(t => {
      if (!t.date) return
      const d = new Date(t.date)
      const dayName = days[d.getDay()] || 'Mon'
      totals[dayName] = (totals[dayName] || 0) + t.amount
    })

    const maxVal = Math.max(...Object.values(totals), 1)

    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
      day,
      amount: totals[day] || 0,
      pctOfMax: Math.round(((totals[day] || 0) / maxVal) * 100)
    }))
  }, [expenseTransactions])

  // 5. Month-over-Month Comparison
  const monthOverMonth = useMemo(() => {
    if (monthlyData.length < 2) return null
    const current = monthlyData[monthlyData.length - 1]
    const previous = monthlyData[monthlyData.length - 2]
    const expDiff = current.expenses - previous.expenses
    const expDiffPct = previous.expenses > 0 ? (expDiff / previous.expenses) * 100 : 0
    const incDiff = current.income - previous.income
    const incDiffPct = previous.income > 0 ? (incDiff / previous.income) * 100 : 0

    return {
      currentMonth: current.month,
      previousMonth: previous.month,
      currentExpenses: current.expenses,
      previousExpenses: previous.expenses,
      expDiff,
      expDiffPct,
      currentIncome: current.income,
      previousIncome: previous.income,
      incDiff,
      incDiffPct
    }
  }, [monthlyData])

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="bg-white rounded-3xl p-6 border border-[#A8BBAA]/30 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#1D4938]/10 text-[#1D4938] border border-[#1D4938]/20">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#17251F]">
              Quantitative Financial Analytics
            </h2>
            <p className="text-xs text-[#75847B]">
              Rigorous transaction telemetry, weekly outflow rhythms, and category concentrations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#F5F1E8] px-3.5 py-2 rounded-xl border border-[#A8BBAA]/30 text-xs font-semibold text-[#1D4938]">
          <Activity className="w-4 h-4 text-emerald-600" />
          <span>Real-time Ledger Telemetry Active</span>
        </div>
      </div>

      {/* KPI Ratios - Calculated Directly from Actual Transactions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#A8BBAA]/30 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#75847B]">
            Net Savings Rate
          </span>
          <div className="text-2xl font-bold text-emerald-800 font-mono mt-1">
            {savingsRate}%
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">
            ✦ {totalIncome > totalExpense ? 'Positive capital retention' : 'Outflows exceed income'}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#A8BBAA]/30 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#75847B]">
            Total Inflow Recorded
          </span>
          <div className="text-2xl font-bold text-[#17251F] font-mono mt-1">
            {formatINR(totalIncome)}
          </div>
          <span className="text-[11px] text-[#75847B] font-medium">
            {incomeTransactions.length} verified deposits
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#A8BBAA]/30 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#75847B]">
            Total Outflows Recorded
          </span>
          <div className="text-2xl font-bold text-[#1D4938] font-mono mt-1">
            {formatINR(totalExpense)}
          </div>
          <span className="text-[11px] text-[#1D4938] font-medium">
            {expenseTransactions.length} tracked payments
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#A8BBAA]/30 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#75847B]">
            Cumulative Capital Surplus
          </span>
          <div className="text-2xl font-bold text-[#D6B66C] font-mono mt-1">
            {formatINR(totalIncome - totalExpense)}
          </div>
          <span className="text-[11px] text-[#96762B] font-medium">
            Net investable cushion
          </span>
        </div>
      </div>

      {/* Primary Analytics Charts Row: Monthly Income vs Expenses & Category Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <IncomeExpenseChart data={monthlyData} />
        </div>
        <div className="lg:col-span-1">
          <ExpenseDonutChart data={categoryData} />
        </div>
      </div>

      {/* Secondary Charts Row: Spending Trends & Savings Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingTrendChart data={spendingTrends} />
        <SavingsGrowthChart data={savingsGrowth} />
      </div>

      {/* Weekly Spending Rhythm & Top 5 Expense Categories Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Spending Patterns */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#A8BBAA]/30 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#A8BBAA]/20 mb-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#17251F]">
                Weekly Spending Patterns
              </h3>
              <p className="text-xs text-[#75847B]">
                Aggregate capital outflow velocity indexed by day of week
              </p>
            </div>
            <Calendar className="w-5 h-5 text-[#1D4938]" />
          </div>

          <div className="grid grid-cols-7 gap-2 pt-2">
            {weeklyPatterns.map(w => (
              <div key={w.day} className="flex flex-col items-center">
                <div className="h-32 w-full bg-[#F5F1E8] rounded-xl relative flex items-end p-1 overflow-hidden">
                  <div
                    className="w-full bg-gradient-to-t from-[#102820] to-[#1D4938] rounded-lg transition-all duration-500"
                    style={{ height: `${Math.max(8, w.pctOfMax)}%` }}
                    title={`${w.day}: ${formatINR(w.amount)}`}
                  />
                </div>
                <span className="text-xs font-bold text-[#17251F] mt-2">{w.day}</span>
                <span className="text-[10px] text-[#75847B] font-mono mt-0.5 truncate max-w-full">
                  {w.amount > 0 ? `₹${(w.amount / 1000).toFixed(0)}k` : '₹0'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Expense Categories */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#A8BBAA]/30 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#A8BBAA]/20 mb-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#17251F]">
                Top 5 Expense Categories
              </h3>
              <p className="text-xs text-[#75847B]">
                Dominant capital outflow concentrations in your ledger
              </p>
            </div>
            <Award className="w-5 h-5 text-[#D6B66C]" />
          </div>

          <div className="space-y-3.5">
            {topFiveCategories.map((cat, idx) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-[#F5F1E8] border border-[#A8BBAA]/30 text-xs font-bold text-[#1D4938] flex items-center justify-center">
                    0{idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-[#17251F]">{cat.name}</h4>
                    <span className="text-[10px] text-[#75847B]">{cat.count} transactions</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-[#17251F]">
                    {formatINR(cat.amount)}
                  </div>
                  <div className="text-[10px] text-[#D6B66C] font-semibold">
                    {cat.percentage}% of expenses
                  </div>
                </div>
              </div>
            ))}

            {topFiveCategories.length === 0 && (
              <div className="text-center py-6 text-xs text-[#75847B]">
                No expense transactions recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Month-over-Month Comparison & Highest Individual Expenses Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Month-over-Month Comparisons */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#A8BBAA]/30 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#A8BBAA]/20 mb-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#17251F]">
                Month-over-Month Comparisons
              </h3>
              <p className="text-xs text-[#75847B]">
                Telemetry variances between adjacent financial cycles
              </p>
            </div>
            <Layers className="w-5 h-5 text-[#1D4938]" />
          </div>

          {monthOverMonth ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#A8BBAA]/30">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#75847B] font-semibold uppercase tracking-wider text-[10px]">
                    Expenditure Variance
                  </span>
                  <span className="text-xs font-bold text-[#17251F]">
                    {monthOverMonth.previousMonth} → {monthOverMonth.currentMonth}
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <div className="text-lg font-serif font-bold text-[#17251F]">
                    {formatINR(monthOverMonth.currentExpenses)}
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-bold ${
                    monthOverMonth.expDiff <= 0 ? 'text-emerald-700' : 'text-rose-700'
                  }`}>
                    {monthOverMonth.expDiff <= 0 ? (
                      <ArrowDownRight className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                    <span>
                      {monthOverMonth.expDiff >= 0 ? '+' : ''}{monthOverMonth.expDiffPct.toFixed(1)}% ({formatINR(monthOverMonth.expDiff)})
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#A8BBAA]/30">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#75847B] font-semibold uppercase tracking-wider text-[10px]">
                    Income Variance
                  </span>
                  <span className="text-xs font-bold text-[#17251F]">
                    {monthOverMonth.previousMonth} → {monthOverMonth.currentMonth}
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <div className="text-lg font-serif font-bold text-[#17251F]">
                    {formatINR(monthOverMonth.currentIncome)}
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-bold ${
                    monthOverMonth.incDiff >= 0 ? 'text-emerald-700' : 'text-amber-700'
                  }`}>
                    {monthOverMonth.incDiff >= 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    <span>
                      {monthOverMonth.incDiff >= 0 ? '+' : ''}{monthOverMonth.incDiffPct.toFixed(1)}% ({formatINR(monthOverMonth.incDiff)})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-[#75847B]">
              At least two months of transaction data are required for comparative telemetry.
            </div>
          )}
        </div>

        {/* Highest Individual Expenses */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#A8BBAA]/30 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#A8BBAA]/20 mb-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#17251F]">
                Highest Individual Expenses
              </h3>
              <p className="text-xs text-[#75847B]">
                Peak transaction outflows recorded in your Supabase ledger
              </p>
            </div>
            <DollarSign className="w-5 h-5 text-[#1D4938]" />
          </div>

          <div className="divide-y divide-[#A8BBAA]/15">
            {highestIndividualExpenses.map(tx => (
              <div key={tx.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#17251F]">{tx.title}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-[#75847B]">
                    <span>{tx.category}</span>
                    <span>•</span>
                    <span>{formatDate(tx.date)}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-rose-700">
                    -{formatINR(tx.amount)}
                  </span>
                  <div className="text-[10px] text-[#75847B]">{tx.paymentMethod}</div>
                </div>
              </div>
            ))}

            {highestIndividualExpenses.length === 0 && (
              <div className="text-center py-6 text-xs text-[#75847B]">
                No expenses logged yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
