import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, setToken, getToken, type ApiUser } from '../lib/api'

type Role = 'applicant' | 'admin' | 'agent' | null

interface AuthState {
  loading: boolean
  user: ApiUser | null
  role: Role
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<ApiUser>
  signUp: (input: SignUpInput) => Promise<ApiUser>
  signOut: () => void
  refreshProfile: () => Promise<void>
}

interface SignUpInput {
  full_name: string
  email: string
  password: string
  phone?: string
  country?: string
  nationality?: string
  date_of_birth?: string
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ loading: true, user: null, role: null })

  useEffect(() => {
    const token = getToken()
    if (!token) { setState({ loading: false, user: null, role: null }); return }
    api.getMe()
      .then(user => setState({ loading: false, user, role: user.role }))
      .catch(() => { setToken(null); setState({ loading: false, user: null, role: null }) })
  }, [])

  async function signIn(email: string, password: string) {
    const { token, user } = await api.login(email, password)
    setToken(token)
    setState({ loading: false, user, role: user.role })
    return user
  }

  async function signUp(input: SignUpInput) {
    const { token, user } = await api.signup(input)
    setToken(token)
    setState({ loading: false, user, role: user.role })
    return user
  }

  function signOut() {
    setToken(null)
    setState({ loading: false, user: null, role: null })
  }

  async function refreshProfile() {
    try {
      const user = await api.getMe()
      setState({ loading: false, user, role: user.role })
    } catch { /* ignore */ }
  }

  return (
    <AuthContext.Provider value={{ ...state, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
