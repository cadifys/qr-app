import { useState } from 'react'
import { ExternalLink, FileText } from 'lucide-react'

export default function PDFViewer({ url, fileName, preferDirect = false }) {
  const [useGoogle, setUseGoogle] = useState(!preferDirect)

  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
        <FileText className="h-12 w-12" />
        <p className="text-sm">No PDF uploaded yet</p>
      </div>
    )
  }

  // Google Docs viewer works on all devices including Android
  const googleUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`
  const embedUrl  = useGoogle ? googleUrl : url

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 text-white rounded-t-xl gap-2">
        <p className="text-sm truncate max-w-xs opacity-80">{fileName || 'Document'}</p>
        <div className="flex items-center gap-2 flex-shrink-0">
          {useGoogle ? (
            <button
              onClick={() => setUseGoogle(false)}
              className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              Use direct viewer
            </button>
          ) : (
            <button
              onClick={() => setUseGoogle(true)}
              className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              Can't see PDF?
            </button>
          )}
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
      </div>

      {/* PDF iframe — works on desktop + mobile */}
      <iframe
        key={embedUrl}
        src={embedUrl}
        className="w-full flex-1 rounded-b-xl border border-t-0 border-slate-200 bg-white"
        style={{ minHeight: '85vh' }}
        title={fileName || 'PDF Document'}
        allow="fullscreen"
      />
    </div>
  )
}
