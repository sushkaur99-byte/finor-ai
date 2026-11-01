import React, { useState } from 'react'
import type { FinancialInsight, Transaction } from '../../types/finance'
import {
  generateAIInsights,
  askAIAssistant,
  type AIInsightsResult
} from '../../services/aiService'
import {
  Sparkles,
  ArrowRight,
  Cpu,
  Bot,
  MessageSquare,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertCircle
} from 'lucide-react'
import { formatINR } from '../../utils/formatters'

interface AIInsightsViewProps {
  insights: FinancialInsight[]
  transactions?: Transaction[]
  onRefreshInsights: () => void
}

const PRESET_QUERIES = [
  'Where am I spending the most money?',
  'How much did I spend on Food and Dining?',
  'What is my current savings velocity and rate?',
  'Which expense categories can I optimize to save more?'
]

export const AIInsightsView: React.FC<AIInsightsViewProps> = ({
  insights: legacyInsights,
  transactions = [],
  onRefreshInsights
}) => {
  // Live Gemini Insights State
  const [geminiInsights, setGeminiInsights] = useState<AIInsightsResult | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [insightsError, setInsightsError] = useState<string | null>(null)

  // Interactive Assistant State
  const [userQuery, setUserQuery] = useState('')
  const [assistantAnswer, setAssistantAnswer] = useState<string | null>(null)
  const [assistantConfidence, setAssistantConfidence] = useState<'high' | 'medium' | 'low' | null>(null)
  const [isAnswering, setIsAnswering] = useState(false)
  const [assistantError, setAssistantError] = useState<string | null>(null)

  // Handle generating live Gemini insights
  const handleGenerateLiveInsights = async () => {
    setIsGenerating(true)
    setInsightsError(null)

    const result = await generateAIInsights(transactions)

    setIsGenerating(false)

    if (result.error) {
      setInsightsError(result.error.message)
    } else if (result.data) {
      setGeminiInsights(result.data)
      onRefreshInsights()
    }
  }

  // Handle asking AI Assistant question
  const handleAskQuestion = async (questionText?: string) => {
    const q = questionText || userQuery
    if (!q.trim()) return

    setIsAnswering(true)
    setAssistantError(null)
    setAssistantAnswer(null)
    setAssistantConfidence(null)

    const result = await askAIAssistant(q.trim(), transactions)

    setIsAnswering(false)

    if (result.error) {
      setAssistantError(result.error.message)
    } else if (result.data) {
      setAssistantAnswer(result.data.answer)
      setAssistantConfidence(result.data.confidence)
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Banner & Generation Call-to-Action */}
      <div className="bg-gradient-to-br from-[#102820] via-[#16382C] to-[#102820] text-white rounded-3xl p-6 sm:p-7 border border-[#D6B66C]/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#D6B66C]/10 via-[#1D4938]/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1D4938]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1D4938] to-[#2E755B] border border-[#D6B66C]/50 flex items-center justify-center text-[#D6B66C] shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-wide">
                  Gemini AI Financial Intelligence
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#D6B66C]/20 text-[#D6B66C] border border-[#D6B66C]/40">
                  Live Engine
                </span>
              </div>
              <p className="text-xs text-[#A8BBAA] mt-0.5">
                Powered by official Google Gemini 1.5 Flash • Reconciling {transactions.length} verified ledger entries
              </p>
            </div>
          </div>

          <button
            onClick={handleGenerateLiveInsights}
            disabled={isGenerating || transactions.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D6B66C] to-[#BC9948] hover:from-[#E5CA85] hover:to-[#D6B66C] text-[#102820] font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Analyzing with Gemini...' : 'Generate AI Insights'}</span>
          </button>
        </div>

        {/* Error notification banner if any */}
        {insightsError && (
          <div className="relative z-10 mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="flex-1">{insightsError}</span>
          </div>
        )}

        {/* Live Gemini Insights Display */}
        {geminiInsights ? (
          <div className="relative z-10 mt-6 space-y-4">
            {/* Monthly Summary & Highest Category */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 bg-[#102820]/90 rounded-2xl p-4 sm:p-5 border border-[#1D4938] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#D6B66C]">
                      Monthly Financial Summary
                    </span>
                    <span className="text-[10px] text-[#A8BBAA]">Gemini Verified</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#F5F1E8] leading-relaxed">
                    {geminiInsights.monthlySummary}
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-[#1D4938]/80 flex items-center gap-2 text-xs text-[#A8BBAA]">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{geminiInsights.incomeExpenseAnalysis}</span>
                </div>
              </div>

              <div className="bg-[#102820]/90 rounded-2xl p-4 sm:p-5 border border-[#1D4938] flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#D6B66C] block mb-1">
                    Highest Spend Category
                  </span>
                  <h4 className="text-base font-bold text-white mb-1">
                    {geminiInsights.highestCategory.name}
                  </h4>
                  <div className="font-mono text-xl font-bold text-[#D6B66C] mb-2">
                    {formatINR(geminiInsights.highestCategory.amount)}
                  </div>
                  <p className="text-xs text-[#A8BBAA] leading-relaxed">
                    {geminiInsights.highestCategory.insight}
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-[#1D4938]/80 text-[11px] text-[#A8BBAA]">
                  {geminiInsights.savingsObservation}
                </div>
              </div>
            </div>

            {/* Suggestions & Trends */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#102820]/90 rounded-2xl p-4 sm:p-5 border border-[#1D4938]">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-[#D6B66C]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    Capital Optimization Suggestions
                  </h4>
                </div>
                <ul className="space-y-2 text-xs text-[#F5F1E8]">
                  {geminiInsights.savingSuggestions.map((sug, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#D6B66C] font-bold mt-0.5">•</span>
                      <span>{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#102820]/90 rounded-2xl p-4 sm:p-5 border border-[#1D4938]">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    Spending Trends & Observations
                  </h4>
                </div>
                <p className="text-xs text-[#F5F1E8] leading-relaxed mb-3">
                  {geminiInsights.trends}
                </p>
                {geminiInsights.unusualExpenses.length > 0 && (
                  <div className="pt-2 border-t border-[#1D4938]/80">
                    <span className="text-[10px] uppercase font-bold text-amber-300 block mb-1">
                      Notable Alerts:
                    </span>
                    <ul className="space-y-1 text-xs text-amber-100">
                      {geminiInsights.unusualExpenses.map((exp, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3 h-3 text-amber-300 shrink-0" />
                          <span>{exp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative z-10 mt-6 p-6 rounded-2xl bg-[#102820]/60 border border-[#1D4938] text-center">
            <Cpu className="w-8 h-8 text-[#D6B66C] mx-auto mb-2 opacity-80" />
            <h4 className="text-sm font-bold text-white mb-1">
              Live AI Analysis Ready to Generate
            </h4>
            <p className="text-xs text-[#A8BBAA] max-w-md mx-auto">
              Click &quot;Generate AI Insights&quot; above to synthesize custom spending trends, identify peak expense drivers, and receive tailored wealth recommendations.
            </p>
          </div>
        )}
      </div>

      {/* 2. Interactive AI Financial Assistant (Live Q&A) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#A8BBAA]/30 shadow-xs">
        <div className="flex items-center gap-3 pb-4 border-b border-[#A8BBAA]/20">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#102820] to-[#1D4938] text-[#D6B66C] flex items-center justify-center border border-[#D6B66C]/30 shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#17251F]">
              Interactive Financial Assistant
            </h3>
            <p className="text-xs text-[#75847B]">
              Ask any question about your actual transactions, categories, or savings velocity
            </p>
          </div>
        </div>

        {/* Suggested Quick Question Chips */}
        <div className="mt-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#75847B] block mb-2">
            Suggested Inquiries:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {PRESET_QUERIES.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setUserQuery(q)
                  handleAskQuestion(q)
                }}
                className="p-3 rounded-xl text-left text-xs bg-[#F5F1E8]/70 hover:bg-[#F5F1E8] border border-[#A8BBAA]/30 hover:border-[#1D4938] text-[#17251F] transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase text-[#1D4938]">
                    Prompt 0{idx + 1}
                  </span>
                  <ArrowRight className="w-3 h-3 text-[#75847B]" />
                </div>
                <p className="font-medium line-clamp-2 leading-snug">{q}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Question Submission Form */}
        <form
          onSubmit={e => {
            e.preventDefault()
            handleAskQuestion()
          }}
          className="mt-5 flex gap-2"
        >
          <div className="relative flex-1">
            <MessageSquare className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#75847B]" />
            <input
              type="text"
              placeholder="Ask anything about your finances (e.g. 'How much did I spend on Transport?')"
              value={userQuery}
              onChange={e => setUserQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#F5F1E8]/60 border border-[#A8BBAA]/40 text-[#17251F] focus:outline-hidden focus:bg-white focus:border-[#1D4938] transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isAnswering || !userQuery.trim()}
            className="px-5 py-2.5 rounded-xl bg-[#1D4938] text-[#D6B66C] hover:text-white hover:bg-[#102820] font-semibold text-xs transition-all shadow-xs shrink-0 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {isAnswering ? (
              <>
                <Cpu className="w-3.5 h-3.5 animate-spin text-[#D6B66C]" />
                <span>Thinking...</span>
              </>
            ) : (
              <>
                <span>Ask Gemini</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Assistant Response Box */}
        {(assistantAnswer || isAnswering || assistantError) && (
          <div className="mt-5 p-5 rounded-2xl bg-gradient-to-br from-[#102820] to-[#16382C] text-white border border-[#D6B66C]/30 shadow-lg animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-2 text-xs">
              <div className="flex items-center gap-2 font-semibold text-[#D6B66C]">
                <Sparkles className="w-4 h-4" />
                <span>Finora Intelligence Response</span>
              </div>
              {assistantConfidence && (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-[#1D4938] text-[#A8BBAA] border border-[#D6B66C]/20">
                  Confidence: {assistantConfidence}
                </span>
              )}
            </div>

            {isAnswering && (
              <div className="py-6 flex items-center justify-center gap-3 text-xs text-[#A8BBAA]">
                <Cpu className="w-4 h-4 animate-spin text-[#D6B66C]" />
                <span>Auditing ledger records and synthesizing response with Gemini...</span>
              </div>
            )}

            {assistantError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs">
                {assistantError}
              </div>
            )}

            {assistantAnswer && (
              <>
                <p className="text-xs sm:text-sm text-[#F5F1E8] leading-relaxed">
                  {assistantAnswer}
                </p>
                <div className="pt-3 mt-3 border-t border-[#1D4938] flex items-center justify-between text-[11px] text-[#A8BBAA]">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Calculated strictly from your verified transactions</span>
                  </span>
                  <span className="text-[10px] text-[#75847B]">
                    General observations only, not professional financial advice
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 3. Comprehensive Strategic Recommendations Registry */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#A8BBAA]/30 shadow-xs">
        <h3 className="font-serif text-lg font-bold text-[#17251F] mb-1">
          Strategic Wealth Advisory Registry
        </h3>
        <p className="text-xs text-[#75847B] mb-4">
          Heuristic benchmarks and verified portfolio optimization milestones
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {legacyInsights.map(item => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#A8BBAA]/30 hover:border-[#1D4938]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#1D4938]/10 text-[#1D4938]">
                    {item.badge || item.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#1D4938]">
                    Impact: {item.impactScore}/100
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#17251F] mb-1">{item.title}</h4>
                <p className="text-xs text-[#75847B] leading-relaxed">{item.description}</p>
              </div>

              {item.actionable && (
                <div className="pt-3 mt-3 border-t border-[#A8BBAA]/20 flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#1D4938] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{item.actionable}</span>
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
