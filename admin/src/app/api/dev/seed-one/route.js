import dbConnect from '../../../../lib/db'
import Article from '../../../../lib/models/Article'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    await dbConnect()
    const now = Date.now()
    const docs = Array.from({ length: 15 }).map((_, i) => ({
      title: `Seeded Article #${i + 1}`,
      summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      tags: ['seed','demo'],
      source: 'manual',
      sourceAuthor: 'Seeder',
      status: i % 3 === 0 ? 'pending_review' : 'published',
      publishedAt: i % 3 === 0 ? null : new Date(now - i * 60000),
      sourcePublishedAt: i % 3 === 0 ? null : new Date(now - i * 60000),
    }))
    const res = await Article.insertMany(docs, { ordered: false })
    return new Response(JSON.stringify({ ok: true, count: res.length }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (e) {
    console.error('POST /api/dev/seed-bulk error:', e)
    return new Response(JSON.stringify({ ok: false, error: 'Seed failed' }), { status: 500 })
  }
}
