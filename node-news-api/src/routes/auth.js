// node-news-api/src/routes/auth.js
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import User from '../models/User.js'

// ⬇️ point to the file you actually have (permissons.js)
import { Roles } from '../utils/permissions.js'

const router = Router()

const Register = z.object({ email: z.string().email(), password: z.string().min(6), displayName: z.string().min(2) })
const Login = z.object({ email: z.string().email(), password: z.string().min(6) })

router.post('/register', async (req, res) => {
  try {
    const data = Register.parse(req.body)
    const exists = await User.findOne({ email: data.email })
    if (exists) return res.status(400).json({ error: 'Email in use' })

    const user = new User({ email: data.email, displayName: data.displayName, role: Roles.USER })
    await user.setPassword(data.password)
    await user.save()

    const token = jwt.sign({ id: user.id, role: user.role, displayName: user.displayName }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, displayName: user.displayName } })
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = Login.parse(req.body)
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })
    const ok = await user.verifyPassword(password)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign({ id: user.id, role: user.role, displayName: user.displayName }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, displayName: user.displayName } })
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})

router.get('/me', async (req, res) => {
  const hdr = req.headers.authorization || ''
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null
  if (!token) return res.json({ authenticated: false })
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    return res.json({ authenticated: true, ...payload })
  } catch { return res.json({ authenticated: false }) }
})

export default router
