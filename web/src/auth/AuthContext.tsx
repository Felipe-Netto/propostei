import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  login as apiLogin,
  register as apiRegister,
  extractToken,
} from '@/api/auth-api'
import {
  getAccessToken,
  setAccessToken,
  removeAccessToken,
} from '@/storage/auth-storage'

function isTokenValid(token: string): boolean {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false

    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))) as unknown

    if (payload === null || typeof payload !== 'object') return false

    const obj = payload as Record<string, unknown>

    if (typeof obj['exp'] !== 'number') return true

    return obj['exp'] * 1000 > Date.now()
  } catch {
    return false
  }
}

interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = getAccessToken()
    if (stored && isTokenValid(stored)) {
      setToken(stored)
    } else {
      removeAccessToken()
    }
    setIsLoading(false)
  }, [])

  async function login(email: string, password: string): Promise<void> {
    const data = await apiLogin({ email, password })
    const extracted = extractToken(data)
    if (!extracted) throw new Error('Token not found in response')
    setAccessToken(extracted)
    setToken(extracted)
  }

  async function register(name: string, email: string, password: string): Promise<boolean> {
    const data = await apiRegister({ name, email, password })
    const extracted = extractToken(data)
    if (extracted) {
      setAccessToken(extracted)
      setToken(extracted)
      return true
    }
    return false
  }

  function logout(): void {
    removeAccessToken()
    setToken(null)
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: token !== null,
        isLoading,
        token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
