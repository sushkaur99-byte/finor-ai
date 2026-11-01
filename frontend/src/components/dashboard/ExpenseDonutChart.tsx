import React, { useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import type { CategoryBreakdownItem } from '../../types/finance'
import { formatINR } from '../../utils/formatters'
import { PieChart as PieIcon } from 'lucide-react'

interface ExpenseDonutChartProps {
  data: CategoryBreakdownItem[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    payload: CategoryBreakdownItem
  }>
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload
    return (
      <div className="bg-[#102820] text-white p-3 rounded-xl border border-[#D6B66C]/40 shadow-xl text-xs">
        <p className="font-semibold text-[#D6B66C] mb-1">{item.name}</p>
        <p className="font-mono text-white text-sm font-bold">{formatINR(item.amount)}</p>
        <p className="text-[11px] text-[#A8BBAA] mt-0.5">
          {item.percentage}% of monthly portfolio expenditure
        </p>
      </div>
    )
  }
  return null
}

export const ExpenseDonutChart: React.FC<ExpenseDonutChartProps> = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const totalExpense = data.reduce((sum, item) => sum + item.amount, 0)
  const activeItem = activeIndex !== null ? data[activeIndex] : null

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#A8BBAA]/30 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#A8BBAA]/20">
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#17251F]">
              Expense Allocation
            </h3>
          </div>
          <div className="flex items-center gap-1 text-xs text-[#75847B]">
            <PieIcon className="w-3.5 h-3.5 text-[#1D4938]" />
            <span>Category Spread</span>
          </div>
        </div>

        {/* Donut Chart with center summary */}
        <div className="relative h-60 w-full my-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={88}
                paddingAngle={3}
                dataKey="amount"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="#FFFFFF"
                    strokeWidth={2}
                    className="transition-all duration-300 hover:opacity-85 cursor-pointer"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center text overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#75847B]">
              {activeItem ? activeItem.name : 'Total Outflow'}
            </span>
            <span className="text-base sm:text-lg font-bold font-serif text-[#17251F]">
              {formatINR(activeItem ? activeItem.amount : totalExpense)}
            </span>
            <span className="text-[10px] text-[#1D4938] font-bold">
              {activeItem ? `${activeItem.percentage}%` : '100% Portfolio'}
            </span>
          </div>
        </div>
      </div>

      {/* Category breakdown legend list */}
      <div className="space-y-2 mt-2 pt-3 border-t border-[#A8BBAA]/20">
        {data.slice(0, 4).map((cat, idx) => (
          <div
            key={idx}
            onMouseEnter={() => setActiveIndex(idx)}
            onMouseLeave={() => setActiveIndex(null)}
            className={`flex items-center justify-between p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              activeIndex === idx ? 'bg-[#F5F1E8]' : 'hover:bg-[#F5F1E8]/60'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-[#17251F] font-medium truncate max-w-36">
                {cat.name}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#75847B] font-mono text-[11px]">{cat.percentage}%</span>
              <span className="font-semibold text-[#17251F] font-mono">{formatINR(cat.amount)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
