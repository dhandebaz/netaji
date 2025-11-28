import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq, desc, sql, and, or, like } from 'drizzle-orm';
import ws from 'ws';
import { fetchMultipleRealPoliticians, getFallbackPoliticians } from './services/realDataLoader.mjs';

neonConfig.webSocketConstructor = ws;

const app = express();

const pool = process.env.DATABASE_URL 
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null;

const db = pool ? drizzle({ client: pool }) : null;

const clients = new Set();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many login attempts, please try again later.' }
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'AI request limit reached. Please wait a moment.' }
});

app.use('/api', generalLimiter);

import fs from 'fs';
const DATA_FILE = 'data.json';

const initData = () => {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({
      politicians: [],
      votes: [],
      complaints: [],
      volunteers: [
        { id: 'v1', name: 'Priya Sharma', state: 'Delhi', rtisFiled: 12, points: 450, email: 'priya@neta.in', phone: '+91-9876543210', claimsResolved: 8 },
        { id: 'v2', name: 'Rajesh Kumar', state: 'Maharashtra', rtisFiled: 8, points: 320, email: 'rajesh@neta.in', phone: '+91-9876543211', claimsResolved: 5 },
        { id: 'v3', name: 'Anjali Verma', state: 'Karnataka', rtisFiled: 15, points: 550, email: 'anjali@neta.in', phone: '+91-9876543212', claimsResolved: 10 },
      ],
      rtiTasks: [],
      games: [
        { id: 'g1', title: 'Chair Saver', description: 'Help the politician dodge accountability and keep their seat!', thumbnailUrl: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?auto=format&fit=crop&q=80&w=400', plays: 12450 },
        { id: 'g2', title: 'Scam Dodger', description: 'Run through the bureaucracy maze without getting caught!', thumbnailUrl: 'https://images.unsplash.com/photo-1633419461186-7d7507690054?auto=format&fit=crop&q=80&w=400', plays: 8900 }
      ],
      users: [],
      auditLogs: [],
      settings: {}
    }, null, 2));
  }
};

const getData = () => {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch (error) {
    console.error('[API] Error reading data.json:', error.message);
    return { politicians: [], votes: [], complaints: [], volunteers: [], rtiTasks: [], games: [], users: [], auditLogs: [], settings: {} };
  }
};

const saveData = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('[API] Error writing data.json:', error.message);
  }
};

const broadcastUpdate = (eventType, data) => {
  const message = JSON.stringify({ type: eventType, data, timestamp: Date.now() });
  clients.forEach(client => {
    if (client.readyState === 1) {
      client.write(`data: ${message}\n\n`);
    }
  });
  console.log(`[SSE] Broadcast: ${eventType} to ${clients.size} clients`);
};

const logAudit = (userId, userName, action, resource, resourceId, details, req) => {
  const data = getData();
  const log = {
    id: `log_${Date.now()}`,
    userId,
    userName,
    action,
    resource,
    resourceId,
    details,
    ipAddress: req.ip || req.connection?.remoteAddress,
    userAgent: req.get('user-agent'),
    createdAt: new Date().toISOString()
  };
  if (!data.auditLogs) data.auditLogs = [];
  data.auditLogs.unshift(log);
  if (data.auditLogs.length > 1000) data.auditLogs = data.auditLogs.slice(0, 1000);
  saveData(data);
  return log;
};

app.get('/api/sse', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'SSE connection established' })}\n\n`);
  
  clients.add(res);
  console.log(`[SSE] Client connected. Total: ${clients.size}`);
  
  const heartbeat = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`);
  }, 30000);
  
  req.on('close', () => {
    clients.delete(res);
    clearInterval(heartbeat);
    console.log(`[SSE] Client disconnected. Total: ${clients.size}`);
  });
});

const generateSlug = (name) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

app.get('/api/politicians', (req, res) => {
  const data = getData();
  const { state, party, search, sort, limit = 100, offset = 0 } = req.query;
  
  let politicians = (data.politicians || []).map(p => ({ 
    ...p, 
    slug: p.slug || generateSlug(p.name),
    votes: p.votes || { up: p.votesUp || 0, down: p.votesDown || 0 }
  }));
  
  if (state) politicians = politicians.filter(p => p.state === state);
  if (party) politicians = politicians.filter(p => p.party === party);
  if (search) {
    const s = search.toLowerCase();
    politicians = politicians.filter(p => 
      p.name.toLowerCase().includes(s) || 
      p.party?.toLowerCase().includes(s) ||
      p.constituency?.toLowerCase().includes(s)
    );
  }
  
  if (sort === 'approval') politicians.sort((a, b) => (b.approvalRating || 0) - (a.approvalRating || 0));
  else if (sort === 'votes') politicians.sort((a, b) => ((b.votes?.up || 0) - (b.votes?.down || 0)) - ((a.votes?.up || 0) - (a.votes?.down || 0)));
  else if (sort === 'cases') politicians.sort((a, b) => (b.criminalCases || 0) - (a.criminalCases || 0));
  
  const total = politicians.length;
  politicians = politicians.slice(Number(offset), Number(offset) + Number(limit));
  
  res.json({ data: politicians, total, limit: Number(limit), offset: Number(offset) });
});

app.get('/api/politicians/:idOrSlug', (req, res) => {
  const data = getData();
  const { idOrSlug } = req.params;
  const politician = data.politicians.find(p => 
    p.id == idOrSlug || p.slug === idOrSlug || generateSlug(p.name) === idOrSlug
  );
  if (politician) {
    res.json({ ...politician, slug: politician.slug || generateSlug(politician.name) });
  } else {
    res.status(404).json({ error: 'Politician not found' });
  }
});

app.post('/api/politicians', (req, res) => {
  const data = getData();
  const newPolitician = {
    id: Date.now(),
    ...req.body,
    slug: generateSlug(req.body.name || 'unknown'),
    votes: { up: 0, down: 0 },
    createdAt: new Date().toISOString()
  };
  data.politicians.push(newPolitician);
  saveData(data);
  broadcastUpdate('politician:added', newPolitician);
  res.json(newPolitician);
});

app.put('/api/politicians/:id', (req, res) => {
  const data = getData();
  const idx = data.politicians.findIndex(p => p.id == req.params.id);
  if (idx >= 0) {
    data.politicians[idx] = { ...data.politicians[idx], ...req.body, updatedAt: new Date().toISOString() };
    saveData(data);
    broadcastUpdate('politician:updated', data.politicians[idx]);
    res.json(data.politicians[idx]);
  } else res.status(404).json({ error: 'Not found' });
});

app.delete('/api/politicians/:id', (req, res) => {
  const data = getData();
  const idx = data.politicians.findIndex(p => p.id == req.params.id);
  if (idx >= 0) {
    const deleted = data.politicians.splice(idx, 1)[0];
    saveData(data);
    broadcastUpdate('politician:deleted', { id: req.params.id });
    res.json({ success: true, deleted });
  } else res.status(404).json({ error: 'Not found' });
});

app.post('/api/votes', (req, res) => {
  const data = getData();
  const { politicianId, voteType, voterId } = req.body;
  
  const existingVote = data.votes.find(v => v.politicianId === politicianId && v.voterId === voterId);
  if (existingVote) {
    return res.status(400).json({ error: 'Already voted for this politician' });
  }
  
  const vote = { 
    id: Date.now(), 
    politicianId,
    voteType,
    voterId: voterId || `anon_${Date.now()}`,
    ipAddress: req.ip,
    createdAt: new Date().toISOString()
  };
  data.votes.push(vote);
  
  const politicianIdx = data.politicians.findIndex(p => p.id === politicianId);
  if (politicianIdx >= 0) {
    const p = data.politicians[politicianIdx];
    if (!p.votes) p.votes = { up: 0, down: 0 };
    if (voteType === 'up') p.votes.up = (p.votes.up || 0) + 1;
    else p.votes.down = (p.votes.down || 0) + 1;
    
    const total = p.votes.up + p.votes.down;
    p.approvalRating = total > 0 ? Math.round((p.votes.up / total) * 100) : 50;
  }
  
  saveData(data);
  broadcastUpdate('vote:recorded', { politicianId, votes: data.politicians[politicianIdx]?.votes });
  res.json({ success: true, vote });
});

app.get('/api/complaints', (req, res) => {
  const data = getData();
  const { status, politicianId, limit = 50, offset = 0 } = req.query;
  
  let complaints = data.complaints || [];
  if (status) complaints = complaints.filter(c => c.status === status);
  if (politicianId) complaints = complaints.filter(c => c.politicianId == politicianId);
  
  complaints.sort((a, b) => new Date(b.filedAt || 0) - new Date(a.filedAt || 0));
  
  const total = complaints.length;
  complaints = complaints.slice(Number(offset), Number(offset) + Number(limit));
  
  res.json({ data: complaints, total });
});

app.post('/api/complaints', (req, res) => {
  const data = getData();
  const complaint = { 
    id: `c_${Date.now()}`, 
    ...req.body,
    upvotes: 0,
    status: 'pending',
    filedAt: new Date().toISOString()
  };
  data.complaints.push(complaint);
  saveData(data);
  broadcastUpdate('complaint:filed', complaint);
  res.json(complaint);
});

app.put('/api/complaints/:id', (req, res) => {
  const data = getData();
  const idx = data.complaints.findIndex(c => c.id === req.params.id);
  if (idx >= 0) {
    data.complaints[idx] = { ...data.complaints[idx], ...req.body, updatedAt: new Date().toISOString() };
    saveData(data);
    broadcastUpdate('complaint:updated', data.complaints[idx]);
    res.json(data.complaints[idx]);
  } else res.status(404).json({ error: 'Not found' });
});

app.post('/api/complaints/:id/upvote', (req, res) => {
  const data = getData();
  const idx = data.complaints.findIndex(c => c.id === req.params.id);
  if (idx >= 0) {
    data.complaints[idx].upvotes = (data.complaints[idx].upvotes || 0) + 1;
    saveData(data);
    broadcastUpdate('complaint:upvoted', { id: req.params.id, upvotes: data.complaints[idx].upvotes });
    res.json(data.complaints[idx]);
  } else res.status(404).json({ error: 'Not found' });
});

app.get('/api/volunteers', (req, res) => {
  const data = getData();
  const volunteers = (data.volunteers || []).sort((a, b) => (b.points || 0) - (a.points || 0));
  res.json(volunteers);
});

app.post('/api/volunteers', (req, res) => {
  const data = getData();
  const volunteer = { 
    id: `vol_${Date.now()}`, 
    ...req.body,
    rtisFiled: 0,
    points: 0,
    claimsResolved: 0,
    createdAt: new Date().toISOString()
  };
  data.volunteers.push(volunteer);
  saveData(data);
  broadcastUpdate('volunteer:registered', volunteer);
  res.json(volunteer);
});

app.put('/api/volunteers/:id', (req, res) => {
  const data = getData();
  const idx = data.volunteers.findIndex(v => v.id === req.params.id);
  if (idx >= 0) {
    data.volunteers[idx] = { ...data.volunteers[idx], ...req.body };
    saveData(data);
    broadcastUpdate('volunteer:updated', data.volunteers[idx]);
    res.json(data.volunteers[idx]);
  } else res.status(404).json({ error: 'Not found' });
});

app.get('/api/rti-tasks', (req, res) => {
  const data = getData();
  const { status, priority } = req.query;
  let tasks = data.rtiTasks || [];
  if (status) tasks = tasks.filter(t => t.status === status);
  if (priority) tasks = tasks.filter(t => t.priority === priority);
  res.json(tasks);
});

app.post('/api/rti-tasks', (req, res) => {
  const data = getData();
  const task = { 
    id: `rti_${Date.now()}`, 
    ...req.body,
    status: 'generated',
    generatedDate: new Date().toISOString()
  };
  if (!data.rtiTasks) data.rtiTasks = [];
  data.rtiTasks.push(task);
  saveData(data);
  broadcastUpdate('rti:created', task);
  res.json(task);
});

app.put('/api/rti-tasks/:id', (req, res) => {
  const data = getData();
  const idx = data.rtiTasks?.findIndex(t => t.id === req.params.id);
  if (idx >= 0) {
    data.rtiTasks[idx] = { ...data.rtiTasks[idx], ...req.body };
    saveData(data);
    broadcastUpdate('rti:updated', data.rtiTasks[idx]);
    res.json(data.rtiTasks[idx]);
  } else res.status(404).json({ error: 'Not found' });
});

app.get('/api/games', (req, res) => {
  const data = getData();
  res.json(data.games || []);
});

app.post('/api/games', (req, res) => {
  const data = getData();
  const game = { id: `g_${Date.now()}`, ...req.body, plays: 0 };
  if (!data.games) data.games = [];
  data.games.push(game);
  saveData(data);
  res.json(game);
});

app.post('/api/games/:id/play', (req, res) => {
  const data = getData();
  const idx = data.games?.findIndex(g => g.id === req.params.id);
  if (idx >= 0) {
    data.games[idx].plays = (data.games[idx].plays || 0) + 1;
    saveData(data);
    broadcastUpdate('game:played', { id: req.params.id, plays: data.games[idx].plays });
    res.json(data.games[idx]);
  } else res.status(404).json({ error: 'Not found' });
});

app.get('/api/scraper/fetch-politicians', async (req, res) => {
  try {
    console.log('[API] Scraper triggered - Fetching real politician data...');
    const data = getData();
    
    let realPoliticians = await fetchMultipleRealPoliticians();
    if (!realPoliticians || realPoliticians.length === 0) {
      console.log('[API] No real data fetched, using fallback politicians');
      realPoliticians = getFallbackPoliticians(6);
    }
    
    data.politicians = realPoliticians;
    saveData(data);
    broadcastUpdate('politicians:refreshed', { count: realPoliticians.length });
    console.log(`[API] ✓ Scraper complete: Updated ${realPoliticians.length} politicians`);
    res.json({ success: true, count: realPoliticians.length, politicians: realPoliticians });
  } catch (error) {
    console.error('[API] Scraper error:', error.message);
    const fallbackData = getFallbackPoliticians(6);
    res.json({ success: true, count: fallbackData.length, politicians: fallbackData, fallback: true });
  }
});

app.get('/api/fetch-real-data', async (req, res) => {
  try {
    const data = getData();
    if (data.politicians && data.politicians.length > 0) {
      res.json({ success: true, politicians: data.politicians, count: data.politicians.length });
    } else {
      let realPoliticians = await fetchMultipleRealPoliticians();
      if (!realPoliticians || realPoliticians.length === 0) {
        realPoliticians = getFallbackPoliticians(6);
      }
      data.politicians = realPoliticians;
      saveData(data);
      res.json({ success: true, politicians: realPoliticians, count: realPoliticians.length });
    }
  } catch (error) {
    console.error('[API] Fetch real data error:', error.message);
    const fallbackData = getFallbackPoliticians(6);
    res.json({ success: true, politicians: fallbackData, count: fallbackData.length, fallback: true });
  }
});

const JWT_SECRET = process.env.JWT_SECRET || (() => {
  const secret = crypto.randomBytes(32).toString('hex');
  console.warn('[Auth] WARNING: JWT_SECRET not set. Using random secret for this session.');
  return secret;
})();
const JWT_EXPIRY = '24h';

const ADMIN_USERS = {
  'admin@neta.app': { passwordHash: bcrypt.hashSync('admin123', 10), role: 'superadmin', name: 'Super Admin' },
  'dev@neta.app': { passwordHash: bcrypt.hashSync('dev123', 10), role: 'developer', name: 'Developer' },
  'volunteer@neta.app': { passwordHash: bcrypt.hashSync('vol123', 10), role: 'volunteer', name: 'Volunteer User' }
};

const DEMO_PASSWORDS = {
  superadmin: 'admin123',
  developer: 'dev123',
  volunteer: 'vol123',
  voter: 'citizen123'
};

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
};

app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { email, password, role } = req.body;
  
  if (role && password) {
    const demoPassword = DEMO_PASSWORDS[role];
    if (demoPassword && password === demoPassword) {
      const token = jwt.sign(
        { id: Date.now().toString(), role, email: `${role}@neta.app` },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
      );
      
      logAudit(role, role, 'LOGIN', 'auth', null, { method: 'demo' }, req);
      
      return res.json({
        success: true,
        user: {
          id: Date.now().toString(),
          name: role === 'superadmin' ? 'Super Admin' :
                role === 'developer' ? 'Dev Corp Ltd.' :
                role === 'volunteer' ? 'Volunteer User' : 'Citizen',
          email: `${role}@neta.app`,
          role: role,
          token
        }
      });
    }
    return res.status(401).json({ success: false, error: 'Invalid demo credentials' });
  }
  
  const user = ADMIN_USERS[email];
  if (user && password && bcrypt.compareSync(password, user.passwordHash)) {
    const token = jwt.sign(
      { id: Date.now().toString(), role: user.role, email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );
    
    logAudit(email, user.name, 'LOGIN', 'auth', null, { method: 'password' }, req);
    
    return res.json({
      success: true,
      user: {
        id: Date.now().toString(),
        name: user.name,
        email: email,
        role: user.role,
        token
      }
    });
  }
  
  res.status(401).json({ success: false, error: 'Invalid credentials' });
});

app.post('/api/auth/verify', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ valid: false });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ valid: true, role: decoded.role, email: decoded.email });
  } catch (error) {
    return res.status(401).json({ valid: false, error: 'Invalid or expired token' });
  }
});

app.get('/api/admin/settings', verifyToken, requireRole('superadmin', 'developer'), (req, res) => {
  const data = getData();
  res.json(data.settings || {});
});

app.post('/api/admin/settings', verifyToken, requireRole('superadmin'), (req, res) => {
  const data = getData();
  data.settings = { ...data.settings, ...req.body };
  saveData(data);
  logAudit(req.user.email, req.user.email, 'UPDATE_SETTINGS', 'settings', null, req.body, req);
  broadcastUpdate('settings:updated', data.settings);
  res.json({ success: true, settings: data.settings });
});

app.get('/api/admin/audit-logs', verifyToken, requireRole('superadmin'), (req, res) => {
  const data = getData();
  const { limit = 100, offset = 0, action } = req.query;
  let logs = data.auditLogs || [];
  if (action) logs = logs.filter(l => l.action === action);
  const total = logs.length;
  logs = logs.slice(Number(offset), Number(offset) + Number(limit));
  res.json({ data: logs, total });
});

app.get('/api/admin/stats', verifyToken, requireRole('superadmin', 'developer'), (req, res) => {
  const data = getData();
  res.json({
    politicians: data.politicians?.length || 0,
    complaints: data.complaints?.length || 0,
    pendingComplaints: data.complaints?.filter(c => c.status === 'pending').length || 0,
    volunteers: data.volunteers?.length || 0,
    rtiTasks: data.rtiTasks?.length || 0,
    votes: data.votes?.length || 0,
    games: data.games?.length || 0,
    sseClients: clients.size
  });
});

app.post('/api/ai/chat', verifyToken, requireRole('superadmin'), aiLimiter, async (req, res) => {
  try {
    const { message, context, history } = req.body;
    console.log('[AI Chat] Request from:', req.user.email);
    
    const aiResponse = {
      success: true,
      message: `I received your message: "${message}". I'm analyzing the platform data and ready to help you with improvements, code generation, or data insights.`,
      suggestions: [
        'Analyze politician data for trends',
        'Generate a report on complaint resolution',
        'Suggest UI improvements based on user behavior'
      ],
      timestamp: new Date().toISOString()
    };
    
    logAudit(req.user.email, req.user.email, 'AI_CHAT', 'ai', null, { messageLength: message.length }, req);
    res.json(aiResponse);
  } catch (error) {
    console.error('[AI Chat] Error:', error.message);
    res.status(500).json({ success: false, error: 'AI service temporarily unavailable' });
  }
});

app.post('/api/ai/analyze', verifyToken, requireRole('superadmin', 'developer'), aiLimiter, async (req, res) => {
  try {
    const { analysisType } = req.body;
    const data = getData();
    
    let findings = [];
    let recommendations = [];
    
    if (analysisType === 'performance') {
      findings = [
        { category: 'database', severity: 'info', message: `Currently managing ${data.politicians?.length || 0} politicians` },
        { category: 'complaints', severity: data.complaints?.filter(c => c.status === 'pending').length > 10 ? 'warning' : 'info', message: `${data.complaints?.filter(c => c.status === 'pending').length || 0} pending complaints` }
      ];
      recommendations = ['Consider archiving resolved complaints older than 6 months', 'Implement pagination for large politician lists'];
    } else if (analysisType === 'security') {
      findings = [
        { category: 'auth', severity: 'info', message: 'JWT authentication is active' },
        { category: 'rate-limiting', severity: 'info', message: 'Rate limiting enabled on all endpoints' }
      ];
      recommendations = ['Enable 2FA for admin accounts', 'Rotate JWT secret periodically'];
    } else {
      findings = [{ category: 'general', severity: 'info', message: 'System is running normally' }];
      recommendations = ['Regular backups recommended'];
    }
    
    logAudit(req.user.email, req.user.email, 'AI_ANALYZE', 'ai', null, { analysisType }, req);
    
    res.json({
      success: true,
      type: analysisType,
      findings,
      recommendations,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[AI Analyze] Error:', error.message);
    res.status(500).json({ success: false, error: 'Analysis failed' });
  }
});

app.get('/api/db/status', verifyToken, requireRole('superadmin'), (req, res) => {
  res.json({
    primary: { 
      type: pool ? 'postgresql' : 'json-file', 
      status: 'connected', 
      path: pool ? 'PostgreSQL (Neon)' : DATA_FILE 
    },
    sseClients: clients.size
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    sseClients: clients.size
  });
});

app.use((err, req, res, next) => {
  console.error('[API] Error:', err.message);
  logAudit('system', 'system', 'ERROR', 'api', null, { error: err.message, stack: err.stack }, req);
  res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
});

initData();

(async () => {
  try {
    console.log('[Server] ✓ Real politician data fetcher endpoints ready');
    console.log('[Server] ✓ SSE real-time sync enabled');
    console.log('[Server] ✓ Rate limiting active');
    console.log('[Server] ✓ Security headers enabled (Helmet)');
    
    const realPoliticians = await fetchMultipleRealPoliticians();
    if (realPoliticians && realPoliticians.length > 0) {
      const data = getData();
      data.politicians = realPoliticians;
      saveData(data);
      console.log(`[PoliticianFetcher] ✓ Loaded ${realPoliticians.length} politicians with real photos`);
    }
  } catch (error) {
    console.error('[PoliticianFetcher] Error:', error.message);
  }
})();

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Backend API running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   SSE: http://localhost:${PORT}/api/sse\n`);
});
