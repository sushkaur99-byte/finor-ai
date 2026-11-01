import React from 'react'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import type { FinancialSummary } from '../../types/finance'
import { formatINR } from '../../utils/formatters'

interface SummaryCardsProps {
  summary: FinancialSummary
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  const cards = [
    {
      title: 'Total Balance',
      amount: summary.totalBalance,
      change: `+${summary.balanceGrowth}%`,
      isPositive: true,
      comparison: 'vs ₹16.15L last month',
      icon: Wallet,
      accentColor: 'from-[#1D4938] to-[#102820]',
      iconBg: 'bg-[#1D4938]/10 text-[#1D4938]',
      borderHighlight: 'border-l-4 border-l-[#1D4938]',
      tag: 'Liquid & Investments'
    },
    {
      title: 'Total Income',
      amount: summary.totalIncome,
      change: `+${summary.incomeGrowth}%`,
      isPositive: true,
      comparison: 'vs ₹3.55L last month',
      icon: TrendingUp,
      accentColor: 'from-[#1D4938] to-[#2E755B]',
      iconBg: 'bg-emerald-500/10 text-emerald-700',
      borderHighlight: 'border-l-4 border-l-emerald-600',
      tag: 'Monthly Inflow'
    },
    {
      title: 'Total Expenses',
      amount: summary.totalExpenses,
      change: `${summary.expensesGrowth}%`,
      isPositive: true, // Lower expenses is positive for wealth!
      comparison: 'vs ₹1.48L last month',
      icon: TrendingDown,
      accentColor: 'from-[#75847B] to-[#17251F]',
      iconBg: 'bg-amber-500/10 text-amber-700',
      borderHighlight: 'border-l-4 border-l-[#D6B66C]',
      tag: 'Controlled Burn'
    },
    {
      title: 'Total Savings',
      amount: summary.totalSavings,
      change: `+${summary.savingsGrowth}%`,
      isPositive: true,
      comparison: `${summary.savingsRate}% net savings rate`,
      icon: PiggyBank,
      accentColor: 'from-[#D6B66C] to-[#B39243]',
      iconBg: 'bg-[#D6B66C]/20 text-[#96762B]',
      borderHighlight: 'border-l-4 border-l-[#D6B66C]',
      tag: 'Wealth Velocity'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card, idx) => {
        const Icon = card.icon
        return (
          <div
            key={idx}
            className={`relative bg-white rounded-2xl p-5 border border-[#A8BBAA]/30 shadow-xs hover:shadow-lg transition-all duration-300 group overflow-hidden ${card.borderHighlight}`}
          >
            {/* Subtle top-right champagne gold accent gradient */}
            <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-[#D6B66C]/10 via-[#1D4938]/5 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />

            <div className="flex items-center justify-between mb-3 relative z-10">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#75847B]">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.iconBg} group-hover:scale-110 transition-transform duration-200 shadow-xs`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            {/* Financial Value */}
            <div className="relative z-10 my-1">
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#17251F]">
                {formatINR(card.amount)}
              </h3>
            </div>

            {/* Percentage Change and Comparison */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#A8BBAA]/20 text-xs relative z-10">
              <div
                className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full ${
                  card.isPositive
                    ? 'text-emerald-800 bg-emerald-50 border border-emerald-200'
                    : 'text-amber-800 bg-amber-50 border border-amber-200'
                }`}
              >
                {card.isPositive ? (
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-700" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 text-amber-700" />
                )}
                <span>{card.change}</span>
              </div>
              <span className="text-[11px] text-[#75847B] font-medium truncate ml-2">
                {card.comparison}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
