// src/app/api/articles/bulk/route.js
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ---- MODE SWITCH ----
const USE_EXTERNAL = process.env.USE_EXTERNAL_API === 'true'
const API_URL    = process.env.API_URL || 'http://localhost:4000'
const API_TOKEN  = process.env.API_TOKEN || ''
const API_HEADER = process.env.API_HEADER || 'Authorization'
const API_SCHEME = process.env.API_SCHEME ?? 'Bearer'
const TARGET     = `${API_URL.replace(/\/$/, '')}/api/articles/bulk`

function authHeaders() {
  if (!API_TOKEN) return {}
  const v = API_SCHEME ? `${API_SCHEME} ${API_TOKEN}` : API_TOKEN
  return { [API_HEADER]: v }
}

async function proxyForward(method, req) {
  const init = {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: await req.text(),
  }
  const r = await fetch(TARGET, init)
  const text = await r.text().catch(() => '')
  const headers = new Headers()
  const ct = r.headers.get('content-type') || 'application/json'
  headers.set('Content-Type', ct)
  return new Response(text, { status: r.status, headers })
}

/** ------- Local (Mongoose) fallback ------- **/
let dbConnect, Article

async function ensureModels() {
  if (dbConnect && Article) return

  // dbConnect path is consistent from here: src/app/api/articles/bulk/route.js -> ../../../../lib/db
  const dbMod = await import('../../../lib/db').catch(() => null)
  if (!dbMod) throw new Error('Could not import ../../../lib/db')
  dbConnect = dbMod.default || dbMod

  // Try both model locations to be forgiving:
  // 1) src/models/Article
  // 2) src/lib/models/Articles
  let modelMod = await import('../../../../models/Articles').catch(() => null)
  if (!modelMod) {
    modelMod = await import('../../../../lib/models/Articles').catch(() => null)
  }
  if (!modelMod) {
    throw new Error('Could not import Article model from ../../../../models/Article or ../../../../lib/models/Articles')
  }
  Article = modelMod.default || modelMod
}

export async function PATCH(req) {
  if (USE_EXTERNAL) return proxyForward('PATCH', req)

  try {
    const body = await req.json().catch(() => ({}))
    const ids = Array.isArray(body.ids) ? body.ids : []
    const op  = body.op

    if (!ids.length) {
      return new Response(JSON.stringify({ error: 'ids required' }), { status: 400 })
    }
    if (!['publish', 'unpublish'].includes(op)) {
      return new Response(JSON.stringify({ error: 'invalid op' }), { status: 400 })
    }

    await ensureModels()
    await dbConnect()

    if (op === 'publish') {
      const res = await Article.updateMany(
        { _id: { $in: ids } },
        { $set: { status: 'published', publishedAt: new Date() } }
      )
      return new Response(JSON.stringify({ ok: true, modified: res.modifiedCount }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (op === 'unpublish') {
      const res = await Article.updateMany(
        { _id: { $in: ids } },
        { $set: { status: 'pending_review' }, $unset: { publishedAt: 1 } }
      )
      return new Response(JSON.stringify({ ok: true, modified: res.modifiedCount }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'invalid op' }), { status: 400 })
  } catch (err) {
    console.error('PATCH /api/articles/bulk error:', err)
    return new Response(JSON.stringify({ error: 'Bulk update failed' }), { status: 500 })
  }
}

export async function DELETE(req) {
  if (USE_EXTERNAL) return proxyForward('DELETE', req)

  try {
    const body = await req.json().catch(() => ({}))
    const ids = Array.isArray(body.ids) ? body.ids : []
    if (!ids.length) {
      return new Response(JSON.stringify({ error: 'ids required' }), { status: 400 })
    }

    await ensureModels()
    await dbConnect()
    const res = await Article.deleteMany({ _id: { $in: ids } })
    return new Response(JSON.stringify({ ok: true, deleted: res.deletedCount }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('DELETE /api/articles/bulk error:', err)
    return new Response(JSON.stringify({ error: 'Bulk delete failed' }), { status: 500 })
  }
}
