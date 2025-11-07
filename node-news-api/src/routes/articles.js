// src/routes/articles.js
import { Router } from 'express'
import { z } from 'zod'
import Article from '../models/Article.js'
import { requireAuth, requirePermission, authOptional } from '../middleware/auth.js'
import { Actions } from '../utils/permissions.js'

const router = Router()

const ArticleCreate = z.object({
  title: z.string().min(4),
  rawContent: z.string().min(40),
  tags: z.array(z.string()).optional()
})

// List
router.get('/', authOptional, async (req, res) => {
  const status = req.query.status
  const isStaff = !!req.user
  const filter = {}
  if (!isStaff) filter.status = 'published'
  if (isStaff && status) filter.status = status
  const items = await Article.find(filter).sort({ createdAt: -1 }).limit(50)
  res.json(items)
})

// Read
router.get('/:id', authOptional, async (req, res) => {
  const art = await Article.findById(req.params.id)
  if (!art) return res.status(404).json({ error: 'Not found' })
  if (art.status !== 'published' && !req.user) return res.status(403).json({ error: 'Unpublished' })
  res.json(art)
})

// Create (manual authoring) -> default 'draft'
router.post('/', requireAuth, requirePermission(Actions.ARTICLE_CREATE), async (req, res) => {
  const data = ArticleCreate.parse(req.body)
  const art = await Article.create({ ...data, createdBy: req.user.id, status: 'draft', ingestion: 'manual' })
  res.status(201).json(art)
})

// Edit
router.put('/:id', requireAuth, requirePermission(Actions.ARTICLE_EDIT), async (req, res) => {
  const art = await Article.findById(req.params.id)
  if (!art) return res.status(404).json({ error: 'Not found' })
  const fields = ['title','rawContent','cleanedContent','summary','aiSummary','tags']
  for (const f of fields) if (f in req.body) art[f] = req.body[f]
  await art.save()
  res.json(art)
})

// Submit for review
router.post('/:id/submit', requireAuth, requirePermission(Actions.ARTICLE_EDIT), async (req, res) => {
  const art = await Article.findById(req.params.id)
  if (!art) return res.status(404).json({ error: 'Not found' })
  art.status = 'pending_review'
  await art.save()
  res.json({ ok: true })
})

// Approve
router.post('/:id/approve', requireAuth, requirePermission(Actions.ARTICLE_APPROVE), async (req, res) => {
  const art = await Article.findById(req.params.id)
  if (!art) return res.status(404).json({ error: 'Not found' })
  art.status = 'approved'
  art.approvedBy = req.user.id
  await art.save()
  res.json({ ok: true })
})

// Publish
router.post('/:id/publish', requireAuth, requirePermission(Actions.ARTICLE_PUBLISH), async (req, res) => {
  const art = await Article.findById(req.params.id)
  if (!art) return res.status(404).json({ error: 'Not found' })
  art.status = 'published'
  art.publishedAt = new Date()
  await art.save()
  res.json({ ok: true })
})

// Delete
router.delete('/:id', requireAuth, requirePermission(Actions.ARTICLE_DELETE), async (req, res) => {
  await Article.findByIdAndDelete(req.params.id)
  res.json({ ok: true })
})

export default router
