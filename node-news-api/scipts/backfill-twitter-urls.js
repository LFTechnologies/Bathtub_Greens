import 'dotenv/config'
import mongoose from 'mongoose'
import Article from '../src/models/Article.js'

function mask(s){ return s ? s.slice(0,6)+'…'+s.slice(-4) : '' }

function numericFromAny(s) {
  if (!s) return ''
  const str = String(s)
  if (/^\d+$/.test(str)) return str
  try {
    const decoded = Buffer.from(str, 'base64').toString('utf8')
    const m = decoded.match(/(\d{10,20})/)
    if (m) return m[1]
  } catch {}
  const m2 = str.match(/(\d{10,20})/)
  return m2 ? m2[1] : ''
}

async function run() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI
  if (!uri) throw new Error('Missing MONGODB_URI/MONGO_URI')
  await mongoose.connect(uri)

  const q = { source: 'twitter', $or: [ { sourceUrl: { $in: [null, ''] } }, { sourceUrl: { $exists: false } } ] }
  const docs = await Article.find(q).limit(1000).lean()
  console.log(`Found ${docs.length} twitter article(s) missing sourceUrl`)

  let fixed = 0, skipped = 0
  for (const d of docs) {
    const numId = numericFromAny(d.sourceId)
    if (!numId) { skipped++; continue }

    // build a safe fallback url
    const url = `https://twitter.com/i/web/status/${numId}`

    // optionally normalize sourceId to numeric too
    const update = { sourceUrl: url }
    if (numId && d.sourceId !== numId) update.sourceId = numId

    await Article.updateOne({ _id: d._id }, { $set: update })
    fixed++
  }

  console.log(`Fixed ${fixed}, skipped ${skipped}`)
  await mongoose.disconnect()
}

run().catch(e => { console.error(e); process.exit(1) })
