# Production Deployment Guide

## Overview

This news blog platform features:
- **Automated Content Generation** using Claude (Anthropic) and ChatGPT (OpenAI)
- **Multi-source News Scanning** from RSS feeds and NewsAPI
- **Intelligent Commentary** using advanced AI models
- **Admin Dashboard** for content management
- **Scheduled Jobs** for automated content creation
- **Production-ready** with monitoring and health checks

## Quick Start

### 1. Environment Setup

Copy the example environment file:

```bash
cd node-news-api
cp .env.example .env
```

Edit `.env` and configure:

#### Required Variables:
```env
MONGO_URI=mongodb://localhost:27017/news-blog
JWT_SECRET=generate-a-strong-secret-key-here
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
```

#### Optional but Recommended:
```env
NEWSAPI_KEY=your-newsapi-org-key
RAPIDAPI_KEY=your-rapidapi-twitter-key
```

### 2. Install Dependencies

```bash
# Backend
cd node-news-api
npm install

# Frontend
cd ../admin
npm install
```

### 3. Start Services

**Development:**
```bash
# Terminal 1: Backend
cd node-news-api
npm run dev

# Terminal 2: Frontend
cd admin
npm run dev
```

**Production:**
```bash
# Backend
cd node-news-api
npm start

# Frontend
cd admin
npm run build
npm start
```

### 4. Create Admin User

```bash
cd node-news-api
npm run seed:admin
```

Default credentials:
- Email: `admin@example.com`
- Password: `admin123`

**⚠️ Change these immediately in production!**

## Features

### Automated Content Generation

The system automatically:
1. **Scans** news sources (RSS feeds, NewsAPI, etc.)
2. **Filters** articles by relevance, quality, and recency
3. **Analyzes** using Claude or ChatGPT
4. **Generates** engaging titles, summaries, and commentary
5. **Creates** blog posts ready for review/publishing

#### Manual Content Generation

Use the API or admin UI:

```bash
curl -X POST http://localhost:4000/api/content-gen/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "articlesLimit": 10,
    "aiProvider": "both",
    "autoPublish": false
  }'
```

#### Scheduled Content Generation

Configure in `.env`:

```env
# Generate content every 4 hours
CRON_CONTENT_GEN=0 */4 * * *

# Scan news every hour
CRON_NEWS_SCAN=0 * * * *

# Generate 5 articles per run
AUTO_GEN_ARTICLES_LIMIT=5

# Auto-publish (true/false)
AUTO_GEN_AUTO_PUBLISH=false
```

### AI Provider Selection

**Claude (Anthropic)** - Best for:
- Nuanced analysis and commentary
- Long-form content
- Thoughtful perspectives

**ChatGPT (OpenAI)** - Best for:
- Faster processing
- Structured data extraction
- Cost-effective at scale

**Both** (Recommended):
- Tries Claude first
- Falls back to ChatGPT if Claude fails
- Best reliability

Configure in `.env`:
```env
AI_PROVIDER=both  # or 'claude' or 'openai'
```

### News Sources

#### Built-in RSS Feeds:
- BBC News
- New York Times
- Reuters
- The Guardian
- CNN
- TechCrunch
- Wired
- The Verge
- Hacker News

#### Adding Custom Sources

Edit `node-news-api/src/services/newsScanner.js`:

```javascript
const DEFAULT_NEWS_SOURCES = [
  // Add your source
  {
    type: 'rss',
    url: 'https://your-news-site.com/feed',
    name: 'Your News Site',
    category: 'general'
  }
]
```

Or use the API (coming soon):
```bash
curl -X POST http://localhost:4000/api/content-gen/sources \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"type":"rss","url":"...","name":"..."}'
```

## API Endpoints

### Content Generation

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/content-gen/generate` | POST | Generate blog content from news |
| `/api/content-gen/topic` | POST | Generate content for specific topic |
| `/api/content-gen/test` | POST | Test generation with a URL |
| `/api/content-gen/stats` | GET | Get generation statistics |
| `/api/content-gen/scan` | GET | Scan news without generating |
| `/api/content-gen/sources` | GET | List configured sources |

### Health & Monitoring

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Basic health check |
| `/api/health/status` | GET | Service status |
| `/api/health/detailed` | GET | Detailed health info |
| `/api/health/metrics` | GET | Prometheus metrics |

### Articles

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/articles` | GET | List articles |
| `/api/articles/:id` | GET | Get article |
| `/api/articles` | POST | Create article |
| `/api/articles/:id` | PUT | Update article |
| `/api/articles/:id/publish` | POST | Publish article |
| `/api/articles/bulk` | PATCH | Bulk operations |

## Production Configuration

### Database

**MongoDB Atlas (Recommended):**

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/news-blog?retryWrites=true&w=majority
```

**Local MongoDB:**

```env
MONGO_URI=mongodb://localhost:27017/news-blog
```

### Security

1. **Change JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

2. **Set ADMIN_ORIGIN:**
```env
ADMIN_ORIGIN=https://your-admin-domain.com
```

3. **Use HTTPS** in production

4. **Rate Limiting** (already configured):
- 200 requests/minute global
- Adjust in `src/index.js` if needed

### API Keys

#### OpenAI
1. Visit https://platform.openai.com/api-keys
2. Create new secret key
3. Add to `.env`: `OPENAI_API_KEY=sk-...`

#### Anthropic
1. Visit https://console.anthropic.com/
2. Get API key
3. Add to `.env`: `ANTHROPIC_API_KEY=sk-ant-...`

#### NewsAPI (Optional)
1. Visit https://newsapi.org/register
2. Get API key
3. Add to `.env`: `NEWSAPI_KEY=...`

### Monitoring

#### Health Checks

**Kubernetes/Docker:**
```yaml
livenessProbe:
  httpGet:
    path: /api/health/status
    port: 4000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /api/health/detailed
    port: 4000
  initialDelaySeconds: 5
  periodSeconds: 5
```

#### Prometheus Metrics

Configure Prometheus to scrape:
```yaml
scrape_configs:
  - job_name: 'news-blog'
    static_configs:
      - targets: ['localhost:4000']
    metrics_path: '/api/health/metrics'
```

## Deployment Options

### Docker

**Backend Dockerfile:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

**Build & Run:**
```bash
docker build -t news-blog-api ./node-news-api
docker run -p 4000:4000 --env-file .env news-blog-api
```

### Docker Compose

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  api:
    build: ./node-news-api
    ports:
      - "4000:4000"
    environment:
      - MONGO_URI=mongodb://mongodb:27017/news-blog
    env_file:
      - ./node-news-api/.env
    depends_on:
      - mongodb

  admin:
    build: ./admin
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_BASE=http://api:4000

volumes:
  mongo-data:
```

### Vercel/Netlify (Frontend)

**admin/.env.production:**
```env
NEXT_PUBLIC_API_BASE=https://your-api-domain.com
```

Deploy:
```bash
cd admin
npm run build
vercel deploy --prod
```

### Railway/Render (Backend)

1. Connect GitHub repo
2. Set environment variables from `.env.example`
3. Deploy

## Troubleshooting

### Content Generation Not Working

1. **Check API Keys:**
```bash
curl http://localhost:4000/api/health/detailed
```

2. **Check Logs:**
```bash
# Look for [ContentGenerator] or [AI] logs
tail -f logs/app.log
```

3. **Test Manually:**
```bash
curl -X POST http://localhost:4000/api/content-gen/test \
  -H "Authorization: Bearer TOKEN" \
  -d '{"url":"https://news.ycombinator.com"}'
```

### Scheduled Jobs Not Running

1. **Check Cron Configuration:**
```bash
# In .env
CRON_CONTENT_GEN=0 */4 * * *
```

2. **Check Logs on Startup:**
```
[Cron] Content generation scheduled: 0 */4 * * *
[Cron] News scan scheduled: 0 * * * *
```

3. **Verify Time Zone:**
```bash
echo $TZ
# Set if needed: TZ=America/New_York
```

### Database Connection Issues

1. **Check MongoDB:**
```bash
mongosh $MONGO_URI
```

2. **Check Logs:**
```
[MongoDB] Connected successfully
```

3. **Test Connection:**
```bash
curl http://localhost:4000/api/health/detailed
```

## Performance Optimization

### AI API Rate Limiting

The system includes built-in delays:
- 2 seconds between AI calls
- 1 second between news sources
- 0.5 seconds between article fetches

Adjust in `src/services/contentGenerator.js` and `src/services/newsScanner.js`.

### Caching (Recommended)

Add Redis for caching:
```env
REDIS_URL=redis://localhost:6379
```

### Database Indexing

Already configured in models:
- `Article.sourceUrl` (unique index)
- `Article.status` (query index)
- `Article.publishedAt` (sort index)

## Cost Estimation

### AI API Costs

**Claude Sonnet 4.5:**
- ~$3 per 1M input tokens
- ~$15 per 1M output tokens
- Per article: ~$0.02-0.05

**GPT-4o:**
- ~$2.50 per 1M input tokens
- ~$10 per 1M output tokens
- Per article: ~$0.01-0.03

**5 articles every 4 hours:**
- Claude: ~$0.15/day = $4.50/month
- GPT-4o: ~$0.08/day = $2.40/month
- Both (Claude fallback): ~$0.15/day = $4.50/month

### Infrastructure

**Minimal Setup:**
- MongoDB Atlas (Free M0): $0/month
- Railway/Render (Hobby): $5/month
- Vercel (Frontend): $0/month
- **Total: ~$5-10/month**

## Support

- **Issues**: GitHub Issues
- **Documentation**: This guide + code comments
- **API Docs**: `/api/health/detailed` for service status

## License

ISC
