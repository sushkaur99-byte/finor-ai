import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import type { SavingsGrowthPoint } from '../../types/finance'
import { formatINR } from '../../utils/formatters'
import { Sparkles, ShieldCheck } from 'lucide-react'

interface SavingsGrowthChartProps {
  data: SavingsGrowthPoint[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    value: number
    dataKey: string
    color: string
    name: string
  }>
  label?: string
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#102820] text-white p-3.5 rounded-xl border border-[#D6B66C]/40 shadow-xl text-xs">
        <p className="font-semibold text-[#D6B66C] mb-2">{label} Wealth Compounding</p>
        <div className="space-y-1.5">
          {payload.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <span className="text-[#A8BBAA] flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: item.color }}
                />
                {item.name}:
              </span>
              <span className="font-mono font-bold text-white">{formatINR(item.value)}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

export const SavingsGrowthChart: React.FC<SavingsGrowthChartProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#A8BBAA]/30 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#A8BBAA]/20 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#17251F]">
              Savings & Wealth Compounding Curve
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#D6B66C]/20 text-[#96762B] border border-[#D6B66C]/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#D6B66C]" /> AI Forecast
            </span>
          </div>
          <p className="text-xs text-[#75847B] mt-0.5">
            12-month exponential capital growth tracking actual vs predictive trajectory
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#17251F] font-semibold bg-[#F5F1E8] px-3 py-1.5 rounded-xl border border-[#A8BBAA]/30">
          <ShieldCheck className="w-4 h-4 text-[#1D4938]" />
          <span>CAGR: 19.4%</span>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECE5D6" />
            <XAxis
              dataKey="month"
              axisLine={{ stroke: '#C2D1C4' }}
              tickLine={false}
              tick={{ fill: '#75847B', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#75847B', fontSize: 11 }}
              tickFormatter={val => `₹${(val / 100000).toFixed(1)}L`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
              formatter={value => (
                <span className="text-xs font-medium text-[#17251F]">{value}</span>
              )}
            />
            <Line
              type="monotone"
              dataKey="actual"
              name="Accumulated Savings"
              stroke="#1D4938"
              strokeWidth={3}
              dot={{ r: 4, fill: '#1D4938', strokeWidth: 2, stroke: '#FFFFFF' }}
              activeDot={{ r: 6, fill: '#D6B66C' }}
            />
            <Line
              type="monotone"
              dataKey="projected"
              name="AI Predictive Model"
              stroke="#D6B66C"
              strokeDasharray="4 4"
              strokeWidth={2}
              dot={{ r: 3, fill: '#D6B66C' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 pt-3 border-t border-[#A8BBAA]/20 flex items-center justify-between text-xs text-[#75847B]">
        <span>Projected Portfolio Horizon Dec 2026: <strong className="text-[#1D4938]">₹23.40 Lakhs</strong></span>
        <span className="text-[#D6B66C] font-semibold hidden sm:inline">✦ Predictive Confidence 96%</span>
      </div>
    </div>
  )
}
