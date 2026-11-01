import React from 'react'
import { AlertTriangle, Trash2, X } from 'lucide-react'
import type { Transaction } from '../../types/finance'
import { formatINR } from '../../utils/formatters'

interface DeleteConfirmModalProps {
  transaction: Transaction | null
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onConfirm
}) => {
  if (!isOpen || !transaction) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#102820]/80 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-200 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        <div className="p-6">
          <div className="flex items-start justify-between pb-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#75847B] hover:text-[#17251F] hover:bg-[#F5F1E8] transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-3">
            <h3 className="font-serif text-lg font-bold text-[#17251F]">
              Confirm Transaction Removal
            </h3>
            <p className="text-xs text-[#75847B] mt-1.5 leading-relaxed">
              Are you sure you want to permanently remove this transaction from your private wealth ledger?
            </p>

            <div className="p-3.5 rounded-2xl bg-[#F5F1E8] border border-[#A8BBAA]/30 mt-3 text-xs">
              <div className="font-bold text-[#17251F] text-sm">{transaction.title}</div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-[#75847B]">{transaction.category} • {transaction.date}</span>
                <span className="font-mono font-bold text-[#17251F]">
                  {formatINR(transaction.amount)}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-5 mt-4 border-t border-[#A8BBAA]/20 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#75847B] hover:bg-[#F5F1E8] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm()
                onClose()
              }}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Confirm Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

