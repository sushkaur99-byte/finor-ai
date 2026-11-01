import React, { useState } from 'react'
import {
  X,
  Plus,
  Edit3,
  TrendingUp,
  TrendingDown,
  Sparkles,
  CreditCard,
  Calendar,
  Tag,
  FileText,
  Loader2,
  Check,
  AlertCircle
} from 'lucide-react'
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  type Transaction,
  type TransactionType,
  type TransactionCategory
} from '../../types/finance'
import {
  suggestTransactionCategory,
  type AICategorySuggestion
} from '../../services/aiService'

interface TransactionFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (transactionData: Omit<Transaction, 'id'>, id?: string) => void
  initialData?: Transaction | null
}

const PAYMENT_METHODS = [
  'HDFC Infinia Metal',
  'ICICI Wealth NetBanking',
  'Axis Burgundy Wire',
  'UPI AutoPay',
  'Direct Credit RBI',
  'Corporate Card',
  'Cash'
]

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData
}) => {
  const isEditing = Boolean(initialData)

  const [type, setType] = useState<TransactionType>(() => initialData?.type || 'expense')
  const [title, setTitle] = useState(() => initialData?.title || '')
  const [amount, setAmount] = useState(() => (initialData ? initialData.amount.toString() : ''))
  const [category, setCategory] = useState<TransactionCategory>(
    () => initialData?.category || EXPENSE_CATEGORIES[0]
  )
  const [paymentMethod, setPaymentMethod] = useState(
    () => initialData?.paymentMethod || PAYMENT_METHODS[0]
  )
  const [date, setDate] = useState(
    () => initialData?.date || new Date().toISOString().slice(0, 10)
  )
  const [description, setDescription] = useState(() => initialData?.description || '')
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // AI Suggestion State
  const [isSuggestingCategory, setIsSuggestingCategory] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState<AICategorySuggestion | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [wasAiCategorized, setWasAiCategorized] = useState(() => Boolean(initialData?.aiCategorized))

  // Automatically adjust default category when type toggles
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType)
    setAiSuggestion(null)
    setAiError(null)
    if (newType === 'expense') {
      if (!EXPENSE_CATEGORIES.includes(category as (typeof EXPENSE_CATEGORIES)[number])) {
        setCategory(EXPENSE_CATEGORIES[0])
      }
    } else {
      if (!INCOME_CATEGORIES.includes(category as (typeof INCOME_CATEGORIES)[number])) {
        setCategory(INCOME_CATEGORIES[0])
      }
    }
  }

  const handleSuggestCategory = async () => {
    if (!title.trim()) {
      setErrors(prev => ({ ...prev, title: 'Enter a title first to get AI category suggestion.' }))
      return
    }

    setIsSuggestingCategory(true)
    setAiError(null)
    setAiSuggestion(null)

    const result = await suggestTransactionCategory(title.trim(), description.trim(), type)

    setIsSuggestingCategory(false)

    if (result.error) {
      setAiError(result.error.message)
    } else if (result.data) {
      setAiSuggestion(result.data)
    }
  }

  const handleApplyAiSuggestion = () => {
    if (!aiSuggestion) return
    setCategory(aiSuggestion.category as TransactionCategory)
    setWasAiCategorized(true)
    setAiSuggestion(null)
  }

  if (!isOpen) return null

  const validate = () => {
    const errs: { [key: string]: string } = {}

    if (!title.trim()) {
      errs.title = 'Transaction title is required.'
    }

    const numAmount = parseFloat(amount)
    if (!amount || isNaN(numAmount)) {
      errs.amount = 'Amount is required.'
    } else if (numAmount <= 0) {
      errs.amount = 'Amount must be greater than ₹0.'
    }

    if (!date) {
      errs.date = 'Date is required.'
    }

    if (!category) {
      errs.category = 'Please select a valid category.'
    }

    if (!paymentMethod) {
      errs.paymentMethod = 'Please choose a payment method.'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    const numAmount = parseFloat(amount)

    onSubmit(
      {
        title: title.trim(),
        amount: numAmount,
        type,
        category,
        paymentMethod,
        date,
        description: description.trim() || undefined,
        aiCategorized: wasAiCategorized,
        status: initialData ? initialData.status : 'completed'
      },
      initialData?.id
    )

    onClose()
  }

  const availableCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#102820]/80 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#D6B66C]/40 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#102820] to-[#1D4938] px-6 py-5 text-white flex items-center justify-between border-b border-[#D6B66C]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#D6B66C]/20 border border-[#D6B66C]/40 flex items-center justify-center text-[#D6B66C]">
              {isEditing ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white tracking-wide">
                {isEditing ? 'Edit Transaction' : 'Record New Transaction'}
              </h3>
              <p className="text-[11px] text-[#A8BBAA]">
                {isEditing
                  ? 'Update verified record in your private wealth ledger'
                  : 'Post a verified entry into your private wealth ledger'}
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
          {/* Flow Segment: Income vs Expense */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#75847B] mb-1.5">
              Transaction Flow *
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[#F5F1E8] p-1 rounded-2xl border border-[#A8BBAA]/30">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
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
                onClick={() => handleTypeChange('income')}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#17251F] mb-1">
                Transaction Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Swiggy Gourmet, Dividend"
                value={title}
                onChange={e => {
                  setTitle(e.target.value)
                  if (errors.title) setErrors(prev => ({ ...prev, title: '' }))
                }}
                className={`w-full px-3.5 py-2 text-xs rounded-xl bg-[#F5F1E8]/50 border ${
                  errors.title ? 'border-rose-500 bg-rose-50/30' : 'border-[#A8BBAA]/40'
                } text-[#17251F] focus:outline-hidden focus:border-[#1D4938] focus:bg-white transition-all`}
              />
              {errors.title && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.title}</p>
              )}
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
                  placeholder="0.00"
                  value={amount}
                  onChange={e => {
                    setAmount(e.target.value)
                    if (errors.amount) setErrors(prev => ({ ...prev, amount: '' }))
                  }}
                  className={`w-full pl-8 pr-3.5 py-2 text-xs rounded-xl bg-[#F5F1E8]/50 border ${
                    errors.amount ? 'border-rose-500 bg-rose-50/30' : 'border-[#A8BBAA]/40'
                  } text-[#17251F] font-mono font-bold focus:outline-hidden focus:border-[#1D4938] focus:bg-white transition-all`}
                />
              </div>
              {errors.amount && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.amount}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#17251F] mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-[#1D4938]" /> Description / Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Dinner with clients at Taj Palace, monthly subscription"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#F5F1E8]/50 border border-[#A8BBAA]/40 text-[#17251F] focus:outline-hidden focus:border-[#1D4938] focus:bg-white transition-all"
            />
          </div>

          {/* AI Suggest Category Action Button */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[#75847B]">
              Need help selecting the best category?
            </span>
            <button
              type="button"
              onClick={handleSuggestCategory}
              disabled={isSuggestingCategory || !title.trim()}
              className="px-3 py-1.5 rounded-xl bg-[#1D4938]/10 hover:bg-[#1D4938]/20 border border-[#1D4938]/30 text-[#1D4938] text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSuggestingCategory ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D6B66C]" />
                  <span>Consulting Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#D6B66C]" />
                  <span>Suggest Category with AI</span>
                </>
              )}
            </button>
          </div>

          {/* AI Suggestion Banner / Result */}
          {aiSuggestion && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#102820] to-[#1D4938] text-white border border-[#D6B66C]/40 shadow-sm animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#D6B66C]/20 border border-[#D6B66C]/30 flex items-center justify-center text-[#D6B66C]">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#D6B66C]">
                      Gemini Recommendation
                    </span>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      Suggested Category: <span className="underline decoration-[#D6B66C]">{aiSuggestion.category}</span>
                    </h4>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleApplyAiSuggestion}
                  className="px-3 py-1 rounded-lg bg-[#D6B66C] text-[#102820] text-xs font-bold hover:bg-white flex items-center gap-1 transition-all shadow-xs cursor-pointer shrink-0"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Accept</span>
                </button>
              </div>
              {aiSuggestion.explanation && (
                <p className="text-[11px] text-[#A8BBAA] mt-2 leading-relaxed pl-8">
                  {aiSuggestion.explanation}
                </p>
              )}
            </div>
          )}

          {/* AI Error Notification */}
          {aiError && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="flex-1">{aiError}</span>
              <button
                type="button"
                onClick={() => setAiError(null)}
                className="text-[10px] text-amber-700 underline font-semibold hover:text-amber-900 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Category & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#17251F] mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-[#1D4938]" /> Category *
                </span>
                {wasAiCategorized && (
                  <span className="text-[10px] font-bold text-[#1D4938] bg-[#D6B66C]/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-[#D6B66C]" /> AI Verified
                  </span>
                )}
              </label>
              <select
                value={category}
                onChange={e => {
                  setCategory(e.target.value as TransactionCategory)
                  setWasAiCategorized(false)
                }}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#F5F1E8]/50 border border-[#A8BBAA]/40 text-[#17251F] focus:outline-hidden focus:border-[#1D4938] focus:bg-white transition-all cursor-pointer"
              >
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17251F] mb-1 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-[#1D4938]" /> Payment Instrument *
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#F5F1E8]/50 border border-[#A8BBAA]/40 text-[#17251F] focus:outline-hidden focus:border-[#1D4938] focus:bg-white transition-all cursor-pointer"
              >
                {PAYMENT_METHODS.map(pm => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-[#17251F] mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#1D4938]" /> Transaction Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={e => {
                setDate(e.target.value)
                if (errors.date) setErrors(prev => ({ ...prev, date: '' }))
              }}
              className={`w-full px-3.5 py-2 text-xs rounded-xl bg-[#F5F1E8]/50 border ${
                errors.date ? 'border-rose-500 bg-rose-50/30' : 'border-[#A8BBAA]/40'
              } text-[#17251F] focus:outline-hidden focus:border-[#1D4938] focus:bg-white transition-all`}
            />
            {errors.date && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.date}</p>
            )}
          </div>

          {/* AI Smart Categorization Notice */}
          <div className="p-3 rounded-xl bg-[#1D4938]/10 border border-[#1D4938]/20 flex items-center justify-between text-xs text-[#1D4938]">
            <div className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#D6B66C]" />
              <span>Smart Ledger Reconcile & Audit Verification</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-[#1D4938] bg-white px-2 py-0.5 rounded-md shadow-xs">
              Active
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#A8BBAA]/20 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#75847B] hover:bg-[#F5F1E8] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#102820] to-[#1D4938] text-[#D6B66C] hover:text-white border border-[#D6B66C]/60 text-xs font-semibold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              {isEditing ? 'Save Changes' : 'Record Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
