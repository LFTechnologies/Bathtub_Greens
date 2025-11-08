# 🚀 Startup Guide - Bathtub Greens

## Quick Start (Easiest Way)

### Option 1: Docker Compose (Recommended)

Start everything with one command:

```bash
docker-compose up
```

This will start:
- MongoDB on port 27017
- Backend API on port 4000
- Frontend Admin on port 3000

**Access the app:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Dashboard: http://localhost:3000/dashboard
- Content Gen: http://localhost:3000/admin/content-gen
- Drafts: http://localhost:3000/admin/drafts
- API Keys: http://localhost:3000/admin/api-keys

---

### Option 2: Manual Startup (Development)

#### Step 1: Start MongoDB

**Using Docker:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:7
```

**Or if you have MongoDB installed locally:**
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

#### Step 2: Start Backend API

```bash
cd node-news-api

# Install dependencies (first time only)
npm install

# Create .env file from example (first time only)
cp .env.example .env
# Edit .env and add your API keys if needed

# Start the backend
npm run dev
```

You should see:
```
[MongoDB] Connected successfully
API on http://localhost:4000
[Cron] All scheduled jobs initialized
```

#### Step 3: Start Frontend

**In a new terminal:**

```bash
cd admin

# Install dependencies (first time only)
npm install

# Create .env.local from example (first time only)
cp .env.example .env.local

# Start the frontend
npm run dev
```

You should see:
```
▲ Next.js 15.x.x
- Local: http://localhost:3000
```

#### Step 4: Access the Application

Open your browser and go to:
- **Homepage:** http://localhost:3000
- **Dashboard:** http://localhost:3000/dashboard
- **Login:** http://localhost:3000/login

---

## Why Articles Page is Empty

The articles page will be empty if:

1. ❌ **Backend not running** - Start it with `npm run dev` in `node-news-api/`
2. ❌ **MongoDB not running** - Start with Docker or local MongoDB
3. ❌ **No articles created yet** - Generate some content!

### Solution: Generate Your First Content

1. Make sure backend + MongoDB are running
2. Go to http://localhost:3000/admin/content-gen
3. Configure settings (use default keywords)
4. Click **"Start Scan"**
5. Review found articles
6. Select articles to generate
7. Click **"Generate Selected"**
8. Content saved as drafts!
9. Go to http://localhost:3000/admin/drafts
10. Select drafts and publish them
11. Now check http://localhost:3000/articles - Articles appear!

---

## Environment Configuration

### Backend (.env)

Located at: `node-news-api/.env`

```env
MONGO_URI=mongodb://localhost:27017/news-blog
PORT=4000
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-your-openai-key  # Optional for ChatGPT
ANTHROPIC_API_KEY=sk-ant-your-key  # Optional for Claude
```

### Frontend (.env.local)

Located at: `admin/.env.local`

```env
USE_EXTERNAL_API=true
API_URL=http://localhost:4000
NEXT_PUBLIC_API_BASE=http://localhost:4000
```

---

## Testing the Full Workflow

### 1. Generate Content
```
URL: /admin/content-gen
- Enter keywords: "AI, technology, climate"
- Click "Start Scan"
- Select interesting articles
- Click "Generate Selected"
- Watch real-time generation
```

### 2. Review Drafts
```
URL: /admin/drafts
- See all generated content
- Edit any draft
- Select drafts to publish
```

### 3. Publish Content
```
From Drafts page:
- Select one or more drafts
- Click "Publish Selected"
- Choose channels (Blog, Email, SMS, Download, API)
- Click "Publish Now"
```

### 4. View Published Articles
```
URL: /articles
- See all published articles
- Click any article to read full content
```

### 5. Manage API Access
```
URL: /admin/api-keys
- Create API key
- Set permissions (read, write, delete)
- Copy key (shown only once!)
- Use for programmatic access
```

---

## Common Issues & Solutions

### "No articles showing"
✅ **Fix:**
- Check backend is running: `curl http://localhost:4000/api/articles`
- Check MongoDB is running: `mongosh --eval "db.version()"`
- Generate content first at `/admin/content-gen`

### "Cannot connect to database"
✅ **Fix:**
- Start MongoDB: `docker run -d -p 27017:27017 --name mongodb mongo:7`
- Or: `brew services start mongodb-community` (macOS)

### "API key not working"
✅ **Fix:**
- Generate new key at `/admin/api-keys`
- Copy the FULL key (shown only once)
- Use in header: `Authorization: Bearer your_key_here`

### "Content generation fails"
✅ **Fix:**
- Add API keys to `node-news-api/.env`:
  - `OPENAI_API_KEY=sk-...` for ChatGPT
  - `ANTHROPIC_API_KEY=sk-ant-...` for Claude
- Restart backend after adding keys
- Try "Scan Only" first (no AI keys needed)

---

## Production Deployment

### Using Docker Compose (Production)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Environment Variables for Production

Update these in production:

```env
# Backend
MONGO_URI=mongodb://your-mongo-host:27017/news-blog
JWT_SECRET=very-secure-random-string
NODE_ENV=production

# Frontend
NEXT_PUBLIC_API_BASE=https://your-domain.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

---

## Need Help?

- Check logs: `docker-compose logs backend` or `docker-compose logs admin`
- Backend logs: Check terminal where you ran `npm run dev`
- Frontend logs: Check browser console (F12)
- Database issues: `mongosh` to inspect MongoDB directly

**Everything working?** Go to http://localhost:3000 and start creating! 🎉
