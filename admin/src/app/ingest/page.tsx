// src/app/api/articles/stats/route.js
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ---- MODE SWITCH (external proxy vs local DB) ----
const USE_EXTERNAL = process.env.USE_EXTERNAL_API === 'true'
const API_URL    = process.env.API_URL || 'http://localhost:4000'
const API_TOKEN  = process.env.API_TOKEN || ''
const API_HEADER = process.env.API_HEADER || 'Authorization'
const API_SCHEME = process.env.API_SCHEME ?? 'Bearer'
const TARGET     = `${API_URL.replace(/\/$/, '')}/api/articles/stats`

function authHeaders() {
  if (!API_TOKEN) return {}
  const v = API_SCHEME ? `${API_SCHEME} ${API_TOKEN}` : API_TOKEN
  return { [API_HEADER]: v }
}

async function proxyGET() {
  const r = await fetch(TARGET, { headers: { ...authHeaders() } })
  const text = await r.text().catch(()=>'')
  const headers = new Headers({ 'Content-Type': r.headers.get('content-type') || 'application/json' })
  return new Response(text, { status: r.status, headers })
}

// ---------- Local (Mongoose) implementation ----------
let dbConnect, Article

async function tryImport(paths) {
  for (const p of paths) {
    try {
      const mod = await import(p)
      return mod?.default || mod
    } catch (_) {/* keep trying */}
  }
  return null
}

async function ensureModels() {
  if (dbConnect && Article) return

  // These cover common layouts:
  // (from this file) src/app/api/articles/stats/route.js  -> src/lib/db.js is "../../../../lib/db"
  dbConnect = await tryImport([
    '../../../../lib/db',
    '../../../lib/db',
    '../../../../app/lib/db',
    '../../../../../lib/db',
  ])
  if (!dbConnect) {
    throw new Error('Could not import a dbConnect from known paths (tried ../../../../lib/db, etc.)')
  }

  // Try multiple model locations that have popped up in your project history
  Article = await tryImport([
    '../../../../models/Article',        // src/models/Article.js
    '../../../../lib/models/Articles',   // src/lib/models/Articles.js
    '../../../../lib/models/Article',    // src/lib/models/Article.js
    '../../../models/Article',
    '../../../lib/models/Articles',
  ])
  if (!Article) {
    throw new Error('Could not import Article model from known paths.')
  }
}

export async function GET() {
  if (USE_EXTERNAL) {
    // Proxy to your external API, injecting token
    return proxyGET()
  }

  try {
    await ensureModels()
    await dbConnect()

    // Group by status
    const grouped = await Article.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])

    const stats = {}
    for (const g of grouped) stats[g._id] = g.count

    const published = stats['published'] || 0
    const pending   = stats['pending_review'] || 0
    const drafts    = stats['draft'] || 0
    const approved  = stats['approved'] || 0
    const discarded = stats['discarded'] || 0
    const total     = published + pending + drafts + approved + discarded

    return new Response(JSON.stringify({
      published, pending, drafts, approved, discarded, total
    }), { headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('GET /api/articles/stats (local) error:', err)
    return new Response(JSON.stringify({ error: 'Failed to fetch stats' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
