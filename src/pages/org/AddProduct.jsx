import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { createProduct } from '../../services/productService'
import { ArrowLeft, Package } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AddProduct() {
  const { slug }    = useParams()
  const { orgId }   = useAuth()
  const navigate    = useNavigate()
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Product name is required.'); return }
    setSaving(true)
    try {
      const product = await createProduct(orgId, form)
      toast.success('Product created!')
      navigate(`/app/${slug}/products/${product.id}`)
    } catch (err) {
      toast.error(err.message || 'Failed to create product.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link to={`/app/${slug}/products`} className="btn-secondary px-2.5 py-2.5">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Add New Product</h1>
          <p className="text-sm text-slate-500">A QR code will be generated automatically</p>
        </div>
      </div>

      <div className="card p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center justify-center h-16 w-16 bg-brand-50 rounded-2xl mx-auto mb-2">
            <Package className="h-8 w-8 text-brand-600" />
          </div>

          <div>
            <label className="label">Product Name *</label>
            <input
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="input"
              placeholder="e.g. Hybrid Tomato Seeds – Premium Grade"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="label">Description <span className="text-slate-400 font-normal">(optional)</span></label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="input resize-none"
              rows={3}
              placeholder="Brief description, batch number, variety info…"
            />
          </div>

          <div className="p-4 bg-brand-50 border border-brand-100 rounded-xl text-sm text-brand-700">
            After adding the product, you can upload its PDF and download the QR code for printing.
          </div>

          <div className="flex gap-3 justify-end">
            <Link to={`/app/${slug}/products`} className="btn-secondary">Cancel</Link>
            <button type="submit" disabled={saving} className="btn-primary px-6">
              {saving ? 'Creating…' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
