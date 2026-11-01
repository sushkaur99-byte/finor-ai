import React, { useState, useMemo } from 'react'
import {
  Building2,
  TrendingUp,
  ShoppingBag,
  Coffee,
  HeartPulse,
  Briefcase,
  CreditCard,
  GraduationCap,
  Zap,
  Car,
  Tv,
  Search,
  Download,
  Filter,
  Trash2,
  Edit3,
  Eye,
  Plus,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Inbox,
  RotateCcw
} from 'lucide-react'
import type { Transaction } from '../../types/finance'
import { formatINR, formatDate, exportTransactionsToCSV } from '../../utils/formatters'

interface RecentTransactionsProps {
  transactions: Transaction[]
  onDeleteTransaction: (id: string) => void
  onEditTransaction?: (transaction: Transaction) => void
  onViewDetails?: (transaction: Transaction) => void
  onOpenAddModal?: () => void
  onViewAll?: () => void
  isFullView?: boolean
}

// Helper to calculate date presets outside component render scope
function getDateRangeForPreset(preset: 'all' | 'this_month' | 'last_30_days' | 'this_year'): { start: string; end: string } {
  if (preset === 'all') return { start: '', end: '' }
  const now = new Date()
  if (preset === 'this_month') {
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate()
    return { start: `${year}-${month}-01`, end: `${year}-${month}-${lastDay}` }
  }
  if (preset === 'last_30_days') {
    const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    return { start: past30.toISOString().slice(0, 10), end: now.toISOString().slice(0, 10) }
  }
  if (preset === 'this_year') {
    const year = now.getFullYear()
    return { start: `${year}-01-01`, end: `${year}-12-31` }
  }
  return { start: '', end: '' }
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  onDeleteTransaction,
  onEditTransaction,
  onViewDetails,
  onOpenAddModal,
  onViewAll,
  isFullView = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all')
  const [searchFilter, setSearchFilter] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [datePreset, setDatePreset] = useState<'all' | 'this_month' | 'last_30_days' | 'this_year'>('all')

  // Category Icon Resolver
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Housing':
        return <Building2 className="w-4 h-4 text-[#1D4938]" />
      case 'Investment':
        return <TrendingUp className="w-4 h-4 text-emerald-700" />
      case 'Food':
        return <Coffee className="w-4 h-4 text-[#D6B66C]" />
      case 'Shopping':
        return <ShoppingBag className="w-4 h-4 text-[#96762B]" />
      case 'Transport':
        return <Car className="w-4 h-4 text-[#265F4A]" />
      case 'Bills & Utilities':
        return <Zap className="w-4 h-4 text-[#B39243]" />
      case 'Entertainment':
        return <Tv className="w-4 h-4 text-indigo-700" />
      case 'Healthcare':
        return <HeartPulse className="w-4 h-4 text-rose-700" />
      case 'Education':
        return <GraduationCap className="w-4 h-4 text-teal-800" />
      case 'Salary':
      case 'Business':
      case 'Freelance':
        return <Briefcase className="w-4 h-4 text-[#102820]" />
      default:
        return <CreditCard className="w-4 h-4 text-[#75847B]" />
    }
  }

  // Predefined Categories for Quick Filter Pills
  const categories = [
    'All',
    'Food',
    'Housing',
    'Investment',
    'Bills & Utilities',
    'Shopping',
    'Transport',
    'Entertainment',
    'Healthcare',
    'Education',
    'Salary',
    'Freelance',
    'Business',
    'Other'
  ]

  // Date Preset Handler
  const handleDatePreset = (preset: 'all' | 'this_month' | 'last_30_days' | 'this_year') => {
    setDatePreset(preset)
    const { start, end } = getDateRangeForPreset(preset)
    setStartDate(start)
    setEndDate(end)
  }

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const matchesCategory =
        selectedCategory === 'All' || t.category.toLowerCase() === selectedCategory.toLowerCase()
      const matchesType = selectedType === 'all' || t.type === selectedType
      const q = searchFilter.toLowerCase().trim()
      const matchesSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.paymentMethod.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))

      // Date Range Filter
      let matchesDate = true
      if (startDate && t.date < startDate) matchesDate = false
      if (endDate && t.date > endDate) matchesDate = false

      return matchesCategory && matchesType && matchesSearch && matchesDate
    })
  }, [transactions, selectedCategory, selectedType, searchFilter, startDate, endDate])

  const displayed = isFullView ? filtered : filtered.slice(0, 7)

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    selectedType !== 'all' ||
    Boolean(searchFilter) ||
    Boolean(startDate) ||
    Boolean(endDate)

  const handleResetFilters = () => {
    setSelectedCategory('All')
    setSelectedType('all')
    setSearchFilter('')
    setStartDate('')
    setEndDate('')
    setDatePreset('all')
  }

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#A8BBAA]/30 shadow-xs hover:shadow-md transition-shadow">
      {/* Table Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-[#A8BBAA]/20 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#17251F]">
              {isFullView ? 'Transaction Ledger & Management' : 'Recent Transactions'}
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1D4938]/10 text-[#1D4938] font-bold">
              {filtered.length} of {transactions.length} Records
            </span>
          </div>
          <p className="text-xs text-[#75847B] mt-0.5">
            Verified private ledger movements with persistent audit synchronization
          </p>
        </div>

        {/* Filter and Export Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#75847B]" />
            <input
              type="text"
              placeholder="Search title, category, ref..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#F5F1E8]/60 border border-[#A8BBAA]/40 text-[#17251F] placeholder-[#75847B] focus:outline-hidden focus:bg-white focus:border-[#1D4938] transition-all w-48 sm:w-56"
            />
          </div>

          {/* Type Segmented Control */}
          <div className="flex items-center bg-[#F5F1E8] p-0.5 rounded-xl border border-[#A8BBAA]/30 text-xs">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedType === 'all'
                  ? 'bg-white text-[#17251F] shadow-xs font-semibold'
                  : 'text-[#75847B] hover:text-[#17251F]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedType('income')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedType === 'income'
                  ? 'bg-[#1D4938] text-white shadow-xs font-semibold'
                  : 'text-[#75847B] hover:text-[#17251F]'
              }`}
            >
              Income
            </button>
            <button
              onClick={() => setSelectedType('expense')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedType === 'expense'
                  ? 'bg-[#102820] text-[#D6B66C] shadow-xs font-semibold'
                  : 'text-[#75847B] hover:text-[#17251F]'
              }`}
            >
              Expense
            </button>
          </div>

          {/* Export to CSV Button */}
          <button
            onClick={() => exportTransactionsToCSV(filtered)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#A8BBAA]/40 text-xs font-semibold text-[#17251F] hover:bg-[#F5F1E8] hover:border-[#1D4938] transition-all shadow-xs cursor-pointer"
            title="Download verified CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-[#1D4938]" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Quick Add Button if full view */}
          {isFullView && onOpenAddModal && (
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#102820] to-[#1D4938] text-[#D6B66C] hover:text-white border border-[#D6B66C]/60 text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Transaction</span>
            </button>
          )}
        </div>
      </div>

      {/* Date Filtering Bar */}
      <div className="py-2.5 border-b border-[#A8BBAA]/15 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-semibold text-[#75847B] flex items-center gap-1 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-[#1D4938]" /> Filter Date:
          </span>

          <div className="flex items-center gap-1 bg-[#F5F1E8] p-0.5 rounded-lg border border-[#A8BBAA]/30 text-[11px]">
            {(
              [
                { id: 'all', label: 'All Time' },
                { id: 'this_month', label: 'This Month' },
                { id: 'last_30_days', label: 'Last 30 Days' },
                { id: 'this_year', label: 'This Year' }
              ] as const
            ).map(p => (
              <button
                key={p.id}
                onClick={() => handleDatePreset(p.id)}
                className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                  datePreset === p.id
                    ? 'bg-[#102820] text-[#D6B66C] font-semibold shadow-2xs'
                    : 'text-[#75847B] hover:text-[#17251F]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Date Range Pickers */}
          <div className="flex items-center gap-1.5 text-xs">
            <input
              type="date"
              value={startDate}
              onChange={e => {
                setStartDate(e.target.value)
                setDatePreset('all')
              }}
              className="px-2 py-1 text-[11px] rounded-lg bg-[#F5F1E8]/70 border border-[#A8BBAA]/40 text-[#17251F] focus:outline-hidden focus:bg-white focus:border-[#1D4938]"
              title="Start Date"
            />
            <span className="text-[#75847B]">to</span>
            <input
              type="date"
              value={endDate}
              onChange={e => {
                setEndDate(e.target.value)
                setDatePreset('all')
              }}
              className="px-2 py-1 text-[11px] rounded-lg bg-[#F5F1E8]/70 border border-[#A8BBAA]/40 text-[#17251F] focus:outline-hidden focus:bg-white focus:border-[#1D4938]"
              title="End Date"
            />
          </div>
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 hover:text-rose-900 transition-colors ml-auto"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Horizontal Category Pill Scroll */}
      <div className="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar border-b border-[#A8BBAA]/10 text-xs">
        <span className="text-[11px] font-semibold text-[#75847B] flex items-center gap-1 shrink-0 mr-1">
          <Filter className="w-3 h-3 text-[#1D4938]" /> Category:
        </span>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#1D4938] text-white shadow-xs border border-[#1D4938]'
                : 'bg-[#F5F1E8]/70 text-[#75847B] hover:text-[#17251F] hover:bg-[#F5F1E8] border border-transparent'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#A8BBAA]/20 text-[11px] uppercase tracking-wider text-[#75847B] font-semibold">
              <th className="py-3 px-3">Transaction</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">Payment Method</th>
              <th className="py-3 px-3">Date</th>
              <th className="py-3 px-3 text-right">Amount (INR)</th>
              <th className="py-3 px-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#A8BBAA]/15 text-xs">
            {displayed.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#75847B]">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <div className="p-3.5 rounded-2xl bg-[#F5F1E8] text-[#75847B] mb-2.5 border border-[#A8BBAA]/20">
                      <Inbox className="w-7 h-7 text-[#1D4938]" />
                    </div>
                    <p className="font-semibold text-sm text-[#17251F]">
                      {transactions.length === 0 ? 'No Transactions Recorded Yet' : 'No Transactions Found'}
                    </p>
                    <p className="text-xs text-[#75847B] mt-1 leading-relaxed">
                      {transactions.length === 0
                        ? 'Your private ledger is pristine. Add your first income or expense entry to start tracking.'
                        : 'No ledger records match the active category, date range or search parameters.'}
                    </p>

                    <div className="flex items-center gap-2 mt-4">
                      {transactions.length === 0 ? (
                        onOpenAddModal && (
                          <button
                            onClick={onOpenAddModal}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#102820] to-[#1D4938] text-[#D6B66C] hover:text-white border border-[#D6B66C]/60 text-xs font-semibold shadow-md transition-all cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add Your First Transaction</span>
                          </button>
                        )
                      ) : (
                        <button
                          onClick={handleResetFilters}
                          className="px-3.5 py-1.5 rounded-xl bg-[#1D4938] text-white text-xs font-medium hover:bg-[#102820] transition-colors cursor-pointer"
                        >
                          Clear All Filters
                        </button>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              displayed.map(tx => {
                const isIncome = tx.type === 'income'
                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-[#FAF8F5] transition-colors duration-150 group cursor-pointer"
                    onClick={() => onViewDetails && onViewDetails(tx)}
                  >
                    {/* Title & Icon */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#F5F1E8] border border-[#A8BBAA]/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          {getCategoryIcon(tx.category)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-[#17251F] group-hover:text-[#1D4938] transition-colors">
                              {tx.title}
                            </span>
                            {tx.aiCategorized && (
                              <span
                                title="AI Verified & Smart Categorized"
                                className="inline-flex items-center p-0.5 rounded text-[10px] bg-[#D6B66C]/20 text-[#96762B]"
                              >
                                <Sparkles className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>
                          {tx.description && (
                            <p className="text-[11px] text-[#75847B] truncate max-w-xs mt-0.5">
                              {tx.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category Pill */}
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#F5F1E8] border border-[#A8BBAA]/30 text-[#17251F]">
                        {tx.category}
                      </span>
                    </td>

                    {/* Payment Method */}
                    <td className="py-3.5 px-3 text-[#75847B]">
                      <span className="text-[11px] font-medium text-[#17251F] block">
                        {tx.paymentMethod}
                      </span>
                      <span className="text-[10px] text-[#75847B]">
                        {tx.status === 'flagged' ? (
                          <span className="text-amber-700 font-semibold">Under AI Review</span>
                        ) : (
                          'Settled & Reconciled'
                        )}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-3 text-[#75847B] font-mono text-[11px]">
                      {formatDate(tx.date)}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1 font-mono font-bold text-sm">
                        {isIncome ? (
                          <span className="text-emerald-800 flex items-center">
                            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5 text-emerald-700 inline" />
                            +{formatINR(tx.amount)}
                          </span>
                        ) : (
                          <span className="text-[#17251F] flex items-center">
                            <ArrowDownRight className="w-3.5 h-3.5 mr-0.5 text-amber-700 inline" />
                            -{formatINR(tx.amount)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions: View, Edit, Delete */}
                    <td
                      className="py-3.5 px-3 text-center"
                      onClick={e => e.stopPropagation()} // Prevent row click when pressing buttons
                    >
                      <div className="flex items-center justify-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        {onViewDetails && (
                          <button
                            onClick={() => onViewDetails(tx)}
                            className="p-1.5 rounded-lg text-[#75847B] hover:text-[#1D4938] hover:bg-[#F5F1E8] transition-colors cursor-pointer"
                            title="View details"
                            aria-label="View transaction details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {onEditTransaction && (
                          <button
                            onClick={() => onEditTransaction(tx)}
                            className="p-1.5 rounded-lg text-[#75847B] hover:text-[#D6B66C] hover:bg-[#102820] transition-colors cursor-pointer"
                            title="Edit record"
                            aria-label="Edit transaction"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1.5 rounded-lg text-[#75847B] hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Remove record"
                          aria-label="Delete transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Navigation if previewing on Dashboard */}
      {!isFullView && onViewAll && transactions.length > 7 && (
        <div className="mt-4 pt-3 border-t border-[#A8BBAA]/20 flex items-center justify-between text-xs">
          <span className="text-[#75847B]">
            Displaying {displayed.length} of {transactions.length} portfolio entries
          </span>
          <button
            onClick={onViewAll}
            className="text-xs font-bold text-[#1D4938] hover:text-[#102820] hover:underline transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>View Complete Transaction Ledger</span>
            <span>→</span>
          </button>
        </div>
      )}
    </div>
  )
}
