import React, { useState } from 'react'
import { X, Calendar, DollarSign, Layers } from 'lucide-react'
import { EXPENSE_CATEGORIES, type MonthlyBudget } from '../../types/finance'

interface BudgetModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (budgetData: Omit<MonthlyBudget, 'id'>, id?: string) => void
  initialData?: MonthlyBudget | null
  currentMonth: string
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  currentMonth
}) => {
  const isEditing = Boolean(initialData)

  const [month, setMonth] = useState(() => initialData?.month || currentMonth)
  const [overallLimit, setOverallLimit] = useState(() =>
    initialData ? initialData.overallLimit.toString() : '150000'
  )
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    EXPENSE_CATEGORIES.forEach(cat => {
      const existing = initialData?.categoryBudgets?.[cat]
      map[cat] = existing ? existing.toString() : ''
    })
    return map
  })
  const [notes, setNotes] = useState(() => initialData?.notes || '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!isOpen) return null

  const handleCategoryChange = (cat: string, value: string) => {
    setCategoryBudgets(prev => ({ ...prev, [cat]: value }))
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!month) errs.month = 'Month is required.'

    const limitNum = parseFloat(overallLimit)
    if (!overallLimit || isNaN(limitNum) || limitNum <= 0) {
      errs.overallLimit = 'Overall spending ceiling must be greater than ₹0.'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const parsedCategoryBudgets: Record<string, number> = {}
    Object.entries(categoryBudgets).forEach(([cat, val]) => {
      const num = parseFloat(val)
      if (!isNaN(num) && num > 0) {
        parsedCategoryBudgets[cat] = num
      }
    })

    onSave(
      {
        month,
        overallLimit: parseFloat(overallLimit),
        categoryBudgets: parsedCategoryBudgets,
        notes: notes.trim() || undefined
      },
      initialData?.id
    )
    onClose()
  }

  const sumCategories = Object.values(categoryBudgets).reduce((sum, v) => {
    const n = parseFloat(v)
    return sum + (isNaN(n) ? 0 : n)
  }, 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-[#102820]/80 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#D6B66C]/40 z-10 overflow-hidden my-8">
        <div className="bg-gradient-to-r from-[#102820] to-[#1D4938] px-6 py-5 text-white flex items-center justify-between border-b border-[#D6B66C]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#D6B66C]/20 border border-[#D6B66C]/40 flex items-center justify-center text-[#D6B66C]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white tracking-wide">
                {isEditing ? 'Re-calibrate Monthly Envelope' : 'Configure Monthly Budget Envelope'}
              </h3>
              <p className="text-[11px] text-[#A8BBAA]">
                Establish aggregate and category ceilings for capital discipline
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-[#A8BBAA] hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#17251F] mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#1D4938]" /> Month (YYYY-MM) *
              </label>
              <input
                type="month"
                value={month}
                onChange={e => setMonth(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#F5F1E8]/50 border border-[#A8BBAA]/40 text-[#17251F] focus:outline-hidden focus:border-[#1D4938]"
              />
              {errors.month && <p className="text-[11px] text-rose-600 mt-1">{errors.month}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17251F] mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-[#1D4938]" /> Overall Monthly Cap (₹) *
              </label>
              <input
                type="number"
                step="any"
                placeholder="150000"
                value={overallLimit}
                onChange={e => setOverallLimit(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono font-bold rounded-xl bg-[#F5F1E8]/50 border border-[#A8BBAA]/40 text-[#17251F] focus:outline-hidden focus:border-[#1D4938]"
              />
              {errors.overallLimit && <p className="text-[11px] text-rose-600 mt-1">{errors.overallLimit}</p>}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#F5F1E8] border border-[#A8BBAA]/30 flex items-center justify-between text-xs">
            <span className="text-[#75847B]">Sum of Category Caps:</span>
            <span className="font-mono font-bold text-[#1D4938]">
              ₹{sumCategories.toLocaleString('en-IN')} / ₹{(parseFloat(overallLimit) || 0).toLocaleString('en-IN')}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17251F] mb-2 uppercase tracking-wider">
              Individual Category Allocations (Optional)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {EXPENSE_CATEGORIES.map(cat => (
                <div key={cat} className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F5] border border-[#A8BBAA]/20">
                  <span className="text-xs font-medium text-[#17251F]">{cat}</span>
                  <div className="relative w-28">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-[#75847B]">₹</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={categoryBudgets[cat] || ''}
                      onChange={e => handleCategoryChange(cat, e.target.value)}
                      className="w-full pl-5 pr-2 py-1 text-xs font-mono font-semibold rounded-lg bg-white border border-[#A8BBAA]/40 text-right focus:outline-hidden focus:border-[#1D4938]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17251F] mb-1">Envelope Notes / Strategy</label>
            <input
              type="text"
              placeholder="e.g. Q4 Capital Preservation Strategy"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#F5F1E8]/50 border border-[#A8BBAA]/40 text-[#17251F] focus:outline-hidden focus:border-[#1D4938]"
            />
          </div>

          <div className="pt-3 border-t border-[#A8BBAA]/20 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#75847B] hover:bg-[#F5F1E8]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#102820] to-[#1D4938] text-[#D6B66C] hover:text-white border border-[#D6B66C]/60 text-xs font-semibold shadow-md"
            >
              {isEditing ? 'Update Envelope' : 'Save Envelope'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

