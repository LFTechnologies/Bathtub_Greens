# Bathtub Greens - AI-Powered News Blog Platform

A production-ready news blog platform with automated content generation powered by Claude (Anthropic) and ChatGPT (OpenAI).

## Features

### 🤖 AI-Powered Content Generation
- **Dual AI Provider Support**: Claude Sonnet 4.5 + GPT-4o with intelligent fallback
- **Automated Commentary**: AI-generated insightful analysis and commentary
- **Multi-Source Scanning**: RSS feeds, NewsAPI, and custom sources
- **Smart Filtering**: Relevance, quality, and recency filters
- **Scheduled Generation**: Automated content creation every 4 hours

### 📰 News Sources
- **Built-in RSS Feeds**: BBC, NYT, Reuters, Guardian, CNN, TechCrunch, Wired, The Verge, HN
- **NewsAPI Integration**: Access to thousands of news sources
- **Twitter/X Integration**: RapidAPI support for social media content
- **Custom Sources**: Easy configuration for additional feeds

### 🎯 Content Management
- **Admin Dashboard**: Full-featured content management interface
- **Workflow System**: Draft → Review → Approved → Published
- **Bulk Operations**: Publish, unpublish, delete multiple articles
- **Comment System**: User engagement with AI moderation
- **Role-Based Access**: Admin, Editor, Moderator, User roles

### 🔧 Production Ready
- **Health Checks**: Comprehensive monitoring endpoints
- **Prometheus Metrics**: Production-grade observability
- **Rate Limiting**: Built-in API protection
- **Security**: JWT auth, CORS, Helmet security headers
- **Database**: MongoDB with Mongoose ODM
- **Scheduled Jobs**: node-cron for automation

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- API Keys:
  - OpenAI API key
  - Anthropic API key
  - (Optional) NewsAPI key
  - (Optional) RapidAPI Twitter key

### Installation

1. **Clone & Install:**
```bash
git clone <repo-url>
cd Bathtub_Greens

# Backend
cd node-news-api
npm install
cp .env.example .env
# Edit .env with your API keys

# Frontend
cd ../admin
npm install
```

2. **Configure Environment:**

Edit `node-news-api/.env`:
```env
MONGO_URI=mongodb://localhost:27017/news-blog
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
AI_PROVIDER=both
```

3. **Create Admin User:**
```bash
cd node-news-api
npm run seed:admin
# Default: admin@example.com / admin123
```

4. **Start Services:**
```bash
# Terminal 1: Backend
cd node-news-api
npm run dev

# Terminal 2: Frontend
cd admin
npm run dev
```

5. **Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Admin Dashboard: http://localhost:3001

## Usage

### Manual Content Generation

**Via API:**
```bash
curl -X POST http://localhost:4000/api/content-gen/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "articlesLimit": 5,
    "aiProvider": "both",
    "autoPublish": false
  }'
```

**Via Admin UI:**
1. Login to admin dashboard
2. Navigate to "Content Generation"
3. Configure settings
4. Click "Generate Content"

### Automated Content Generation

Configured via environment variables:

```env
# Generate content every 4 hours
CRON_CONTENT_GEN=0 */4 * * *

# Number of articles per generation
AUTO_GEN_ARTICLES_LIMIT=5

# Auto-publish generated content
AUTO_GEN_AUTO_PUBLISH=false

# AI provider preference
AI_PROVIDER=both
```

The system will automatically:
1. Scan configured news sources
2. Filter by quality and relevance
3. Generate AI summaries and commentary
4. Create blog posts (draft or published)

### Topic-Specific Generation

Generate content for specific topics:

```bash
curl -X POST http://localhost:4000/api/content-gen/topic \
  -H "Authorization: Bearer TOKEN" \
  -d '{"topic": "artificial intelligence", "articlesLimit": 3}'
```

## Architecture

```
Bathtub_Greens/
├── node-news-api/          # Express.js Backend
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   │   ├── articles.js
│   │   │   ├── auth.js
│   │   │   ├── contentGen.js  # Content generation
│   │   │   └── health.js      # Monitoring
│   │   ├── services/       # Business logic
│   │   │   ├── ai.js          # Claude + OpenAI
│   │   │   ├── newsScanner.js # RSS + NewsAPI
│   │   │   └── contentGenerator.js
│   │   ├── models/         # MongoDB schemas
│   │   ├── middleware/     # Auth, permissions
│   │   └── jobs/           # Scheduled tasks
│   └── package.json
│
├── admin/                  # Next.js Frontend
│   ├── src/app/
│   │   ├── admin/
│   │   │   ├── articles/
│   │   │   └── content-gen/   # Generation dashboard
│   │   └── api/           # Next.js API routes
│   └── package.json
│
└── PRODUCTION_GUIDE.md    # Deployment guide
```

## API Endpoints

### Content Generation
- `POST /api/content-gen/generate` - Generate content
- `POST /api/content-gen/topic` - Topic-specific generation
- `POST /api/content-gen/test` - Test with URL
- `GET /api/content-gen/stats` - Generation statistics
- `GET /api/content-gen/sources` - List news sources
- `POST /api/content-gen/scan` - Scan without generating

### Articles
- `GET /api/articles` - List articles
- `POST /api/articles` - Create article
- `PUT /api/articles/:id` - Update article
- `POST /api/articles/:id/publish` - Publish article
- `PATCH /api/articles/bulk` - Bulk operations

### Health & Monitoring
- `GET /api/health` - Basic health
- `GET /api/health/status` - Service status
- `GET /api/health/detailed` - Detailed diagnostics
- `GET /api/health/metrics` - Prometheus metrics

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Current user

## Configuration

### AI Providers

**Claude (Anthropic) - Best for:**
- Nuanced analysis and commentary
- Thoughtful perspectives
- High-quality long-form content

**ChatGPT (OpenAI) - Best for:**
- Faster processing
- Cost-effective at scale
- Structured data extraction

**Both (Recommended):**
```env
AI_PROVIDER=both  # Claude first, OpenAI fallback
```

### News Source Configuration

Default sources in `src/services/newsScanner.js`:
- RSS feeds from major news outlets
- Technology news sites
- General news aggregators

Add custom sources:
```javascript
const DEFAULT_NEWS_SOURCES = [
  {
    type: 'rss',
    url: 'https://your-site.com/feed',
    name: 'Your Site',
    category: 'general'
  }
]
```

### Scheduled Jobs

```env
# Content generation (default: every 4 hours)
CRON_CONTENT_GEN=0 */4 * * *

# News scanning (default: every hour)
CRON_NEWS_SCAN=0 * * * *
```

Cron format: `minute hour day month weekday`
- `0 */4 * * *` - Every 4 hours
- `0 * * * *` - Every hour
- `*/30 * * * *` - Every 30 minutes
- `0 9 * * *` - Daily at 9 AM

## Monitoring

### Health Checks

**Basic:**
```bash
curl http://localhost:4000/api/health/status
```

**Detailed:**
```bash
curl http://localhost:4000/api/health/detailed
```

**Prometheus Metrics:**
```bash
curl http://localhost:4000/api/health/metrics
```

### Logs

Look for these prefixes:
- `[ContentGenerator]` - Content generation activity
- `[NewsScanner]` - News scanning activity
- `[AI]` - AI service calls
- `[Cron]` - Scheduled job execution

## Deployment

See [PRODUCTION_GUIDE.md](./PRODUCTION_GUIDE.md) for detailed deployment instructions.

### Quick Deploy Options

**Docker:**
```bash
docker build -t news-blog-api ./node-news-api
docker run -p 4000:4000 --env-file .env news-blog-api
```

**Docker Compose:**
```bash
docker-compose up -d
```

**Platform as a Service:**
- Railway
- Render
- Heroku
- DigitalOcean App Platform

**Frontend:**
- Vercel
- Netlify
- Cloudflare Pages

## Cost Estimation

### AI API Costs
**5 articles every 4 hours (30 articles/day):**
- Claude Sonnet 4.5: ~$4.50/month
- GPT-4o: ~$2.40/month
- Both (Claude primary): ~$4.50/month

### Infrastructure
**Minimal setup:**
- MongoDB Atlas Free Tier: $0
- Railway/Render Hobby: $5/month
- Vercel Frontend: $0
- **Total: ~$5-10/month**

## Monetization

This platform includes comprehensive monetization features. See [MONETIZATION_GUIDE.md](./MONETIZATION_GUIDE.md) for complete details.

### Revenue Streams

**1. Google AdSense**
- Automated ad placement components
- Responsive ad units
- Expected: $10-500/month (depends on traffic)

**2. Affiliate Marketing**
- Built-in link management system
- Click tracking and analytics
- Expected: $50-1,000/month

**3. Sponsored Content**
- Sponsored article support
- Disclosure management
- Expected: $200-2,000/month

**4. Premium/Subscriptions** (optional)
- Newsletter monetization
- Members-only content
- Expected: $100-5,000/month

### Quick Monetization Setup

1. **Apply for Google AdSense**: https://adsense.google.com
2. **Add API keys** to `.env`:
```env
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```
3. **Enable cookie consent** (already included)
4. **Create affiliate links** via `/admin/affiliate`
5. **Track revenue** in `/admin/monetization`

### Included Monetization Features

- ✅ Google AdSense components (banner, in-article, sidebar)
- ✅ Google Analytics integration with event tracking
- ✅ Cookie consent banner (GDPR compliant)
- ✅ Privacy Policy & Terms of Service pages
- ✅ Affiliate link management system with tracking
- ✅ Sponsored content support
- ✅ SEO optimization components
- ✅ Monetization dashboard
- ✅ Analytics and revenue tracking

### Potential Monthly Revenue

**With 50K monthly views:**
- AdSense: $150-300
- Affiliates: $100-200
- Sponsored: $500 (1-2 posts)
- **Total: $750-1,000/month**

**With 200K monthly views:**
- AdSense: $600-1,200
- Affiliates: $400-800
- Sponsored: $1,500 (3-4 posts)
- **Total: $2,500-3,500/month**

See [MONETIZATION_GUIDE.md](./MONETIZATION_GUIDE.md) for detailed strategies and setup instructions.

## Development

### Testing Content Generation

**Test with a specific URL:**
```bash
curl -X POST http://localhost:4000/api/content-gen/test \
  -H "Authorization: Bearer TOKEN" \
  -d '{"url": "https://techcrunch.com/some-article"}'
```

**Scan news sources:**
```bash
curl -X POST http://localhost:4000/api/content-gen/scan \
  -H "Authorization: Bearer TOKEN"
```

### Database Schema

**Article:**
- title, summary, content
- AI-generated summary and commentary
- Source attribution
- Status workflow (draft → review → published)
- Tags and metadata

**User:**
- Email, password (bcrypt hashed)
- Role-based permissions
- Display name

**Comment:**
- Article reference
- User reference
- AI moderation flags
- Visibility status

## Troubleshooting

### Content Generation Not Working

1. **Check API keys:**
```bash
curl http://localhost:4000/api/health/detailed
```

2. **Check logs for [AI] errors**

3. **Verify AI provider:**
```env
AI_PROVIDER=both  # or 'claude' or 'openai'
```

### No Articles Generated

1. **Check filters** - May be too restrictive
2. **Check news sources** - Ensure RSS feeds are accessible
3. **Check age limit** - `maxAgeHours` may be too low
4. **Check duplicates** - Articles may already exist

### Scheduled Jobs Not Running

1. **Verify cron syntax** in `.env`
2. **Check startup logs** for cron initialization
3. **Verify timezone** settings

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License

ISC

## Support

- **Documentation**: This README + PRODUCTION_GUIDE.md
- **Issues**: GitHub Issues
- **API Health**: `/api/health/detailed`

---

Built with ❤️ using Claude Sonnet 4.5, Next.js, and Express.js
