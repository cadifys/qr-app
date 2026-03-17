import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../config/api'

export default function Setup() {
  const navigate = useNavigate()
  const [checking, setChecking]  = useState(false)
  const [allowed, setAllowed]    = useState(null)
  const [done, setDone]          = useState(false)
  const [form, setForm]          = useState({ name: '', email: '', password: '', confirm: '' })
  const [saving, setSaving]      = useState(false)

  async function checkAndAllow() {
    setChecking(true)
    try {
      const { data } = await api.get('/api/setup/check')
      setAllowed(!data.hasAdmin)
    } catch {
      toast.error('Could not connect to server. Is the backend running?')
    } finally {
      setChecking(false)
    }
  }

  if (allowed === null && !checking) checkAndAllow()

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match.')
      return
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters.')
      return
    }
    setSaving(true)
    try {
      const { data } = await api.post('/api/setup', {
        name: form.name,
        email: form.email,
        password: form.password,
      })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setDone(true)
      toast.success('Super admin created!')
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Setup failed.'
      if (msg.includes('already')) {
        toast.error('That email is already registered.')
      } else {
        toast.error(msg)
      }
    } finally {
      setSaving(false)
    }
  }

  if (checking || allowed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex items-center gap-3 text-white/60">
          <div className="h-5 w-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          Checking setup status…
        </div>
      </div>
    )
  }

  if (allowed === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <div className="max-w-sm w-full text-center">
          <div className="h-14 w-14 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-7 w-7 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white">Setup Already Complete</h1>
          <p className="text-white/50 text-sm mt-2">
            A super admin account already exists. This page is disabled for security.
          </p>
          <button onClick={() => navigate('/')} className="btn-primary mt-5">
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <div className="max-w-sm w-full text-center">
          <div className="h-14 w-14 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-7 w-7 text-green-400" />
          </div>
          <h1 className="text-xl font-bold text-white">You're all set!</h1>
          <p className="text-white/50 text-sm mt-2">
            Super admin account created for <strong className="text-white/70">{form.email}</strong>.
          </p>
          <button onClick={() => navigate('/')} className="btn-primary mt-5">
            Go to Admin Login →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-brand-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center h-14 w-14 bg-white/10 rounded-2xl mb-4">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Initial Setup</h1>
          <p className="text-white/50 text-sm mt-1">
            Create your super admin account. This page disappears after first use.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs mb-6">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            Make sure the backend server is running before proceeding.
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Your Name</label>
              <input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="input"
                placeholder="Shubham Aher"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="input"
                placeholder="admin@yourdomain.com"
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className="input"
                placeholder="Min 8 characters"
                required
                minLength={8}
              />
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input
                type="password"
                value={form.confirm}
                onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                className="input"
                placeholder="Repeat password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full py-3 text-base mt-2"
            >
              {saving ? 'Creating account…' : 'Create Super Admin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
