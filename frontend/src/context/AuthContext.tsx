import React, { useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../services/supabaseClient'
import type { UserProfile } from '../types/finance'
import { AuthContext } from './authContextDef'

const DEMO_USER_KEY = 'finora_demo_user_active'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const configured = isSupabaseConfigured()

  // Initialize state directly from demo cache if Supabase is unconfigured
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(() => {
    if (!configured) {
      try {
        const demo = localStorage.getItem(DEMO_USER_KEY)
        if (demo) {
          const parsed = JSON.parse(demo)
          return { id: parsed.id, email: parsed.email } as any
        }
      } catch {}
    }
    return null
  })

  const [profile, setProfile] = useState<UserProfile | null>(() => {
    if (!configured) {
      try {
        const demo = localStorage.getItem(DEMO_USER_KEY)
        if (demo) return JSON.parse(demo)
      } catch {}
    }
    return null
  })

  const [loading, setLoading] = useState(configured)

  // Initialize live session on mount if Supabase is configured
  useEffect(() => {
    if (!configured) return

    let mounted = true

    // 1. Get existing active session from Supabase
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      if (!mounted) return
      setSession(existingSession)
      setUser(existingSession?.user ?? null)
      if (existingSession?.user) {
        setProfile({
          id: existingSession.user.id,
          email: existingSession.user.email || 'user@finora.ai',
          fullName: existingSession.user.user_metadata?.full_name || existingSession.user.email?.split('@')[0] || 'Private Client',
          tier: 'Tier I · Ultra Wealth'
        })
      }
      setLoading(false)
    })

    // 2. Listen to live auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!mounted) return
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      if (currentSession?.user) {
        setProfile({
          id: currentSession.user.id,
          email: currentSession.user.email || 'user@finora.ai',
          fullName: currentSession.user.user_metadata?.full_name || currentSession.user.email?.split('@')[0] || 'Private Client',
          tier: 'Tier I · Ultra Wealth'
        })
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [configured])

  // Email / Password Login
  const signIn = async (email: string, password: string) => {
    if (!configured) {
      return {
        error: new Error('Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file or use Demo Mode.')
      }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    return { error }
  }

  // Email / Password Sign Up
  const signUp = async (email: string, password: string, fullName: string) => {
    if (!configured) {
      return {
        error: new Error('Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file or use Demo Mode.')
      }
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })

    return { error }
  }

  // Logout
  const signOut = async () => {
    if (configured) {
      await supabase.auth.signOut()
    }
    localStorage.removeItem(DEMO_USER_KEY)
    setUser(null)
    setSession(null)
    setProfile(null)
  }

  // Demo user login when Supabase is pending setup
  const signInDemo = () => {
    const demoProfile: UserProfile = {
      id: 'demo-user-001',
      email: 'alexander.sterling@finora.ai',
      fullName: 'Alexander Sterling',
      tier: 'Tier I · Ultra Wealth'
    }
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoProfile))
    setUser({ id: demoProfile.id, email: demoProfile.email } as any)
    setProfile(demoProfile)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isConfigured: configured,
        signIn,
        signUp,
        signOut,
        signInDemo
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
