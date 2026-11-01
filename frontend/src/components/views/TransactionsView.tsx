import React from 'react'
import type { Transaction } from '../../types/finance'
import { RecentTransactions } from '../dashboard/RecentTransactions'
import { formatINR } from '../../utils/formatters'
import {
  ArrowLeftRight,
  Plus,
  ShieldCheck,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

interface TransactionsViewProps {
  transactions: Transaction[]
  onDeleteTransaction: (id: string) => void
  onEditTransaction: (transaction: Transaction) => void
  onViewDetails: (transaction: Transaction) => void
  onOpenAddModal: () => void
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  onDeleteTransaction,
  onEditTransaction,
  onViewDetails,
  onOpenAddModal
}) => {
  // Pure calculations from transactions data
  const totalInflow = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalOutflow = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const netBalance = totalInflow - totalOutflow

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Fast Actions */}
      <div className="bg-white rounded-2xl p-6 border border-[#A8BBAA]/30 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#1D4938]/10 text-[#1D4938]">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-[#17251F]">
                Private Wealth Ledger & Records
              </h2>
              <p className="text-xs text-[#75847B]">
                Audited transaction activity, persistent local storage, and granular search filters
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#102820] to-[#1D4938] text-[#D6B66C] hover:text-white border border-[#D6B66C]/60 text-xs font-semibold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Transaction</span>
        </button>
      </div>

      {/* 3 Metric Summary Cards Derived Purely from Transactions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#A8BBAA]/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-semibold uppercase text-[#75847B]">
              Total Inflow (Income)
            </span>
            <div className="text-xl font-bold text-emerald-800 font-mono mt-0.5">
              +{formatINR(totalInflow)}
            </div>
            <span className="text-[10px] text-emerald-700 font-medium">
              {transactions.filter(t => t.type === 'income').length} credit events
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#A8BBAA]/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-semibold uppercase text-[#75847B]">
              Total Outflow (Expenses)
            </span>
            <div className="text-xl font-bold text-[#17251F] font-mono mt-0.5">
              -{formatINR(totalOutflow)}
            </div>
            <span className="text-[10px] text-[#75847B] font-medium">
              {transactions.filter(t => t.type === 'expense').length} debit entries
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#A8BBAA]/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-semibold uppercase text-[#75847B]">
              Net Surplus Margin
            </span>
            <div className="text-xl font-bold font-mono mt-0.5"
              style={{ color: netBalance >= 0 ? '#1D4938' : '#E05A47' }}
            >
              {netBalance >= 0 ? `+${formatINR(netBalance)}` : formatINR(netBalance)}
            </div>
            <span className="text-[10px] text-[#1D4938] font-medium">
              Income minus Expenses
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#D6B66C]/20 text-[#96762B]">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Ledger Table with full view */}
      <RecentTransactions
        transactions={transactions}
        onDeleteTransaction={onDeleteTransaction}
        onEditTransaction={onEditTransaction}
        onViewDetails={onViewDetails}
        onOpenAddModal={onOpenAddModal}
        isFullView={true}
      />
    </div>
  )
}
