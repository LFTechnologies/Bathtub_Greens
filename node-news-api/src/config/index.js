import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { connectDB } from ',./config/db.js'
import authRoutes from './routes/auth.js'
import articleRoutes from './routes/articles.js'
import commentRoutes from './routes/comments.js'
import ingestRoutes from './routes/ingest.js'
import { initCron } from './jobs/cron.js'

const app = express()

// Security + parsers
app.use(helmet())
app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))

// Simple global rate limiter
app.use(rateLimit({ windowMs: 60_000, max: 120 }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/articles', articleRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/ingest', ingestRoutes)

app.get('/api/health', (_req, res) => res.json({ ok: true }))

// Start
const PORT = process.env.PORT || 4000
await connectDB()
initCron()
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`))