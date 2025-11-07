# Quick Start Guide - Bathtub Greens

## Prerequisites

1. **Node.js 18+** installed
2. **MongoDB** running
3. **API Keys** (optional for basic testing):
   - OpenAI API Key (for ChatGPT)
   - Anthropic API Key (for Claude)

## Step 1: Start MongoDB

**Option A - Using Docker (Recommended):**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:7
```

**Option B - Local MongoDB:**
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

**Verify MongoDB is running:**
```bash
mongosh --eval "db.version()"
```

## Step 2: Configure Backend

```bash
cd node-news-api

# Copy environment file (already created)
# Edit .env and add your API keys if you want AI generation

# Install dependencies (if not already done)
npm install

# Start the backend
npm run dev
```

You should see:
```
[MongoDB] Connected successfully
API on http://localhost:4000
[Cron] All scheduled jobs initialized
```

## Step 3: Configure Frontend

```bash
# In a new terminal
cd admin

# Install dependencies (if not already done)
npm install

# Start the frontend
npm run dev
```

You should see:
```
✓ Ready in 2.5s
○ Local: http://localhost:3000
```

## Step 4: Create Admin User

```bash
# In another terminal
cd node-news-api
npm run seed:admin
```

This creates:
- **Email:** admin@example.com
- **Password:** admin123

## Step 5: Access the Application

1. **Homepage:** http://localhost:3000
   - Modern landing page with all features

2. **Login:** http://localhost:3000/login
   - Use admin credentials or register a new account

3. **Dashboard:** http://localhost:3000/dashboard
   - See all AI features and stats

4. **Content Generation:** http://localhost:3000/admin/content-gen
   - Generate content with AI

## Testing Content Generation

### Without AI Keys (Test Mode)

The system will scan news sources and create article drafts without AI enhancement:

1. Go to http://localhost:3000/admin/content-gen
2. Configure settings:
   - Articles to Generate: 3
   - AI Provider: ChatGPT (or Claude)
3. Click "Scan Only (No Generation)"
   - This tests news scanning without AI

### With AI Keys (Full Mode)

1. Add API keys to `node-news-api/.env`:
```env
OPENAI_API_KEY=sk-your-actual-key
ANTHROPIC_API_KEY=sk-ant-your-actual-key
```

2. Restart the backend:
```bash
cd node-news-api
npm run dev
```

3. Generate content:
   - Go to http://localhost:3000/admin/content-gen
   - Click "Generate Content"
   - Wait for AI to create articles (2-5 minutes)

## Common Issues

### "Cannot connect to database"
- Make sure MongoDB is running
- Check connection string in `.env`

### "404 on API routes"
- Make sure backend is running on port 4000
- Check `NEXT_PUBLIC_API_BASE` in `admin/.env.local`

### "AI generation fails"
- Check if API keys are valid
- Make sure you have credits on OpenAI/Anthropic
- Check backend logs for errors

### "Port already in use"
```bash
# Kill process on port 4000 (backend)
lsof -ti:4000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

## Features You Can Test

### ✅ Without API Keys:
- User registration/login
- Manual article creation
- News source scanning
- Article management
- Admin dashboard
- Monetization dashboard
- Analytics tracking

### ✅ With API Keys:
- AI content generation
- Automated commentary
- Smart summarization
- Auto-tagging
- Sentiment analysis
- Scheduled content generation

## Next Steps

1. **Explore the Dashboard** - See all features at a glance
2. **Create Content** - Either manually or with AI
3. **Configure Monetization** - Add AdSense ID, create affiliate links
4. **Set Up Automation** - Configure cron jobs for auto-generation
5. **Deploy** - See PRODUCTION_GUIDE.md for deployment

## Support

- **Documentation:** README.md, PRODUCTION_GUIDE.md, MONETIZATION_GUIDE.md
- **Backend API:** http://localhost:4000/api/health/detailed
- **Issues:** Check browser console and backend terminal

## URLs

- Landing Page: http://localhost:3000
- Login: http://localhost:3000/login
- Register: http://localhost:3000/register
- Dashboard: http://localhost:3000/dashboard
- Content Gen: http://localhost:3000/admin/content-gen
- Monetization: http://localhost:3000/admin/monetization
- Articles: http://localhost:3000/articles
- Blog Feed: http://localhost:3000/feed

- Backend API: http://localhost:4000
- Health Check: http://localhost:4000/api/health
- API Docs: http://localhost:4000/api/health/detailed

---

**Ready to generate content?** Start at http://localhost:3000/admin/content-gen! 🚀
