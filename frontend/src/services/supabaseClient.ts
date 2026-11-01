import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL || ''
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

/**
 * Check whether Supabase environment variables have been filled with real credentials.
 */
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    rawUrl &&
    rawAnonKey &&
    rawUrl.startsWith('https://') &&
    !rawUrl.includes('your-project') &&
    !rawAnonKey.includes('your_supabase_anon')
  )
}

// Fallback dummy URL and Key to safely prevent runtime crashes if env vars are empty
const supabaseUrl = isSupabaseConfigured() ? rawUrl : 'https://placeholder.supabase.co'
const supabaseAnonKey = isSupabaseConfigured() ? rawAnonKey : 'placeholder-anon-key'

/**
 * Shared Supabase Client instance with session persistence in localStorage
 * and automatic JWT token refresh.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  }
})

