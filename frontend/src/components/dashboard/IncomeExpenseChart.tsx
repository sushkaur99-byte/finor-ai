import React, { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import type { MonthlyCashflow } from '../../types/finance'
import { formatINR } from '../../utils/formatters'
import { Calendar } from 'lucide-react'

interface IncomeExpenseChartProps {
  data: MonthlyCashflow[]
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
      <div className="bg-[#102820] text-white p-3.5 rounded-xl border border-[#D6B66C]/40 shadow-xl min-w-44 backdrop-blur-md">
        <p className="text-xs font-serif font-bold text-[#D6B66C] tracking-wide mb-2 pb-1.5 border-b border-[#1D4938]">
          {label} 2026 Overview
        </p>
        <div className="space-y-1.5 text-xs">
          {payload.map((item, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-[#A8BBAA]">
                <span
                  className="w-2.5 h-2.5 rounded-sm inline-block"
                  style={{ backgroundColor: item.color }}
                />
                {item.name}:
              </span>
              <span className="font-semibold text-white font-mono">
                {formatINR(item.value)}
              </span>
            </div>
          ))}
          {payload.length >= 2 && (
            <div className="pt-2 mt-2 border-t border-[#1D4938] flex items-center justify-between text-[11px]">
              <span className="text-[#A8BBAA]">Net Surplus:</span>
              <span className="text-emerald-400 font-bold font-mono">
                {formatINR(payload[0].value - payload[1].value)}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }
  return null
}

export const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({ data }) => {
  const [timeframe, setTimeframe] = useState<'6M' | 'YTD' | '1Y'>('6M')

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#A8BBAA]/30 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#A8BBAA]/20 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#17251F]">
              Cash Flow: Inflow vs Outflow
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#1D4938]/10 text-[#1D4938]">
              Monthly
            </span>
          </div>
          <p className="text-xs text-[#75847B] mt-0.5">
            Comparative analysis of gross earnings vs operational expenditures
          </p>
        </div>

        {/* Timeframe pill selector */}
        <div className="flex items-center gap-1 bg-[#F5F1E8] p-1 rounded-xl self-start sm:self-auto border border-[#A8BBAA]/30">
          {(['6M', 'YTD', '1Y'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                timeframe === tf
                  ? 'bg-[#102820] text-[#D6B66C] shadow-xs'
                  : 'text-[#75847B] hover:text-[#17251F]'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart container */}
      <div className="h-72 sm:h-80 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            barGap={8}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECE5D6" />
            <XAxis
              dataKey="month"
              axisLine={{ stroke: '#C2D1C4' }}
              tickLine={false}
              tick={{ fill: '#75847B', fontSize: 12, fontWeight: 500 }}
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
            <Bar
              dataKey="income"
              name="Gross Income"
              fill="#1D4938"
              radius={[6, 6, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              dataKey="expenses"
              name="Total Expenses"
              fill="#D6B66C"
              radius={[6, 6, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 pt-3 border-t border-[#A8BBAA]/20 flex items-center justify-between text-xs text-[#75847B]">
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-[#1D4938]" />
          <span>Trailing 6-Month Average Surplus: <strong className="text-[#1D4938]">₹2,14,200/mo</strong></span>
        </span>
        <span className="text-emerald-700 font-semibold hidden sm:inline">
          ✦ Positive Net Delta
        </span>
      </div>
    </div>
  )
}
