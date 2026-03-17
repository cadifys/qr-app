import { useState } from 'react'
import { ExternalLink, FileText, AlertCircle } from 'lucide-react'

export default function PDFViewer({ url, fileName }) {
  const [error, setError] = useState(false)

  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
        <FileText className="h-12 w-12" />
        <p className="text-sm">No PDF uploaded yet</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 text-white rounded-t-xl">
        <p className="text-sm truncate max-w-xs opacity-80">{fileName || 'Document'}</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open in new tab
        </a>
      </div>

      {/* PDF embed */}
      {error ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 bg-slate-50 rounded-b-xl border border-slate-200">
          <AlertCircle className="h-10 w-10 text-amber-500" />
          <p className="text-sm text-slate-600">Could not display PDF in browser.</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-sm"
          >
            <ExternalLink className="h-4 w-4" />
            Open PDF directly
          </a>
        </div>
      ) : (
        <object
          data={url}
          type="application/pdf"
          className="w-full flex-1 rounded-b-xl border border-t-0 border-slate-200"
          style={{ minHeight: '70vh' }}
          onError={() => setError(true)}
        >
          {/* Mobile / no-plugin fallback */}
          <div className="flex flex-col items-center justify-center gap-4 py-16 bg-slate-50">
            <FileText className="h-12 w-12 text-brand-400" />
            <p className="text-slate-600 text-sm text-center px-4">
              Your browser doesn&apos;t support inline PDF viewing.
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <ExternalLink className="h-4 w-4" />
              View PDF
            </a>
          </div>
        </object>
      )}
    </div>
  )
}
