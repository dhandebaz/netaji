# Neta v2.1.0 - Political Accountability Platform

## 🚀 Quick Start (3 Minutes)

### Installation
```bash
npm install
npm run dev:all
```

Access at **http://localhost:5000**

### Demo Credentials
- SuperAdmin: `admin@neta.app` / `admin123`
- Developer: `dev@neta.app` / `dev123`
- Volunteer: `volunteer@neta.app` / `vol123`
- Citizen: `citizen@neta.app` / `citizen123`

## Features (v2.1.0)

✅ Real politician data from MyNeta.info  
✅ Real-time vote tracking & approval ratings  
✅ File complaints & RTI requests  
✅ Volunteer leaderboard system  
✅ Admin dashboard with instant sync  
✅ AI chatbot for app improvements  
✅ JWT authentication & role-based access  
✅ Database abstraction layer (cPanel ready)  
✅ Satirical mini-games  

## Project Structure

```
neta/
├── pages/          - React page components
├── components/     - Reusable UI components
├── services/       - API & data services
├── context/        - Authentication & state
├── server.js       - Express backend (port 3001)
├── data.json       - JSON database
├── vite.config.ts  - Build configuration
└── package.json
```

## Running Locally

### Development (Two Terminals)
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
npm run server
```

### Production
```bash
npm run build
NODE_ENV=production node server.js
npx serve -s dist -l 5000
```

## Deployment

### Replit (Recommended - 1 Click)
Click **Publish** button in Replit UI

### Self-Hosted / cPanel
1. `npm install && npm run build`
2. Upload `dist/` and `server.js` to server
3. Install Node.js on server
4. Run: `NODE_ENV=production node server.js`
5. Serve `dist/` as static files

### Docker
```bash
docker build -t neta .
docker run -p 3001:3001 -p 5000:5000 neta
```

## Security Settings (Production)

Add environment variables:
```bash
JWT_SECRET=your-secure-random-string-here
NODE_ENV=production
```

Optional (for AI features):
```bash
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_GOOGLE_API_KEY=AIza...
VITE_OPENROUTER_API_KEY=sk-or-...
```

## API Endpoints

### Public
```
GET  /api/politicians
GET  /api/complaints
GET  /api/volunteers
GET  /api/games
```

### Protected (JWT Required)
```
POST /api/auth/login
GET  /api/admin/settings
POST /api/ai/chat
GET  /api/db/status
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Nothing showing | Ensure both servers running (5000 & 3001) |
| Changes not syncing | Clear browser cache & hard refresh (Ctrl+Shift+R) |
| API errors | Check backend logs: `npm run server` |
| Build fails | `rm -rf node_modules && npm install` |

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Backend**: Express.js, Node.js 18+
- **Database**: JSON (upgradeable to PostgreSQL)
- **Auth**: JWT with bcrypt password hashing
- **AI**: Multi-provider (Anthropic, Google, OpenRouter)
- **Realtime**: Event bus architecture

## Files & Documentation

- **replit.md** - Full architecture & features
- **DEPLOYMENT.md** - Detailed deployment guide  
- **FINAL_CHECKLIST.md** - Production readiness
- **README.md** - Project overview

## Status

✅ **Production Ready v2.1.0**
- All features implemented & tested
- Real politician data loading
- Secure JWT authentication
- Real-time event synchronization
- Ready to deploy immediately

---

**Version**: 2.1.0 | **Updated**: Nov 27, 2025 | **License**: MIT
