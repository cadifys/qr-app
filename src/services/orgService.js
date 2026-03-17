import api from '../config/api'

// ─── Organizations ────────────────────────────────────────────────

export async function getAllOrgs() {
  const { data } = await api.get('/api/orgs')
  return data
}

export async function getOrgById(orgId) {
  const { data } = await api.get(`/api/orgs/${orgId}`)
  return data
}

export async function getOrgBySlug(slug) {
  try {
    const { data } = await api.get(`/api/orgs/by-slug/${slug.toLowerCase()}`)
    return data
  } catch (e) {
    if (e.response?.status === 404) return null
    throw e
  }
}

export async function createOrg({ businessName, slug, contactEmail, contactPhone, description }) {
  const { data } = await api.post('/api/orgs', { businessName, slug, contactEmail, contactPhone, description })
  return data.id
}

export async function toggleOrgStatus(orgId, active) {
  await api.patch(`/api/orgs/${orgId}/status`, { active })
}

export async function updateOrg(orgId, data) {
  await api.patch(`/api/orgs/${orgId}`, data)
}

// ─── Org Admins ──────────────────────────────────────────────────

export async function getOrgAdmins(orgId) {
  const { data } = await api.get(`/api/orgs/${orgId}/admins`)
  return data
}

export async function createOrgAdmin({ orgId, name, email, tempPassword }) {
  const { data } = await api.post(`/api/orgs/${orgId}/admins`, { name, email, tempPassword })
  return data
}

export async function updateOrgAdmin(orgId, adminId, { name, email, newPassword }) {
  const { data } = await api.patch(`/api/orgs/${orgId}/admins/${adminId}`, { name, email, newPassword })
  return data
}

export async function deleteOrgAdmin(orgId, adminId) {
  await api.delete(`/api/orgs/${orgId}/admins/${adminId}`)
}
