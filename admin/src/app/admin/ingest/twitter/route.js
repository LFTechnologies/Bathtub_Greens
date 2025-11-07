export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const USE_EXTERNAL = process.env.USE_EXTERNAL_API === 'true'
const API_URL    = process.env.API_URL || 'http://localhost:4000'
const API_TOKEN  = process.env.API_TOKEN || ''
const API_HEADER = process.env.API_HEADER || 'Authorization'
const API_SCHEME = process.env.API_SCHEME ?? 'Bearer'
const TARGET     = `${API_URL.replace(/\/$/, '')}/api/ingest/twitter`

function authHeaders() {
  if (!API_TOKEN) return {}
  const v = API_SCHEME ? `${API_SCHEME} ${API_TOKEN}` : API_TOKEN
  return { [API_HEADER]: v }
}

export async function POST(req) {
  if (!USE_EXTERNAL) {
    // Local ingest not implemented yet—return a clear response instead of a 404.
    return new Response(JSON.stringify({
      error: 'Local ingest not implemented',
      hint: 'Set USE_EXTERNAL_API=true to proxy to your external service, or implement local logic here.',
    }), { status: 501, headers: { 'Content-Type': 'application/json' } })
  }

  try {
    const body = await req.text() // forward raw to preserve shape
    const r = await fetch(TARGET, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body,
    })
    const text = await r.text().catch(()=>'')
    const headers = new Headers({ 'Content-Type': r.headers.get('content-type') || 'application/json' })
    return new Response(text, { status: r.status, headers })
  } catch (err) {
    console.error('POST /api/ingest/twitter proxy error:', err)
    return new Response(JSON.stringify({ error: 'Ingest proxy failed' }), { status: 500 })
  }
}
