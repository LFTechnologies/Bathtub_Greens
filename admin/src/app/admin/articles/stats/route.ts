// src/app/api/articles/stats/route.js
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import dbConnect from '../../../lib/db'
import Article from '../../../lib/models/Article'

export async function GET() {
  try {
    await dbConnect()

    const statuses = ['draft','pending_review','approved','published','discarded']
    const [total, ...byStatusCounts] = await Promise.all([
      Article.estimatedDocumentCount(),
      ...statuses.map(s => Article.countDocuments({ status: s })),
    ])

    const latestPublished = await Article.find({ status: 'published', publishedAt: { $exists: true } })
      .sort({ publishedAt: -1 }).limit(1).select({ publishedAt: 1 }).lean()
    const latestUpdated = await Article.find({})
      .sort({ updatedAt: -1 }).limit(1).select({ updatedAt: 1 }).lean()

    const sevenDaysAgo = new Date(Date.now() - 7*24*60*60*1000)
    const publishedLast7d = await Article.countDocuments({
      status: 'published',
      publishedAt: { $gte: sevenDaysAgo }
    })

    return new Response(JSON.stringify({
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
    }), { headers: { 'Content-Type': 'application/json' } })

  } catch (err) {
    console.error('GET /api/articles/stats error:', err)
    return new Response(JSON.stringify({ error: 'Failed to compute stats', detail: String(err?.message || err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
