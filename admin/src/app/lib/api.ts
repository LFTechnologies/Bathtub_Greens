// Keep everything relative by default
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? ''  // leave empty in dev

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (token) {
    return { 'Authorization': `Bearer ${token}` }
  }
  return {}
}

export async function apiPost(path: string, body?: any) {
  const r = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(body || {}),
  })
  const text = await r.text().catch(()=>'')
  if (!r.ok) {
    try {
      const j = JSON.parse(text || '{}')
      throw new Error(j.error || j.message || text || `HTTP ${r.status}`)
    } catch {
      throw new Error(text || `HTTP ${r.status}`)
    }
  }
  return text ? JSON.parse(text) : {}
}

export async function apiGet(path: string) {
  const r = await fetch(`${API_BASE}${path}`, {
    headers: getAuthHeaders()
  })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.json()
}

export async function apiPatch(path: string, body?: any) {
  const r = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(body || {}),
  })
  const text = await r.text().catch(()=>'')
  if (!r.ok) throw new Error(text || `HTTP ${r.status}`)
  try { return JSON.parse(text) } catch { return {} }
}

export async function apiDelete(path: string, body?: any) {
  const r = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(body || {}),
  })
  const text = await r.text().catch(()=>'')
  if (!r.ok) throw new Error(text || `HTTP ${r.status}`)
  try { return JSON.parse(text) } catch { return {} }
}
