import React, { useState } from 'react'
import {
  Sparkles,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  RefreshCw,
  Cpu,
  ArrowRight,
  Zap,
  Info
} from 'lucide-react'
import type { FinancialInsight } from '../../types/finance'
import { formatINR } from '../../utils/formatters'

interface AIInsightsPanelProps {
  insights: FinancialInsight[]
  onRefreshInsights: () => void
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  insights,
  onRefreshInsights
}) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now')

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      onRefreshInsights()
      setIsGenerating(false)
      const now = new Date()
      setLastRefreshed(
        now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      )
    }, 1200)
  }

  // Filter or assign key elements
  const highestSpend = {
    category: 'Housing & Estate Management',
    amount: 52000,
    percentage: '36.4%',
    insight: 'Primary driver: Penthouse maintenance & concierge dues. Within historical safety margin.'
  }

  const alertInsight = insights.find(i => i.category === 'alert') || insights[1]
  const savingsInsight = insights.find(i => i.category === 'savings') || insights[0]

  return (
    <div className="bg-gradient-to-br from-[#102820] via-[#16382C] to-[#102820] text-white rounded-3xl p-6 sm:p-7 border border-[#D6B66C]/40 shadow-xl relative overflow-hidden">
      {/* Decorative Champagne Gold Geometric Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#D6B66C]/10 via-[#1D4938]/20 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#1D4938]/30 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* Top Banner & Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#1D4938]/70 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1D4938] to-[#2E755B] border border-[#D6B66C]/50 flex items-center justify-center text-[#D6B66C] shadow-md shadow-black/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg sm:text-xl font-bold tracking-wide text-white">
                  Finora AI Financial Intelligence
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#D6B66C]/20 text-[#D6B66C] border border-[#D6B66C]/30 flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 text-[#D6B66C]" /> Gemini API Ready
                </span>
              </div>
              <p className="text-xs text-[#A8BBAA] mt-0.5">
                Autonomous heuristic engine & portfolio risk surveillance
              </p>
            </div>
          </div>
        </div>

        {/* Generate / Refresh Button */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[#A8BBAA] hidden sm:inline">
            Updated: <strong className="text-white">{lastRefreshed}</strong>
          </span>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D6B66C] to-[#BC9948] hover:from-[#E5CA85] hover:to-[#D6B66C] text-[#102820] font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg hover:shadow-[#D6B66C]/20 transition-all duration-200 active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Analyzing Portfolio...' : 'Generate AI Insights'}</span>
          </button>
        </div>
      </div>

      {/* Illustrative Disclaimer Notice */}
      <div className="relative z-10 my-4 px-3.5 py-2 rounded-xl bg-[#1D4938]/40 border border-[#D6B66C]/20 flex items-center gap-2 text-[11px] text-[#A8BBAA]">
        <Info className="w-3.5 h-3.5 text-[#D6B66C] shrink-0" />
        <span>
          <strong className="text-[#D6B66C]">Illustrative Demo Mode:</strong> These financial insights are synthesized algorithmically for demonstration. Full real-time Google Gemini 1.5 Pro inference triggers once the API key is linked.
        </span>
      </div>

      {/* AI Synthesis Cards Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
        {/* Card 1: Spending Summary & High Category */}
        <div className="bg-[#102820]/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[#1D4938] hover:border-[#D6B66C]/40 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#A8BBAA]">
                Highest Outflow Category
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1D4938] text-[#D6B66C]">
                {highestSpend.percentage}
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">{highestSpend.category}</h4>
            <div className="font-mono text-xl font-bold text-[#D6B66C] mb-2">
              {formatINR(highestSpend.amount)}
            </div>
            <p className="text-xs text-[#A8BBAA] leading-relaxed">{highestSpend.insight}</p>
          </div>
          <div className="pt-3 mt-3 border-t border-[#1D4938]/60 flex items-center gap-1.5 text-[11px] text-[#A8BBAA]">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Under allocated ₹60,000 threshold</span>
          </div>
        </div>

        {/* Card 2: Unusual Spending Alert */}
        <div className="bg-[#102820]/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-amber-500/30 hover:border-amber-500/60 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Anomaly Flagged
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {alertInsight?.badge || 'Spike Detected'}
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">
              {alertInsight?.title || 'Unusual Recurring Cloud Surge'}
            </h4>
            <div className="font-mono text-xl font-bold text-amber-300 mb-2">
              {alertInsight?.metric || '+48% Variance'}
            </div>
            <p className="text-xs text-[#A8BBAA] leading-relaxed">
              {alertInsight?.description || 'AWS compute resources ran continuously over weekends.'}
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-[#1D4938]/60 flex items-center justify-between text-[11px]">
            <span className="text-amber-200">Recommended action</span>
            <span className="text-xs font-semibold text-[#D6B66C]">Audit EC2 & GPU →</span>
          </div>
        </div>

        {/* Card 3: Potential Savings Suggestion */}
        <div className="bg-[#102820]/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[#1D4938] hover:border-[#D6B66C]/40 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#A8BBAA] flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-[#D6B66C]" /> Wealth Optimization
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Capital Opportunity
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">
              {savingsInsight?.title || 'Surplus Allocation Velocity'}
            </h4>
            <div className="font-mono text-xl font-bold text-emerald-400 mb-2">
              +{formatINR(savingsInsight?.potentialSavings || 85000)} / mo
            </div>
            <p className="text-xs text-[#A8BBAA] leading-relaxed">
              {savingsInsight?.description ||
                'High liquidity in low-yield checking can be redeployed into overnight sovereign liquid funds.'}
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-[#1D4938]/60 flex items-center gap-1.5 text-[11px] text-[#D6B66C]">
            <Cpu className="w-3.5 h-3.5 text-[#D6B66C]" />
            <span>Yield lift: +8.4% annualized</span>
          </div>
        </div>
      </div>

      {/* Comprehensive Executive Summary Bar */}
      <div className="relative z-10 pt-4 mt-2 border-t border-[#1D4938]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[#A8BBAA]">
            AI Executive Verdict: <strong className="text-white">Portfolio health rated Exceptional (94/100). Net burn well within liquidity threshold.</strong>
          </span>
        </div>
        <div className="flex items-center gap-1 text-[#D6B66C] hover:text-white font-medium cursor-pointer transition-colors text-xs">
          <span>Explore Advanced AI Advisory</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  )
}
