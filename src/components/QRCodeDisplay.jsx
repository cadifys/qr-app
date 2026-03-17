import { useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Download, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function QRCodeDisplay({ url, productName, size = 200 }) {
  const [copied, setCopied] = useState(false)
  const qrRef = useRef(null)

  function handleCopy() {
    navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success('Link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownloadSVG() {
    const svgEl = qrRef.current?.querySelector('svg')
    if (!svgEl) return
    const svgData    = new XMLSerializer().serializeToString(svgEl)
    const svgBlob    = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url        = URL.createObjectURL(svgBlob)
    const link       = document.createElement('a')
    link.href        = url
    link.download    = `QR_${productName.replace(/\s+/g, '_')}.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success('QR downloaded!')
  }

  function handleDownloadPNG() {
    const svgEl = qrRef.current?.querySelector('svg')
    if (!svgEl) return
    const svgData  = new XMLSerializer().serializeToString(svgEl)
    const canvas   = document.createElement('canvas')
    const scale    = 3 // 3× for high-res print
    canvas.width   = size * scale
    canvas.height  = size * scale
    const ctx      = canvas.getContext('2d')
    const img      = new Image()
    img.onload = () => {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const pngUrl = canvas.toDataURL('image/png')
      const link   = document.createElement('a')
      link.href    = pngUrl
      link.download = `QR_${productName.replace(/\s+/g, '_')}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('High-res QR downloaded!')
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* QR Code */}
      <div
        ref={qrRef}
        className="p-4 bg-white rounded-2xl border-2 border-slate-100 shadow-sm inline-block"
      >
        <QRCodeSVG
          value={url}
          size={size}
          bgColor="#ffffff"
          fgColor="#1e1b4b"
          level="H"
          includeMargin={false}
        />
      </div>

      {/* Product label under QR */}
      <p className="text-xs text-slate-500 text-center max-w-[200px] leading-snug">
        Scan to view latest document for<br />
        <strong className="text-slate-700">{productName}</strong>
      </p>

      {/* URL display */}
      <div className="flex items-center gap-2 w-full max-w-xs">
        <input
          readOnly
          value={url}
          className="input text-xs bg-slate-50 truncate"
        />
        <button onClick={handleCopy} className="btn-secondary px-2.5 py-2.5 flex-shrink-0">
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>

      {/* Download buttons */}
      <div className="flex gap-2 w-full max-w-xs">
        <button onClick={handleDownloadPNG} className="btn-primary flex-1 text-xs py-2">
          <Download className="h-3.5 w-3.5" /> PNG (Print)
        </button>
        <button onClick={handleDownloadSVG} className="btn-secondary flex-1 text-xs py-2">
          <Download className="h-3.5 w-3.5" /> SVG
        </button>
      </div>
    </div>
  )
}
