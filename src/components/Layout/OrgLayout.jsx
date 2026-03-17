import { useState } from 'react'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTenant } from '../../contexts/TenantContext'
import {
  LayoutDashboard, Package, QrCode, LogOut, Menu, ChevronRight,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function OrgLayout({ children }) {
  const { slug } = useParams()
  const { user, signOut } = useAuth()
  const { org } = useTenant()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const base = `/app/${slug}`
  const navItems = [
    { to: base,              label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: `${base}/products`, label: 'Products',  icon: Package },
  ]

  async function handleSignOut() {
    await signOut()
    toast.success('Signed out')
    navigate(`/app/${slug}/login`)
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col
          transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:flex
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
          <div className="h-9 w-9 bg-brand-600 rounded-xl flex items-center justify-center">
            <QrCode className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 leading-none truncate">
              {org?.businessName || 'QRDocs'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-slate-100">
          <div className="px-2 py-2 mb-1">
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200">
          <button onClick={() => setSidebarOpen(true)} className="p-1 rounded-md text-slate-500">
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-semibold text-slate-800">{org?.businessName || 'Admin'}</span>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
