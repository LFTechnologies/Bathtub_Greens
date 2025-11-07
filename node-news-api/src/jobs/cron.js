import cron from 'node-cron'
import { generateBlogContent } from '../services/contentGenerator.js'

export function initCron() {
  // Legacy ingest job (if configured)
  const ingestSpec = process.env.CRON_INGEST
  if (ingestSpec) {
    console.log('[Cron] Legacy ingest job scheduled:', ingestSpec)
    cron.schedule(ingestSpec, async () => {
      try {
        console.log('[Cron] Running legacy ingest...')
        // Legacy ingest logic would go here
        console.log('[Cron] Legacy ingest completed')
      } catch (e) {
        console.error('[Cron] Legacy ingest failed:', e.message)
      }
    })
  }

  // Automated content generation job
  // Default: every 4 hours (0 */4 * * *)
  const contentGenSpec = process.env.CRON_CONTENT_GEN || '0 */4 * * *'
  console.log('[Cron] Content generation scheduled:', contentGenSpec)

  cron.schedule(contentGenSpec, async () => {
    try {
      console.log('[Cron] Starting automated content generation...')

      const result = await generateBlogContent({
        sourcesLimit: parseInt(process.env.AUTO_GEN_SOURCES_LIMIT) || 50,
        articlesLimit: parseInt(process.env.AUTO_GEN_ARTICLES_LIMIT) || 5,
        categories: process.env.AUTO_GEN_CATEGORIES?.split(',') || null,
        autoPublish: process.env.AUTO_GEN_AUTO_PUBLISH === 'true',
        aiProvider: process.env.AI_PROVIDER || 'both',
        fetchFullContent: true,
        minContentLength: parseInt(process.env.AUTO_GEN_MIN_LENGTH) || 200,
        maxAgeHours: parseInt(process.env.AUTO_GEN_MAX_AGE_HOURS) || 24
      })

      console.log('[Cron] Content generation completed:', {
        generated: result.generated,
        scanned: result.scanned,
        errors: result.errors
      })
    } catch (e) {
      console.error('[Cron] Content generation failed:', e.message)
    }
  })

  // Quick news scan job (more frequent, just for monitoring)
  // Default: every hour (0 * * * *)
  const scanSpec = process.env.CRON_NEWS_SCAN || '0 * * * *'
  console.log('[Cron] News scan scheduled:', scanSpec)

  cron.schedule(scanSpec, async () => {
    try {
      console.log('[Cron] Running quick news scan...')

      const { scanNewsSources } = await import('../services/newsScanner.js')

      const result = await scanNewsSources({
        limit: 20,
        fetchFullContent: false
      })

      console.log('[Cron] News scan completed:', {
        articlesFound: result.totalArticles,
        sources: result.sourcesScanned
      })
    } catch (e) {
      console.error('[Cron] News scan failed:', e.message)
    }
  })

  console.log('[Cron] All scheduled jobs initialized')
}