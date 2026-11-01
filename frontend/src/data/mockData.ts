import type {
  Transaction,
  FinancialInsight,
  BudgetGoal,
  NotificationItem
} from '../types/finance'

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-101',
    title: 'Venture Equity Q3 Dividend',
    description: 'Quarterly distribution from BluePeak Capital Series B',
    amount: 220000,
    type: 'income',
    category: 'Investment',
    date: '2026-11-01',
    paymentMethod: 'HDFC Infinia Metal',
    status: 'completed',
    aiCategorized: true
  },
  {
    id: 'tx-102',
    title: 'Apex Sky Penthouse Maintenance',
    description: 'Monthly residential estate HOA and concierge service',
    amount: 38500,
    type: 'expense',
    category: 'Housing',
    date: '2026-10-31',
    paymentMethod: 'ICICI Wealth NetBanking',
    status: 'completed',
    aiCategorized: false
  },
  {
    id: 'tx-103',
    title: 'Private Wealth Advisory Retainer',
    description: 'Sterling & Co. fiduciary family office management',
    amount: 15000,
    type: 'expense',
    category: 'Bills & Utilities',
    date: '2026-10-29',
    paymentMethod: 'Axis Burgundy Wire',
    status: 'completed',
    aiCategorized: true
  },
  {
    id: 'tx-104',
    title: 'Sovereign Gold Bond Semi-Annual Coupon',
    description: 'RBI Sovereign Gold Bonds Tranche 2024 tranche IV interest',
    amount: 65000,
    type: 'income',
    category: 'Investment',
    date: '2026-10-28',
    paymentMethod: 'Direct Credit RBI',
    status: 'completed',
    aiCategorized: true
  },
  {
    id: 'tx-105',
    title: 'Taj Coromandel Private Dining',
    description: 'Client reception dinner & sommelier service',
    amount: 18400,
    type: 'expense',
    category: 'Food',
    date: '2026-10-27',
    paymentMethod: 'HDFC Infinia Metal',
    status: 'completed',
    aiCategorized: false
  },
  {
    id: 'tx-106',
    title: 'AWS Cloud & Dedicated GPU Cluster',
    description: 'Dedicated cloud instances for algorithmic portfolio modeling',
    amount: 14200,
    type: 'expense',
    category: 'Bills & Utilities',
    date: '2026-10-26',
    paymentMethod: 'Corporate Card',
    status: 'flagged',
    aiCategorized: true
  },
  {
    id: 'tx-107',
    title: 'Principal Architecture Consulting Retainer',
    description: 'FinTech strategic design consultation for Horizon Labs',
    amount: 100000,
    type: 'income',
    category: 'Freelance',
    date: '2026-10-25',
    paymentMethod: 'Axis Burgundy Wire',
    status: 'completed',
    aiCategorized: true
  },
  {
    id: 'tx-108',
    title: 'Tumi 19 Degree Aluminum Travel Kit',
    description: 'International travel essentials for Geneva summit',
    amount: 32000,
    type: 'expense',
    category: 'Shopping',
    date: '2026-10-23',
    paymentMethod: 'HDFC Infinia Metal',
    status: 'completed',
    aiCategorized: true
  },
  {
    id: 'tx-109',
    title: 'Max Bupa Heartbeat Platinum Policy',
    description: 'Comprehensive annual family medical underwriting',
    amount: 24700,
    type: 'expense',
    category: 'Healthcare',
    date: '2026-10-20',
    paymentMethod: 'UPI AutoPay',
    status: 'completed',
    aiCategorized: true
  },
  {
    id: 'tx-110',
    title: 'Executive Air Charter Mumbai-Bangalore',
    description: 'Regional corporate meetings and investor roadshow',
    amount: 28000,
    type: 'expense',
    category: 'Transport',
    date: '2026-10-18',
    paymentMethod: 'Corporate Card',
    status: 'completed',
    aiCategorized: true
  },
  {
    id: 'tx-111',
    title: 'Wharton Executive FinTech Masterclass',
    description: 'Advanced quantitative leadership credential enrollment',
    amount: 45000,
    type: 'expense',
    category: 'Education',
    date: '2026-10-12',
    paymentMethod: 'HDFC Infinia Metal',
    status: 'completed',
    aiCategorized: true
  },
  {
    id: 'tx-112',
    title: 'Symphony Gala & Private Box Suite',
    description: 'Annual cultural patron membership & box reception',
    amount: 12500,
    type: 'expense',
    category: 'Entertainment',
    date: '2026-10-05',
    paymentMethod: 'Axis Burgundy Wire',
    status: 'completed',
    aiCategorized: true
  }
]

export const INITIAL_AI_INSIGHTS: FinancialInsight[] = [
  {
    id: 'ai-1',
    title: 'Surplus Allocation Velocity',
    description: 'Your net savings rate achieved exceptional levels, outperforming the top decile of private wealth benchmarks. Reallocating surplus into short-duration corporate debt funds could yield an additional 8.4% annualized return.',
    category: 'savings',
    impactScore: 94,
    potentialSavings: 85000,
    metric: 'Net Surplus High',
    badge: 'High Impact Opportunity',
    createdAt: 'Generated today at 09:15 AM',
    actionable: 'Deploy surplus cash reserves into higher-yield debt instruments.'
  },
  {
    id: 'ai-2',
    title: 'Unusual Recurring Cloud Surge Alert',
    description: 'Bills & utilities increased above trailing 30-day baseline. An automated cloud instance was detected running continuously.',
    category: 'alert',
    impactScore: 86,
    potentialSavings: 14200,
    metric: 'Variance Flagged',
    badge: 'Spend Anomaly',
    createdAt: 'Detected 2 hours ago',
    actionable: 'Review cloud auto-shutdown schedules to eliminate unused compute costs.'
  },
  {
    id: 'ai-3',
    title: 'Food & Hospitality Optimization',
    description: 'Food and hospitality expenses reached private engagement thresholds. Leveraging HDFC Infinia 5x reward points on luxury hotel dining could yield direct statement credit.',
    category: 'recommendation',
    impactScore: 78,
    potentialSavings: 9400,
    metric: '₹9,400 Reward Value',
    badge: 'Points Arbitrage',
    createdAt: 'Updated yesterday',
    actionable: 'Activate Infinia Concierge luxury dining multiplier.'
  },
  {
    id: 'ai-4',
    title: 'Tax-Harvesting & Sovereign Bond Reinvestment',
    description: 'Upcoming coupon credit from Sovereign Gold Bonds can be paired with year-end index fund rebalancing to optimize short-term capital gains tax liabilities.',
    category: 'investment',
    impactScore: 91,
    potentialSavings: 28000,
    metric: '₹28,000 Tax Shield',
    badge: 'Tax Efficiency',
    createdAt: 'Computed 3 days ago',
    actionable: 'Schedule tax harvesting review with wealth fiduciary.'
  }
]

export const INITIAL_BUDGET_GOALS: BudgetGoal[] = [
  {
    id: 'bg-1',
    category: 'Housing',
    monthlyLimit: 60000,
    currentSpent: 38500,
    color: '#1D4938',
    iconName: 'Building2'
  },
  {
    id: 'bg-2',
    category: 'Food',
    monthlyLimit: 25000,
    currentSpent: 18400,
    color: '#D6B66C',
    iconName: 'Coffee'
  },
  {
    id: 'bg-3',
    category: 'Bills & Utilities',
    monthlyLimit: 35000,
    currentSpent: 29200,
    color: '#265F4A',
    iconName: 'Laptop'
  },
  {
    id: 'bg-4',
    category: 'Shopping',
    monthlyLimit: 40000,
    currentSpent: 32000,
    color: '#102820',
    iconName: 'ShoppingBag'
  },
  {
    id: 'bg-5',
    category: 'Healthcare',
    monthlyLimit: 30000,
    currentSpent: 24700,
    color: '#75847B',
    iconName: 'HeartPulse'
  }
]

export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Dividend Credit Received',
    message: '₹2,20,000 from BluePeak Capital has cleared in your HDFC account.',
    time: '15m ago',
    read: false,
    type: 'transaction'
  },
  {
    id: 'notif-2',
    title: 'AI Anomaly Flagged',
    message: 'Cloud infrastructure billing spiked above baseline variance.',
    time: '2h ago',
    read: false,
    type: 'alert'
  },
  {
    id: 'notif-3',
    title: 'Monthly Savings Target Met',
    message: 'Congratulations! Positive net capital surplus maintained this period.',
    time: '1d ago',
    read: true,
    type: 'insight'
  }
]
