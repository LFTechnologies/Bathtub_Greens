import express from 'express'
import { authenticate, requirePermission } from '../middleware/auth.js'
import AffiliateLink from '../models/AffiliateLink.js'

const router = express.Router()

/**
 * GET /api/affiliate/links
 * List all affiliate links
 */
router.get('/links', authenticate, async (req, res) => {
  try {
    const { status, program, category } = req.query
    const filter = {}

    if (status) filter.status = status
    if (program) filter.program = program
    if (category) filter.category = category

    const links = await AffiliateLink.find(filter)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'displayName email')

    res.json({
      success: true,
      links,
      count: links.length
    })
  } catch (error) {
    console.error('[Affiliate] Failed to fetch links:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

/**
 * POST /api/affiliate/links
 * Create new affiliate link
 */
router.post('/links', authenticate, requirePermission('ARTICLE_CREATE'), async (req, res) => {
  try {
    const {
      name,
      originalUrl,
      affiliateUrl,
      shortCode,
      program,
      category,
      tags,
      displayText,
      description,
      imageUrl,
      notes
    } = req.body

    if (!name || !originalUrl || !affiliateUrl) {
      return res.status(400).json({
        success: false,
        error: 'Name, originalUrl, and affiliateUrl are required'
      })
    }

    const link = new AffiliateLink({
      name,
      originalUrl,
      affiliateUrl,
      shortCode: shortCode || undefined, // Let pre-save hook generate if not provided
      program,
      category,
      tags,
      displayText,
      description,
      imageUrl,
      notes,
      createdBy: req.user._id
    })

    await link.save()

    res.json({
      success: true,
      link
    })
  } catch (error) {
    console.error('[Affiliate] Failed to create link:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

/**
 * PUT /api/affiliate/links/:id
 * Update affiliate link
 */
router.put('/links/:id', authenticate, requirePermission('ARTICLE_EDIT'), async (req, res) => {
  try {
    const link = await AffiliateLink.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )

    if (!link) {
      return res.status(404).json({ success: false, error: 'Link not found' })
    }

    res.json({ success: true, link })
  } catch (error) {
    console.error('[Affiliate] Failed to update link:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

/**
 * DELETE /api/affiliate/links/:id
 * Delete affiliate link
 */
router.delete('/links/:id', authenticate, requirePermission('ARTICLE_DELETE'), async (req, res) => {
  try {
    const link = await AffiliateLink.findByIdAndDelete(req.params.id)

    if (!link) {
      return res.status(404).json({ success: false, error: 'Link not found' })
    }

    res.json({ success: true, message: 'Link deleted' })
  } catch (error) {
    console.error('[Affiliate] Failed to delete link:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

/**
 * GET /api/affiliate/redirect/:shortCode
 * Redirect via affiliate link (public, tracks clicks)
 */
router.get('/redirect/:shortCode', async (req, res) => {
  try {
    const link = await AffiliateLink.findOne({
      shortCode: req.params.shortCode.toUpperCase(),
      status: 'active'
    })

    if (!link) {
      return res.status(404).send('Link not found')
    }

    // Increment click counter
    link.clicks += 1
    await link.save()

    // Log for analytics
    console.log(`[Affiliate] Click: ${link.name} (${link.shortCode}) - Total: ${link.clicks}`)

    // Redirect
    res.redirect(link.affiliateUrl)
  } catch (error) {
    console.error('[Affiliate] Redirect failed:', error)
    res.status(500).send('Redirect failed')
  }
})

/**
 * GET /api/affiliate/stats
 * Get affiliate statistics
 */
router.get('/stats', authenticate, async (req, res) => {
  try {
    const totalLinks = await AffiliateLink.countDocuments({ status: 'active' })
    const totalClicks = await AffiliateLink.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$clicks' } } }
    ])
    const totalRevenue = await AffiliateLink.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$revenue' } } }
    ])

    const topLinks = await AffiliateLink.find({ status: 'active' })
      .sort({ clicks: -1 })
      .limit(10)
      .select('name shortCode clicks conversions revenue')

    res.json({
      success: true,
      stats: {
        totalLinks,
        totalClicks: totalClicks[0]?.total || 0,
        totalRevenue: totalRevenue[0]?.total || 0,
        topLinks
      }
    })
  } catch (error) {
    console.error('[Affiliate] Failed to get stats:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
