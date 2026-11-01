import React, { useState, useRef, useEffect } from 'react'
import {
  Search,
  Bell,
  Plus,
  Menu,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronDown
} from 'lucide-react'
import type { NotificationItem, UserProfile } from '../../types/finance'
import { LogOut } from 'lucide-react'

interface HeaderProps {
  onOpenAddModal: () => void
  onToggleMobileSidebar: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
  notifications: NotificationItem[]
  onMarkNotificationRead: (id: string) => void
  onMarkAllNotificationsRead: () => void
  profile?: UserProfile | null
  onLogout?: () => void
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddModal,
  onToggleMobileSidebar,
  searchQuery,
  onSearchChange,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  profile,
  onLogout
}) => {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const displayName = profile?.fullName || profile?.email?.split('@')[0] || 'Alexander'
  const firstName = displayName.split(' ')[0]
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

  // Current formatted date & time-based greeting initialized safely
  const [{ formattedDate, greeting }] = useState(() => {
    const now = new Date()
    const formatted = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
    const hour = now.getHours()
    const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
    return { formattedDate: formatted, greeting: greet }
  })

  const unreadCount = notifications.filter(n => !n.read).length

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-30 bg-[#F5F1E8]/90 backdrop-blur-md border-b border-[#A8BBAA]/30 px-4 sm:px-8 py-4 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button & Personalized Greeting */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-[#102820] hover:bg-[#A8BBAA]/20 transition-colors border border-[#A8BBAA]/40"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17251F]">
                {greeting}, <span className="font-serif italic font-semibold text-[#1D4938]">{firstName}</span>
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#1D4938]/10 text-[#1D4938] border border-[#1D4938]/20">
                <Sparkles className="w-3 h-3 text-[#D6B66C]" /> Welcome Back
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#75847B] mt-0.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-[#A8BBAA]" />
              <span>{formattedDate}</span>
              <span className="text-[#A8BBAA]">•</span>
              <span className="text-[#1D4938] font-semibold">INR (₹) Portfolio Mode</span>
            </div>
          </div>
        </div>

        {/* Right Side: Search, Notifications, Avatar, Add Transaction Button */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-64 md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#75847B]" />
            <input
              type="text"
              placeholder="Search transactions, assets..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-[#A8BBAA]/40 text-xs text-[#17251F] placeholder-[#75847B] focus:outline-hidden focus:ring-2 focus:ring-[#1D4938]/40 focus:border-[#1D4938] shadow-xs transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#75847B] hover:text-[#17251F]"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl bg-white border border-[#A8BBAA]/40 text-[#17251F] hover:bg-[#FAF8F5] hover:border-[#1D4938]/50 shadow-xs transition-all"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4 text-[#17251F]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#1D4938] text-[9px] font-bold text-white border-2 border-[#F5F1E8]">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popup */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-[#A8BBAA]/40 shadow-2xl z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-[#A8BBAA]/20">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#102820]">
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-[#D6B66C]/20 text-[#102820] text-[10px] font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={onMarkAllNotificationsRead}
                        className="text-[11px] font-semibold text-[#1D4938] hover:text-[#102820] transition-colors"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-[#A8BBAA]/15 max-h-72 overflow-y-auto mt-2">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-[#75847B]">
                        No notifications to display.
                      </div>
                    ) : (
                      notifications.map(item => (
                        <div
                          key={item.id}
                          onClick={() => onMarkNotificationRead(item.id)}
                          className={`p-2.5 rounded-lg flex items-start gap-3 transition-colors cursor-pointer ${
                            item.read ? 'opacity-70 hover:bg-[#F5F1E8]' : 'bg-[#F5F1E8]/60 hover:bg-[#F5F1E8]'
                          }`}
                        >
                          <div className="mt-0.5">
                            {item.type === 'alert' ? (
                              <div className="p-1 rounded-md bg-amber-100 text-amber-800">
                                <AlertCircle className="w-3.5 h-3.5" />
                              </div>
                            ) : item.type === 'insight' ? (
                              <div className="p-1 rounded-md bg-[#D6B66C]/20 text-[#102820]">
                                <Sparkles className="w-3.5 h-3.5" />
                              </div>
                            ) : (
                              <div className="p-1 rounded-md bg-[#1D4938]/10 text-[#1D4938]">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-[#17251F]">{item.title}</h4>
                              <span className="text-[10px] text-[#75847B]">{item.time}</span>
                            </div>
                            <p className="text-[11px] text-[#75847B] mt-0.5 leading-snug">
                              {item.message}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-2 mt-2 border-t border-[#A8BBAA]/20 text-center">
                    <span className="text-[10px] text-[#75847B]">
                      ✦ Finora Wealth AI Automated Surveillance
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Quick Menu */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 pl-1.5 rounded-xl bg-white border border-[#A8BBAA]/40 hover:border-[#1D4938]/50 shadow-xs transition-all cursor-pointer"
                aria-label="User profile options"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#102820] to-[#1D4938] text-white flex items-center justify-center font-serif text-xs font-bold border border-[#D6B66C]/40">
                  {initials}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#75847B] pr-0.5 hidden sm:inline" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-[#A8BBAA]/40 shadow-xl z-50 p-2 animate-in fade-in duration-150">
                  <div className="px-3 py-2 border-b border-[#A8BBAA]/20">
                    <p className="text-xs font-bold text-[#17251F] truncate">{displayName}</p>
                    <p className="text-[10px] text-[#75847B] truncate">{profile?.email || 'sterling@finora.ai'}</p>
                    <p className="text-[10px] text-[#1D4938] font-mono mt-0.5">Tier: {profile?.tier || 'Private Client'}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false)
                        alert('Base Portfolio Currency: Indian Rupee (INR ₹).')
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-[#17251F] hover:bg-[#F5F1E8] rounded-lg transition-colors cursor-pointer"
                    >
                      Currency: INR (₹)
                    </button>
                    {onLogout && (
                      <button
                        onClick={() => {
                          setShowProfileMenu(false)
                          onLogout()
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5 font-medium cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out of Account</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Premium Gold-Accented "Add Transaction" Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-[#102820] to-[#1D4938] text-[#D6B66C] hover:text-white border border-[#D6B66C]/60 shadow-md shadow-[#102820]/20 hover:shadow-lg hover:shadow-[#D6B66C]/20 transition-all duration-200 active:scale-95 group font-medium text-xs sm:text-sm"
            >
              <div className="p-0.5 rounded-md bg-[#D6B66C]/20 text-[#D6B66C] group-hover:bg-[#D6B66C] group-hover:text-[#102820] transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold tracking-wide">Add Transaction</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
