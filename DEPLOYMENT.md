# Deployment Guide

## Replit (Recommended - 1 Click)

1. Click **Publish** button in Replit
2. (Optional) Add AI key to Secrets tab
3. App deploys automatically

The app will run on: `https://[your-project].replit.dev`

**No additional setup needed!**

## Self-Hosted

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
git clone <your-repo>
cd neta
npm install
npm run build
```

### Running

**Development:**
```bash
npm run dev:all      # Runs both frontend and backend
```

**Production:**
```bash
# Start backend
NODE_ENV=production node server.js &

# In another terminal, serve frontend
npx serve -s dist -l 5000
```

Backend will run on `http://localhost:3001`
Frontend will run on `http://localhost:5000`

### Environment Variables

Create `.env` file:

```bash
# Optional: AI Features
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_GOOGLE_API_KEY=AIza...
VITE_OPENROUTER_API_KEY=sk-or-...
```

## Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

# Build frontend
RUN npm run build

# Copy only necessary files
COPY server.js ./
COPY services/ ./services/
COPY data.json ./

EXPOSE 3001
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t neta .
docker run -p 3001:3001 -p 5000:5000 neta
```

## Vercel (Frontend Only)

Requirements: Backend must run separately (Replit, Railway, self-hosted)

```bash
vercel --prod
```

Set environment variables in Vercel dashboard:
- `VITE_API_URL` - Backend URL (e.g., `https://neta-backend.railway.app`)

## Railway (Backend)

1. Connect GitHub repo to Railway
2. Add Node.js service
3. Set environment variables
4. Deploy

Backend runs on Railway's domain. Frontend can be separate on Vercel.

## AWS/DigitalOcean/Linode

Standard Node.js deployment:

```bash
# SSH into server
ssh user@server

# Clone repo
git clone <repo>
cd neta

# Install and build
npm install
npm run build

# Use PM2 to keep running
npm install -g pm2
pm2 start server.js --name neta
pm2 startup
pm2 save
```

Setup nginx reverse proxy for frontend:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        root /path/to/neta/dist;
        try_files $uri /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
    }
}
```

## CI/CD

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - name: Deploy to Railway
        run: npx railway link ${{ secrets.RAILWAY_PROJECT_ID }}
```

## Monitoring

### Check Backend
```bash
curl http://localhost:3001/api/politicians
```

### Check Frontend
```bash
curl http://localhost:5000
```

### View Logs
```bash
pm2 logs neta          # If using PM2
docker logs <container> # If using Docker
```

## Security Checklist

- [ ] API keys stored in environment variables (not in code)
- [ ] CORS configured for your domain
- [ ] HTTPS enabled
- [ ] Data backup strategy in place
- [ ] Regular dependency updates (`npm audit`)

## Troubleshooting Deployment

**Frontend not loading API**
- Verify backend is running and accessible
- Check CORS settings in server.js
- Check browser console for API errors

**Data not persisting**
- Ensure data.json is writable
- Check file permissions: `chmod 644 data.json`
- Use persistent volumes if containerized

**High memory usage**
- Check for memory leaks: `node --inspect server.js`
- Verify auto-refresh scheduler isn't creating too many tasks
- Review Event Bus listener cleanup

---

Need help? Check console logs first: `console.error()` messages will guide you.
