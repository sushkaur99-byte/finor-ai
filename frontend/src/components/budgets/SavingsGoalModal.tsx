import React, { useState } from 'react'
import { X, Target, Calendar, DollarSign, Tag, Palette } from 'lucide-react'
import type { SavingsGoal } from '../../types/finance'

interface SavingsGoalModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (goalData: Omit<SavingsGoal, 'id'>, id?: string) => void
  initialData?: SavingsGoal | null
}

const GOAL_CATEGORIES = [
  'Wealth Creation',
  'Emergency Cushion',
  'Real Estate',
  'Automotive',
  'Education & Legacy',
  'Alternative Assets',
  'Travel & Luxury',
  'Retirement'
]

const PALETTE_COLORS = [
  '#1D4938', // Deep Emerald
  '#D6B66C', // Champagne Gold
  '#102820', // Midnight Forest
  '#265F4A', // Sage Emerald
  '#B39243', // Dark Gold
  '#2A6850', // Jade
  '#75847B'  // Muted Slate
]

export const SavingsGoalModal: React.FC<SavingsGoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const isEditing = Boolean(initialData)

  const [name, setName] = useState(() => initialData?.name || '')
  const [targetAmount, setTargetAmount] = useState(() => initialData ? initialData.targetAmount.toString() : '')
  const [currentAmount, setCurrentAmount] = useState(() => initialData ? initialData.currentAmount.toString() : '0')
  const [targetDate, setTargetDate] = useState(() => initialData?.targetDate || '2027-12-31')
  const [category, setCategory] = useState(() => initialData?.category || GOAL_CATEGORIES[0])
  const [color, setColor] = useState(() => initialData?.color || PALETTE_COLORS[0])
  const [notes, setNotes] = useState(() => initialData?.notes || '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!isOpen) return null

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Goal name is required.'

    const targetNum = parseFloat(targetAmount)
    if (!targetAmount || isNaN(targetNum) || targetNum <= 0) {
      errs.targetAmount = 'Target amount must be greater than ₹0.'
    }

    const currentNum = parseFloat(currentAmount)
    if (isNaN(currentNum) || currentNum < 0) {
      errs.currentAmount = 'Current saved amount cannot be negative.'
    }

    if (!targetDate) errs.targetDate = 'Target completion date is required.'

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    onSave(
      {
        name: name.trim(),
        targetAmount: parseFloat(targetAmount),
        currentAmount: parseFloat(currentAmount) || 0,
        targetDate,
        category,
        color,
        notes: notes.trim() || undefined
      },
      initialData?.id
    )
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-[#102820]/80 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#D6B66C]/40 z-10 overflow-hidden my-8">
        <div className="bg-gradient-to-r from-[#102820] to-[#1D4938] px-6 py-5 text-white flex items-center justify-between border-b border-[#D6B66C]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#D6B66C]/20 border border-[#D6B66C]/40 flex items-center justify-center text-[#D6B66C]">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white tracking-wide">
                {isEditing ? 'Adjust Savings Goal' : 'Establish Savings Goal'}
              </h3>
              <p className="text-[11px] text-[#A8BBAA]">
                Target milestone in your private wealth accumulation ledger
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-[#A8BBAA] hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#17251F] mb-1">Goal Name *</label>
            <input
              type="text"
              placeholder="e.g. Sovereign Emergency Cushion"
              value={name}
              onChange={e => {
                setName(e.target.value)
                if (errors.name) setErrors(prev => ({ ...prev, name: '' }))
              }}
              className={`w-full px-3.5 py-2 text-xs rounded-xl bg-[#F5F1E8]/50 border ${
                errors.name ? 'border-rose-500' : 'border-[#A8BBAA]/40'
              } text-[#17251F] focus:outline-hidden focus:border-[#1D4938]`}
            />
            {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#17251F] mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-[#1D4938]" /> Target (₹) *
              </label>
              <input
                type="number"
                step="any"
                placeholder="1000000"
                value={targetAmount}
                onChange={e => {
                  setTargetAmount(e.target.value)
                  if (errors.targetAmount) setErrors(prev => ({ ...prev, targetAmount: '' }))
                }}
                className={`w-full px-3.5 py-2 text-xs font-mono font-bold rounded-xl bg-[#F5F1E8]/50 border ${
                  errors.targetAmount ? 'border-rose-500' : 'border-[#A8BBAA]/40'
                } text-[#17251F] focus:outline-hidden focus:border-[#1D4938]`}
              />
              {errors.targetAmount && <p className="text-[11px] text-rose-600 mt-1">{errors.targetAmount}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17251F] mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-[#1D4938]" /> Current (₹)
              </label>
              <input
                type="number"
                step="any"
                placeholder="0"
                value={currentAmount}
                onChange={e => {
                  setCurrentAmount(e.target.value)
                  if (errors.currentAmount) setErrors(prev => ({ ...prev, currentAmount: '' }))
                }}
                className={`w-full px-3.5 py-2 text-xs font-mono font-bold rounded-xl bg-[#F5F1E8]/50 border ${
                  errors.currentAmount ? 'border-rose-500' : 'border-[#A8BBAA]/40'
                } text-[#17251F] focus:outline-hidden focus:border-[#1D4938]`}
              />
              {errors.currentAmount && <p className="text-[11px] text-rose-600 mt-1">{errors.currentAmount}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#17251F] mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#1D4938]" /> Target Date *
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={e => {
                  setTargetDate(e.target.value)
                  if (errors.targetDate) setErrors(prev => ({ ...prev, targetDate: '' }))
                }}
                className={`w-full px-3.5 py-2 text-xs rounded-xl bg-[#F5F1E8]/50 border ${
                  errors.targetDate ? 'border-rose-500' : 'border-[#A8BBAA]/40'
                } text-[#17251F] focus:outline-hidden focus:border-[#1D4938]`}
              />
              {errors.targetDate && <p className="text-[11px] text-rose-600 mt-1">{errors.targetDate}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17251F] mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#1D4938]" /> Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#F5F1E8]/50 border border-[#A8BBAA]/40 text-[#17251F] focus:outline-hidden focus:border-[#1D4938]"
              >
                {GOAL_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17251F] mb-1 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-[#1D4938]" /> Accent Hue
            </label>
            <div className="flex items-center gap-2">
              {PALETTE_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    color === c ? 'scale-125 border-[#17251F]' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17251F] mb-1">Notes & Investment Vehicle (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Deploying monthly SIP into liquid sovereign funds"
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
              {isEditing ? 'Save Changes' : 'Establish Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

