// src/index.js
import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'
import { connectDB } from './config/db.js'

import authRoutes from './routes/auth.js'
import articleRoutes from './routes/articles.js'
import commentRoutes from './routes/comments.js'
import userRoutes from './routes/users.js'

// ⬇️ NEW: bring in Article + RapidAPI helpers
import Article from './models/Article.js'
import {
  fetchHighlights,           // /highlights (user id)
  fetchHashtag,              // hashtag search
  fetchSearch,               // full search
  extractTweets              // normalizer -> [{ id, text, url, displayName, ... }]
} from './services/twitterIngest.js'
import ingestRoutes from './routes/ingest.js'
const app = express()

const ADMIN_ORIGIN = process.env.ADMIN_ORIGIN || 'http://localhost:3001'
app.use(cors({
  origin: ['http://localhost:3000', ADMIN_ORIGIN], // include 3000 if your UI runs there
  credentials: true,
  allowedHeaders: ['Content-Type','Authorization'],
  methods: ['GET','POST','PUT','DELETE','OPTIONS']
}))

app.use(helmet())
app.use(express.json({ limit: '1mb' }))
function mask(k){ return k ? k.slice(0,6)+'…'+k.slice(-4) : '<missing>'; }
console.log('[RapidAPI] HOST=%s KEY=%s',
  process.env.RAPIDAPI_HOST || 'twitter241.p.rapidapi.com',
  mask(process.env.RAPIDAPI_KEY)
)

// ---------- Response logger (env-gated) ----------
const SHOULD_LOG_RES = process.env.DEBUG_LOG_RESPONSES === '1'
function truncate(str, n = 2000) {
  try { const s = String(str); return s.length > n ? s.slice(0, n) + `… (truncated ${s.length - n} chars)` : s }
  catch { return '<unserializable>' }
}
app.use((req, res, next) => {
  if (!SHOULD_LOG_RES) return next()
  const start = Date.now()
  let bodyToLog
  const oldJson = res.json.bind(res)
  const oldSend = res.send.bind(res)
  res.json = function (data) { bodyToLog = data; return oldJson(data) }
  res.send = function (data) { bodyToLog = data; return oldSend(data) }
  res.on('finish', () => {
    try {
      const ms = Date.now() - start
      let out
      if (bodyToLog === undefined) out = '<no body captured or streamed>'
      else if (Buffer.isBuffer(bodyToLog)) out = `<Buffer ${bodyToLog.length} bytes>`
      else if (typeof bodyToLog === 'string') out = truncate(bodyToLog)
      else out = truncate(JSON.stringify(bodyToLog))
      console.log(`[RES] ${req.method} ${req.originalUrl} → ${res.statusCode} ${ms}ms\n${out}\n`)
    } catch {}
  })
  next()
})
// ------------------------------------------------

app.use(cookieParser())
app.use(morgan('dev'))
app.use(rateLimit({ windowMs: 60_000, max: 200 }))

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.use('/api/auth', authRoutes)
app.use('/api/articles', articleRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/users', userRoutes)
// src/index.js

app.use('/api/ingest', ingestRoutes)

/**
 * Ingest — Twitter (RapidAPI)
 * Supports modes:
 *   - "community" or "highlights": uses /highlights with a numeric user id in "query"
 *   - "hashtag": hashtag search (no # needed)
 *   - "search": raw Twitter query
 *
 * Saves pending_review Article docs and returns a lightweight list for your admin UI.
 */
app.post('/api/ingest/twitter', async (req, res) => {
  try {
    const mode  = String(req.body?.mode || 'highlights').toLowerCase()
    const query = String(req.body?.query || '').trim()
    const limit = clampInt(req.body?.limit, 1, 50, 10)

    if (!['highlights','community','hashtag','search'].includes(mode)) {
      return res.status(400).json({ error: `Unsupported mode: ${mode}` })
    }
    if (!query) return res.status(400).json({ error: 'Missing query' })

    // 1) Fetch from RapidAPI
    let payload
    if (mode === 'highlights' || mode === 'community') {
      // "community" repurposed to mean: Highlights for a user id
      // Example user: 877807935493033984
      payload = await fetchHighlights(query, limit)
    } else if (mode === 'hashtag') {
      payload = await fetchHashtag(query, limit)
    } else {
      payload = await fetchSearch(query, limit)
    }

    // 2) Normalize → tweet objects
    const tweets = extractTweets(payload).slice(0, limit)

    // 3) Upsert into Article queue (dedupe by sourceUrl or tweet id)
    const created = []
    for (const t of tweets) {
      if (!t?.id && !t?.url) continue

      const existing = await Article.findOne({
        $or: [
          t.url ? { sourceUrl: t.url } : null,
          t.id  ? { sourceId: String(t.id) } : null
        ].filter(Boolean)
      }).lean()
      if (existing) continue

      const doc = await Article.create({
        title: makeTitle(t.text),
        rawContent: t.text,
        cleanedContent: t.text,
        aiSummary: '',
        tags: [],
        sourceUrl: t.url,
        sourceName: 'Twitter',
        sourceAuthor: t.displayName || undefined,
        sourceHandle: t.screenName || undefined,
        sourcePublishedAt: t.createdAt || undefined,
        sourceId: String(t.id || ''),
        ingestion: 'twitter',
        status: 'pending_review'
      })

      created.push({
        _id: doc._id,
        title: doc.title,
        sourceAuthor: doc.sourceAuthor,
        sourceUrl: doc.sourceUrl,
        sourcePublishedAt: doc.sourcePublishedAt
      })
    }

    console.log(`[INGEST] mode=${mode} query="${query}" limit=${limit} tweets=${tweets.length} created=${created.length}`)
    return res.json({ ok: true, createdCount: created.length, created })
  } catch (e) {
    console.error('[POST /api/ingest/twitter]', e)
    return res.status(500).json({ error: e.message || 'Server error' })
  }
})
// in src/index.js, with your other routes
app.get('/api/debug/rapidapi', async (req, res) => {
  try {
    const host = process.env.RAPIDAPI_HOST || 'twitter241.p.rapidapi.com'
    const key  = process.env.RAPIDAPI_KEY
    if (!key) return res.status(500).json({ ok:false, error:'Missing RAPIDAPI_KEY' })

    const url = `https://${host}/highlights?user=877807935493033984&count=1`
    const r   = await fetch(url, { headers: { 'x-rapidapi-key': key, 'x-rapidapi-host': host } })
    const raw = await r.text()
    res.status(r.status).json({
      ok: r.ok,
      status: r.status,
      sample: r.ok ? 'OK' : raw?.slice(0,200) || null
    })
  } catch (e) {
    res.status(500).json({ ok:false, error: String(e.message || e) })
  }
})

// 🔎 Test endpoint: raw highlights passthrough (useful while adjusting extractTweets)
app.get('/api/test/highlights', async (req, res) => {
  try {
    const user  = String(req.query.user || '877807935493033984') // example user id
    const count = clampInt(req.query.count, 1, 50, 5)
    const data  = await fetchHighlights(user, count)
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

const PORT = process.env.PORT || 4000
await connectDB()
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`))

/* ---------- helpers ---------- */
function clampInt(n, min, max, fallback) {
  const v = Number.parseInt(n, 10)
  if (Number.isFinite(v)) return Math.max(min, Math.min(max, v))
  return fallback
}
function makeTitle(text) {
  const clean = String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/https?:\/\/\S+/g, '')
    .trim()
  return clean.length > 120 ? `${clean.slice(0,117)}...` : (clean || 'Tweet')
}
