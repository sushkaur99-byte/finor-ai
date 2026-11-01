import React, { useState } from 'react'
import {
  Lock,
  Mail,
  User,
  Shield,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Database,
  ExternalLink
} from 'lucide-react'
import { useAuth } from '../../context/useAuth'

export const AuthView: React.FC = () => {
  const { signIn, signUp, signInDemo, isConfigured } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  // Form State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // UI State
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [showConfigHelp, setShowConfigHelp] = useState(!isConfigured)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.')
      return
    }

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setErrorMsg('Please provide your full name for private wealth registration.')
        return
      }
      if (password.length < 6) {
        setErrorMsg('Security policy: Password must be at least 6 characters.')
        return
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.')
        return
      }
    }

    setLoading(true)

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email.trim(), password)
        if (error) {
          setErrorMsg(error.message || 'Failed to authenticate. Please check your credentials.')
        }
      } else {
        const { error } = await signUp(email.trim(), password, fullName.trim())
        if (error) {
          setErrorMsg(error.message || 'Failed to create account.')
        } else {
          setSuccessMsg('Private account created! If email confirmation is enabled on your Supabase project, check your inbox to confirm.')
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#102820] text-white flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden selection:bg-[#D6B66C]/40 selection:text-[#102820]">
      {/* Subtle luxury ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#1D4938]/40 via-[#D6B66C]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1D4938] to-[#102820] border border-[#D6B66C]/50 shadow-xl shadow-black/40 mb-3 group">
            <span className="font-serif font-bold text-2xl text-[#D6B66C] tracking-widest">F</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-wider text-white">
              FINORA
            </h1>
            <span className="text-xs font-bold tracking-widest px-2 py-0.5 rounded bg-[#D6B66C]/20 text-[#D6B66C] border border-[#D6B66C]/30">
              AI
            </span>
          </div>
          <p className="text-xs text-[#A8BBAA] tracking-wider uppercase font-medium mt-1">
            Private Wealth & Financial Intelligence
          </p>
        </div>

        {/* Authentication Card */}
        <div className="bg-[#16382C]/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-[#D6B66C]/30 shadow-2xl">
          {/* Mode Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-[#102820] p-1 rounded-2xl border border-[#1D4938] mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('signin')
                setErrorMsg(null)
                setSuccessMsg(null)
              }}
              className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                mode === 'signin'
                  ? 'bg-[#1D4938] text-white shadow-md border border-[#D6B66C]/30'
                  : 'text-[#A8BBAA] hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup')
                setErrorMsg(null)
                setSuccessMsg(null)
              }}
              className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                mode === 'signup'
                  ? 'bg-[#1D4938] text-white shadow-md border border-[#D6B66C]/30'
                  : 'text-[#A8BBAA] hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{successMsg}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-[#A8BBAA] mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8BBAA]" />
                  <input
                    type="text"
                    required
                    placeholder="Alexander Sterling"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#102820] border border-[#1D4938] text-white placeholder-[#75847B] focus:outline-hidden focus:border-[#D6B66C] transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#A8BBAA] mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8BBAA]" />
                <input
                  type="email"
                  required
                  placeholder="name@finora.ai"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#102820] border border-[#1D4938] text-white placeholder-[#75847B] focus:outline-hidden focus:border-[#D6B66C] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A8BBAA] mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8BBAA]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#102820] border border-[#1D4938] text-white placeholder-[#75847B] focus:outline-hidden focus:border-[#D6B66C] transition-all"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-[#A8BBAA] mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8BBAA]" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#102820] border border-[#1D4938] text-white placeholder-[#75847B] focus:outline-hidden focus:border-[#D6B66C] transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#D6B66C] to-[#BC9948] hover:from-[#E5CA85] hover:to-[#D6B66C] text-[#102820] font-bold text-xs tracking-wider uppercase shadow-lg shadow-black/30 transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In to Wealth Vault' : 'Register Private Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Mode Access */}
          <div className="mt-5 pt-4 border-t border-[#1D4938] text-center">
            <p className="text-[11px] text-[#A8BBAA] mb-2">
              Previewing interface or testing without entering credentials?
            </p>
            <button
              type="button"
              onClick={signInDemo}
              className="w-full py-2 px-3 rounded-xl bg-[#102820] hover:bg-[#1D4938] text-[#D6B66C] border border-[#D6B66C]/40 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Enter in Demo Mode (Alexander Sterling)</span>
            </button>
          </div>
        </div>

        {/* Supabase Status Banner */}
        <div className="mt-4 p-4 rounded-2xl bg-[#16382C]/60 border border-[#1D4938] text-xs text-[#A8BBAA]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1.5 font-semibold text-white">
              <Database className="w-3.5 h-3.5 text-[#D6B66C]" />
              <span>Supabase Cloud Integration</span>
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isConfigured
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {isConfigured ? 'Connected' : 'Setup Required'}
            </span>
          </div>

          <p className="text-[11px] leading-relaxed">
            {isConfigured
              ? 'Connected to your Supabase project. Row Level Security active.'
              : 'To connect your live Supabase database, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env.'}
          </p>

          <button
            onClick={() => setShowConfigHelp(!showConfigHelp)}
            className="text-[11px] text-[#D6B66C] hover:underline font-semibold mt-1.5 block cursor-pointer"
          >
            {showConfigHelp ? 'Hide Setup Guide ▲' : 'View Setup Guide & SQL Instructions ▼'}
          </button>

          {showConfigHelp && (
            <div className="mt-3 pt-3 border-t border-[#1D4938] text-[11px] text-[#A8BBAA] space-y-2">
              <p>
                <strong className="text-white">1. Project Setup:</strong> Create a project at{' '}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#D6B66C] inline-flex items-center gap-0.5 hover:underline"
                >
                  supabase.com <ExternalLink className="w-3 h-3 inline" />
                </a>
              </p>
              <p>
                <strong className="text-white">2. SQL Migration:</strong> Run the complete schema script in Supabase SQL Editor. The file is located at <code className="text-[#D6B66C] bg-[#102820] px-1 py-0.5 rounded">supabase/schema.sql</code>.
              </p>
              <p>
                <strong className="text-white">3. Environment Variables:</strong> Copy <code className="text-[#D6B66C] bg-[#102820] px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> and <code className="text-[#D6B66C] bg-[#102820] px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code> into <code className="text-[#D6B66C] bg-[#102820] px-1 py-0.5 rounded">frontend/.env</code>.
              </p>
            </div>
          )}
        </div>

        {/* Security Stamp */}
        <div className="mt-4 text-center text-[11px] text-[#A8BBAA]/60 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-[#D6B66C]" />
          <span>256-bit AES Vault Encryption · Supabase Row Level Security</span>
        </div>
      </div>
    </div>
  )
}
