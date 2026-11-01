import React from 'react'
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  Sparkles,
  Target,
  Settings,
  X,
  Shield,
  LogOut,
  ChevronRight
} from 'lucide-react'

import type { UserProfile } from '../../types/finance'

export type NavTab = 'dashboard' | 'transactions' | 'analytics' | 'insights' | 'budgets' | 'settings'

interface SidebarProps {
  activeTab: NavTab
  onSelectTab: (tab: NavTab) => void
  isOpen: boolean
  onClose: () => void
  profile?: UserProfile | null
  onLogout?: () => void
}

const NAV_ITEMS = [
  { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions' as NavTab, label: 'Transactions', icon: ArrowLeftRight },
  { id: 'analytics' as NavTab, label: 'Analytics', icon: BarChart3 },
  { id: 'insights' as NavTab, label: 'AI Insights', icon: Sparkles, badge: 'AI' },
  { id: 'budgets' as NavTab, label: 'Budgets', icon: Target },
  { id: 'settings' as NavTab, label: 'Settings', icon: Settings }
]

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
  profile,
  onLogout
}) => {
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

  const displayName = profile?.fullName || profile?.email?.split('@')[0] || 'Alexander Sterling'
  const displayEmail = profile?.email || 'sterling@finora.ai'
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#102820]/70 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#102820] text-white flex flex-col justify-between border-r border-[#1D4938]/60 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-2xl lg:shadow-none`}
      >
        {/* Top Header & Branding */}
        <div>
          <div className="flex items-center justify-between px-6 py-6 border-b border-[#1D4938]/40">
            <div className="flex items-center gap-3">
              {/* Luxury Monogram Logo */}
              <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-[#1D4938] to-[#102820] border border-[#D6B66C]/40 shadow-md shadow-black/20 group cursor-pointer">
                <div className="absolute inset-0 rounded-xl bg-[#D6B66C]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="font-serif font-bold text-lg text-[#D6B66C] tracking-wider">F</span>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#D6B66C] border-2 border-[#102820]" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-serif text-lg font-bold tracking-wider text-white">FINORA</h1>
                  <span className="text-[10px] font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#D6B66C]/20 text-[#D6B66C] border border-[#D6B66C]/30">
                    AI
                  </span>
                </div>
                <p className="text-[10px] tracking-widest uppercase text-[#A8BBAA] font-medium">
                  Private Wealth System
                </p>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-[#A8BBAA] hover:text-white hover:bg-[#1D4938]/50 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 py-6 space-y-1.5">
            <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-[#A8BBAA]/60">
              Wealth Navigation
            </div>
            {NAV_ITEMS.map(item => {
              const Icon = item.icon
              const isActive = activeTab === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id)
                    onClose()
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-[#1D4938] text-white shadow-md shadow-[#102820]/50 border border-[#D6B66C]/30'
                      : 'text-[#A8BBAA] hover:bg-[#16382C]/60 hover:text-white'
                  }`}
                >
                  {/* Active Indicator bar */}
                  {isActive && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#D6B66C] shadow-[0_0_8px_#D6B66C]" />
                  )}

                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? 'text-[#D6B66C]' : 'text-[#A8BBAA] group-hover:text-white'
                      }`}
                    />
                    <span className={`tracking-wide ${isActive ? 'font-semibold text-white' : ''}`}>
                      {item.label}
                    </span>
                  </div>

                  {item.badge ? (
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-[#D6B66C]/20 text-[#D6B66C] border border-[#D6B66C]/40">
                      {item.badge}
                    </span>
                  ) : isActive ? (
                    <ChevronRight className="w-3.5 h-3.5 text-[#D6B66C] opacity-70" />
                  ) : null}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Bottom Section: Tier Badge & User Profile */}
        <div className="p-4 border-t border-[#1D4938]/40 space-y-3">
          {/* Wealth Tier Card */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#16382C] to-[#102820] border border-[#D6B66C]/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-[#D6B66C]/10 text-[#D6B66C]">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Private Client</p>
                <p className="text-[10px] text-[#D6B66C]">Tier I · Ultra Wealth</p>
              </div>
            </div>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D6B66C] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D6B66C]"></span>
            </span>
          </div>

          {/* User Profile */}
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-[#16382C]/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#1D4938] to-[#D6B66C] flex items-center justify-center text-xs font-bold text-white border-2 border-[#102820] shadow-sm">
                  {initials}
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#102820]" />
              </div>
              <div className="text-left overflow-hidden">
                <p className="text-xs font-semibold text-white leading-tight truncate max-w-[130px]">{displayName}</p>
                <p className="text-[10px] text-[#A8BBAA] leading-tight mt-0.5 truncate max-w-[130px]">{displayEmail}</p>
              </div>
            </div>

            <button
              title="Sign Out / Disconnect Session"
              onClick={onLogout}
              className="p-1.5 rounded-lg text-[#A8BBAA] hover:text-[#D6B66C] hover:bg-[#1D4938]/60 transition-colors cursor-pointer"
              aria-label="Account sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

