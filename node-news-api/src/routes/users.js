// src/routes/users.js
import { Router } from 'express'
import User from '../models/User.js'
import { requireAuth, requirePermission } from '../middleware/auth.js'
import { Actions } from '../utils/permissions.js'

const router = Router()

router.get('/', requireAuth, requirePermission(Actions.MANAGE_USERS), async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).select('_id email displayName role createdAt')
  res.json(users)
})

router.post('/:id/role', requireAuth, requirePermission(Actions.MANAGE_ROLES), async (req, res) => {
  const { role } = req.body || {}
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true })
  res.json({ ok: true, user: { _id: user._id, role: user.role } })
})

export default router
