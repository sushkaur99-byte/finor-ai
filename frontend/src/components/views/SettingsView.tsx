import React, { useState } from 'react'
import type { UserProfile } from '../../types/finance'
import {
  Settings,
  Sparkles,
  RefreshCcw,
  Check,
  Info
} from 'lucide-react'

interface SettingsViewProps {
  onResetData: () => void
  profile?: UserProfile | null
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onResetData, profile }) => {
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [pushAlerts, setPushAlerts] = useState(true)
  const [anomalyDetection, setAnomalyDetection] = useState(true)

  const displayName = profile?.fullName || profile?.email?.split('@')[0] || 'Alexander Sterling'
  const displayEmail = profile?.email || 'alexander.sterling@finora.ai'
  const userIdDisplay = profile?.id ? `#UID-${profile.id.substring(0, 8)}` : '#FW-8841-IN'
  const initials = profile?.fullName
    ? profile.fullName
        .split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : profile?.email
    ? profile.email.substring(0, 2).toUpperCase()
    : 'AS'

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl animate-in fade-in duration-300">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#A8BBAA]/30 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#1D4938]/10 text-[#1D4938]">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-[#17251F]">
              System & Security Preferences
            </h2>
            <p className="text-xs text-[#75847B]">
              Configure wealth management parameters, AI intelligence keys, and alerting thresholds
            </p>
          </div>
        </div>
      </div>

      {/* 1. Account & Wealth Tier Status */}
      <div className="bg-white rounded-2xl p-6 border border-[#A8BBAA]/30 shadow-xs space-y-4">
        <h3 className="font-serif text-base font-bold text-[#17251F] pb-2 border-b border-[#A8BBAA]/20">
          Client Identity & Tier Classification
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#102820] to-[#1D4938] text-[#D6B66C] border-2 border-[#D6B66C]/40 flex items-center justify-center font-serif text-lg font-bold shadow-md">
              {initials}
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#17251F]">{displayName}</h4>
              <p className="text-xs text-[#75847B]">{displayEmail}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1D4938] text-[#D6B66C]">
                  {profile?.tier || 'Tier I · Ultra Wealth Client'}
                </span>
                <span className="text-[10px] text-[#75847B] font-mono">{userIdDisplay}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#F5F1E8] px-4 py-3 rounded-xl border border-[#A8BBAA]/30 text-xs">
            <span className="text-[#75847B] block text-[10px] uppercase font-bold">Base Portfolio Currency</span>
            <span className="font-bold text-[#1D4938] text-sm">Indian Rupee (INR ₹)</span>
          </div>
        </div>
      </div>

      {/* 2. Google Gemini AI Engine Configuration */}
      <div className="bg-gradient-to-br from-[#102820] to-[#16382C] text-white rounded-2xl p-6 border border-[#D6B66C]/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1D4938]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#D6B66C]/20 text-[#D6B66C]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-white">
                Gemini 1.5 Pro AI Engine Gateway
              </h3>
              <p className="text-xs text-[#A8BBAA]">
                Configured for zero-latency financial sentiment, receipt parsing, and anomaly surveillance
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Integration Ready
          </span>
        </div>

        <div className="bg-[#102820] p-4 rounded-xl border border-[#1D4938] text-xs text-[#A8BBAA] flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#D6B66C] shrink-0 mt-0.5" />
          <p>
            For maximum enterprise security, your Google Gemini API Key is safely maintained in the backend server environment (`backend/.env`). Client-side exposure of API secrets is strictly blocked.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#16382C] border border-[#D6B66C]/30 text-xs text-[#F5F1E8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#D6B66C]" />
            <span>Server-side Key Managed via `GEMINI_API_KEY`</span>
          </div>
          <span className="font-mono text-[10px] text-[#A8BBAA] bg-[#102820] px-2.5 py-1 rounded-md border border-[#1D4938]">
            Encrypted & Isolated
          </span>
        </div>
      </div>

      {/* 3. Wealth Notifications & Automated Surveillance */}
      <div className="bg-white rounded-2xl p-6 border border-[#A8BBAA]/30 shadow-xs space-y-4">
        <h3 className="font-serif text-base font-bold text-[#17251F] pb-2 border-b border-[#A8BBAA]/20">
          Surveillance & Notification Triggers
        </h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#A8BBAA]/20 cursor-pointer">
            <div>
              <p className="text-xs font-semibold text-[#17251F]">
                Real-Time Outflow Anomaly Alerts
              </p>
              <p className="text-[11px] text-[#75847B]">
                Notify immediately if any recurring SaaS or discretionary charge deviates &gt;30%
              </p>
            </div>
            <input
              type="checkbox"
              checked={anomalyDetection}
              onChange={e => setAnomalyDetection(e.target.checked)}
              className="h-4 w-4 rounded-sm border-gray-300 text-[#1D4938] focus:ring-[#1D4938]"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#A8BBAA]/20 cursor-pointer">
            <div>
              <p className="text-xs font-semibold text-[#17251F]">
                High-Volume Inflow Credit Confirmations
              </p>
              <p className="text-[11px] text-[#75847B]">
                Send instant notification on corporate dividend or wire credits &gt;₹50,000
              </p>
            </div>
            <input
              type="checkbox"
              checked={pushAlerts}
              onChange={e => setPushAlerts(e.target.checked)}
              className="h-4 w-4 rounded-sm border-gray-300 text-[#1D4938] focus:ring-[#1D4938]"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#A8BBAA]/20 cursor-pointer">
            <div>
              <p className="text-xs font-semibold text-[#17251F]">
                Monthly Wealth Executive Digest
              </p>
              <p className="text-[11px] text-[#75847B]">
                Delivered on 1st of each calendar month with complete tax & yield advisory
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={e => setEmailAlerts(e.target.checked)}
              className="h-4 w-4 rounded-sm border-gray-300 text-[#1D4938] focus:ring-[#1D4938]"
            />
          </label>
        </div>
      </div>

      {/* 4. Reset / Refresh Sample Dataset */}
      <div className="bg-white rounded-2xl p-6 border border-rose-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider">
            Reset Sample Data
          </h4>
          <p className="text-xs text-[#75847B] mt-0.5">
            Restore the pristine illustrative Indian Rupee wealth portfolio to original state.
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm('Restore sample portfolio transactions and metrics?')) {
              onResetData()
            }
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          <span>Reset Sample Portfolio</span>
        </button>
      </div>
    </div>
  )
}
