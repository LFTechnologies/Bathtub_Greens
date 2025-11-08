import express from 'express'
import { requireAuth, requirePermission } from '../middleware/auth.js'
import { Actions } from '../utils/permissions.js'
import {
  generateBlogContent,
  generateContentForTopic,
  getGenerationStats,
  resetStats,
  testContentGeneration,
  generateAndSaveSingleArticle
} from '../services/contentGenerator.js'
import { scanNewsSources, getNewsSources } from '../services/newsScanner.js'

const router = express.Router()

/**
 * POST /api/content-gen/generate
 * Generate blog content from news sources
 * Requires ARTICLE_CREATE permission
 */
router.post('/generate', requireAuth, requirePermission(Actions.ARTICLE_CREATE), async (req, res) => {
  try {
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
    } = req.body

    console.log('[API] Content generation requested by:', req.user.email)

    const result = await generateBlogContent({
      sourcesLimit,
      articlesLimit,
      categories,
      requireKeywords,
      excludeKeywords,
      autoPublish,
      aiProvider,
      fetchFullContent,
      minContentLength,
      maxAgeHours
    })

    res.json(result)
  } catch (error) {
    console.error('[API] Content generation failed:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/content-gen/topic
 * Generate content for a specific topic
 * Requires ARTICLE_CREATE permission
 */
router.post('/topic', requireAuth, requirePermission(Actions.ARTICLE_CREATE), async (req, res) => {
  try {
    const { topic, ...options } = req.body

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required'
      })
    }

    console.log('[API] Topic-based generation requested:', topic)

    const result = await generateContentForTopic(topic, options)

    res.json(result)
  } catch (error) {
    console.error('[API] Topic generation failed:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/content-gen/test
 * Test content generation with a specific URL
 * Requires ARTICLE_CREATE permission
 */
router.post('/test', requireAuth, requirePermission(Actions.ARTICLE_CREATE), async (req, res) => {
  try {
    const { url, aiProvider } = req.body

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      })
    }

    console.log('[API] Test generation requested for:', url)

    const result = await testContentGeneration(url, { aiProvider })

    res.json(result)
  } catch (error) {
    console.error('[API] Test generation failed:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/content-gen/stats
 * Get content generation statistics
 */
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const stats = getGenerationStats()
    res.json(stats)
  } catch (error) {
    console.error('[API] Failed to get stats:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/content-gen/stats/reset
 * Reset content generation statistics
 * Requires ADMIN permission
 */
router.post('/stats/reset', requireAuth, requirePermission(Actions.ARTICLE_DELETE), async (req, res) => {
  try {
    const stats = resetStats()
    res.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('[API] Failed to reset stats:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/content-gen/sources
 * Get list of configured news sources
 */
router.get('/sources', requireAuth, async (req, res) => {
  try {
    const sources = getNewsSources()
    res.json({
      success: true,
      sources,
      count: sources.length
    })
  } catch (error) {
    console.error('[API] Failed to get sources:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/content-gen/scan
 * Scan news sources without generating articles
 * Requires ARTICLE_CREATE permission
 */
router.post('/scan', requireAuth, requirePermission(Actions.ARTICLE_CREATE), async (req, res) => {
  try {
    const {
      limit = 50,
      categories = null,
      fetchFullContent = false
    } = req.body

    console.log('[API] News scan requested')

    const result = await scanNewsSources({
      limit,
      categories,
      fetchFullContent
    })

    res.json({
      success: true,
      ...result
    })
  } catch (error) {
    console.error('[API] News scan failed:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/content-gen/generate-single
 * Generate a single article from scanned news
 * Requires ARTICLE_CREATE permission
 */
router.post('/generate-single', requireAuth, requirePermission(Actions.ARTICLE_CREATE), async (req, res) => {
  try {
    const { article, aiProvider = 'both', autoPublish = false } = req.body

    if (!article || !article.url) {
      return res.status(400).json({
        success: false,
        error: 'Article with URL is required'
      })
    }

    console.log('[API] Single article generation requested:', article.title)

    // Use the new generateAndSaveSingleArticle function to properly save the article
    const result = await generateAndSaveSingleArticle(article, {
      aiProvider,
      autoPublish
    })

    res.json(result)
  } catch (error) {
    console.error('[API] Single article generation failed:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router
// Updated
