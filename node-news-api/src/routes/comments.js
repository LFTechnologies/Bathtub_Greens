import { Router } from 'express'
import { z } from 'zod'
import { requireAuth, requirePermission, authOptional } from '../middleware/auth.js'
import { Actions } from '../utils/permissions.js'
import Comment from '../models/Comment.js'
import Article from '../models/Article.js'
import { moderateText } from '../services/ai.js'

const router = Router()
const Create = z.object({ body: z.string().min(2) })

router.get('/by-article/:articleId', authOptional, async (req, res) => {
  const isStaff = !!req.user
  const filter = { article: req.params.articleId }
  if (!isStaff) filter.status = 'visible'
  const items = await Comment.find(filter).sort({ createdAt: -1 }).limit(200)
  res.json(items)
})

router.post('/for/:articleId', requireAuth, async (req, res) => {
  const art = await Article.findById(req.params.articleId)
  if (!art || art.status !== 'published') return res.status(400).json({ error: 'Article unavailable' })
  const { body } = Create.parse(req.body)

  let status = 'visible'
  try {
    const mod = await moderateText(body)
    if (mod?.flagged) status = 'pending'
  } catch {}

  const c = await Comment.create({ article: art.id, user: req.user.id, body, status })
  res.status(201).json(c)
})

router.post('/:id/hide', requireAuth, requirePermission(Actions.COMMENT_MODERATE), async (req, res) => {
  await Comment.findByIdAndUpdate(req.params.id, { status: 'hidden' })
  res.json({ ok: true })
})

router.post('/:id/show', requireAuth, requirePermission(Actions.COMMENT_MODERATE), async (req, res) => {
  await Comment.findByIdAndUpdate(req.params.id, { status: 'visible' })
  res.json({ ok: true })
})

export default router