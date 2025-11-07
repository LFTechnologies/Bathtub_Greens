// src/services/twitterIngest.js
const HOST = process.env.RAPIDAPI_HOST || 'twitter241.p.rapidapi.com'
const KEY  = process.env.RAPIDAPI_KEY
const BASE = `https://${HOST}`

const LOG_UPSTREAM = process.env.DEBUG_LOG_UPSTREAM === '1'

async function rapidGet(path, params = {}) {
  if (!KEY) throw new Error('Missing RAPIDAPI_KEY')
  const qs = new URLSearchParams(params).toString()
  const url = `${BASE}${path}${qs ? `?${qs}` : ''}`

  const r = await fetch(url, {
    method: 'GET',
    headers: { 'x-rapidapi-key': KEY, 'x-rapidapi-host': HOST }
  })

  const raw = await r.text()
  if (LOG_UPSTREAM) {
    const preview = raw.length > 1000 ? raw.slice(0, 1000) + '…(truncated)' : raw
    console.log(`[UPSTREAM] GET ${url} → ${r.status}\n${preview}\n`)
  }

  if (!r.ok) throw new Error(`RapidAPI HTTP ${r.status}: ${raw || r.statusText}`)

  try { return JSON.parse(raw) } catch { return raw }
}

export async function fetchCommunityDetails(communityId) {
  return rapidGet('/community-details', { communityId })
}
export async function fetchCommunityFeed(communityId, count = 25) {
  try { return await rapidGet('/community-tweets',   { communityId, count }) }
  catch { return       rapidGet('/community-timeline',{ communityId, count }) }
}
export async function fetchHashtag(hashtag, count = 25) {
  const tag = String(hashtag || '').replace(/^#/, '')
  try { return await rapidGet('/hashtag-tweets', { hashtag: tag, count }) }
  catch { return       rapidGet('/tweets-by-hashtag', { hashtag: tag, count }) }
}
export async function fetchSearch(q, count = 25) {
  try { return await rapidGet('/search', { q, count }) }
  catch { return       rapidGet('/search-tweets', { q, count }) }
}

export function extractTweets(data) {
  if (!data) return []
  const c = []
  if (Array.isArray(data)) c.push(data)
  if (Array.isArray(data?.tweets)) c.push(data.tweets)
  if (Array.isArray(data?.result?.tweets)) c.push(data.result.tweets)
  if (Array.isArray(data?.data?.tweets)) c.push(data.data.tweets)
  if (Array.isArray(data?.statuses)) c.push(data.statuses)
  if (Array.isArray(data?.result?.statuses)) c.push(data.result.statuses)
  const flat = c.flat().filter(Boolean)
  if (flat.length) return flat.map(mapTweet).filter(t => t.id)
  const bag = []
  JSON.stringify(data, (k, v) => { if (v && typeof v === 'object') bag.push(v); return v })
  const guesses = bag.filter(o => (o.text || o.full_text) && (o.id_str || o.id))
  return guesses.map(mapTweet).filter(t => t.id)
}

export function mapTweet(t) {
  const id = String(t.id_str || t.id || '').trim()
  const text = String(t.full_text || t.text || '').trim()
  const u = t.user || t.author || t.core?.user_results?.result || {}
  const screenName = u.screen_name || u.legacy?.screen_name || u.username || u.handle || ''
  const displayName = u.name || u.legacy?.name || u.screen_name || u.username || ''
  const createdAtRaw = t.created_at || t.legacy?.created_at || t.createdAt
  const createdAt = createdAtRaw ? new Date(createdAtRaw) : new Date()
  const url = (id && screenName)
    ? `https://twitter.com/${screenName}/status/${id}`
    : (t.url || t.permalink || '')
  return { id, text, screenName, displayName, createdAt, url }
}
