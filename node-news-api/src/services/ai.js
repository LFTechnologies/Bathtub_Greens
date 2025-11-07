import OpenAI from 'openai'
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function summarizeArticle({ title, url, text }) {
  const model = process.env.OPENAI_MODEL || 'gpt-4o'
  const instructions = 'You are an assistant that converts raw news into clean, neutral summaries for a general audience. Always produce strict JSON.'
  const input = `Summarize the article below into JSON with keys: title (<=120 chars), summary (<=120 words), key_points (string[] of 5 bullets), tags (string[] up to 6).

Original Title: ${title}
URL: ${url}
TEXT:
${text.slice(0, 8000)}`

  const res = await client.responses.create({ model, instructions, input })
  const out = res.output_text || ''
  try { return JSON.parse(out) } catch { return { title, summary: out, key_points: [], tags: [] } }
}

export async function moderateText(text) {
  const model = process.env.MODERATION_MODEL || 'omni-moderation-latest'
  try {
    const r = await client.moderations.create({ model, input: text })
    const result = r.results?.[0]
    return { flagged: !!result?.flagged, categories: result?.categories }
  } catch (e) {
    return { flagged: false }
  }
}