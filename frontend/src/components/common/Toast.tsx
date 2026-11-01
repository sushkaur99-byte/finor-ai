import React from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import type { ToastMessage } from '../../types/finance'

interface ToastProps {
  toasts: ToastMessage[]
  onDismiss: (id: string) => void
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success'
        const isError = toast.type === 'error'

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-center justify-between gap-3 text-xs animate-in slide-in-from-bottom-3 fade-in duration-200 ${
              isSuccess
                ? 'bg-[#102820] text-white border-[#D6B66C]/50 shadow-[#102820]/40'
                : isError
                ? 'bg-rose-900 text-white border-rose-500 shadow-rose-950/40'
                : 'bg-[#1D4938] text-white border-[#A8BBAA]/40'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isSuccess ? (
                <div className="p-1 rounded-md bg-[#D6B66C]/20 text-[#D6B66C] shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              ) : isError ? (
                <div className="p-1 rounded-md bg-rose-500/20 text-rose-300 shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
              ) : (
                <div className="p-1 rounded-md bg-white/20 text-white shrink-0">
                  <Info className="w-4 h-4" />
                </div>
              )}
              <span className="font-medium leading-snug">{toast.message}</span>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded-lg text-[#A8BBAA] hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

