import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { resolveScan } from '../../services/productService'
import PDFViewer from '../../components/PDFViewer'
import { QrCode, FileText, AlertCircle, XCircle, Phone, Mail } from 'lucide-react'

export default function ViewPDF() {
  const { productId } = useParams()
  const [state, setState] = useState('loading') // 'loading' | 'ok' | 'inactive' | 'no_pdf' | 'error'
  const [org, setOrg]     = useState(null)
  const [product, setProduct] = useState(null)

  useEffect(() => {
    if (productId) load()
  }, [productId])

  async function load() {
    setState('loading')
    try {
      const result = await resolveScan(productId)
      setOrg(result.org)
      setProduct(result.product)
      setState('ok')
    } catch (err) {
      if (err.message === 'org_inactive') setState('inactive')
      else if (err.message === 'no_pdf')  setState('no_pdf')
      else                                setState('error')
    }
  }

  // ── Loading ─────────────────────────────────────────────────────
  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4 text-white">
          <div className="h-12 w-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-sm text-white/60">Loading document…</p>
        </div>
      </div>
    )
  }

  // ── Org inactive ────────────────────────────────────────────────
  if (state === 'inactive') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-sm w-full text-center">
          <div className="h-16 w-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Service Unavailable</h1>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed">
            This product&apos;s QR service is currently inactive.
            Please contact <strong>{org?.businessName || 'the company'}</strong> for assistance.
          </p>
          {(org?.contactEmail || org?.contactPhone) && (
            <div className="mt-5 p-4 bg-slate-100 rounded-xl text-sm space-y-2">
              {org.contactEmail && (
                <a href={`mailto:${org.contactEmail}`} className="flex items-center justify-center gap-2 text-brand-700 hover:underline">
                  <Mail className="h-4 w-4" /> {org.contactEmail}
                </a>
              )}
              {org.contactPhone && (
                <a href={`tel:${org.contactPhone}`} className="flex items-center justify-center gap-2 text-brand-700 hover:underline">
                  <Phone className="h-4 w-4" /> {org.contactPhone}
                </a>
              )}
            </div>
          )}
          <p className="text-xs text-slate-400 mt-6">Powered by CadifysAI</p>
        </div>
      </div>
    )
  }

  // ── No PDF yet ──────────────────────────────────────────────────
  if (state === 'no_pdf') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-sm w-full text-center">
          <div className="h-16 w-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <FileText className="h-8 w-8 text-amber-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Document Coming Soon</h1>
          <p className="text-slate-500 mt-2 text-sm">
            {org?.businessName} hasn&apos;t uploaded the document for this product yet. Please check back later.
          </p>
          <p className="text-xs text-slate-400 mt-6">Powered by CadifysAI</p>
        </div>
      </div>
    )
  }

  // ── Error / not found ───────────────────────────────────────────
  if (state === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-sm w-full text-center">
          <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="h-8 w-8 text-slate-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">QR Code Not Found</h1>
          <p className="text-slate-500 mt-2 text-sm">
            This QR code is invalid or has been removed. Please contact the company that provided this product.
          </p>
          <p className="text-xs text-slate-400 mt-6">Powered by CadifysAI</p>
        </div>
      </div>
    )
  }

  // ── Success — show PDF ──────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      {/* Header bar */}
      <header className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          {org?.logoUrl ? (
            <img src={org.logoUrl} alt={org.businessName}
              className="h-8 w-8 rounded-lg object-contain bg-white/10 flex-shrink-0" />
          ) : (
            <div className="h-8 w-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <QrCode className="h-4 w-4 text-white" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs text-white/50 leading-none">{org?.businessName}</p>
            <p className="text-sm font-semibold text-white truncate">{product?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {product?.pdfVersionCount > 1 && (
            <span className="text-xs bg-white/10 text-white/70 px-2.5 py-1 rounded-full">
              v{product.pdfVersionCount}
            </span>
          )}
          <span className="text-xs text-white/40 hidden sm:inline">Powered by CadifysAI</span>
        </div>
      </header>

      {/* PDF */}
      <div className="flex-1 flex flex-col p-2 sm:p-4">
        <div className="flex-1 rounded-xl overflow-hidden bg-white" style={{ minHeight: '85vh' }}>
          <PDFViewer
            url={product?.currentPdfUrl}
            fileName={product?.currentPdfName}
          />
        </div>
      </div>
    </div>
  )
}
