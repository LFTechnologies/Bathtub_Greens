# Docker Setup Guide - AI-Powered News Blog

This guide will help you get your AI-powered news blog with monetization running using Docker.

## Prerequisites

1. **Docker Desktop** - Download and install from [docker.com](https://www.docker.com/products/docker-desktop)
2. **OpenAI API Key** - Get from [platform.openai.com](https://platform.openai.com)
3. **RapidAPI Key** - Get from [rapidapi.com](https://rapidapi.com) (for news ingestion)

## Project Structure

```
Bathtub_Greens/
├── docker-compose.yml       # Multi-service orchestration
├── start.bat / start.sh     # Startup scripts
├── stop.bat / stop.sh       # Stop scripts
├── .env.example             # Environment variables template
├── node-news-api/           # Backend API
│   ├── Dockerfile
│   ├── .dockerignore
│   └── .env                 # Your actual config (not in git)
└── admin/                   # Frontend Admin Panel
    ├── Dockerfile
    └── .dockerignore
```

## Quick Start

### Windows

1. **Configure Environment Variables**
   ```cmd
   copy .env.example node-news-api\.env
   ```

2. **Edit `node-news-api\.env`** and add your API keys:
   - `OPENAI_API_KEY=sk-your-key-here`
   - `RAPIDAPI_KEY=your-key-here`
   - `JWT_SECRET=generate-a-secure-random-32-char-string`

3. **Start the application**
   ```cmd
   start.bat
   ```

### Linux/Mac

1. **Configure Environment Variables**
   ```bash
   cp .env.example node-news-api/.env
   ```

2. **Edit `node-news-api/.env`** and add your API keys

3. **Make scripts executable and start**
   ```bash
   chmod +x start.sh stop.sh
   ./start.sh
   ```

## Service URLs

Once running, access your services at:

- **Admin Panel**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **MongoDB**: localhost:27017

## Initial Setup

### Create Admin User

After the services are running, seed an admin user:

```bash
# Windows
docker-compose exec backend npm run seed:admin

# Linux/Mac
docker-compose exec backend npm run seed:admin
```

This creates a default admin user. Check the console output for credentials.

## Common Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f admin
docker-compose logs -f mongodb
```

### Stop Services
```bash
# Windows
stop.bat

# Linux/Mac
./stop.sh
```

### Restart Services
```bash
docker-compose restart
```

### Rebuild After Code Changes
```bash
docker-compose up --build -d
```

### Remove All Data (including database)
```bash
docker-compose down -v
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Backend port | `4000` |
| `MONGO_URI` | MongoDB connection | `mongodb://mongodb:27017/node_news` |
| `JWT_SECRET` | Secret for JWT tokens | `your-secure-32-char-secret` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `RAPIDAPI_KEY` | RapidAPI key for news | `your-key...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_MODEL` | OpenAI model to use | `gpt-4o` |
| `CRON_INGEST` | News ingestion schedule | `*/30 * * * *` (every 30 min) |
| `SITE_URL` | Frontend URL | `http://localhost:3000` |

## Docker Architecture

### Services

1. **mongodb** - MongoDB 7.0 database
   - Data persisted in Docker volume `mongodb_data`
   - Health checks enabled

2. **backend** - Node.js Express API
   - Handles news ingestion, AI content generation
   - REST API endpoints
   - Depends on MongoDB

3. **admin** - Next.js 15 Admin Panel
   - React 19 frontend
   - Admin interface for managing posts
   - Depends on backend API

### Networking

All services are on a shared Docker network (`news-network`) and can communicate using service names:
- Backend connects to MongoDB via `mongodb://mongodb:27017`
- Admin connects to backend via environment variable

## Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

1. Check what's using the port:
   ```bash
   # Windows
   netstat -ano | findstr :4000

   # Linux/Mac
   lsof -i :4000
   ```

2. Either stop that service or change ports in `docker-compose.yml`

### MongoDB Connection Issues

```bash
# Check MongoDB health
docker-compose ps

# View MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Backend API Not Responding

```bash
# Check backend logs
docker-compose logs backend

# Verify environment variables
docker-compose exec backend env | grep -E 'MONGO_URI|OPENAI_API_KEY'
```

### Admin Panel Build Errors

```bash
# Rebuild admin service
docker-compose up --build admin

# Check build logs
docker-compose logs admin
```

## Development vs Production

### Development Mode

For development with hot-reload:

```bash
# Backend (with nodemon)
cd node-news-api
npm run dev

# Admin (with Next.js dev server)
cd admin
npm run dev
```

### Production Mode

The Docker setup uses production mode by default:
- Optimized builds
- No hot-reload
- Better performance
- Smaller image sizes

## Security Notes

1. **Never commit `.env` files** - They contain secrets
2. **Generate a strong JWT_SECRET** - Use at least 32 random characters
3. **Use environment-specific configurations** - Different keys for dev/prod
4. **Keep API keys secure** - Rotate them regularly
5. **Update dependencies** - Run `npm audit` regularly

## Performance Tuning

### MongoDB

For production, consider:
- Setting up MongoDB authentication
- Configuring replica sets
- Adjusting connection pool sizes

### Backend

- Adjust rate limiting in the backend code
- Configure caching strategies
- Monitor memory usage

### Admin Panel

- Enable CDN for static assets
- Configure image optimization
- Use ISR (Incremental Static Regeneration) for content pages

## Backup and Restore

### Backup MongoDB

```bash
docker-compose exec mongodb mongodump --out /data/backup
docker cp news-mongodb:/data/backup ./backup
```

### Restore MongoDB

```bash
docker cp ./backup news-mongodb:/data/backup
docker-compose exec mongodb mongorestore /data/backup
```

## Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Verify environment variables
3. Ensure Docker has enough resources (Memory/CPU)
4. Check Docker Desktop is running

## Next Steps

1. Customize your admin panel design
2. Configure news sources in the backend
3. Set up your monetization strategy
4. Deploy to a cloud provider (AWS, GCP, Azure, DigitalOcean)
5. Set up SSL certificates for HTTPS
6. Configure domain names

## License

Check the project README for license information.
