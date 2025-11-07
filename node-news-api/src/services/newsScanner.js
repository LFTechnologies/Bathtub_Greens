import Parser from 'rss-parser'
import axios from 'axios'

const rssParser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'NewsBot/1.0'
  }
})

/**
 * Default news sources configuration
 */
const DEFAULT_NEWS_SOURCES = [
  // RSS Feeds
  { type: 'rss', url: 'https://feeds.bbci.co.uk/news/rss.xml', name: 'BBC News', category: 'general' },
  { type: 'rss', url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', name: 'New York Times', category: 'general' },
  { type: 'rss', url: 'https://feeds.reuters.com/reuters/topNews', name: 'Reuters', category: 'general' },
  { type: 'rss', url: 'https://www.theguardian.com/world/rss', name: 'The Guardian', category: 'world' },
  { type: 'rss', url: 'http://rss.cnn.com/rss/cnn_topstories.rss', name: 'CNN', category: 'general' },
  { type: 'rss', url: 'https://techcrunch.com/feed/', name: 'TechCrunch', category: 'technology' },
  { type: 'rss', url: 'https://www.wired.com/feed/rss', name: 'Wired', category: 'technology' },
  { type: 'rss', url: 'https://www.theverge.com/rss/index.xml', name: 'The Verge', category: 'technology' },
  { type: 'rss', url: 'https://hnrss.org/frontpage', name: 'Hacker News', category: 'technology' },
]

/**
 * Fetch and parse RSS feed
 */
async function fetchRSSFeed(url, sourceName) {
  try {
    const feed = await rssParser.parseURL(url)

    return feed.items.map(item => ({
      title: item.title || 'Untitled',
      url: item.link || item.guid || url,
      summary: item.contentSnippet || item.content || item.description || '',
      content: item.content || item.contentSnippet || item.description || '',
      author: item.creator || item.author || sourceName,
      publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      source: sourceName,
      sourceType: 'rss',
      categories: item.categories || [],
      image: item.enclosure?.url || extractImageFromContent(item.content)
    }))
  } catch (error) {
    console.error(`[NewsScanner] Failed to fetch RSS from ${url}:`, error.message)
    return []
  }
}

/**
 * Fetch news from NewsAPI.org
 */
async function fetchNewsAPI(category = 'general', country = 'us') {
  const apiKey = process.env.NEWSAPI_KEY
  if (!apiKey) {
    console.warn('[NewsScanner] NewsAPI key not configured')
    return []
  }

  try {
    const url = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&pageSize=20`
    const response = await axios.get(url, {
      headers: { 'X-Api-Key': apiKey }
    })

    if (response.data.status !== 'ok') {
      throw new Error(`NewsAPI error: ${response.data.message}`)
    }

    return response.data.articles.map(article => ({
      title: article.title,
      url: article.url,
      summary: article.description || '',
      content: article.content || article.description || '',
      author: article.author || article.source.name,
      publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
      source: article.source.name,
      sourceType: 'newsapi',
      categories: [category],
      image: article.urlToImage
    }))
  } catch (error) {
    console.error('[NewsScanner] NewsAPI fetch failed:', error.message)
    return []
  }
}

/**
 * Fetch full article content from URL
 */
async function fetchArticleContent(url) {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)'
      }
    })

    // Basic extraction (in production, use a proper article parser like @extractus/article-extractor)
    const html = response.data

    // Remove scripts and styles
    let content = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    return content.slice(0, 50000) // Limit content size
  } catch (error) {
    console.error(`[NewsScanner] Failed to fetch content from ${url}:`, error.message)
    return null
  }
}

/**
 * Extract image URL from HTML content
 */
function extractImageFromContent(content) {
  if (!content) return null

  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/)
  return imgMatch ? imgMatch[1] : null
}

/**
 * Scan all configured news sources
 */
export async function scanNewsSources(options = {}) {
  const {
    sources = DEFAULT_NEWS_SOURCES,
    limit = 50,
    fetchFullContent = false,
    categories = null
  } = options

  console.log(`[NewsScanner] Starting scan of ${sources.length} sources...`)

  const results = []
  const errors = []

  // Process each source
  for (const source of sources) {
    // Filter by category if specified
    if (categories && source.category && !categories.includes(source.category)) {
      continue
    }

    try {
      let articles = []

      if (source.type === 'rss') {
        articles = await fetchRSSFeed(source.url, source.name)
      } else if (source.type === 'newsapi') {
        articles = await fetchNewsAPI(source.category || 'general')
      }

      // Optionally fetch full content
      if (fetchFullContent) {
        for (const article of articles) {
          const fullContent = await fetchArticleContent(article.url)
          if (fullContent) {
            article.fullContent = fullContent
            article.content = fullContent
          }
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }

      results.push(...articles)
      console.log(`[NewsScanner] Fetched ${articles.length} articles from ${source.name}`)
    } catch (error) {
      console.error(`[NewsScanner] Error processing source ${source.name}:`, error.message)
      errors.push({ source: source.name, error: error.message })
    }

    // Rate limiting between sources
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  // Sort by published date (newest first)
  results.sort((a, b) => b.publishedAt - a.publishedAt)

  // Apply limit
  const limitedResults = results.slice(0, limit)

  console.log(`[NewsScanner] Scan complete. Found ${limitedResults.length} articles (${errors.length} errors)`)

  return {
    articles: limitedResults,
    errors,
    scannedAt: new Date(),
    sourcesScanned: sources.length,
    totalArticles: results.length
  }
}

/**
 * Get configured news sources
 */
export function getNewsSources() {
  return DEFAULT_NEWS_SOURCES
}

/**
 * Add custom news source
 */
export function addNewsSource(source) {
  if (!source.type || !source.url || !source.name) {
    throw new Error('Invalid source configuration')
  }
  DEFAULT_NEWS_SOURCES.push(source)
  return DEFAULT_NEWS_SOURCES
}

/**
 * Filter articles by relevance, quality, and recency
 */
export function filterArticles(articles, criteria = {}) {
  const {
    minContentLength = 100,
    maxAgeHours = 24,
    excludeKeywords = [],
    requireKeywords = [],
    categories = null
  } = criteria

  return articles.filter(article => {
    // Content length check
    if (article.content && article.content.length < minContentLength) {
      return false
    }

    // Age check
    const ageHours = (Date.now() - article.publishedAt.getTime()) / (1000 * 60 * 60)
    if (ageHours > maxAgeHours) {
      return false
    }

    // Category check
    if (categories && article.categories) {
      const hasCategory = article.categories.some(cat =>
        categories.includes(cat.toLowerCase())
      )
      if (!hasCategory) return false
    }

    // Keyword filters
    const text = `${article.title} ${article.summary} ${article.content}`.toLowerCase()

    if (excludeKeywords.length > 0) {
      const hasExcluded = excludeKeywords.some(keyword =>
        text.includes(keyword.toLowerCase())
      )
      if (hasExcluded) return false
    }

    if (requireKeywords.length > 0) {
      const hasRequired = requireKeywords.some(keyword =>
        text.includes(keyword.toLowerCase())
      )
      if (!hasRequired) return false
    }

    return true
  })
}
