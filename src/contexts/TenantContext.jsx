import { createContext, useContext, useEffect, useState } from 'react'
import api from '../config/api'

const TenantContext = createContext(null)

export function TenantProvider({ slug, children }) {
  const [org, setOrg]         = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!slug) { setLoading(false); return }
    loadOrg(slug)
  }, [slug])

  async function loadOrg(slugValue) {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get(`/api/orgs/by-slug/${slugValue.toLowerCase()}`)
      setOrg(data)
    } catch (e) {
      setError(e.response?.status === 404 ? 'not_found' : 'error')
      setOrg(null)
    } finally {
      setLoading(false)
    }
  }

  async function refreshOrg() {
    if (org?.slug) await loadOrg(org.slug)
  }

  return (
    <TenantContext.Provider value={{ org, loading, error, refreshOrg }}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const ctx = useContext(TenantContext)
  if (!ctx) throw new Error('useTenant must be used inside TenantProvider')
  return ctx
}
