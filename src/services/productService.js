import api from '../config/api'

// ─── Products ────────────────────────────────────────────────────

export async function getProducts(orgId) {
  const { data } = await api.get(`/api/orgs/${orgId}/products`)
  return data
}

export async function getProduct(orgId, productId) {
  const { data } = await api.get(`/api/orgs/${orgId}/products/${productId}`)
  return data
}

export async function createProduct(orgId, { name, description }) {
  const { data } = await api.post(`/api/orgs/${orgId}/products`, { name, description })
  // Returns full product object including scanId
  return data
}

export async function updateProduct(orgId, productId, updates) {
  const { data } = await api.patch(`/api/orgs/${orgId}/products/${productId}`, updates)
  return data
}

// ─── PDF Upload ──────────────────────────────────────────────────

/**
 * Uploads a PDF file to S3 via the backend.
 * onProgress(percent) is an optional callback.
 */
export async function uploadProductPdf(orgId, productId, file, _uploaderUid, onProgress) {
  const form = new FormData()
  form.append('pdf', file)

  const { data } = await api.post(
    `/api/orgs/${orgId}/products/${productId}/pdf`,
    form,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: e => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      },
    }
  )
  return data.pdfUrl
}

// ─── PDF History ─────────────────────────────────────────────────

export async function getPdfHistory(orgId, productId) {
  const { data } = await api.get(`/api/orgs/${orgId}/products/${productId}/pdf-history`)
  return data
}

// ─── QR Scan (public) ────────────────────────────────────────────

export async function resolveScan(scanId) {
  const { data } = await api.get(`/api/scan/${scanId}`)
  // Always build the PDF proxy URL from the known API base URL,
  // so it works regardless of what the backend embeds in the response.
  const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
  if (data.product) {
    data.product.currentPdfUrl = `${apiBase}/api/scan/pdf/${scanId}`
  }
  return data
}
