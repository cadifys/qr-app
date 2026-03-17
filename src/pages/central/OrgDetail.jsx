import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  getOrgById, getOrgAdmins, createOrgAdmin,
  updateOrgAdmin, deleteOrgAdmin, toggleOrgStatus,
} from '../../services/orgService'
import LoadingSpinner from '../../components/LoadingSpinner'
import {
  ArrowLeft, Building2, User, Plus, Pencil, Trash2,
  Eye, EyeOff, ToggleLeft, ToggleRight, X, Check,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

const EMPTY_ADMIN = { name: '', email: '', tempPassword: '' }

export default function OrgDetail() {
  const { orgId } = useParams()

  const [org, setOrg]         = useState(null)
  const [admins, setAdmins]   = useState([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  // add modal
  const [showAdd, setShowAdd]   = useState(false)
  const [addForm, setAddForm]   = useState(EMPTY_ADMIN)
  const [addingAdmin, setAddingAdmin] = useState(false)
  const [showAddPass, setShowAddPass] = useState(false)

  // edit modal
  const [editTarget, setEditTarget] = useState(null)   // admin object being edited
  const [editForm, setEditForm]     = useState(EMPTY_ADMIN)
  const [editingAdmin, setEditingAdmin] = useState(false)
  const [showEditPass, setShowEditPass] = useState(false)

  // delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deletingAdmin, setDeletingAdmin] = useState(false)

  useEffect(() => { load() }, [orgId])

  async function load() {
    setLoading(true)
    try {
      const [o, a] = await Promise.all([getOrgById(orgId), getOrgAdmins(orgId)])
      setOrg(o)
      setAdmins(a)
    } catch {
      toast.error('Failed to load organization')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle() {
    setToggling(true)
    try {
      await toggleOrgStatus(org.id, !org.active)
      setOrg(prev => ({ ...prev, active: !prev.active }))
      toast.success(`Organization ${!org.active ? 'activated' : 'deactivated'}`)
    } catch {
      toast.error('Failed to update status')
    } finally {
      setToggling(false)
    }
  }

  // ─── Add admin ─────────────────────────────────────────────────

  async function handleAddAdmin(e) {
    e.preventDefault()
    setAddingAdmin(true)
    try {
      const admin = await createOrgAdmin({ orgId, ...addForm })
      setAdmins(prev => [...prev, admin])
      setShowAdd(false)
      setAddForm(EMPTY_ADMIN)
      toast.success('Admin created!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create admin')
    } finally {
      setAddingAdmin(false)
    }
  }

  // ─── Edit admin ────────────────────────────────────────────────

  function openEdit(admin) {
    setEditTarget(admin)
    setEditForm({ name: admin.name, email: admin.email, tempPassword: '' })
    setShowEditPass(false)
  }

  async function handleEditAdmin(e) {
    e.preventDefault()
    setEditingAdmin(true)
    try {
      const updated = await updateOrgAdmin(orgId, editTarget.id, {
        name:        editForm.name,
        email:       editForm.email,
        newPassword: editForm.tempPassword || undefined,
      })
      setAdmins(prev => prev.map(a => a.id === editTarget.id ? updated : a))
      setEditTarget(null)
      toast.success('Admin updated!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update admin')
    } finally {
      setEditingAdmin(false)
    }
  }

  // ─── Delete admin ──────────────────────────────────────────────

  async function handleDeleteAdmin() {
    setDeletingAdmin(true)
    try {
      await deleteOrgAdmin(orgId, deleteTarget.id)
      setAdmins(prev => prev.filter(a => a.id !== deleteTarget.id))
      setDeleteTarget(null)
      toast.success('Admin removed')
    } catch {
      toast.error('Failed to remove admin')
    } finally {
      setDeletingAdmin(false)
    }
  }

  if (loading) return <LoadingSpinner label="Loading organization…" />
  if (!org)    return <div className="text-center py-20 text-slate-400">Organization not found.</div>

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/admin" className="btn-secondary px-2.5 py-2.5">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900">{org.businessName}</h1>
          <p className="text-sm text-slate-500">{org.contactEmail}</p>
        </div>
        <button
          onClick={handleToggle}
          disabled={toggling}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${org.active
              ? 'bg-green-50 text-green-700 hover:bg-green-100'
              : 'bg-red-50 text-red-700 hover:bg-red-100'
            } disabled:opacity-50`}
        >
          {toggling
            ? <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            : org.active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />
          }
          {org.active ? 'Active' : 'Inactive'}
        </button>
      </div>

      {/* Org Info */}
      <div className="card p-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
        <div>
          <p className="text-slate-400 text-xs mb-1">Slug</p>
          <code className="bg-slate-100 px-2 py-1 rounded font-mono text-xs">{org.slug}</code>
        </div>
        <div>
          <p className="text-slate-400 text-xs mb-1">Products</p>
          <p className="font-semibold text-slate-800">{org.totalProducts}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs mb-1">Total Scans</p>
          <p className="font-semibold text-slate-800">{org.totalScans}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs mb-1">Joined</p>
          <p className="font-semibold text-slate-800">
            {org.createdAt ? formatDistanceToNow(new Date(org.createdAt), { addSuffix: true }) : '—'}
          </p>
        </div>
        {org.contactPhone && (
          <div>
            <p className="text-slate-400 text-xs mb-1">Phone</p>
            <p className="text-slate-700">{org.contactPhone}</p>
          </div>
        )}
        {org.description && (
          <div className="col-span-2 sm:col-span-4">
            <p className="text-slate-400 text-xs mb-1">Description</p>
            <p className="text-slate-700">{org.description}</p>
          </div>
        )}
      </div>

      {/* Admin Login URL */}
      <div className="card p-4 text-sm">
        <p className="text-slate-400 text-xs mb-1">Admin Login URL</p>
        <code className="text-brand-700 break-all">
          {window.location.origin}/app/{org.slug}/login
        </code>
      </div>

      {/* Admins */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <User className="h-4 w-4 text-brand-600" /> Admins ({admins.length})
          </h2>
          <button onClick={() => setShowAdd(true)} className="btn-primary text-sm py-2">
            <Plus className="h-4 w-4" /> Add Admin
          </button>
        </div>

        {admins.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <User className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>No admins yet.</p>
            <button onClick={() => setShowAdd(true)} className="btn-primary mt-4">
              <Plus className="h-4 w-4" /> Add First Admin
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left">
                <th className="px-6 py-3 font-medium text-slate-500">Name</th>
                <th className="px-6 py-3 font-medium text-slate-500">Email</th>
                <th className="px-6 py-3 font-medium text-slate-500 hidden sm:table-cell">Added</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {admins.map(admin => (
                <tr key={admin.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-medium text-slate-900">{admin.name}</td>
                  <td className="px-6 py-4 text-slate-600">{admin.email}</td>
                  <td className="px-6 py-4 hidden sm:table-cell text-xs text-slate-400">
                    {admin.createdAt ? formatDistanceToNow(new Date(admin.createdAt), { addSuffix: true }) : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => openEdit(admin)}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-brand-600"
                        title="Edit admin"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(admin)}
                        className="p-1.5 rounded hover:bg-red-50 text-slate-500 hover:text-red-600"
                        title="Remove admin"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Add Admin Modal ── */}
      {showAdd && (
        <Modal title="Add Admin" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div>
              <label className="label">Name *</label>
              <input value={addForm.name} onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))}
                className="input" placeholder="Rahul Patel" required />
            </div>
            <div>
              <label className="label">Email *</label>
              <input type="email" value={addForm.email} onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))}
                className="input" placeholder="rahul@company.com" required />
            </div>
            <div>
              <label className="label">Password *</label>
              <div className="relative">
                <input
                  type={showAddPass ? 'text' : 'password'}
                  value={addForm.tempPassword}
                  onChange={e => setAddForm(p => ({ ...p, tempPassword: e.target.value }))}
                  className="input pr-10" placeholder="Set a login password"
                  required minLength={6}
                />
                <button type="button" onClick={() => setShowAddPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showAddPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={addingAdmin} className="btn-primary">
                {addingAdmin ? 'Adding…' : 'Add Admin'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Edit Admin Modal ── */}
      {editTarget && (
        <Modal title="Edit Admin" onClose={() => setEditTarget(null)}>
          <form onSubmit={handleEditAdmin} className="space-y-4">
            <div>
              <label className="label">Name *</label>
              <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                className="input" required />
            </div>
            <div>
              <label className="label">Email *</label>
              <input type="email" value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                className="input" required />
            </div>
            <div>
              <label className="label">New Password <span className="text-slate-400 font-normal">(leave blank to keep current)</span></label>
              <div className="relative">
                <input
                  type={showEditPass ? 'text' : 'password'}
                  value={editForm.tempPassword}
                  onChange={e => setEditForm(p => ({ ...p, tempPassword: e.target.value }))}
                  className="input pr-10" placeholder="Leave blank to keep current"
                  minLength={6}
                />
                <button type="button" onClick={() => setShowEditPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showEditPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={() => setEditTarget(null)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={editingAdmin} className="btn-primary">
                {editingAdmin ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <Modal title="Remove Admin" onClose={() => setDeleteTarget(null)}>
          <p className="text-slate-600 text-sm mb-6">
            Are you sure you want to remove <strong>{deleteTarget.name}</strong> ({deleteTarget.email})?
            They will no longer be able to log in.
          </p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setDeleteTarget(null)} className="btn-secondary">Cancel</button>
            <button
              onClick={handleDeleteAdmin}
              disabled={deletingAdmin}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {deletingAdmin ? 'Removing…' : 'Remove Admin'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── Simple Modal wrapper ──────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-slate-900 text-lg">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
