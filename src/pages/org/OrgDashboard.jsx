import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTenant } from '../../contexts/TenantContext'
import { getProducts } from '../../services/productService'
import StatsCard from '../../components/StatsCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import {
  Package, QrCode, FileText, TrendingUp, Plus, ArrowRight,
  Upload, LayoutGrid, List,
} from 'lucide-react'
export default function OrgDashboard() {
  const { slug }    = useParams()
  const { orgId }   = useAuth()
  const { org }     = useTenant()
  const [products, setProducts]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [view, setView]           = useState('list')

  useEffect(() => {
    if (orgId) loadProducts()
  }, [orgId])

  async function loadProducts() {
    setLoading(true)
    try {
      const data = await getProducts(orgId)
      setProducts(data)
    } finally {
      setLoading(false)
    }
  }

  const totalScans    = products.reduce((s, p) => s + (p.scanCount || 0), 0)
  const withPdf       = products.filter(p => p.currentPdfUrl).length
  const recentProducts = [...products].slice(0, 5)

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back 👋
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">{org?.businessName} · Admin Dashboard</p>
        </div>
        <Link to={`/app/${slug}/products/new`} className="btn-primary self-start">
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={Package}  label="Products"      value={products.length}  color="brand"  />
        <StatsCard icon={FileText} label="PDFs Uploaded" value={withPdf}           color="green"  />
        <StatsCard icon={QrCode}   label="Total Scans"   value={totalScans}        color="purple" />
        <StatsCard icon={TrendingUp} label="No PDF Yet"  value={products.length - withPdf} color="amber" />
      </div>

      {/* Recent products */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Recent Products</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
              <button
                onClick={() => setView('grid')}
                className={`p-1.5 rounded-md transition-colors ${view === 'grid' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
            <Link to={`/app/${slug}/products`} className="text-sm text-brand-600 hover:text-brand-800 flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : products.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="h-10 w-10 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm mb-4">No products yet. Add your first product!</p>
            <Link to={`/app/${slug}/products/new`} className="btn-primary">
              <Plus className="h-4 w-4" /> Add Product
            </Link>
          </div>
        ) : view === 'list' ? (
          <div className="divide-y divide-slate-50">
            {recentProducts.map(product => (
              <Link
                key={product.id}
                to={`/app/${slug}/products/${product.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/70 transition-colors group"
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0
                  ${product.currentPdfUrl ? 'bg-brand-50 text-brand-600' : 'bg-slate-100 text-slate-400'}`}>
                  <Package className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{product.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {product.currentPdfUrl
                      ? `PDF v${product.pdfVersionCount || 1} · ${product.scanCount || 0} scans`
                      : 'No PDF uploaded yet'}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {!product.currentPdfUrl && (
                    <span className="hidden sm:flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                      <Upload className="h-3 w-3" /> Upload PDF
                    </span>
                  )}
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-brand-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentProducts.map(product => (
              <Link
                key={product.id}
                to={`/app/${slug}/products/${product.id}`}
                className="card p-4 hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0
                    ${product.currentPdfUrl ? 'bg-brand-50 text-brand-600' : 'bg-slate-100 text-slate-400'}`}>
                    <Package className="h-4 w-4" />
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-brand-500 transition-colors mt-1" />
                </div>
                <p className="font-semibold text-slate-900 text-sm truncate group-hover:text-brand-700 transition-colors">
                  {product.name}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {product.currentPdfUrl
                    ? `PDF v${product.pdfVersionCount || 1} · ${product.scanCount || 0} scans`
                    : 'No PDF uploaded yet'}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick tips */}
      {products.length > 0 && products.some(p => !p.currentPdfUrl) && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
          <Upload className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              {products.filter(p => !p.currentPdfUrl).length} product(s) missing a PDF
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Upload PDFs so customers can view them by scanning QR codes.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
