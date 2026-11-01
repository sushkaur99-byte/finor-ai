import React from 'react'
import {
  X,
  Edit3,
  Trash2,
  Calendar,
  CreditCard,
  Tag,
  FileText,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Hash
} from 'lucide-react'
import type { Transaction } from '../../types/finance'
import { formatINR, formatDate } from '../../utils/formatters'

interface TransactionDetailModalProps {
  transaction: Transaction | null
  isOpen: boolean
  onClose: () => void
  onEdit: (tx: Transaction) => void
  onDelete: (id: string) => void
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onEdit,
  onDelete
}) => {
  if (!isOpen || !transaction) return null

  const isIncome = transaction.type === 'income'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#102820]/80 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#D6B66C]/40 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#102820] to-[#1D4938] px-6 py-5 text-white flex items-center justify-between border-b border-[#D6B66C]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D6B66C]/20 border border-[#D6B66C]/40 flex items-center justify-center text-[#D6B66C]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-white tracking-wide">
                Transaction Voucher Details
              </h3>
              <p className="text-[11px] text-[#A8BBAA] font-mono">
                ID: {transaction.id}
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

        {/* Voucher Body */}
        <div className="p-6 space-y-5">
          {/* Amount Showcase Banner */}
          <div className="text-center p-5 rounded-2xl bg-[#F5F1E8] border border-[#A8BBAA]/30">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 uppercase tracking-wider"
              style={{
                backgroundColor: isIncome ? 'rgba(46, 125, 91, 0.15)' : 'rgba(23, 37, 31, 0.1)',
                color: isIncome ? '#1D4938' : '#17251F'
              }}
            >
              {isIncome ? (
                <>
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Verified Inflow (Credit)</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-3.5 h-3.5 text-amber-700" />
                  <span>Verified Outflow (Debit)</span>
                </>
              )}
            </div>

            <div className="font-mono text-3xl sm:text-4xl font-bold tracking-tight text-[#17251F]">
              {isIncome ? `+${formatINR(transaction.amount)}` : `-${formatINR(transaction.amount)}`}
            </div>

            <h4 className="text-sm font-semibold text-[#17251F] mt-1.5">
              {transaction.title}
            </h4>
          </div>

          {/* Details Grid */}
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#A8BBAA]/20">
              <span className="text-[#75847B] flex items-center gap-1.5 font-medium">
                <Tag className="w-3.5 h-3.5 text-[#1D4938]" /> Category
              </span>
              <span className="font-semibold text-[#17251F] px-2.5 py-0.5 rounded-full bg-white border border-[#A8BBAA]/30">
                {transaction.category}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#A8BBAA]/20">
              <span className="text-[#75847B] flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-[#1D4938]" /> Value Date
              </span>
              <span className="font-semibold text-[#17251F] font-mono">
                {formatDate(transaction.date)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#A8BBAA]/20">
              <span className="text-[#75847B] flex items-center gap-1.5 font-medium">
                <CreditCard className="w-3.5 h-3.5 text-[#1D4938]" /> Payment Instrument
              </span>
              <span className="font-semibold text-[#17251F]">
                {transaction.paymentMethod}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#A8BBAA]/20">
              <span className="text-[#75847B] flex items-center gap-1.5 font-medium">
                <Hash className="w-3.5 h-3.5 text-[#1D4938]" /> Reconciliation Status
              </span>
              <span className="font-semibold text-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Settled
              </span>
            </div>

            {transaction.description && (
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#A8BBAA]/20 space-y-1">
                <span className="text-[#75847B] flex items-center gap-1.5 font-medium">
                  <FileText className="w-3.5 h-3.5 text-[#1D4938]" /> Notes & Reference
                </span>
                <p className="text-xs text-[#17251F] pl-5 leading-relaxed">
                  {transaction.description}
                </p>
              </div>
            )}

            {transaction.aiCategorized && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#D6B66C]/15 border border-[#D6B66C]/30 text-[#102820]">
                <Sparkles className="w-3.5 h-3.5 text-[#D6B66C] shrink-0" />
                <span className="text-[11px] font-medium">
                  AI Categorization & Heuristic Risk Check Verified
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#A8BBAA]/20 flex items-center justify-between gap-3">
            <button
              onClick={() => {
                onDelete(transaction.id)
                onClose()
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onEdit(transaction)
                  onClose()
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1D4938] text-white hover:bg-[#102820] text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#F5F1E8] text-[#17251F] hover:bg-[#ECE5D6] text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

