import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTenant } from '../../contexts/TenantContext'
import {
  Search, LayoutGrid, List, Plus, X, Check, Trash2,
  CalendarDays, StickyNote, ExternalLink, ImageOff, ChevronRight,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { getProducts } from '../../services/productService'
import {
  getProductImages,
  uploadProductImage,
  updateProductImage,
  deleteProductImage,
} from '../../services/productService'

// ─── Small helpers ────────────────────────────────────────────────

function fmt(dateStr) {
  if (!dateStr) return '—'
  try { return format(new Date(dateStr), 'dd MMM yyyy') } catch { return dateStr }
}

function filesize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

// ─── Inline edit form for a single image ─────────────────────────

function ImageMetaEditor({ img, orgId, productId, onSave, onCancel }) {
  const [title, setTitle]     = useState(img.title   || '')
  const [notes, setNotes]     = useState(img.notes   || '')
  const [dueDate, setDueDate] = useState(img.dueDate ? img.dueDate.slice(0, 10) : '')
  const [saving, setSaving]   = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const updated = await updateProductImage(orgId, productId, img.id, { title, notes, dueDate: dueDate || null })
      toast.success('Saved')
      onSave(updated)
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-2 mt-2 text-sm">
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Title"
        className="input text-xs w-full"
      />
      <div className="flex gap-2 items-center">
        <CalendarDays className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          className="input text-xs flex-1"
        />
      </div>
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Notes…"
        rows={2}
        className="input text-xs w-full resize-none"
      />
      <div className="flex gap-1.5 justify-end">
        <button onClick={onCancel} className="btn-ghost text-xs px-2 py-1">
          <X className="h-3.5 w-3.5" />
        </button>
        <button onClick={handleSave} disabled={saving} className="btn-primary text-xs px-2 py-1">
          <Check className="h-3.5 w-3.5" /> {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}

// ─── Grid card ───────────────────────────────────────────────────

function ImageCard({ img, orgId, productId, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!window.confirm('Delete this image?')) return
    setDeleting(true)
    try {
      await deleteProductImage(orgId, productId, img.id)
      toast.success('Image deleted')
      onDelete(img.id)
    } catch {
      toast.error('Failed to delete')
      setDeleting(false)
    }
  }

  return (
    <div className="card overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative aspect-video bg-slate-100 group">
        <img
          src={img.imageUrl}
          alt={img.title || img.fileName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <a href={img.imageUrl} target="_blank" rel="noopener noreferrer"
            className="h-8 w-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white">
            <ExternalLink className="h-4 w-4" />
          </a>
          <button onClick={handleDelete} disabled={deleting}
            className="h-8 w-8 bg-red-500/80 hover:bg-red-500 rounded-lg flex items-center justify-center text-white">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex-1 flex flex-col">
        {editing ? (
          <ImageMetaEditor
            img={img} orgId={orgId} productId={productId}
            onSave={updated => { onUpdate(updated); setEditing(false) }}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <>
            <p className="font-medium text-sm text-slate-800 truncate">
              {img.title || <span className="text-slate-400 italic">No title</span>}
            </p>
            <p className="text-xs text-slate-400 mt-0.5 truncate">{img.fileName} · {filesize(img.fileSize)}</p>
            <div className="mt-2 space-y-1 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-3 w-3 text-slate-400" />
                <span>Added {fmt(img.uploadedAt)}</span>
              </div>
              {img.dueDate && (
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="h-3 w-3 text-amber-400" />
                  <span className="text-amber-600 font-medium">Due {fmt(img.dueDate)}</span>
                </div>
              )}
              {img.notes && (
                <div className="flex items-start gap-1.5 mt-1">
                  <StickyNote className="h-3 w-3 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{img.notes}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setEditing(true)}
              className="mt-3 text-xs text-brand-600 hover:text-brand-700 font-medium self-start"
            >
              Edit info
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ─── List row ────────────────────────────────────────────────────

function ImageRow({ img, orgId, productId, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!window.confirm('Delete this image?')) return
    setDeleting(true)
    try {
      await deleteProductImage(orgId, productId, img.id)
      toast.success('Image deleted')
      onDelete(img.id)
    } catch {
      toast.error('Failed to delete')
      setDeleting(false)
    }
  }

  return (
    <div className="card p-3">
      <div className="flex gap-3 items-start">
        {/* Thumbnail */}
        <a href={img.imageUrl} target="_blank" rel="noopener noreferrer"
          className="flex-shrink-0 h-16 w-16 rounded-lg overflow-hidden bg-slate-100 hover:opacity-80 transition-opacity">
          <img src={img.imageUrl} alt={img.fileName} className="w-full h-full object-cover" />
        </a>

        {/* Details */}
        <div className="flex-1 min-w-0">
          {editing ? (
            <ImageMetaEditor
              img={img} orgId={orgId} productId={productId}
              onSave={updated => { onUpdate(updated); setEditing(false) }}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-sm text-slate-800 truncate">
                    {img.title || <span className="text-slate-400 italic">No title</span>}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{img.fileName} · {filesize(img.fileSize)}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => setEditing(true)}
                    className="text-xs text-brand-600 hover:text-brand-700 font-medium px-2 py-1 rounded hover:bg-brand-50">
                    Edit
                  </button>
                  <button onClick={handleDelete} disabled={deleting}
                    className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-red-50">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3 text-slate-400" /> Added {fmt(img.uploadedAt)}
                </span>
                {img.dueDate && (
                  <span className="flex items-center gap-1 text-amber-600 font-medium">
                    <CalendarDays className="h-3 w-3 text-amber-400" /> Due {fmt(img.dueDate)}
                  </span>
                )}
              </div>
              {img.notes && (
                <p className="mt-1 text-xs text-slate-500 flex items-start gap-1">
                  <StickyNote className="h-3 w-3 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{img.notes}</span>
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────

export default function ProductImagesPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const { org } = useTenant()

  const [products, setProducts]           = useState([])
  const [selectedProduct, setSelected]    = useState(null)
  const [images, setImages]               = useState([])
  const [loadingProducts, setLoadingProds]= useState(true)
  const [loadingImages, setLoadingImgs]   = useState(false)
  const [search, setSearch]               = useState('')
  const [view, setView]                   = useState('grid') // 'grid' | 'list'
  const [uploading, setUploading]         = useState(false)
  const fileRef                           = useRef()

  // Load products
  useEffect(() => {
    if (!org?.id) return
    setLoadingProds(true)
    getProducts(org.id)
      .then(setProducts)
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoadingProds(false))
  }, [org?.id])

  // Load images when product selected
  useEffect(() => {
    if (!selectedProduct || !org?.id) return
    setLoadingImgs(true)
    setImages([])
    getProductImages(org.id, selectedProduct.id)
      .then(setImages)
      .catch(() => toast.error('Failed to load images'))
      .finally(() => setLoadingImgs(false))
  }, [selectedProduct?.id, org?.id])

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  async function handleUpload(e) {
    const files = Array.from(e.target.files)
    if (!files.length || !selectedProduct) return
    setUploading(true)
    try {
      const uploaded = await Promise.all(
        files.map(f => uploadProductImage(org.id, selectedProduct.id, f))
      )
      setImages(prev => [...uploaded, ...prev])
      toast.success(`${uploaded.length} image${uploaded.length > 1 ? 's' : ''} uploaded`)
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Product Images</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Browse and manage images with notes and due dates per product
        </p>
      </div>

      <div className="flex gap-5 min-h-[600px]">
        {/* ── Product list panel ───────────────────────────────── */}
        <aside className="w-64 flex-shrink-0 flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products…"
              className="input pl-8 text-sm"
            />
          </div>

          <div className="card overflow-hidden flex-1">
            {loadingProducts ? (
              <div className="p-4 text-sm text-slate-400 text-center">Loading…</div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-4 text-sm text-slate-400 text-center">No products found</div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {filteredProducts.map(p => {
                  const isActive = selectedProduct?.id === p.id
                  return (
                    <li key={p.id}>
                      <button
                        onClick={() => setSelected(p)}
                        className={`w-full flex items-center justify-between gap-2 px-4 py-3 text-left text-sm transition-colors
                          ${isActive
                            ? 'bg-brand-50 text-brand-700 font-medium'
                            : 'text-slate-700 hover:bg-slate-50'
                          }`}
                      >
                        <span className="truncate">{p.name}</span>
                        <ChevronRight className={`h-3.5 w-3.5 flex-shrink-0 transition-opacity ${isActive ? 'opacity-100' : 'opacity-30'}`} />
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* ── Images panel ─────────────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {!selectedProduct ? (
            <div className="flex-1 card flex flex-col items-center justify-center text-slate-400 gap-3">
              <ImageOff className="h-12 w-12 opacity-30" />
              <p className="text-sm">Select a product to view its images</p>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h2 className="font-semibold text-slate-800">{selectedProduct.name}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {loadingImages ? 'Loading…' : `${images.length} image${images.length !== 1 ? 's' : ''}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* View toggle */}
                  <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                    <button
                      onClick={() => setView('grid')}
                      className={`p-1.5 rounded-md transition-colors ${view === 'grid' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setView('list')}
                      className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Upload */}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={handleUpload}
                  />
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="btn-primary"
                  >
                    <Plus className="h-4 w-4" />
                    {uploading ? 'Uploading…' : 'Add Images'}
                  </button>
                </div>
              </div>

              {/* Content */}
              {loadingImages ? (
                <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                  Loading images…
                </div>
              ) : images.length === 0 ? (
                <div className="flex-1 card flex flex-col items-center justify-center gap-3 text-slate-400">
                  <ImageOff className="h-10 w-10 opacity-30" />
                  <p className="text-sm">No images yet</p>
                  <button onClick={() => fileRef.current?.click()} className="btn-primary text-sm">
                    <Plus className="h-4 w-4" /> Add first image
                  </button>
                </div>
              ) : view === 'grid' ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {images.map(img => (
                    <ImageCard
                      key={img.id}
                      img={img}
                      orgId={org.id}
                      productId={selectedProduct.id}
                      onUpdate={updated => setImages(prev => prev.map(i => i.id === updated.id ? updated : i))}
                      onDelete={id => setImages(prev => prev.filter(i => i.id !== id))}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {images.map(img => (
                    <ImageRow
                      key={img.id}
                      img={img}
                      orgId={org.id}
                      productId={selectedProduct.id}
                      onUpdate={updated => setImages(prev => prev.map(i => i.id === updated.id ? updated : i))}
                      onDelete={id => setImages(prev => prev.filter(i => i.id !== id))}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
