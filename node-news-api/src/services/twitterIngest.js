const HOST = process.env.RAPIDAPI_HOST || 'twitter241.p.rapidapi.com'
const KEY  = process.env.RAPIDAPI_KEY
const BASE = `https://${HOST}`
const LOG  = process.env.DEBUG_LOG_UPSTREAM === '1'

async function rapidGet(path, params = {}) {
  if (!KEY) throw new Error('Missing RAPIDAPI_KEY')
  const qs = new URLSearchParams(params).toString()
  const url = `${BASE}${path}${qs ? `?${qs}` : ''}`

  const r = await fetch(url, {
    method: 'GET',
    headers: { 'x-rapidapi-key': KEY, 'x-rapidapi-host': HOST }
  })

  const raw = await r.text()
  if (LOG) {
    const preview = raw.length > 1000 ? raw.slice(0, 1000) + '…(truncated)' : raw
    console.log(`[UPSTREAM] GET ${url} → ${r.status}\n${preview}\n`)
  }
  if (!r.ok) throw new Error(`RapidAPI HTTP ${r.status}: ${raw || r.statusText}`)
  try { return JSON.parse(raw) } catch { return raw }
}

// ✅ Your plan supports this
export async function fetchHighlights(user, count = 20) {
  // user must be a numeric Twitter user id
  return rapidGet('/highlights', { user, count })
}

/* ---------- Normalization ---------- */

function pickNumericId(t) {
  const cands = [t?.rest_id, t?.legacy?.id_str, t?.id_str, t?.id]
    .map(v => (v == null ? '' : String(v)))
  for (const c of cands) if (/^\d+$/.test(c)) return c

  // Try base64 GraphQL ids (e.g., "Tm90ZVR3ZWV0OjE5...")
  const raw = String(t?.id || '')
  try {
    const decoded = Buffer.from(raw, 'base64').toString('utf8')
    const m = decoded.match(/(\d{10,20})/)
    if (m) return m[1]
  } catch {}
  const m2 = raw.match(/(\d{10,20})/)
  return m2 ? m2[1] : ''
}

export function mapTweet(t) {
  const id = pickNumericId(t)

  const u =
    t?.user ||
    t?.author ||
    t?.core?.user_results?.result ||
    t?.user_results?.result ||
    t?.author_results?.result ||
    t?.legacy?.user ||
    {}

  const screenName =
    u?.screen_name ||
    u?.legacy?.screen_name ||
    u?.username ||
    u?.handle ||
    ''

  const displayName =
    u?.name ||
    u?.legacy?.name ||
    u?.screen_name ||
    u?.username ||
    ''

  const text = String(t?.full_text || t?.text || t?.legacy?.full_text || '').trim()

  const createdAtRaw = t?.created_at || t?.legacy?.created_at || t?.createdAt
  const createdAt = createdAtRaw ? new Date(createdAtRaw) : new Date()

  let url = t?.url || t?.permalink || ''
  if (!url && id) {
    url = screenName
      ? `https://twitter.com/${screenName}/status/${id}`
      : `https://twitter.com/i/web/status/${id}` // works without username
  }

  return { id, text, screenName, displayName, createdAt, url }
}

export function extractTweets(data) {
  if (!data) return []
  const c = []
  if (Array.isArray(data)) c.push(data)
  if (Array.isArray(data?.tweets)) c.push(data.tweets)
  if (Array.isArray(data?.result?.tweets)) c.push(data.result.tweets)
  if (Array.isArray(data?.data?.tweets)) c.push(data.data.tweets)
  if (Array.isArray(data?.statuses)) c.push(data.statuses)
  if (Array.isArray(data?.result?.statuses)) c.push(data.result.statuses)

  const flat = c.flat().filter(Boolean)
  if (flat.length) return flat.map(mapTweet).filter(t => t.id)

  const bag = []
  JSON.stringify(data, (k, v) => { if (v && typeof v === 'object') bag.push(v); return v })
  const guesses = bag.filter(o => (o.text || o.full_text) && (o.id_str || o.id || o.rest_id || o?.legacy?.id_str))
  return guesses.map(mapTweet).filter(t => t.id)
}

// Stubs so index.js can import them; we return a clean NOT_AVAILABLE error.
export async function fetchHashtag() {
  const err = new Error('NOT_AVAILABLE')
  err.code = 'NOT_AVAILABLE'
  err.feature = 'hashtag'
  throw err
}

export async function fetchSearch() {
  const err = new Error('NOT_AVAILABLE')
  err.code = 'NOT_AVAILABLE'
  err.feature = 'search'
  throw err
}
