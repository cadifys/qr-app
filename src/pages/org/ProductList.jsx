import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getProducts } from '../../services/productService'
import LoadingSpinner from '../../components/LoadingSpinner'
import {
  Package, Plus, Search, QrCode, FileText, Upload,
  ArrowRight, CheckCircle, XCircle,
} from 'lucide-react'

export default function ProductList() {
  const { slug }  = useParams()
  const { orgId } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')

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

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {products.length} product{products.length !== 1 ? 's' : ''} ·
            {' '}{products.filter(p => p.currentPdfUrl).length} with PDF
          </p>
        </div>
        <Link to={`/app/${slug}/products/new`} className="btn-primary self-start">
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products…"
          className="input pl-10"
        />
      </div>

      {/* List */}
      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="card py-20 text-center">
          <Package className="h-12 w-12 mx-auto text-slate-200 mb-3" />
          <p className="text-slate-500">
            {search ? `No products match "${search}".` : 'No products yet.'}
          </p>
          {!search && (
            <Link to={`/app/${slug}/products/new`} className="btn-primary mt-4 inline-flex">
              <Plus className="h-4 w-4" /> Add First Product
            </Link>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map(product => (
            <Link
              key={product.id}
              to={`/app/${slug}/products/${product.id}`}
              className="card p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0
                    ${product.currentPdfUrl
                      ? 'bg-brand-50 text-brand-600'
                      : 'bg-slate-100 text-slate-400'}`}>
                    <Package className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate group-hover:text-brand-700 transition-colors">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{product.description}</p>
                    )}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-brand-500 flex-shrink-0 mt-1 transition-colors" />
              </div>

              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-50">
                {product.currentPdfUrl ? (
                  <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                    <CheckCircle className="h-3 w-3" />
                    PDF v{product.pdfVersionCount || 1}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                    <Upload className="h-3 w-3" />
                    No PDF
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <QrCode className="h-3 w-3" />
                  {product.scanCount || 0} scan{product.scanCount !== 1 ? 's' : ''}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
