import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Setup from './pages/central/Setup'
import { TenantProvider } from './contexts/TenantContext'
import LoadingSpinner from './components/LoadingSpinner'

// Layouts
import CentralLayout from './components/Layout/CentralLayout'
import OrgLayout     from './components/Layout/OrgLayout'

// Central admin pages
import CentralLogin     from './pages/central/CentralLogin'
import CentralDashboard from './pages/central/CentralDashboard'
import NewOrg           from './pages/central/NewOrg'
import OrgDetail        from './pages/central/OrgDetail'

// Org pages
import OrgLogin      from './pages/org/OrgLogin'
import OrgDashboard  from './pages/org/OrgDashboard'
import ProductList   from './pages/org/ProductList'
import AddProduct    from './pages/org/AddProduct'
import ProductDetail from './pages/org/ProductDetail'

// Public
import ViewPDF from './pages/public/ViewPDF'

// ─── Guards ──────────────────────────────────────────────────────

function RequireSuperAdmin({ children }) {
  const { user, role, loading } = useAuth()
  if (loading) return <LoadingSpinner label="Authenticating…" />
  if (!user || role !== 'superadmin') return <Navigate to="/" replace />
  return children
}

function RequireOrgAdmin({ slug, children }) {
  const { user, role, loading } = useAuth()
  if (loading) return <LoadingSpinner label="Authenticating…" />
  if (!user || role !== 'orgadmin') return <Navigate to={`/app/${slug}/login`} replace />
  return children
}

// ─── Org App wrapper (provides TenantContext) ─────────────────────

function OrgAppRoutes() {
  const { slug } = useParams()
  return (
    <TenantProvider slug={slug}>
      <Routes>
        <Route path="login" element={<OrgLogin />} />
        <Route
          path="*"
          element={
            <RequireOrgAdmin slug={slug}>
              <OrgLayout>
                <Routes>
                  <Route index              element={<OrgDashboard />} />
                  <Route path="products"              element={<ProductList />} />
                  <Route path="products/new"          element={<AddProduct />} />
                  <Route path="products/:productId"   element={<ProductDetail />} />
                  <Route path="*"                     element={<Navigate to="" replace />} />
                </Routes>
              </OrgLayout>
            </RequireOrgAdmin>
          }
        />
      </Routes>
    </TenantProvider>
  )
}

// ─── Root redirect ────────────────────────────────────────────────

function RootRedirect() {
  const { user, role, loading } = useAuth()
  if (loading) return <LoadingSpinner label="Loading…" />
  if (user && role === 'superadmin') return <Navigate to="/admin" replace />
  return <CentralLogin />
}

// ─── 404 ─────────────────────────────────────────────────────────

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <p className="text-7xl font-black text-slate-200">404</p>
        <p className="text-xl font-semibold text-slate-700 mt-2">Page not found</p>
        <p className="text-slate-400 text-sm mt-1">The page you're looking for doesn't exist.</p>
        <a href="/" className="btn-primary mt-5 inline-flex">Go to Homepage</a>
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────

export default function App() {
  return (
    <Routes>
      {/* ── First-time setup (self-disabling) ── */}
      <Route path="/setup" element={<Setup />} />

      {/* ── Public QR scan ── */}
      <Route path="/scan/:productId" element={<ViewPDF />} />

      {/* ── Root / Central login ── */}
      <Route path="/" element={<RootRedirect />} />

      {/* ── Central admin ── */}
      <Route
        path="/admin/*"
        element={
          <RequireSuperAdmin>
            <CentralLayout>
              <Routes>
                <Route index                      element={<CentralDashboard />} />
                <Route path="orgs"              element={<CentralDashboard />} />
                <Route path="orgs/new"          element={<NewOrg />} />
                <Route path="orgs/:orgId"       element={<OrgDetail />} />
                <Route path="*"                 element={<Navigate to="/admin" replace />} />
              </Routes>
            </CentralLayout>
          </RequireSuperAdmin>
        }
      />

      {/* ── Org apps ── */}
      <Route path="/app/:slug/*" element={<OrgAppRoutes />} />

      {/* ── 404 ── */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
