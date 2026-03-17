import { createContext, useContext, useEffect, useState } from 'react'
import api from '../config/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [role, setRole]       = useState(null)
  const [orgId, setOrgId]     = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      const u = JSON.parse(stored)
      setUser(u)
      setRole(u.role)
      setOrgId(u.orgId)
    }
    setLoading(false)
  }, [])

  async function signIn(email, password) {
    const { data } = await api.post('/api/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    setRole(data.user.role)
    setOrgId(data.user.orgId)
    return data
  }

  function signOut() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setRole(null)
    setOrgId(null)
  }

  async function resetPassword(email) {
    await api.post('/api/auth/reset-password', { email })
  }

  return (
    <AuthContext.Provider value={{ user, role, orgId, loading, signIn, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
