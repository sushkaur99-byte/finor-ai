import React, { useState } from 'react'
import {
  X,
  Plus,
  TrendingUp,
  TrendingDown,
  Sparkles,
  CreditCard,
  Calendar,
  Tag
} from 'lucide-react'
import type { Transaction, TransactionType, TransactionCategory } from '../../types/finance'

interface AddTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void
}

const CATEGORIES: TransactionCategory[] = [
  'Housing',
  'Investments',
  'Lifestyle',
  'Dining',
  'Technology',
  'Healthcare',
  'Salary',
  'Dividends',
  'Advisory',
  'Transport',
  'Other'
]

const PAYMENT_METHODS = [
  'HDFC Infinia Metal',
  'ICICI Wealth NetBanking',
  'Axis Burgundy Wire',
  'UPI AutoPay',
  'Direct RBI Credit',
  'Corporate Card',
  'Cash'
]

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction
}) => {
  const [type, setType] = useState<TransactionType>('expense')
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<TransactionCategory>('Dining')
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0])
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Please provide a transaction or merchant title')
      return
    }

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than ₹0')
      return
    }

    onAddTransaction({
      title: title.trim(),
      amount: numAmount,
      type,
      category,
      paymentMethod,
      date: date || new Date().toISOString().slice(0, 10),
      description: description.trim() || undefined,
      aiCategorized: true,
      status: 'completed'
    })

    // Reset and close
    setTitle('')
    setAmount('')
    setDescription('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#102820]/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#D6B66C]/40 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#102820] to-[#1D4938] px-6 py-5 text-white flex items-center justify-between border-b border-[#D6B66C]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D6B66C]/20 border border-[#D6B66C]/40 flex items-center justify-center text-[#D6B66C]">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white tracking-wide">
                Record New Transaction
              </h3>
              <p className="text-[11px] text-[#A8BBAA]">
                Post a verified entry into your private wealth ledger
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#A8BBAA] hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {error}
            </div>
          )}

          {/* Type Toggle: Inflow vs Outflow */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#75847B] mb-1.5">
              Transaction Flow
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[#F5F1E8] p-1 rounded-2xl border border-[#A8BBAA]/30">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
                  type === 'expense'
                    ? 'bg-[#102820] text-[#D6B66C] shadow-md'
                    : 'text-[#75847B] hover:text-[#17251F]'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Expense (Outflow)</span>
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
                  type === 'income'
                    ? 'bg-[#1D4938] text-white shadow-md'
                    : 'text-[#75847B] hover:text-[#17251F]'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Income (Inflow)</span>
              </button>
            </div>
          </div>

          {/* Title and Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#17251F] mb-1">
                Transaction / Merchant Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Taj Hotel, Sovereign Dividend"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#F5F1E8]/50 border border-[#A8BBAA]/40 text-[#17251F] focus:outline-hidden focus:border-[#1D4938] focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#17251F] mb-1">
                Amount (INR ₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#1D4938]">
                  ₹
                </span>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2 text-xs rounded-xl bg-[#F5F1E8]/50 border border-[#A8BBAA]/40 text-[#17251F] font-mono font-bold focus:outline-hidden focus:border-[#1D4938] focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#17251F] mb-1 flex items-center gap-1">
                <Tag className="w-3 h-3 text-[#1D4938]" /> Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as TransactionCategory)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#F5F1E8]/50 border border-[#A8BBAA]/40 text-[#17251F] focus:outline-hidden focus:border-[#1D4938] focus:bg-white transition-all"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#17251F] mb-1 flex items-center gap-1">
                <CreditCard className="w-3 h-3 text-[#1D4938]" /> Payment Instrument
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#F5F1E8]/50 border border-[#A8BBAA]/40 text-[#17251F] focus:outline-hidden focus:border-[#1D4938] focus:bg-white transition-all"
              >
                {PAYMENT_METHODS.map(pm => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#17251F] mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#1D4938]" /> Value Date
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#F5F1E8]/50 border border-[#A8BBAA]/40 text-[#17251F] focus:outline-hidden focus:border-[#1D4938] focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#17251F] mb-1">
                Description / Memo
              </label>
              <input
                type="text"
                placeholder="Optional notes or reference ID"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#F5F1E8]/50 border border-[#A8BBAA]/40 text-[#17251F] focus:outline-hidden focus:border-[#1D4938] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* AI Auto-Categorize Badge */}
          <div className="p-2.5 rounded-xl bg-[#1D4938]/10 border border-[#1D4938]/20 flex items-center justify-between text-xs text-[#1D4938]">
            <div className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#D6B66C]" />
              <span>AI Smart Reconcile & Category Tagging</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-[#1D4938] bg-white px-2 py-0.5 rounded-md shadow-xs">
              Active
            </span>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-[#A8BBAA]/20 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#75847B] hover:bg-[#F5F1E8] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#102820] to-[#1D4938] text-[#D6B66C] hover:text-white border border-[#D6B66C]/60 text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer"
            >
              Record & Reconcile
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
