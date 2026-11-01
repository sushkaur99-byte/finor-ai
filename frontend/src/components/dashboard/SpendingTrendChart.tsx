import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import type { SpendingTrendPoint } from '../../types/finance'
import { formatINR } from '../../utils/formatters'
import { TrendingUp, CheckCircle } from 'lucide-react'

interface SpendingTrendChartProps {
  data: SpendingTrendPoint[]
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
      <div className="bg-[#102820] text-white p-3 rounded-xl border border-[#D6B66C]/40 shadow-xl text-xs">
        <p className="font-semibold text-[#D6B66C] mb-1.5">{label} Spending Pacing</p>
        <div className="space-y-1">
          {payload.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <span className="text-[#A8BBAA]">{item.name}:</span>
              <span className="font-mono font-bold text-white">{formatINR(item.value)}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

export const SpendingTrendChart: React.FC<SpendingTrendChartProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#A8BBAA]/30 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#A8BBAA]/20 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#17251F]">
              Cumulative Spending Trajectory
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              On Target
            </span>
          </div>
          <p className="text-xs text-[#75847B] mt-0.5">
            Pacing tracking actual daily expenditures against target monthly ceiling
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#1D4938] font-medium bg-[#F5F1E8] px-3 py-1.5 rounded-xl border border-[#A8BBAA]/30">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Under Target by ₹4,800</span>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1D4938" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#1D4938" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D6B66C" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#D6B66C" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECE5D6" />
            <XAxis
              dataKey="day"
              axisLine={{ stroke: '#C2D1C4' }}
              tickLine={false}
              tick={{ fill: '#75847B', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#75847B', fontSize: 11 }}
              tickFormatter={val => `₹${val / 1000}k`}
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
            <Area
              type="monotone"
              dataKey="budgetBenchmark"
              name="Ceiling Benchmark"
              stroke="#D6B66C"
              strokeDasharray="4 4"
              strokeWidth={2}
              fill="url(#goldGradient)"
            />
            <Area
              type="monotone"
              dataKey="spending"
              name="Actual Spend"
              stroke="#1D4938"
              strokeWidth={2.5}
              fill="url(#emeraldGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 pt-3 border-t border-[#A8BBAA]/20 flex items-center justify-between text-xs text-[#75847B]">
        <span className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-[#1D4938]" />
          <span>Projected Month-End Close: <strong className="text-[#17251F]">₹1,42,800</strong></span>
        </span>
        <span className="font-medium text-[#1D4938]">Safe Zone: &lt; 85% of Limit</span>
      </div>
    </div>
  )
}
