import { scanNewsSources, filterArticles } from './newsScanner.js'
import { summarizeArticle, generateCommentary } from './ai.js'
import Article from '../models/Article.js'

/**
 * Content generation statistics
 */
let stats = {
  totalScans: 0,
  totalGenerated: 0,
  lastScanAt: null,
  lastGenerationAt: null,
  errors: []
}

/**
 * Generate blog content from news sources
 */
export async function generateBlogContent(options = {}) {
  const {
    sourcesLimit = 50,
    articlesLimit = 10,
    categories = null,
    requireKeywords = [],
    excludeKeywords = [],
    autoPublish = false,
    aiProvider = 'both',
    fetchFullContent = true,
    minContentLength = 200,
    maxAgeHours = 24
  } = options

  console.log('[ContentGenerator] Starting content generation...')
  stats.totalScans++

  try {
    // Step 1: Scan news sources
    console.log('[ContentGenerator] Scanning news sources...')
    const scanResult = await scanNewsSources({
      limit: sourcesLimit,
      fetchFullContent,
      categories
    })

    console.log(`[ContentGenerator] Found ${scanResult.articles.length} articles`)

    // Step 2: Filter articles
    console.log('[ContentGenerator] Filtering articles...')
    const filteredArticles = filterArticles(scanResult.articles, {
      minContentLength,
      maxAgeHours,
      excludeKeywords,
      requireKeywords,
      categories
    })

    console.log(`[ContentGenerator] ${filteredArticles.length} articles after filtering`)

    // Step 3: Check for duplicates in database
    const uniqueArticles = await filterDuplicates(filteredArticles)
    console.log(`[ContentGenerator] ${uniqueArticles.length} unique articles`)

    // Step 4: Limit and prioritize
    const selectedArticles = uniqueArticles.slice(0, articlesLimit)

    // Step 5: Generate content for each article
    const generatedArticles = []
    const errors = []

    for (const [index, article] of selectedArticles.entries()) {
      try {
        console.log(`[ContentGenerator] Processing article ${index + 1}/${selectedArticles.length}: ${article.title}`)

        // Generate AI summary and analysis
        const aiResult = await summarizeArticle({
          title: article.title,
          url: article.url,
          text: article.content || article.summary,
          provider: aiProvider
        })

        console.log(`[ContentGenerator] AI analysis complete using ${aiResult.provider}`)

        // Generate additional commentary if summary is short
        let commentary = aiResult.commentary || ''
        if (commentary.length < 200) {
          console.log('[ContentGenerator] Generating additional commentary...')
          commentary = await generateCommentary({
            title: aiResult.title || article.title,
            summary: aiResult.summary || article.summary,
            key_points: aiResult.key_points,
            url: article.url
          })
        }

        // Create article in database
        const newArticle = new Article({
          title: aiResult.title || article.title,
          summary: aiResult.summary || article.summary,
          rawContent: article.content || article.summary,
          cleanedContent: commentary,
          aiSummary: JSON.stringify({
            key_points: aiResult.key_points,
            sentiment: aiResult.sentiment,
            provider: aiResult.provider
          }),
          tags: aiResult.tags || [],
          imageUrl: article.image,
          source: article.source,
          sourceUrl: article.url,
          sourceAuthor: article.author,
          sourcePublishedAt: article.publishedAt,
          sourceName: article.source,
          status: autoPublish ? 'published' : 'pending_review',
          ingestion: 'auto-generated',
          publishedAt: autoPublish ? new Date() : null
        })

        await newArticle.save()
        generatedArticles.push(newArticle)
        stats.totalGenerated++

        console.log(`[ContentGenerator] Article saved: ${newArticle._id}`)

        // Rate limiting between AI calls
        await new Promise(resolve => setTimeout(resolve, 2000))
      } catch (error) {
        console.error(`[ContentGenerator] Error processing article "${article.title}":`, error.message)
        errors.push({
          article: article.title,
          error: error.message
        })
        stats.errors.push({
          at: new Date(),
          article: article.title,
          error: error.message
        })
      }
    }

    stats.lastScanAt = new Date()
    stats.lastGenerationAt = new Date()

    const result = {
      success: true,
      generated: generatedArticles.length,
      scanned: scanResult.articles.length,
      filtered: filteredArticles.length,
      unique: uniqueArticles.length,
      errors: errors.length,
      errorDetails: errors,
      articles: generatedArticles.map(a => ({
        id: a._id,
        title: a.title,
        status: a.status,
        source: a.source,
        url: a.sourceUrl
      }))
    }

    console.log('[ContentGenerator] Generation complete:', JSON.stringify(result, null, 2))
    return result
  } catch (error) {
    console.error('[ContentGenerator] Fatal error:', error)
    stats.errors.push({
      at: new Date(),
      error: error.message,
      stack: error.stack
    })

    return {
      success: false,
      error: error.message,
      generated: 0
    }
  }
}

/**
 * Filter out duplicate articles already in database
 */
async function filterDuplicates(articles) {
  const uniqueArticles = []

  for (const article of articles) {
    // Check if article with same URL exists
    const existing = await Article.findOne({ sourceUrl: article.url })

    if (!existing) {
      uniqueArticles.push(article)
    } else {
      console.log(`[ContentGenerator] Skipping duplicate: ${article.title}`)
    }
  }

  return uniqueArticles
}

/**
 * Generate content for a specific topic or keyword
 */
export async function generateContentForTopic(topic, options = {}) {
  console.log(`[ContentGenerator] Generating content for topic: ${topic}`)

  return await generateBlogContent({
    ...options,
    requireKeywords: [topic, ...(options.requireKeywords || [])],
    articlesLimit: options.articlesLimit || 5
  })
}

/**
 * Get content generation statistics
 */
export function getGenerationStats() {
  return {
    ...stats,
    recentErrors: stats.errors.slice(-10)
  }
}

/**
 * Reset statistics
 */
export function resetStats() {
  stats = {
    totalScans: 0,
    totalGenerated: 0,
    lastScanAt: null,
    lastGenerationAt: null,
    errors: []
  }
  return stats
}

/**
 * Test content generation with a single article
 */
export async function testContentGeneration(url, options = {}) {
  console.log(`[ContentGenerator] Testing with URL: ${url}`)

  try {
    // Fetch article content
    const axios = (await import('axios')).default
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)'
      }
    })

    // Basic HTML to text conversion
    let content = response.data
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    // Extract title (basic)
    const titleMatch = response.data.match(/<title>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1] : 'Test Article'

    // Generate AI summary
    const aiResult = await summarizeArticle({
      title,
      url,
      text: content,
      provider: options.aiProvider || 'both'
    })

    // Generate commentary
    const commentary = await generateCommentary({
      title: aiResult.title || title,
      summary: aiResult.summary,
      key_points: aiResult.key_points,
      url
    })

    return {
      success: true,
      article: {
        originalTitle: title,
        aiTitle: aiResult.title,
        summary: aiResult.summary,
        keyPoints: aiResult.key_points,
        tags: aiResult.tags,
        commentary,
        sentiment: aiResult.sentiment,
        provider: aiResult.provider
      }
    }
  } catch (error) {
    console.error('[ContentGenerator] Test failed:', error.message)
    return {
      success: false,
      error: error.message
    }
  }
}
