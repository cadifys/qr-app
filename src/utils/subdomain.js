/**
 * Detects the current "context" from the URL.
 *
 * Rules:
 *  - domain.com                 → { type: 'central' }
 *  - slug.domain.com            → { type: 'org', slug }
 *  - localhost / 127.0.0.1      → reads ?org=slug param; if absent → 'central'
 *
 * The React Router path then handles further routing within each context.
 */
export function detectContext() {
  const hostname = window.location.hostname

  // Local development — use ?org= query param
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const params = new URLSearchParams(window.location.search)
    const org = params.get('org')
    return org ? { type: 'org', slug: org } : { type: 'central' }
  }

  const appDomain = import.meta.env.VITE_APP_DOMAIN
    ? new URL(import.meta.env.VITE_APP_DOMAIN).hostname
    : null

  // Subdomain check
  if (appDomain && hostname.endsWith(`.${appDomain}`)) {
    const slug = hostname.replace(`.${appDomain}`, '')
    if (slug && slug !== 'www') {
      return { type: 'org', slug }
    }
  }

  return { type: 'central' }
}

/**
 * Build the public scan URL for a product.
 * Example: https://yourdomain.com/scan/PRODUCT_ID
 */
export function buildScanUrl(productId) {
  return `${window.location.origin}/scan/${productId}`
}

/**
 * Build the org admin URL (for display / onboarding emails).
 * Supports both subdomain and path-based routing.
 */
export function buildOrgUrl(slug) {
  const appDomain = import.meta.env.VITE_APP_DOMAIN
  if (appDomain) {
    const { protocol, hostname } = new URL(appDomain)
    return `${protocol}//${slug}.${hostname}`
  }
  return `${window.location.origin}/app/${slug}`
}
