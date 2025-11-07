export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ---- MODE SWITCH / PROXY ----
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

// ---- LOCAL (Mongoose) ----
let dbConnect, Article

async function ensureModels() {
  if (dbConnect && Article) return
  const dbMod = await import('../../../lib/db').catch(() => null)
  if (!dbMod) throw new Error('Could not import ../../../lib/db')
  dbConnect = dbMod.default || dbMod

  // Try both model locations so you’re flexible with file layout
  let modelMod = await import('../../../lib/models/Article').catch(() => null)
  if (!modelMod) modelMod = await import('../../../lib/models/Article').catch(() => null)
  if (!modelMod) throw new Error('Could not import Article model from models/Article or lib/models/Articles')
  Article = modelMod.default || modelMod
}

export async function GET() {
  if (USE_EXTERNAL) return proxyGET()

  try {
    await ensureModels()
    await dbConnect()

    // Count by status + totals in parallel
    const statuses = ['draft','pending_review','approved','published','discarded']
    const countPromises = statuses.map(s => Article.countDocuments({ status: s }))
    const [total, ...byStatusCounts] = await Promise.all([
      Article.estimatedDocumentCount(),
      ...countPromises,
    ])

    // Latest timestamps (optional but handy for dashboards)
    const latestPublished = await Article.find({ status: 'published', publishedAt: { $exists: true } })
      .sort({ publishedAt: -1 }).limit(1).select({ publishedAt: 1 }).lean().catch(() => [])
    const latestUpdated = await Article.find({})
      .sort({ updatedAt: -1 }).limit(1).select({ updatedAt: 1 }).lean().catch(() => [])

    // (Optional) last 7 days published count
    const sevenDaysAgo = new Date(Date.now() - 7*24*60*60*1000)
    const publishedLast7d = await Article.countDocuments({ status: 'published', publishedAt: { $gte: sevenDaysAgo } })

    const res = {
      total,
      byStatus: {
        draft:           byStatusCounts[0] || 0,
        pending_review:  byStatusCounts[1] || 0,
        approved:        byStatusCounts[2] || 0,
        published:       byStatusCounts[3] || 0,
        discarded:       byStatusCounts[4] || 0,
      },
      latestPublishedAt: latestPublished?.[0]?.publishedAt || null,
      latestUpdatedAt:   latestUpdated?.[0]?.updatedAt || null,
      publishedLast7d,
    }

    return new Response(JSON.stringify(res), { headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('GET /api/articles/stats error:', err)
    return new Response(JSON.stringify({ error: 'Failed to compute stats' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
