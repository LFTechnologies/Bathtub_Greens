import jwt from 'jsonwebtoken'
import { can } from '../utils/permissions.js'

export function requireAuth(req, res, next) {
  try {
    const hdr = req.headers.authorization || ''
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null
    if (!token) return res.status(401).json({ error: 'Missing token' })
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = payload
    next()
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export function authOptional(req, _res, next) {
  const hdr = req.headers.authorization || ''
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null
  if (token) {
    try { req.user = jwt.verify(token, process.env.JWT_SECRET) } catch {}
  }
  next()
}

export function requirePermission(action) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Auth required' })
    if (!can(req.user, action)) return res.status(403).json({ error: 'Forbidden' })
    next()
  }
}