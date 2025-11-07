import express from 'express'
import mongoose from 'mongoose'
import { getGenerationStats } from '../services/contentGenerator.js'

const router = express.Router()

/**
 * GET /api/health/status
 * Basic health check
 */
router.get('/status', async (req, res) => {
  const uptime = process.uptime()
  const memory = process.memoryUsage()

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(uptime),
    uptimeFormatted: formatUptime(uptime),
    memory: {
      heapUsed: formatBytes(memory.heapUsed),
      heapTotal: formatBytes(memory.heapTotal),
      rss: formatBytes(memory.rss)
    }
  })
})

/**
 * GET /api/health/detailed
 * Detailed health check including database and services
 */
router.get('/detailed', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {}
  }

  // Check database
  try {
    const dbState = mongoose.connection.readyState
    health.services.database = {
      status: dbState === 1 ? 'connected' : 'disconnected',
      state: ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState]
    }
  } catch (error) {
    health.services.database = {
      status: 'error',
      error: error.message
    }
    health.status = 'degraded'
  }

  // Check AI services
  try {
    health.services.ai = {
      status: 'configured',
      providers: {
        openai: !!process.env.OPENAI_API_KEY,
        anthropic: !!process.env.ANTHROPIC_API_KEY
      },
      activeProvider: process.env.AI_PROVIDER || 'both'
    }
  } catch (error) {
    health.services.ai = {
      status: 'error',
      error: error.message
    }
  }

  // Check content generation stats
  try {
    const stats = getGenerationStats()
    health.services.contentGeneration = {
      status: 'active',
      stats: {
        totalScans: stats.totalScans,
        totalGenerated: stats.totalGenerated,
        lastScan: stats.lastScanAt,
        lastGeneration: stats.lastGenerationAt,
        recentErrors: stats.recentErrors?.length || 0
      }
    }
  } catch (error) {
    health.services.contentGeneration = {
      status: 'error',
      error: error.message
    }
  }

  // Check environment variables
  const requiredEnvVars = [
    'MONGO_URI',
    'JWT_SECRET',
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY'
  ]

  const missingEnvVars = requiredEnvVars.filter(key => !process.env[key])
  if (missingEnvVars.length > 0) {
    health.services.environment = {
      status: 'warning',
      missing: missingEnvVars
    }
    health.status = 'degraded'
  } else {
    health.services.environment = {
      status: 'ok',
      configured: requiredEnvVars.length
    }
  }

  const statusCode = health.status === 'healthy' ? 200 : 503
  res.status(statusCode).json(health)
})

/**
 * GET /api/health/metrics
 * Prometheus-style metrics
 */
router.get('/metrics', async (req, res) => {
  const uptime = process.uptime()
  const memory = process.memoryUsage()
  const stats = getGenerationStats()

  const metrics = [
    `# HELP nodejs_uptime_seconds Node.js uptime in seconds`,
    `# TYPE nodejs_uptime_seconds gauge`,
    `nodejs_uptime_seconds ${uptime}`,
    ``,
    `# HELP nodejs_heap_used_bytes Node.js heap used in bytes`,
    `# TYPE nodejs_heap_used_bytes gauge`,
    `nodejs_heap_used_bytes ${memory.heapUsed}`,
    ``,
    `# HELP content_generation_total Total content generations`,
    `# TYPE content_generation_total counter`,
    `content_generation_total ${stats.totalGenerated}`,
    ``,
    `# HELP content_scans_total Total content scans`,
    `# TYPE content_scans_total counter`,
    `content_scans_total ${stats.totalScans}`,
    ``,
    `# HELP content_generation_errors_total Total content generation errors`,
    `# TYPE content_generation_errors_total counter`,
    `content_generation_errors_total ${stats.errors?.length || 0}`,
  ].join('\n')

  res.set('Content-Type', 'text/plain')
  res.send(metrics)
})

/**
 * Helper: Format uptime
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  const parts = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`)

  return parts.join(' ')
}

/**
 * Helper: Format bytes
 */
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}

export default router
