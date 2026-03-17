import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllOrgs, toggleOrgStatus } from '../../services/orgService'
import StatsCard from '../../components/StatsCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import {
  Building2, Package, QrCode, TrendingUp, Plus, Power, PowerOff,
  Search, ExternalLink, ChevronRight, ToggleLeft, ToggleRight,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

export default function CentralDashboard() {
  const [orgs, setOrgs]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [toggling, setToggling] = useState(null)

  useEffect(() => { loadOrgs() }, [])

  async function loadOrgs() {
    setLoading(true)
    try {
      const data = await getAllOrgs()
      setOrgs(data)
    } catch {
      toast.error('Failed to load organizations')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle(org) {
    setToggling(org.id)
    try {
      await toggleOrgStatus(org.id, !org.active)
      setOrgs(prev => prev.map(o => o.id === org.id ? { ...o, active: !o.active } : o))
      toast.success(`${org.businessName} ${!org.active ? 'activated' : 'deactivated'}`)
    } catch {
      toast.error('Failed to update status')
    } finally {
      setToggling(null)
    }
  }

  const filtered = orgs.filter(o =>
    o.businessName?.toLowerCase().includes(search.toLowerCase()) ||
    o.slug?.toLowerCase().includes(search.toLowerCase()) ||
    o.contactEmail?.toLowerCase().includes(search.toLowerCase())
  )

  const totalProducts = orgs.reduce((s, o) => s + (o.totalProducts || 0), 0)
  const totalScans    = orgs.reduce((s, o) => s + (o.totalScans    || 0), 0)
  const activeCount   = orgs.filter(o => o.active).length

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage all organizations on the platform</p>
        </div>
        <Link to="/admin/orgs/new" className="btn-primary self-start">
          <Plus className="h-4 w-4" /> Onboard Organization
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={Building2}  label="Total Orgs"    value={orgs.length}   color="brand" />
        <StatsCard icon={ToggleRight} label="Active Orgs"  value={activeCount}   color="green" />
        <StatsCard icon={Package}    label="Total Products" value={totalProducts} color="amber" />
        <StatsCard icon={QrCode}     label="Total Scans"   value={totalScans}    color="purple" />
      </div>

      {/* Orgs table */}
      <div className="card overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Organizations</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search organizations…"
              className="input pl-9 w-64 text-sm"
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <Building2 className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>{search ? 'No organizations match your search.' : 'No organizations yet.'}</p>
            {!search && (
              <Link to="/admin/orgs/new" className="btn-primary mt-4 inline-flex">
                <Plus className="h-4 w-4" /> Onboard First Org
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="px-6 py-3 font-medium text-slate-500">Organization</th>
                  <th className="px-6 py-3 font-medium text-slate-500 hidden md:table-cell">Slug / URL</th>
                  <th className="px-6 py-3 font-medium text-slate-500 hidden lg:table-cell">Products</th>
                  <th className="px-6 py-3 font-medium text-slate-500 hidden lg:table-cell">Scans</th>
                  <th className="px-6 py-3 font-medium text-slate-500">Status</th>
                  <th className="px-6 py-3 font-medium text-slate-500 hidden sm:table-cell">Joined</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(org => (
                  <tr key={org.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{org.businessName}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{org.contactEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono">
                        {org.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell text-slate-600">
                      {org.totalProducts || 0}
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell text-slate-600">
                      {org.totalScans || 0}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggle(org)}
                        disabled={toggling === org.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                          ${org.active
                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                          } disabled:opacity-50`}
                      >
                        {toggling === org.id ? (
                          <span className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : org.active ? (
                          <ToggleRight className="h-3.5 w-3.5" />
                        ) : (
                          <ToggleLeft className="h-3.5 w-3.5" />
                        )}
                        {org.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell text-xs text-slate-400">
                      {org.createdAt
                        ? formatDistanceToNow(new Date(org.createdAt), { addSuffix: true })
                        : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/admin/orgs/${org.id}`}
                        className="text-brand-600 hover:text-brand-800 inline-flex items-center gap-1 text-xs font-medium"
                      >
                        View <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
