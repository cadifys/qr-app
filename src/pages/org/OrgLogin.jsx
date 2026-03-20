import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTenant } from '../../contexts/TenantContext'
import { QrCode, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function OrgLogin() {
  const { slug }      = useParams()
  const { signIn }    = useAuth()
  const { org, loading: orgLoading, error: orgError } = useTenant()
  const navigate      = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [resetMode, setResetMode] = useState(false)
  const { resetPassword } = useAuth()

  if (orgLoading) return <LoadingSpinner label="Loading…" />

  if (orgError === 'not_found') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800">Organization not found</h2>
          <p className="text-slate-500 mt-2">No organization with slug "<code>{slug}</code>" exists.</p>
        </div>
      </div>
    )
  }

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn(email, password)
      navigate(`/app/${slug}`)
    } catch {
      toast.error('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  async function handleReset(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await resetPassword(email)
      toast.success('Password reset email sent!')
      setResetMode(false)
    } catch {
      toast.error('Failed to send reset email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-brand-900 p-4">
      <div className="w-full max-w-md">
        {/* Org header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 bg-white/10 backdrop-blur rounded-2xl mb-4">
            <QrCode className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">{org?.businessName}</h1>
          <p className="text-white/50 text-sm mt-1">Admin Login</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {!resetMode ? (
            <>
              <h2 className="text-xl font-semibold text-slate-800 mb-6">Welcome back</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="label">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="input" placeholder="you@company.com" required autoFocus />
                </div>
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'} value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="input pr-10" placeholder="••••••••" required />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>
              <button onClick={() => setResetMode(true)}
                className="mt-4 text-xs text-brand-600 hover:underline w-full text-center">
                Forgot password?
              </button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">Reset Password</h2>
              <p className="text-sm text-slate-500 mb-6">Enter your email to receive a reset link.</p>
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="label">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="input" required autoFocus />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
              <button onClick={() => setResetMode(false)}
                className="mt-4 text-xs text-slate-500 hover:underline w-full text-center">
                ← Back to login
              </button>
            </>
          )}
        </div>

        <p className="text-center text-white/30 text-xs mt-6">Powered by CadifysAI</p>
      </div>
    </div>
  )
}
