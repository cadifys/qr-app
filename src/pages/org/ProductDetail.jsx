import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  getProduct, uploadProductPdf, getPdfHistory,
  getProductImages, uploadProductImage, deleteProductImage,
} from '../../services/productService'
import { buildScanUrl } from '../../utils/subdomain'
import QRCodeDisplay from '../../components/QRCodeDisplay'
import PDFViewer from '../../components/PDFViewer'
import LoadingSpinner from '../../components/LoadingSpinner'
import {
  ArrowLeft, Upload, FileText, History, AlertCircle,
  Package, ExternalLink, Image, Trash2, Plus,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

function formatBytes(b) {
  if (!b) return '—'
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / (1024 * 1024)).toFixed(1)} MB`
}

export default function ProductDetail() {
  const { slug, productId } = useParams()
  const { orgId, user }     = useAuth()
  const [product, setProduct]   = useState(null)
  const [history, setHistory]   = useState([])
  const [images, setImages]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [uploading, setUploading]   = useState(false)
  const [uploadPct, setUploadPct]   = useState(0)
  const [imgUploading, setImgUploading] = useState(false)
  const [tab, setTab]           = useState('pdf') // 'pdf' | 'qr' | 'images' | 'history'
  const fileRef    = useRef(null)
  const imgFileRef = useRef(null)

  useEffect(() => {
    if (orgId && productId) loadData()
  }, [orgId, productId])

  async function loadData() {
    setLoading(true)
    try {
      const [prod, hist, imgs] = await Promise.all([
        getProduct(orgId, productId),
        getPdfHistory(orgId, productId),
        getProductImages(orgId, productId),
      ])
      setProduct(prod)
      setHistory(hist)
      setImages(imgs)
    } catch {
      toast.error('Failed to load product.')
    } finally {
      setLoading(false)
    }
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') { toast.error('Only PDF files are allowed.'); return }
    if (file.size > 20 * 1024 * 1024)   { toast.error('File size must be under 20 MB.'); return }

    setUploading(true); setUploadPct(0)
    try {
      await uploadProductPdf(orgId, productId, file, user.uid, setUploadPct)
      toast.success('PDF uploaded!')
      await loadData()
    } catch {
      toast.error('Upload failed.')
    } finally {
      setUploading(false); setUploadPct(0)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setImgUploading(true)
    try {
      await Promise.all(files.map(f => uploadProductImage(orgId, productId, f)))
      toast.success(`${files.length} image${files.length > 1 ? 's' : ''} uploaded!`)
      const imgs = await getProductImages(orgId, productId)
      setImages(imgs)
    } catch {
      toast.error('Image upload failed.')
    } finally {
      setImgUploading(false)
      if (imgFileRef.current) imgFileRef.current.value = ''
    }
  }

  async function handleDeleteImage(imageId) {
    if (!confirm('Delete this image?')) return
    try {
      await deleteProductImage(orgId, productId, imageId)
      setImages(prev => prev.filter(i => i.id !== imageId))
      toast.success('Image deleted.')
    } catch {
      toast.error('Failed to delete image.')
    }
  }

  if (loading) return <LoadingSpinner />
  if (!product) return (
    <div className="text-center py-20 text-slate-500">Product not found.</div>
  )

  const tabs = [
    { key: 'pdf',     label: 'View PDF',     icon: FileText },
    { key: 'qr',      label: 'Product QR',   icon: Package },
    { key: 'images',  label: `Images (${images.length})`, icon: Image },
    { key: 'history', label: `History (${history.length})`, icon: History },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link to={`/app/${slug}/products`} className="btn-secondary px-2.5 py-2.5 flex-shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-slate-900 truncate">{product.name}</h1>
          {product.description && (
            <p className="text-sm text-slate-500 mt-0.5">{product.description}</p>
          )}
        </div>
      </div>

      {/* PDF upload section */}
      <div className="card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0
              ${product.currentPdfUrl ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-slate-800">
                {product.currentPdfUrl ? `Current PDF: ${product.currentPdfName}` : 'No PDF uploaded yet'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {product.currentPdfUrl
                  ? `${formatBytes(product.currentPdfSize)} · Version ${product.pdfVersionCount || 1}`
                  : 'Upload a PDF to activate the QR code'}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <input ref={fileRef} type="file" accept="application/pdf"
              onChange={handleFileChange} className="hidden" id="pdf-upload" />
            <label htmlFor="pdf-upload"
              className={`btn-primary cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <Upload className="h-4 w-4" />
              {product.currentPdfUrl ? 'Update PDF' : 'Upload PDF'}
            </label>
          </div>
        </div>
        {uploading && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span>Uploading…</span><span>{uploadPct}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-brand-600 rounded-full transition-all duration-200" style={{ width: `${uploadPct}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
              ${tab === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* PDF tab */}
      {tab === 'pdf' && (
        <div className="card overflow-hidden" style={{ minHeight: '60vh' }}>
          {product.currentPdfUrl ? (
            <PDFViewer url={product.currentPdfUrl} fileName={product.currentPdfName} />
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-slate-400">
              <FileText className="h-14 w-14 opacity-30" />
              <p className="text-sm">No PDF yet. Upload one above.</p>
            </div>
          )}
        </div>
      )}

      {/* QR tab */}
      {tab === 'qr' && (
        <div className="card p-8 flex flex-col items-center gap-6">
          {!product.currentPdfUrl && (
            <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm w-full max-w-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              Upload a PDF first so scans show the document.
            </div>
          )}
          <QRCodeDisplay url={buildScanUrl(product.scanId)} productName={product.name} size={220} />
          <p className="text-center text-sm text-slate-500 max-w-sm">
            This QR code always shows the <strong>latest PDF</strong> — even after updates.
          </p>
        </div>
      )}

      {/* Images tab */}
      {tab === 'images' && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-800">Product Images</h3>
              <p className="text-xs text-slate-400 mt-0.5">JPEG, PNG, WebP — max 10 MB each</p>
            </div>
            <div>
              <input ref={imgFileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                multiple onChange={handleImageUpload} className="hidden" id="img-upload" />
              <label htmlFor="img-upload"
                className={`btn-primary cursor-pointer text-sm ${imgUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <Plus className="h-4 w-4" />
                {imgUploading ? 'Uploading…' : 'Add Images'}
              </label>
            </div>
          </div>

          {images.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
              <Image className="h-12 w-12 opacity-30" />
              <p className="text-sm">No images yet. Click "Add Images" to upload.</p>
            </div>
          ) : (
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map(img => (
                <div key={img.id} className="group relative rounded-xl overflow-hidden bg-slate-100 aspect-square">
                  <img
                    src={img.imageUrl}
                    alt={img.fileName}
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <a
                      href={img.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 w-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white"
                      title="Open full size"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => handleDeleteImage(img.id)}
                      className="h-8 w-8 bg-red-500/80 hover:bg-red-500 rounded-lg flex items-center justify-center text-white"
                      title="Delete image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {/* File name tooltip */}
                  <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs truncate">{img.fileName}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History tab */}
      {tab === 'history' && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">PDF Upload History</h3>
            <p className="text-xs text-slate-400 mt-0.5">All previous and current versions are preserved</p>
          </div>
          {history.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">No PDF history yet.</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {history.map((record, i) => (
                <div key={record.id} className="flex items-center gap-4 px-6 py-4">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold
                    ${i === 0 ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    v{history.length - i}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{record.fileName || record.file_name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatBytes(record.fileSize || record.file_size)} ·{' '}
                      {record.uploadedAt || record.uploaded_at
                        ? format(new Date(record.uploadedAt || record.uploaded_at), 'dd MMM yyyy, HH:mm')
                        : '—'}
                    </p>
                  </div>
                  {i === 0 && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium flex-shrink-0">Current</span>
                  )}
                  <a href={record.pdfUrl || record.pdf_url} target="_blank" rel="noopener noreferrer"
                    className="text-brand-600 hover:text-brand-800 flex-shrink-0" title="Open PDF">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
