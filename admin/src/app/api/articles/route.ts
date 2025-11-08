// src/app/api/articles/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuid } from 'uuid'

// ---- keep your external proxy switch if you had it ----
const USE_EXTERNAL = process.env.USE_EXTERNAL_API === 'true'
const API_URL    = process.env.API_URL || 'http://localhost:4000'
const API_TOKEN  = process.env.API_TOKEN || ''
const API_HEADER = process.env.API_HEADER || 'Authorization'
const API_SCHEME = process.env.API_SCHEME ?? 'Bearer'
const TARGET     = `${API_URL.replace(/\/$/, '')}/api/articles`

function authHeaders() {
  if (!API_TOKEN) return {}
  const v = API_SCHEME ? `${API_SCHEME} ${API_TOKEN}` : API_TOKEN
  return { [API_HEADER]: v }
}
async function proxyForward(method: 'GET'|'POST'|'PATCH'|'DELETE', req: NextRequest) {
  const url = new URL(req.url)
  const target = `${TARGET}${url.search}`

  // Get Authorization header from incoming request
  const authHeader = req.headers.get('Authorization')

  const init: RequestInit = {
    method,
    headers: {
      ...(method !== 'GET' && method !== 'DELETE' ? { 'Content-Type': 'application/json' } : {}),
      ...(authHeader ? { 'Authorization': authHeader } : authHeaders()),
    },
    body: method === 'GET' ? undefined : await req.text(),
  }
  const r = await fetch(target, init)
  const text = await r.text().catch(()=>'')
  const headers = new Headers({ 'Content-Type': r.headers.get('content-type') || 'application/json' })
  return new NextResponse(text, { status: r.status, headers })
}

// -------- Local (Mongoose) handlers --------
const ALLOWED_SORT = new Set(['updatedAt', 'createdAt', 'title', 'publishedAt'])
const ALLOWED_STATUS = new Set(['draft','pending_review','approved','published','discarded'])

function parseSort(s?: string | null) {
  if (!s) return { updatedAt: -1, createdAt: -1 } as Record<string, 1|-1>
  const [fieldRaw, dirRaw] = String(s).split(':')
  const field = ALLOWED_SORT.has(fieldRaw) ? fieldRaw : 'updatedAt'
  const dir = dirRaw === 'asc' ? 1 : -1
  return { [field]: dir as 1 | -1, createdAt: -1 as -1 }
}

let dbConnect: any, Article: any
async function ensureModels() {
  if (dbConnect && Article) return
  // 👇 correct relative paths for your project
  const db = await import('../../lib/db')
  const model = await import('../../lib/models/Article')
  dbConnect = (db as any).default || db
  Article = (model as any).default || model
}

async function localGET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q        = (searchParams.get('q') || '').trim()
    const sortStr  = searchParams.get('sort') || 'updatedAt:desc'
    const status   = (searchParams.get('status') || '').trim()
    const page     = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit    = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const skip     = (page - 1) * limit

    await ensureModels()
    await dbConnect()

    const filter: Record<string, any> = {}
    if (status) {
      if (!ALLOWED_STATUS.has(status as any)) {
        return NextResponse.json({ items: [], total: 0, hasMore: false, warning: `Invalid status '${status}'` })
      }
      filter.status = status
    }
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      filter.$or = [
        { title: rx }, { summary: rx }, { sourceAuthor: rx }, { sourceHandle: rx }, { source: rx },
      ]
    }

    const sort = parseSort(sortStr)
    const [items, total] = await Promise.all([
      Article.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Article.countDocuments(filter),
    ])
    const hasMore = skip + items.length < total
    return NextResponse.json({ items, total, hasMore })
  } catch (err) {
    console.error('GET /api/articles (local) error:', err)
    return NextResponse.json({ error: 'Failed to load articles' }, { status: 500 })
  }
}

async function localPOST(req: NextRequest) {
  try {
    await ensureModels()
    await dbConnect()
    const body = await req.json().catch(() => ({}))

    const title = (body.title || '').trim()
    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

    let tags = body.tags
    if (typeof tags === 'string') tags = tags.split(/[,\s]+/).map((t: string) => t.trim()).filter(Boolean)
    if (!Array.isArray(tags)) tags = []

    let status = body.status || 'draft'
    if (!ALLOWED_STATUS.has(status)) status = 'draft'

    const now = new Date()
    let publishedAt = body.publishedAt ? new Date(body.publishedAt) : undefined
    if (status === 'published' && !publishedAt) publishedAt = now

    const source = body.source || 'manual'
    const sourceId = body.sourceId ?? uuid()

    const doc = await Article.create({
      title,
      summary: body.summary ?? '',
      rawContent: body.rawContent ?? '',
      cleanedContent: body.cleanedContent ?? '',
      aiSummary: body.aiSummary ?? '',
      imageUrl: body.imageUrl || '',
      tags,
      source,
      sourceId,
      sourceUrl: body.sourceUrl || '',
      sourceAuthor: body.sourceAuthor || '',
      sourceHandle: body.sourceHandle || '',
      sourcePublishedAt: body.sourcePublishedAt ? new Date(body.sourcePublishedAt) : undefined,
      status,
      publishedAt,
    })

    return NextResponse.json({ ok: true, id: doc._id }, { status: 201 })
  } catch (err: any) {
    console.error('POST /api/articles (local) error:', err)
    return NextResponse.json({ error: err?.message || 'Create failed' }, { status: 500 })
  }
}

export async function GET(req: NextRequest)  { return USE_EXTERNAL ? proxyForward('GET', req)  : localGET(req) }
export async function POST(req: NextRequest) { return USE_EXTERNAL ? proxyForward('POST', req) : localPOST(req) }
export async function PATCH(req: NextRequest) { return USE_EXTERNAL ? proxyForward('PATCH', req) : NextResponse.json({ error: 'PATCH not implemented locally' }, { status: 405 }) }
export async function DELETE(req: NextRequest){ return USE_EXTERNAL ? proxyForward('DELETE', req): NextResponse.json({ error: 'DELETE not implemented locally' }, { status: 405 }) }
