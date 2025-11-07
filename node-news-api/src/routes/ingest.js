// src/routes/ingest.js
import { Router } from 'express'

// ✅ Use your API's DB connector (not the admin app's)
import { connectDB } from '../config/db.js'
import Article from '../models/Article.js'

// RapidAPI helpers for Twitter (Highlights plan)
import { fetchHighlights, extractTweets, mapTweet } from '../services/twitterIngest.js'

const router = Router()

// POST /api/ingest/twitter
router.post('/twitter', async (req, res) => {
  try {
    if (!process.env.RAPIDAPI_KEY) {
      return res.status(500).json({ error: 'Server missing RAPIDAPI_KEY' })
    }

    await connectDB()

    const mode  = String(req.body?.mode || 'community').toLowerCase()
    const query = String(req.body?.query || '').trim()
    const limit = clampInt(req.body?.limit, 1, 50, 10)

    if (!['community','highlights','hashtag','search'].includes(mode)) {
      return res.status(400).json({ error: `Unsupported mode: ${mode}` })
    }
    if (!query) return res.status(400).json({ error: 'Missing query' })

    // Your plan supports Highlights only; block others cleanly.
    if (mode === 'hashtag' || mode === 'search') {
      return res.status(501).json({
        error: `The ${mode} endpoint isn’t available on this RapidAPI plan.`,
        hint:  'Use Highlights (mode=community) with a numeric Twitter user ID, e.g. 877807935493033984.'
      })
    }

    // ✅ community/highlights require a numeric user id
    if (!isNumericId(query)) {
      return res.status(400).json({
        error: 'Highlights requires a numeric Twitter user ID.',
        hint:  'Example: 44196397'
      })
    }

    // Fetch highlights from RapidAPI
    const payload   = await fetchHighlights(query, limit)
    const tweetsRaw = extractTweets(payload).slice(0, limit)
    const tweets    = tweetsRaw.map(mapTweet)

    const fetched = tweets.length
    const created = []
    let skipped = 0
    const ids = [] // collect all tweet ids we touched

    for (const t of tweets) {
      if (!t?.id) { skipped++; continue }
      ids.push(String(t.id))

      // robust URL if missing
      let url = t.url || ''
      if (!url) {
        url = t.screenName
          ? `https://twitter.com/${t.screenName}/status/${t.id}`
          : `https://twitter.com/i/web/status/${t.id}`
      }

      const docOnInsert = {
        title: makeTitle(t.text, t.screenName, t.displayName),
        rawContent: t.text,
        cleanedContent: t.text,
        aiSummary: '',
        tags: [],
        source: 'twitter',
        sourceId: String(t.id),
        sourceUrl: url,
        sourceName: 'Twitter',
        sourceAuthor: t.displayName || t.screenName || '',
        sourceHandle: t.screenName || '',
        sourcePublishedAt: t.createdAt || new Date(),
        ingestion: 'twitter',
        status: 'pending_review'
      }

      // Atomic upsert (prevents dupes/races)
      const r = await Article.updateOne(
        { source: 'twitter', sourceId: String(t.id) },
        { $setOnInsert: docOnInsert },
        { upsert: true }
      )

      if (r.upsertedCount === 1 || r.upsertedId) {
        const doc = await Article.findOne(
          { source: 'twitter', sourceId: String(t.id) },
          { title:1, sourceAuthor:1, sourceUrl:1, sourcePublishedAt:1 }
        ).lean()
        created.push(doc)
      } else {
        skipped++
      }
    }

    // Always return the items we touched (created + existing)
    const items = ids.length
      ? await Article.find(
          { source: 'twitter', sourceId: { $in: ids } },
          { title:1, sourceAuthor:1, sourceUrl:1, sourcePublishedAt:1 }
        ).lean()
      : []

    console.log(`[INGEST/twitter] fetched=${fetched} created=${created.length} skipped=${skipped}`)

    return res.json({
      ok: true,
      fetchedCount: fetched,
      createdCount: created.length,
      skippedCount: skipped,
      created,
      items
    })
  } catch (e) {
    console.error('[POST /api/ingest/twitter]', e)
    return res.status(500).json({ error: e.message || 'Server error' })
  }
})

// (Optional) UI can query capabilities to hide unsupported modes
router.get('/twitter/capabilities', (_req, res) => {
  res.json({ modes: ['community','highlights'] })
})

/* ---------------- helpers ---------------- */
function clampInt(n, min, max, fallback) {
  const v = Number.parseInt(n, 10)
  if (Number.isFinite(v)) return Math.max(min, Math.min(max, v))
  return fallback
}
function isNumericId(s) {
  return typeof s === 'string' && /^\d+$/.test(s)
}
function makeTitle(text, screenName, displayName) {
  const clean = String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/https?:\/\/\S+/g, '')
    .trim()
  if (clean.length >= 8) return clean.length > 120 ? `${clean.slice(0,117)}...` : clean
  const who = displayName || (screenName ? `@${screenName}` : 'X')
  return `Post by ${who}`
}

export default router
