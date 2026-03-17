import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createOrg, createOrgAdmin } from '../../services/orgService'
import { ArrowLeft, Building2, User, CheckCircle, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 30)
}

export default function NewOrg() {
  const navigate = useNavigate()
  const [step, setStep]     = useState(1) // 1 = org info, 2 = admin user, 3 = done
  const [saving, setSaving] = useState(false)
  const [newOrgId, setNewOrgId] = useState(null)

  const [orgForm, setOrgForm] = useState({
    businessName: '',
    slug:         '',
    contactEmail: '',
    contactPhone: '',
    description:  '',
  })
  const [adminForm, setAdminForm] = useState({
    name:         '',
    email:        '',
    tempPassword: '',
  })
  const [showPass, setShowPass] = useState(false)

  function handleOrgChange(e) {
    const { name, value } = e.target
    setOrgForm(prev => {
      const next = { ...prev, [name]: value }
      if (name === 'businessName' && !prev.slug) {
        next.slug = slugify(value)
      }
      return next
    })
  }

  async function handleOrgSubmit(e) {
    e.preventDefault()
    if (!orgForm.slug.match(/^[a-z0-9]+$/)) {
      toast.error('Slug must contain only lowercase letters and numbers.')
      return
    }
    setSaving(true)
    try {
      const id = await createOrg(orgForm)
      setNewOrgId(id)
      setStep(2)
      toast.success('Organization created!')
    } catch (err) {
      toast.error(err.message || 'Failed to create organization.')
    } finally {
      setSaving(false)
    }
  }

  async function handleAdminSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await createOrgAdmin({ orgId: newOrgId, ...adminForm })
      toast.success('Admin account created! Password reset email sent.')
      setStep(3)
    } catch (err) {
      toast.error(err.message || 'Failed to create admin user.')
    } finally {
      setSaving(false)
    }
  }

  if (step === 3) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Organization Onboarded!</h2>
        <p className="text-slate-500 mt-2">
          <strong>{orgForm.businessName}</strong> is now live on the platform.
          Admin login details were sent to <strong>{adminForm.email}</strong>.
        </p>
        <div className="mt-6 p-4 bg-slate-50 rounded-xl text-sm text-slate-600 text-left space-y-2">
          <p><strong>Slug:</strong> <code className="bg-white px-2 py-0.5 rounded border">{orgForm.slug}</code></p>
          <p><strong>Admin login URL:</strong> <code className="bg-white px-2 py-0.5 rounded border text-xs">{window.location.origin}/app/{orgForm.slug}/login</code></p>
          <p><strong>Admin email:</strong> {adminForm.email}</p>
          <p><strong>Admin password:</strong> {adminForm.tempPassword}</p>
        </div>
        <div className="flex gap-3 justify-center mt-6">
          <Link to="/admin" className="btn-secondary">Back to Dashboard</Link>
          <button onClick={() => { setStep(1); setOrgForm({ businessName:'',slug:'',contactEmail:'',contactPhone:'',description:'' }); setAdminForm({ name:'',email:'',tempPassword:'TempPass@123' }); setNewOrgId(null) }} className="btn-primary">
            Onboard Another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link to="/admin" className="btn-secondary px-2.5 py-2.5">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Onboard New Organization</h1>
          <p className="text-sm text-slate-500">Step {step} of 2</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { n: 1, label: 'Organization Info', icon: Building2 },
          { n: 2, label: 'Admin Account',     icon: User },
        ].map(({ n, label, icon: Icon }) => (
          <div key={n} className="flex items-center gap-2 flex-1">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0
              ${step >= n ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
              {step > n ? '✓' : n}
            </div>
            <span className={`text-sm font-medium ${step >= n ? 'text-slate-800' : 'text-slate-400'}`}>
              {label}
            </span>
            {n < 2 && <div className="flex-1 h-px bg-slate-200 mx-2" />}
          </div>
        ))}
      </div>

      <div className="card p-6 sm:p-8">
        {step === 1 && (
          <form onSubmit={handleOrgSubmit} className="space-y-5">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-brand-600" /> Organization Details
            </h2>

            <div>
              <label className="label">Business Name *</label>
              <input name="businessName" value={orgForm.businessName} onChange={handleOrgChange}
                className="input" placeholder="Kalash Seeds Pvt Ltd" required />
            </div>

            <div>
              <label className="label">
                Subdomain / Slug *
                <span className="text-slate-400 font-normal ml-1">(used in admin URL & QR links)</span>
              </label>
              <div className="flex items-center gap-0">
                <div className="px-3 py-2.5 bg-slate-50 border border-r-0 border-slate-200 rounded-l-lg text-sm text-slate-500">
                  {window.location.hostname}/app/
                </div>
                <input name="slug" value={orgForm.slug} onChange={handleOrgChange}
                  className="input rounded-l-none" placeholder="kalashseeds"
                  pattern="[a-z0-9]+" title="Lowercase letters and numbers only"
                  required />
              </div>
              <p className="text-xs text-slate-400 mt-1">Only lowercase letters and numbers. Cannot be changed later.</p>
            </div>

            <div>
              <label className="label">Contact Email *</label>
              <input type="email" name="contactEmail" value={orgForm.contactEmail} onChange={handleOrgChange}
                className="input" placeholder="info@kalashseeds.com" required />
            </div>

            <div>
              <label className="label">Contact Phone</label>
              <input name="contactPhone" value={orgForm.contactPhone} onChange={handleOrgChange}
                className="input" placeholder="+91 98765 43210" />
            </div>

            <div>
              <label className="label">Description</label>
              <textarea name="description" value={orgForm.description} onChange={handleOrgChange}
                className="input resize-none" rows={3}
                placeholder="Brief description of the business…" />
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="btn-primary px-6">
                {saving ? 'Creating…' : 'Continue →'}
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleAdminSubmit} className="space-y-5">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <User className="h-5 w-5 text-brand-600" /> Create Admin Account
            </h2>
            <p className="text-sm text-slate-500">
              This person will manage products and QR codes for <strong>{orgForm.businessName}</strong>.
              They will receive a password-reset email to set their own password.
            </p>

            <div>
              <label className="label">Admin Name *</label>
              <input value={adminForm.name}
                onChange={e => setAdminForm(p => ({ ...p, name: e.target.value }))}
                className="input" placeholder="Rahul Patel" required />
            </div>

            <div>
              <label className="label">Admin Email *</label>
              <input type="email" value={adminForm.email}
                onChange={e => setAdminForm(p => ({ ...p, email: e.target.value }))}
                className="input" placeholder="rahul@kalashseeds.com" required />
            </div>

            <div>
              <label className="label">Password *</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={adminForm.tempPassword}
                  onChange={e => setAdminForm(p => ({ ...p, tempPassword: e.target.value }))}
                  className="input pr-10"
                  placeholder="Set a login password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">Share this password with the admin so they can log in.</p>
            </div>

            <div className="flex gap-3 justify-between">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary">
                ← Back
              </button>
              <button type="submit" disabled={saving} className="btn-primary px-6">
                {saving ? 'Creating…' : 'Create Admin & Finish'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
