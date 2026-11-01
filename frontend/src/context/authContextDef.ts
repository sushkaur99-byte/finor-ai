import { createContext } from 'react'
import type { User, Session, AuthError } from '@supabase/supabase-js'
import type { UserProfile } from '../types/finance'

export interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  isConfigured: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | Error | null }>
  signOut: () => Promise<void>
  signInDemo: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

