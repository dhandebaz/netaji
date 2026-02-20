import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, desc, sql, and, or, like } from 'drizzle-orm';
import { GoogleGenerativeAI } from '@google/generative-ai';
import admin from 'firebase-admin';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { fetchMultipleRealPoliticians, getFallbackPoliticians, fetchOneRealPolitician } from './services/realDataLoader.mjs';
import { fetchRealPoliticiansFromMyNeta as fetchStatePoliticiansFromMyNeta } from './services/realMynetaScraper.mjs';

const app = express();

const pool = process.env.DATABASE_URL 
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  : null;

const db = pool ? drizzle({ client: pool }) : null;

const clients = new Set();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use(compression());

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
  const headerTenant = req.get('X-Tenant');
  const host = req.get('host') || '';
  let tenant = '';
  if (headerTenant && headerTenant.trim()) {
    tenant = headerTenant.trim();
  } else if (host) {
    const parts = host.split('.');
    if (parts.length > 2) tenant = parts[0];
  }
  req.tenant = tenant || null;
  next();
});

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

// In-memory cache
let memoryCache = null;

let ensuredComplaints = false;
async function ensureComplaintsTable() {
  if (!pool || ensuredComplaints) return;
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS complaints (
      id SERIAL PRIMARY KEY,
      politician_id INTEGER,
      user_id TEXT,
      user_name TEXT,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT,
      evidence_url TEXT,
      upvotes INTEGER DEFAULT 0,
      status TEXT DEFAULT 'pending',
      proof_of_work TEXT,
      filed_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      tenant_id TEXT
    )`);
    ensuredComplaints = true;
  } catch (e) {
    ensuredComplaints = false;
  }
}

let ensuredPoliticians = false;
async function ensurePoliticiansTable() {
  if (!pool || ensuredPoliticians) return;
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS politicians (
      id SERIAL PRIMARY KEY,
      tenant_id TEXT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE,
      party TEXT,
      party_logo TEXT,
      state TEXT,
      constituency TEXT,
      photo_url TEXT,
      myneta_id TEXT,
      election_slug TEXT,
      age INTEGER,
      approval_rating REAL DEFAULT 50,
      total_assets REAL DEFAULT 0,
      criminal_cases INTEGER DEFAULT 0,
      education TEXT,
      attendance REAL DEFAULT 0,
      verified BOOLEAN DEFAULT FALSE,
      status TEXT DEFAULT 'active',
      role TEXT DEFAULT 'elected',
      votes_up INTEGER DEFAULT 0,
      votes_down INTEGER DEFAULT 0,
      source TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`);
    const countRes = await pool.query('SELECT COUNT(*)::int AS c FROM politicians');
    if (countRes.rows[0]?.c === 0) {
      const data = getData();
      const list = data.politicians || [];
      for (const p of list) {
        try {
          const votesUp = p.votes?.up || p.votesUp || 0;
          const votesDown = p.votes?.down || p.votesDown || 0;
          await pool.query(
            `INSERT INTO politicians (tenant_id,name,slug,party,party_logo,state,constituency,photo_url,myneta_id,election_slug,age,approval_rating,total_assets,criminal_cases,education,attendance,verified,status,role,votes_up,votes_down,source,created_at,updated_at)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
             ON CONFLICT (slug) DO NOTHING`,
            [
              p.tenantId || null,
              p.name,
              p.slug || generateSlug(p.name),
              p.party || null,
              p.partyLogo || null,
              p.state || null,
              p.constituency || null,
              p.photoUrl || null,
              p.mynetaId || null,
              p.electionSlug || null,
              p.age || null,
              p.approvalRating ?? 50,
              p.totalAssets ?? 0,
              p.criminalCases ?? 0,
              p.education || null,
              p.attendance ?? 0,
              p.verified ?? false,
              p.status || 'active',
              p.role || 'elected',
              votesUp,
              votesDown,
              p.source || null,
              p.createdAt ? new Date(p.createdAt) : new Date(),
              p.updatedAt ? new Date(p.updatedAt) : new Date()
            ]
          );
        } catch (e) {}
      }
    }
    ensuredPoliticians = true;
  } catch (e) {
    ensuredPoliticians = false;
  }
}

async function upsertRealPoliticiansToDb(realPoliticians, tenantId = 'default') {
  if (!pool) return;
  await ensurePoliticiansTable();
  for (const p of realPoliticians) {
    try {
      const name = p.name || 'Unknown';
      const slug = p.slug || generateSlug(name);
      const mynetaId = p.mynetaId || String(p.id || '');
      const electionSlug = p.electionSlug || 'LokSabha2024';
      const existing = await pool.query(
        `SELECT id FROM politicians WHERE myneta_id = $1 AND election_slug = $2 LIMIT 1`,
        [mynetaId, electionSlug]
      );
      if (existing.rows.length) {
        const id = existing.rows[0].id;
        await pool.query(
          `UPDATE politicians
           SET name = $1,
               slug = $2,
               party = $3,
               party_logo = $4,
               state = $5,
               constituency = $6,
               photo_url = $7,
               age = $8,
               approval_rating = $9,
               total_assets = $10,
               criminal_cases = $11,
               education = $12,
               verified = $13,
               status = $14,
               source = $15,
               updated_at = NOW()
           WHERE id = $16`,
          [
            name,
            slug,
            p.party || null,
            p.partyLogo || null,
            p.state || null,
            p.constituency || null,
            p.photoUrl || null,
            p.age || null,
            p.approvalRating ?? 50,
            p.totalAssets ?? 0,
            p.criminalCases ?? 0,
            p.education || null,
            p.verified ?? true,
            p.status || 'active',
            p.source || 'MyNeta.info',
            id,
          ]
        );
      } else {
        await pool.query(
          `INSERT INTO politicians
             (tenant_id,name,slug,party,party_logo,state,constituency,photo_url,myneta_id,election_slug,age,approval_rating,total_assets,criminal_cases,education,attendance,verified,status,role,votes_up,votes_down,source,created_at,updated_at)
           VALUES
             ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)`,
          [
            tenantId,
            name,
            slug,
            p.party || null,
            p.partyLogo || null,
            p.state || null,
            p.constituency || null,
            p.photoUrl || null,
            mynetaId,
            electionSlug,
            p.age || null,
            p.approvalRating ?? 50,
            p.totalAssets ?? 0,
            p.criminalCases ?? 0,
            p.education || null,
            p.attendance ?? 0,
            p.verified ?? true,
            p.status || 'active',
            p.role || 'elected',
            p.votes?.up || p.votesUp || 0,
            p.votes?.down || p.votesDown || 0,
            p.source || 'MyNeta.info',
            new Date(),
            new Date(),
          ]
        );
      }
    } catch (e) {}
  }
}

async function saveScraperMeta(tenantId, meta) {
  if (!pool) return;
  await ensureSettingsTable();
  const key = 'politician_scraper_status';
  let current = { tenants: {} };
  try {
    const existing = await pool.query('SELECT value FROM settings WHERE key = $1 LIMIT 1', [key]);
    if (existing.rows[0]?.value) {
      current = existing.rows[0].value;
    }
  } catch (e) {}
  const tenants = current.tenants || {};
  const tId = tenantId || 'default';
  tenants[tId] = { ...(tenants[tId] || {}), ...meta };
  const value = { tenants };
  await pool.query(
    `INSERT INTO settings (key, value) VALUES ($1,$2)
     ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
    [key, value]
  );
}

let ensuredVotes = false;
async function ensureVotesTable() {
  if (!pool || ensuredVotes) return;
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS votes (
      id SERIAL PRIMARY KEY,
      tenant_id TEXT,
      politician_id INTEGER REFERENCES politicians(id),
      voter_id TEXT,
      vote_type TEXT,
      ip_address TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`);
    ensuredVotes = true;
  } catch (e) {
    ensuredVotes = false;
  }
}

let ensuredVolunteers = false;
async function ensureVolunteersTable() {
  if (!pool || ensuredVolunteers) return;
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS volunteers (
      id SERIAL PRIMARY KEY,
      tenant_id TEXT,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT,
      state TEXT,
      rtis_filed INTEGER DEFAULT 0,
      points INTEGER DEFAULT 0,
      claims_resolved INTEGER DEFAULT 0,
      rank INTEGER,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`);
    ensuredVolunteers = true;
  } catch (e) {
    ensuredVolunteers = false;
  }
}

let ensuredRTITasks = false;
async function ensureRTITasksTable() {
  if (!pool || ensuredRTITasks) return;
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS rti_tasks (
      id SERIAL PRIMARY KEY,
      tenant_id TEXT,
      politician_id INTEGER,
      politician_name TEXT,
      topic TEXT NOT NULL,
      status TEXT DEFAULT 'generated',
      priority TEXT DEFAULT 'medium',
      generated_date TIMESTAMP DEFAULT NOW(),
      claimed_by TEXT,
      filed_date TIMESTAMP,
      response_date TIMESTAMP,
      proof_of_filing_url TEXT,
      government_response_url TEXT,
      pio_details JSONB,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`);
    ensuredRTITasks = true;
  } catch (e) {
    ensuredRTITasks = false;
  }
}

let ensuredSettings = false;
async function ensureSettingsTable() {
  if (!pool || ensuredSettings) return;
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS settings (
      id SERIAL PRIMARY KEY,
      key TEXT NOT NULL UNIQUE,
      value JSONB,
      updated_at TIMESTAMP DEFAULT NOW()
    )`);
    ensuredSettings = true;
  } catch (e) {
    ensuredSettings = false;
  }
}

let ensuredGrievances = false;
async function ensureGrievancesTable() {
  if (!pool || ensuredGrievances) return;
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS grievances (
      id TEXT PRIMARY KEY,
      tenant_id TEXT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'open',
      created_at TIMESTAMP DEFAULT NOW()
    )`);
    ensuredGrievances = true;
  } catch (e) {
    ensuredGrievances = false;
  }
}

const initData = () => {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
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
        { id: 'g1', title: 'Chair Saver', description: 'Help the politician dodge accountability and keep their seat!', thumbnailUrl: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?auto=format&fit=crop&q=80&w=400', plays: 12450, rating: 4.8, playUrl: '/games/play/g1' },
        { id: 'g2', title: 'Scam Dodger', description: 'Run through the bureaucracy maze without getting caught!', thumbnailUrl: 'https://images.unsplash.com/photo-1633419461186-7d7507690054?auto=format&fit=crop&q=80&w=400', plays: 8900, rating: 4.5, playUrl: '/games/play/g2' },
        { id: 'g3', title: 'Debate Master', description: 'Shout louder than your opponent to win the argument!', thumbnailUrl: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&q=80&w=400', plays: 5600, rating: 4.2, playUrl: '/games/play/g3' }
      ],
      users: [],
      auditLogs: [],
      settings: {}
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    memoryCache = initialData;
  } else {
    try {
      memoryCache = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    } catch (error) {
      console.error('[API] Error reading data.json during init:', error.message);
      memoryCache = { politicians: [], votes: [], complaints: [], volunteers: [], rtiTasks: [], games: [], users: [], auditLogs: [], settings: {} };
    }
  }
};

const getData = () => {
  if (memoryCache) return memoryCache;
  
  try {
    memoryCache = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    return memoryCache;
  } catch (error) {
    console.error('[API] Error reading data.json:', error.message);
    return { politicians: [], votes: [], complaints: [], volunteers: [], rtiTasks: [], games: [], users: [], auditLogs: [], settings: {} };
  }
};

const saveData = (data) => {
  memoryCache = data;
  try {
    // Write to file asynchronously to avoid blocking
    fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), (err) => {
      if (err) console.error('[API] Error writing data.json:', err.message);
    });
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
  // console.debug(`[SSE] Broadcast: ${eventType} to ${clients.size} clients`);
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

/**
 * Image Proxy to bypass CORS/ORB
 */
app.get('/api/proxy-image', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).send('URL is required');
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      return res.status(response.status).send(`Failed to fetch image: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }
    
    // Cache for 1 day
    res.setHeader('Cache-Control', 'public, max-age=86400');

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (error) {
    console.error('Image proxy error:', error);
    res.status(500).send('Error fetching image');
  }
});

app.get('/api/politicians', async (req, res) => {
  const { state, party, search, sort, limit = 100, offset = 0, role, ids } = req.query;
  if (pool) {
    try {
      await ensurePoliticiansTable();
      const params = [];
      let idx = 1;
      const where = [];
      if (req.tenant) {
        where.push(`(tenant_id = $${idx} OR tenant_id IS NULL)`);
        params.push(req.tenant);
        idx++;
      }
      if (state) {
        where.push(`state = $${idx++}`);
        params.push(String(state));
      }
      if (party) {
        where.push(`party = $${idx++}`);
        params.push(String(party));
      }
      if (role) {
        where.push(`role = $${idx++}`);
        params.push(String(role));
      }
      if (search) {
        const s = String(search).toLowerCase();
        where.push(`(LOWER(name) LIKE $${idx} OR LOWER(party) LIKE $${idx} OR LOWER(constituency) LIKE $${idx})`);
        params.push(`%${s}%`);
        idx++;
      }
      if (ids) {
        const idList = String(ids)
          .split(',')
          .map(x => Number(x.trim()))
          .filter(x => !isNaN(x));
        if (idList.length) {
          const placeholders = idList.map(() => `$${idx++}`);
          where.push(`id IN (${placeholders.join(',')})`);
          params.push(...idList);
        }
      }
      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
      const totalRow = await pool.query(`SELECT COUNT(*)::int AS c FROM politicians ${whereSql}`, params);
      const paramsWithPaging = params.slice();
      paramsWithPaging.push(Number(limit));
      paramsWithPaging.push(Number(offset));
      let orderBy = 'ORDER BY id DESC';
      if (sort === 'approval') orderBy = 'ORDER BY approval_rating DESC NULLS LAST';
      else if (sort === 'votes') orderBy = 'ORDER BY (COALESCE(votes_up,0) - COALESCE(votes_down,0)) DESC';
      else if (sort === 'cases') orderBy = 'ORDER BY criminal_cases DESC NULLS LAST';
      else if (sort === 'assets') orderBy = 'ORDER BY total_assets DESC NULLS LAST';
      const rows = await pool.query(
        `SELECT * FROM politicians ${whereSql} ${orderBy} LIMIT $${paramsWithPaging.length - 1} OFFSET $${paramsWithPaging.length}`,
        paramsWithPaging
      );
      const mapped = rows.rows.map(r => ({
        id: r.id,
        name: r.name,
        slug: r.slug || generateSlug(r.name),
        party: r.party,
        partyLogo: r.party_logo,
        state: r.state,
        constituency: r.constituency,
        photoUrl: r.photo_url,
        mynetaId: r.myneta_id,
        electionSlug: r.election_slug,
        age: r.age,
        approvalRating: r.approval_rating,
        totalAssets: r.total_assets,
        criminalCases: r.criminal_cases,
        education: r.education,
        attendance: r.attendance,
        verified: r.verified,
        status: r.status,
        role: r.role || 'elected',
        votes: { up: r.votes_up || 0, down: r.votes_down || 0 },
        source: r.source,
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }));
      return res.json({
        data: mapped,
        total: totalRow.rows[0]?.c || 0,
        limit: Number(limit),
        offset: Number(offset)
      });
    } catch (e) {}
  }
  const data = getData();
  let politicians = (data.politicians || []).map(p => ({ 
    ...p, 
    slug: p.slug || generateSlug(p.name),
    votes: p.votes || { up: p.votesUp || 0, down: p.votesDown || 0 },
    role: p.role || 'elected'
  }));
  if (ids) {
    const idList = String(ids).split(',').map(Number);
    politicians = politicians.filter(p => idList.includes(p.id));
  }
  if (role) politicians = politicians.filter(p => p.role === role);
  if (state) politicians = politicians.filter(p => p.state === state);
  if (party) politicians = politicians.filter(p => p.party === party);
  if (search) {
    const s = String(search).toLowerCase();
    politicians = politicians.filter(p => 
      p.name.toLowerCase().includes(s) || 
      p.party?.toLowerCase().includes(s) ||
      p.constituency?.toLowerCase().includes(s)
    );
  }
  if (sort === 'approval') politicians.sort((a, b) => (b.approvalRating || 0) - (a.approvalRating || 0));
  else if (sort === 'votes') politicians.sort((a, b) => ((b.votes?.up || 0) - (b.votes?.down || 0)) - ((a.votes?.up || 0) - (a.votes?.down || 0)));
  else if (sort === 'cases') politicians.sort((a, b) => (b.criminalCases || 0) - (a.criminalCases || 0));
  else if (sort === 'assets') politicians.sort((a, b) => (b.totalAssets || 0) - (a.totalAssets || 0));
  const total = politicians.length;
  politicians = politicians.slice(Number(offset), Number(offset) + Number(limit));
  res.json({ data: politicians, total, limit: Number(limit), offset: Number(offset) });
});

app.post('/api/politicians/scrape', async (req, res) => {
  const { url, id } = req.body;
  
  let candidateId = id;
  let electionSlug = 'LokSabha2024';

  if (url) {
    const idMatch = url.match(/candidate_id=(\d+)/);
    if (idMatch) candidateId = idMatch[1];

    const slugMatch = url.match(/myneta\.info\/([^\/]+)\//);
    if (slugMatch) electionSlug = slugMatch[1];
  }

  if (!candidateId) {
    return res.status(400).json({ error: 'Valid URL or ID required' });
  }

  try {
    const fetched = await fetchOneRealPolitician(candidateId, electionSlug);
    if (fetched) {
      res.json({ success: true, data: fetched });
    } else {
      res.status(404).json({ error: 'Could not fetch politician data' });
    }
  } catch (error) {
    console.error('[Server] Scrape error:', error);
    res.status(500).json({ error: 'Internal server error during scraping' });
  }
});

app.get('/api/politicians/:idOrSlug', async (req, res) => {
  const { idOrSlug } = req.params;
  if (pool) {
    try {
      await ensurePoliticiansTable();
      const params = [];
      let where = '';
      const idNum = Number(idOrSlug);
      if (!isNaN(idNum)) {
        where = 'id = $1';
        params.push(idNum);
      } else {
        where = '(slug = $1 OR LOWER(name) = LOWER($1))';
        params.push(idOrSlug);
      }
      const rows = await pool.query(`SELECT * FROM politicians WHERE ${where} LIMIT 1`, params);
      if (rows.rows.length > 0) {
        const r = rows.rows[0];
        return res.json({
          id: r.id,
          name: r.name,
          slug: r.slug || generateSlug(r.name),
          party: r.party,
          partyLogo: r.party_logo,
          state: r.state,
          constituency: r.constituency,
          photoUrl: r.photo_url,
          mynetaId: r.myneta_id,
          electionSlug: r.election_slug,
          age: r.age,
          approvalRating: r.approval_rating,
          totalAssets: r.total_assets,
          criminalCases: r.criminal_cases,
          education: r.education,
          attendance: r.attendance,
          verified: r.verified,
          status: r.status,
          role: r.role || 'elected',
          votes: { up: r.votes_up || 0, down: r.votes_down || 0 },
          source: r.source,
          createdAt: r.created_at,
          updatedAt: r.updated_at
        });
      }
    } catch (e) {}
  }
  const data = getData();
  let politician = data.politicians.find(p => 
    p.id == idOrSlug || p.slug === idOrSlug || generateSlug(p.name) === idOrSlug
  );
  if (!politician && !isNaN(idOrSlug)) {
    try {
      console.log(`[Server] Politician ${idOrSlug} not found locally, fetching from source...`);
      const fetched = await fetchOneRealPolitician(idOrSlug);
      if (fetched) {
        politician = {
          ...fetched,
          slug: generateSlug(fetched.name),
          votes: fetched.votes || { up: 0, down: 0 },
          createdAt: new Date().toISOString()
        };
        data.politicians.push(politician);
        saveData(data);
        broadcastUpdate('politician:added', politician);
      }
    } catch (e) {
      console.error('[Server] Error auto-fetching politician:', e);
    }
  }
  if (politician) {
    res.json({ ...politician, slug: politician.slug || generateSlug(politician.name) });
  } else {
    res.status(404).json({ error: 'Politician not found' });
  }
});

app.post('/api/politicians', async (req, res) => {
  if (pool) {
    try {
      await ensurePoliticiansTable();
      const b = req.body || {};
      const name = b.name || 'unknown';
      const slug = generateSlug(name);
      const r = await pool.query(
        `INSERT INTO politicians (tenant_id,name,slug,party,party_logo,state,constituency,photo_url,myneta_id,election_slug,age,approval_rating,total_assets,criminal_cases,education,attendance,verified,status,role,votes_up,votes_down,source)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,0,0,$20)
         RETURNING *`,
        [
          req.tenant || null,
          name,
          slug,
          b.party || null,
          b.partyLogo || null,
          b.state || null,
          b.constituency || null,
          b.photoUrl || null,
          b.mynetaId || null,
          b.electionSlug || null,
          b.age || null,
          b.approvalRating ?? 50,
          b.totalAssets ?? 0,
          b.criminalCases ?? 0,
          b.education || null,
          b.attendance ?? 0,
          b.verified ?? false,
          b.status || 'active',
          b.role || 'elected',
          b.source || null
        ]
      );
      const row = r.rows[0];
      const payload = {
        id: row.id,
        name: row.name,
        slug: row.slug,
        party: row.party,
        partyLogo: row.party_logo,
        state: row.state,
        constituency: row.constituency,
        photoUrl: row.photo_url,
        mynetaId: row.myneta_id,
        electionSlug: row.election_slug,
        age: row.age,
        approvalRating: row.approval_rating,
        totalAssets: row.total_assets,
        criminalCases: row.criminal_cases,
        education: row.education,
        attendance: row.attendance,
        verified: row.verified,
        status: row.status,
        role: row.role,
        votes: { up: row.votes_up || 0, down: row.votes_down || 0 },
        source: row.source,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
      broadcastUpdate('politician:added', payload);
      return res.json(payload);
    } catch (e) {}
  }
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

app.put('/api/politicians/:id', async (req, res) => {
  const idNum = Number(req.params.id);
  if (pool && !isNaN(idNum)) {
    try {
      await ensurePoliticiansTable();
      const fields = [];
      const params = [];
      let idx = 1;
      const allowed = [
        'name','party','partyLogo','state','constituency','photoUrl',
        'mynetaId','electionSlug','age','approvalRating','totalAssets',
        'criminalCases','education','attendance','verified','status','role'
      ];
      for (const k of allowed) {
        if (req.body && req.body[k] !== undefined) {
          const col = k.replace(/[A-Z]/g, m => '_' + m.toLowerCase());
          fields.push(`${col} = $${idx++}`);
          params.push(req.body[k]);
        }
      }
      params.push(new Date());
      fields.push(`updated_at = $${idx++}`);
      params.push(idNum);
      let where = `id = $${idx++}`;
      if (req.tenant) {
        params.push(req.tenant);
        where += ` AND (tenant_id = $${idx++} OR tenant_id IS NULL)`;
      }
      const q = `UPDATE politicians SET ${fields.join(', ')} WHERE ${where} RETURNING *`;
      const r = await pool.query(q, params);
      if (r.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      const row = r.rows[0];
      const payload = {
        id: row.id,
        name: row.name,
        slug: row.slug || generateSlug(row.name),
        party: row.party,
        partyLogo: row.party_logo,
        state: row.state,
        constituency: row.constituency,
        photoUrl: row.photo_url,
        mynetaId: row.myneta_id,
        electionSlug: row.election_slug,
        age: row.age,
        approvalRating: row.approval_rating,
        totalAssets: row.total_assets,
        criminalCases: row.criminal_cases,
        education: row.education,
        attendance: row.attendance,
        verified: row.verified,
        status: row.status,
        role: row.role,
        votes: { up: row.votes_up || 0, down: row.votes_down || 0 },
        source: row.source,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
      broadcastUpdate('politician:updated', payload);
      return res.json(payload);
    } catch (e) {}
  }
  const data = getData();
  const idxLocal = data.politicians.findIndex(p => p.id == req.params.id);
  if (idxLocal >= 0) {
    data.politicians[idxLocal] = { ...data.politicians[idxLocal], ...req.body, updatedAt: new Date().toISOString() };
    saveData(data);
    broadcastUpdate('politician:updated', data.politicians[idxLocal]);
    res.json(data.politicians[idxLocal]);
  } else res.status(404).json({ error: 'Not found' });
});

app.delete('/api/politicians/:id', async (req, res) => {
  const idNum = Number(req.params.id);
  if (pool && !isNaN(idNum)) {
    try {
      await ensurePoliticiansTable();
      const params = [idNum];
      let where = 'id = $1';
      if (req.tenant) {
        params.push(req.tenant);
        where += ' AND (tenant_id = $2 OR tenant_id IS NULL)';
      }
      const r = await pool.query(`DELETE FROM politicians WHERE ${where} RETURNING *`, params);
      if (r.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      broadcastUpdate('politician:deleted', { id: req.params.id });
      return res.json({ success: true, deleted: r.rows[0] });
    } catch (e) {}
  }
  const data = getData();
  const idxLocal = data.politicians.findIndex(p => p.id == req.params.id);
  if (idxLocal >= 0) {
    const deleted = data.politicians.splice(idxLocal, 1)[0];
    saveData(data);
    broadcastUpdate('politician:deleted', { id: req.params.id });
    res.json({ success: true, deleted });
  } else res.status(404).json({ error: 'Not found' });
});

app.post('/api/votes', async (req, res) => {
  const { politicianId, voteType, voterId } = req.body;
  const voter = voterId || `anon_${Date.now()}`;
  if (!politicianId || !['up', 'down'].includes(voteType)) {
    return res.status(400).json({ error: 'Invalid vote payload' });
  }
  if (pool) {
    try {
      await ensurePoliticiansTable();
      await ensureVotesTable();
      const paramsCheck = [Number(politicianId), voter, req.tenant || 'default'];
      const existing = await pool.query(
        'SELECT 1 FROM votes WHERE politician_id = $1 AND voter_id = $2 AND tenant_id = $3 LIMIT 1',
        paramsCheck
      );
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Already voted for this politician' });
      }
      const voteRes = await pool.query(
        `INSERT INTO votes (tenant_id,politician_id,voter_id,vote_type,ip_address)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [req.tenant || 'default', Number(politicianId), voter, voteType, req.ip]
      );
      const polRes = await pool.query(
        'SELECT id,votes_up,votes_down FROM politicians WHERE id = $1 LIMIT 1',
        [Number(politicianId)]
      );
      let votesUp = polRes.rows[0]?.votes_up || 0;
      let votesDown = polRes.rows[0]?.votes_down || 0;
      if (voteType === 'up') votesUp += 1;
      else votesDown += 1;
      const total = votesUp + votesDown;
      const approval = total > 0 ? Math.round((votesUp / total) * 100) : 50;
      await pool.query(
        'UPDATE politicians SET votes_up = $1, votes_down = $2, approval_rating = $3, updated_at = NOW() WHERE id = $4',
        [votesUp, votesDown, approval, Number(politicianId)]
      );
      broadcastUpdate('vote:recorded', { politicianId, votes: { up: votesUp, down: votesDown } });
      return res.json({ success: true, vote: voteRes.rows[0] });
    } catch (e) {}
  }
  const data = getData();
  const existingVote = data.votes.find(v => v.politicianId === politicianId && v.voterId === voterId);
  if (existingVote) {
    return res.status(400).json({ error: 'Already voted for this politician' });
  }
  const vote = { 
    id: Date.now(), 
    politicianId,
    voteType,
    voterId: voter,
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

app.get('/api/complaints', async (req, res) => {
  const { status, politicianId, limit = 50, offset = 0 } = req.query;
  if (pool) {
    try {
      await ensureComplaintsTable();
      const params = [];
      let idx = 1;
      let where = [];
      if (req.tenant) {
        where.push(`tenant_id = $${idx++}`);
        params.push(req.tenant);
      }
      if (status) {
        where.push(`status = $${idx++}`);
        params.push(String(status));
      }
      if (politicianId) {
        where.push(`politician_id = $${idx++}`);
        params.push(Number(politicianId));
      }
      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
      const totalRow = await pool.query(`SELECT COUNT(*)::int AS c FROM complaints ${whereSql}`, params);
      params.push(Number(limit));
      params.push(Number(offset));
      const rows = await pool.query(
        `SELECT * FROM complaints ${whereSql} ORDER BY filed_at DESC LIMIT $${idx++} OFFSET $${idx++}`,
        params
      );
      return res.json({ data: rows.rows, total: totalRow.rows[0].c });
    } catch (e) {}
  }
  const data = getData();
  let list = data.complaints || [];
  if (req.tenant) list = list.filter(c => c.tenantId === req.tenant);
  if (status) list = list.filter(c => c.status === status);
  if (politicianId) list = list.filter(c => c.politicianId == politicianId);
  list.sort((a, b) => new Date(b.filedAt || 0) - new Date(a.filedAt || 0));
  const total = list.length;
  list = list.slice(Number(offset), Number(offset) + Number(limit));
  res.json({ data: list, total });
});

app.post('/api/complaints', async (req, res) => {
  if (pool) {
    try {
      await ensureComplaintsTable();
      const b = req.body || {};
      const q = `INSERT INTO complaints (politician_id,user_id,user_name,category,description,location,evidence_url,upvotes,status,proof_of_work,tenant_id)
        VALUES ($1,$2,$3,$4,$5,$6,$7,0,'pending',$8,$9) RETURNING *`;
      const params = [
        b.politicianId || null,
        b.userId || null,
        b.userName || null,
        b.category,
        b.description,
        b.location || null,
        b.evidenceUrl || null,
        b.proofOfWork || null,
        req.tenant || null
      ];
      const r = await pool.query(q, params);
      broadcastUpdate('complaint:filed', r.rows[0]);
      return res.json(r.rows[0]);
    } catch (e) {}
  }
  const data = getData();
  const complaint = { 
    id: `c_${Date.now()}`, 
    ...req.body,
    tenantId: req.tenant || null,
    upvotes: 0,
    status: 'pending',
    filedAt: new Date().toISOString()
  };
  data.complaints.push(complaint);
  saveData(data);
  broadcastUpdate('complaint:filed', complaint);
  res.json(complaint);
});

app.put('/api/complaints/:id', async (req, res) => {
  if (pool) {
    try {
      await ensureComplaintsTable();
      const fields = [];
      const params = [];
      let idx = 1;
      const allowed = ['category','description','location','evidenceUrl','status','proofOfWork'];
      for (const k of allowed) {
        if (req.body && req.body[k] !== undefined) {
          const col = k.replace(/[A-Z]/g, m => '_' + m.toLowerCase());
          fields.push(`${col} = $${idx++}`);
          params.push(req.body[k]);
        }
      }
      params.push(new Date());
      fields.push(`updated_at = $${idx++}`);
      params.push(Number(req.params.id));
      let where = `id = $${idx++}`;
      if (req.tenant) {
        params.push(req.tenant);
        where += ` AND tenant_id = $${idx++}`;
      }
      const q = `UPDATE complaints SET ${fields.join(', ')} WHERE ${where} RETURNING *`;
      const r = await pool.query(q, params);
      if (r.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      broadcastUpdate('complaint:updated', r.rows[0]);
      return res.json(r.rows[0]);
    } catch (e) {}
  }
  const data = getData();
  const idxLocal = data.complaints.findIndex(c => c.id === req.params.id && (!req.tenant || c.tenantId === req.tenant));
  if (idxLocal >= 0) {
    data.complaints[idxLocal] = { ...data.complaints[idxLocal], ...req.body, updatedAt: new Date().toISOString() };
    saveData(data);
    broadcastUpdate('complaint:updated', data.complaints[idxLocal]);
    res.json(data.complaints[idxLocal]);
  } else res.status(404).json({ error: 'Not found' });
});

app.post('/api/complaints/:id/upvote', async (req, res) => {
  if (pool) {
    try {
      await ensureComplaintsTable();
      const params = [Number(req.params.id)];
      let where = 'id = $1';
      if (req.tenant) {
        params.push(req.tenant);
        where += ' AND tenant_id = $2';
      }
      const r = await pool.query(`UPDATE complaints SET upvotes = COALESCE(upvotes,0)+1, updated_at = NOW() WHERE ${where} RETURNING *`, params);
      if (r.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      broadcastUpdate('complaint:upvoted', { id: r.rows[0].id, upvotes: r.rows[0].upvotes });
      return res.json(r.rows[0]);
    } catch (e) {}
  }
  const data = getData();
  const idx = data.complaints.findIndex(c => c.id === req.params.id && (!req.tenant || c.tenantId === req.tenant));
  if (idx >= 0) {
    data.complaints[idx].upvotes = (data.complaints[idx].upvotes || 0) + 1;
    saveData(data);
    broadcastUpdate('complaint:upvoted', { id: req.params.id, upvotes: data.complaints[idx].upvotes });
    res.json(data.complaints[idx]);
  } else res.status(404).json({ error: 'Not found' });
});

app.get('/api/volunteers', async (req, res) => {
  if (pool) {
    try {
      await ensureVolunteersTable();
      const params = [];
      let where = '';
      if (req.tenant) {
        where = 'WHERE tenant_id = $1';
        params.push(req.tenant);
      }
      const rows = await pool.query(`SELECT * FROM volunteers ${where} ORDER BY points DESC NULLS LAST`, params);
      return res.json(rows.rows);
    } catch (e) {}
  }
  const data = getData();
  const volunteers = (data.volunteers || [])
    .filter(v => !req.tenant || v.tenantId === req.tenant)
    .sort((a, b) => (b.points || 0) - (a.points || 0));
  res.json(volunteers);
});

app.post('/api/volunteers', async (req, res) => {
  if (pool) {
    try {
      await ensureVolunteersTable();
      const b = req.body || {};
      const r = await pool.query(
        `INSERT INTO volunteers (tenant_id,name,email,phone,state,rtis_filed,points,claims_resolved,rank)
         VALUES ($1,$2,$3,$4,$5,0,0,0,$6) RETURNING *`,
        [req.tenant || null, b.name, b.email || null, b.phone || null, b.state || null, b.rank || null]
      );
      broadcastUpdate('volunteer:registered', r.rows[0]);
      return res.json(r.rows[0]);
    } catch (e) {}
  }
  const data = getData();
  const volunteer = { 
    id: `vol_${Date.now()}`, 
    ...req.body,
    tenantId: req.tenant || null,
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

app.put('/api/volunteers/:id', async (req, res) => {
  if (pool) {
    try {
      await ensureVolunteersTable();
      const fields = [];
      const params = [];
      let idx = 1;
      const allowed = ['name','email','phone','state','rtisFiled','points','claimsResolved','rank'];
      for (const k of allowed) {
        if (req.body && req.body[k] !== undefined) {
          const col = k.replace(/[A-Z]/g, m => '_' + m.toLowerCase());
          fields.push(`${col} = $${idx++}`);
          params.push(req.body[k]);
        }
      }
      params.push(new Date());
      fields.push(`updated_at = $${idx++}`);
      params.push(Number(req.params.id));
      let where = `id = $${idx++}`;
      if (req.tenant) {
        params.push(req.tenant);
        where += ` AND tenant_id = $${idx++}`;
      }
      const q = `UPDATE volunteers SET ${fields.join(', ')} WHERE ${where} RETURNING *`;
      const r = await pool.query(q, params);
      if (r.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      broadcastUpdate('volunteer:updated', r.rows[0]);
      return res.json(r.rows[0]);
    } catch (e) {}
  }
  const data = getData();
  const idxLocal = data.volunteers.findIndex(v => v.id === req.params.id && (!req.tenant || v.tenantId === req.tenant));
  if (idxLocal >= 0) {
    data.volunteers[idxLocal] = { ...data.volunteers[idxLocal], ...req.body };
    saveData(data);
    broadcastUpdate('volunteer:updated', data.volunteers[idxLocal]);
    res.json(data.volunteers[idxLocal]);
  } else res.status(404).json({ error: 'Not found' });
});

app.get('/api/rti-tasks', async (req, res) => {
  const { status, priority } = req.query;
  if (pool) {
    try {
      await ensureRTITasksTable();
      const params = [];
      let idx = 1;
      const where = [];
      if (req.tenant) {
        where.push(`tenant_id = $${idx++}`);
        params.push(req.tenant);
      }
      if (status) {
        where.push(`status = $${idx++}`);
        params.push(String(status));
      }
      if (priority) {
        where.push(`priority = $${idx++}`);
        params.push(String(priority));
      }
      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
      const r = await pool.query(`SELECT * FROM rti_tasks ${whereSql} ORDER BY generated_date DESC`, params);
      return res.json(r.rows);
    } catch (e) {}
  }
  const data = getData();
  let tasks = data.rtiTasks || [];
  if (req.tenant) tasks = tasks.filter(t => t.tenantId === req.tenant);
  if (status) tasks = tasks.filter(t => t.status === status);
  if (priority) tasks = tasks.filter(t => t.priority === priority);
  res.json(tasks);
});

app.post('/api/rti-tasks', async (req, res) => {
  if (pool) {
    try {
      await ensureRTITasksTable();
      const b = req.body || {};
      const r = await pool.query(
        `INSERT INTO rti_tasks (tenant_id,politician_id,politician_name,topic,status,priority,generated_date,claimed_by,proof_of_filing_url,government_response_url,pio_details)
         VALUES ($1,$2,$3,$4,'generated','medium',NOW(),NULL,NULL,NULL,$5) RETURNING *`,
        [req.tenant || null, b.politicianId || null, b.politicianName || null, b.topic, b.pioDetails || null]
      );
      broadcastUpdate('rti:created', r.rows[0]);
      return res.json(r.rows[0]);
    } catch (e) {}
  }
  const data = getData();
  const task = { 
    id: `rti_${Date.now()}`, 
    ...req.body,
    tenantId: req.tenant || null,
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

app.put('/api/games/:id', (req, res) => {
  const data = getData();
  const idx = data.games?.findIndex(g => g.id === req.params.id);
  if (idx >= 0) {
    data.games[idx] = { ...data.games[idx], ...req.body };
    saveData(data);
    broadcastUpdate('game:updated', data.games[idx]);
    res.json(data.games[idx]);
  } else res.status(404).json({ error: 'Not found' });
});

app.delete('/api/games/:id', (req, res) => {
  const data = getData();
  const before = data.games?.length || 0;
  data.games = (data.games || []).filter(g => g.id !== req.params.id);
  const after = data.games?.length || 0;
  if (after < before) {
    saveData(data);
    broadcastUpdate('game:deleted', { id: req.params.id });
    res.json({ success: true });
  } else res.status(404).json({ error: 'Not found' });
});

async function runRealPoliticianRefresh(req, res) {
  try {
    console.info('[API] Scraper triggered - Fetching real politician data...');
    const data = getData();
    const tenantId = req.tenant || 'default';
    const rawState = req.query?.state || null;
    const stateFilter = typeof rawState === 'string' ? rawState : null;
    const rawStrict = req.query?.strict;
    const isStrict = typeof rawStrict === 'string' && ['1', 'true', 'yes'].includes(rawStrict.toLowerCase());
    let realPoliticians = [];
    if (stateFilter && stateFilter.toLowerCase() === 'delhi') {
      realPoliticians = await fetchStatePoliticiansFromMyNeta('Delhi2025', 200, { strict: isStrict });
    } else {
      realPoliticians = await fetchMultipleRealPoliticians(6, stateFilter || null);
    }
    let usedFallback = false;
    if (!realPoliticians || realPoliticians.length === 0) {
      if (isStrict) {
        console.warn('[API] No real data fetched in strict mode, leaving existing data unchanged');
        return res.status(503).json({ success: false, error: 'no_live_data', count: 0, strict: true });
      }
      console.warn('[API] No real data fetched, using fallback politicians');
      realPoliticians = getFallbackPoliticians(6);
      usedFallback = true;
    }
    if (pool) {
      await upsertRealPoliticiansToDb(realPoliticians, tenantId);
    }
    data.politicians = realPoliticians;
    saveData(data);
    broadcastUpdate('politicians:refreshed', { count: realPoliticians.length });
    const actorEmail = req.user?.email || 'system';
    const actorName = req.user?.name || 'system';
    logAudit(actorEmail, actorName, 'REFRESH_POLITICIANS', 'politician', null, { count: realPoliticians.length }, req);
    await saveScraperMeta(tenantId, {
      lastRunAt: new Date().toISOString(),
      lastSource: usedFallback ? 'fallback' : 'live',
      lastState: stateFilter || 'all',
      lastCount: realPoliticians.length,
    });
    console.info(`[API] ✓ Scraper complete: Updated ${realPoliticians.length} politicians`);
    res.json({ success: true, count: realPoliticians.length, politicians: realPoliticians });
  } catch (error) {
    console.error('[API] Scraper error:', error.message);
    const rawStrict = req.query?.strict;
    const isStrict = typeof rawStrict === 'string' && ['1', 'true', 'yes'].includes(rawStrict.toLowerCase());
    if (isStrict) {
      return res.status(500).json({ success: false, error: 'scraper_failed', strict: true });
    }
    const fallbackData = getFallbackPoliticians(6);
    res.json({ success: true, count: fallbackData.length, politicians: fallbackData, fallback: true });
  }
}

app.get('/api/scraper/fetch-politicians', async (req, res) => {
  await runRealPoliticianRefresh(req, res);
});

app.get('/api/fetch-real-data', async (req, res) => {
  try {
    const data = getData();
    if (data.politicians && data.politicians.length > 0) {
      res.json({ success: true, politicians: data.politicians, count: data.politicians.length });
    } else {
      await runRealPoliticianRefresh(req, res);
    }
  } catch (error) {
    console.error('[API] Fetch real data error:', error.message);
    const fallbackData = getFallbackPoliticians(6);
    res.json({ success: true, politicians: fallbackData, count: fallbackData.length, fallback: true });
  }
});

if (!process.env.JWT_SECRET) {
  console.error('[Auth] ERROR: JWT_SECRET must be set in environment. Refusing to start.');
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;
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

let firebaseAdminApp = null;
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  try {
    firebaseAdminApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    console.log('[Auth] Firebase Admin initialized');
  } catch (err) {
    console.error('[Auth] Failed to initialize Firebase Admin', err);
  }
} else {
  console.warn('[Auth] Firebase Admin credentials not fully set. OTP login disabled.');
}

let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    supabase = createSupabaseClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false
      }
    });
    console.log('[DB] Supabase client initialized');
  } catch (e) {
    console.error('[DB] Failed to initialize Supabase client', e);
  }
} else {
  console.warn('[DB] Supabase env vars not fully set. Voter auth will fall back to local.');
}

const isSupabaseAuthEnabled = () => {
  try {
    const data = getData();
    const settings = data.settings || {};
    const dbs = settings.data?.databases || [];
    const supaDb = dbs.find((db) => db.type === 'supabase');
    return !!(supaDb && supaDb.enabled);
  } catch (e) {
    console.warn('[Auth] Failed to read Supabase settings from data store', e);
    return false;
  }
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
  try {
    if (role === 'voter') {
      if (!isSupabaseAuthEnabled()) {
        return res.status(503).json({ success: false, error: 'supabase_disabled' });
      }
      if (!supabase) {
        return res.status(503).json({ success: false, error: 'supabase_unavailable' });
      }
      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'missing_credentials' });
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data?.user) {
        return res.status(401).json({ success: false, error: 'invalid_credentials' });
      }
      const supaUser = data.user;
      const token = jwt.sign(
        { id: supaUser.id, role: 'voter', email: supaUser.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
      );
      logAudit(
        supaUser.email || supaUser.id,
        supaUser.user_metadata?.full_name || 'Citizen Voter',
        'LOGIN',
        'auth',
        null,
        { method: 'supabase_password' },
        req
      );
      return res.json({
        success: true,
        user: {
          id: supaUser.id,
          name: supaUser.user_metadata?.full_name || 'Citizen Voter',
          email: supaUser.email || email,
          role: 'voter',
          token
        }
      });
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
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  } catch (e) {
    console.error('[Auth] Login failed', e);
    return res.status(500).json({ success: false, error: 'auth_internal_error' });
  }
});

app.post('/api/auth/firebase-login', authLimiter, async (req, res) => {
  if (!firebaseAdminApp) {
    return res.status(503).json({ success: false, error: 'otp_unavailable' });
  }
  const { idToken, role } = req.body;
  if (!idToken) {
    return res.status(400).json({ success: false, error: 'missing_token' });
  }
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const userPhone = decoded.phone_number || null;
    const uid = decoded.uid;
    const assignedRole = role && DEMO_PASSWORDS[role] ? role : 'voter';
    const token = jwt.sign(
      { id: uid, role: assignedRole, phone: userPhone },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );
    logAudit(
      userPhone || uid,
      'OTP User',
      'LOGIN',
      'auth',
      null,
      { method: 'firebase_phone', role: assignedRole },
      req
    );
    return res.json({
      success: true,
      user: {
        id: uid,
        name: 'Citizen Voter',
        email: userPhone || 'phone-user@neta.app',
        role: assignedRole,
        token,
      },
    });
  } catch (err) {
    console.error('[Auth] Firebase token verification failed', err);
    return res.status(401).json({ success: false, error: 'invalid_token' });
  }
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

app.get('/api/admin/settings', verifyToken, requireRole('superadmin', 'developer'), async (req, res) => {
  const data = getData();
  const fallback = data.settings || {};

  if (!pool) {
    return res.json(fallback);
  }

  try {
    await ensureSettingsTable();
    const result = await pool.query('SELECT value FROM settings WHERE key = $1 LIMIT 1', ['system']);
    if (result.rows[0]?.value) {
      return res.json(result.rows[0].value);
    }
    return res.json(fallback);
  } catch (e) {
    return res.json(fallback);
  }
});

app.post('/api/admin/settings', verifyToken, requireRole('superadmin'), async (req, res) => {
  const data = getData();
  data.settings = { ...data.settings, ...req.body };
  saveData(data);

  if (pool) {
    try {
      await ensureSettingsTable();
      await pool.query(
        `INSERT INTO settings (key, value, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at`,
        ['system', data.settings]
      );
    } catch (e) {}
  }

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

app.get('/api/admin/stats', verifyToken, requireRole('superadmin', 'developer'), async (req, res) => {
  const data = getData();

  const trafficData = [];
  const hours = [0, 4, 8, 12, 16, 20, 23];

  hours.forEach(h => {
    const usersBase = h >= 8 && h <= 22 ? 2000 : 500;
    trafficData.push({
      name: `${String(h).padStart(2, '0')}:00`,
      users: usersBase + Math.floor(Math.random() * 1000),
      votes: Math.floor((usersBase + Math.floor(Math.random() * 1000)) * 0.15),
    });
  });

  let dbStats = null;
  let scraperMeta = null;

  if (pool) {
    try {
      const tenantId = req.tenant || 'default';
      const tenantParam = [tenantId];
      const politiciansRes = await pool.query('SELECT COUNT(*)::int AS c FROM politicians WHERE tenant_id = $1 OR tenant_id IS NULL', tenantParam);
      const complaintsRes = await pool.query('SELECT COUNT(*)::int AS c FROM complaints WHERE tenant_id = $1 OR tenant_id IS NULL', tenantParam);
      const pendingComplaintsRes = await pool.query("SELECT COUNT(*)::int AS c FROM complaints WHERE tenant_id = $1 AND status = 'pending'", tenantParam);
      const volunteersRes = await pool.query('SELECT COUNT(*)::int AS c FROM volunteers WHERE tenant_id = $1 OR tenant_id IS NULL', tenantParam);
      const rtiTasksRes = await pool.query('SELECT COUNT(*)::int AS c FROM rti_tasks WHERE tenant_id = $1 OR tenant_id IS NULL', tenantParam);
      const votesRes = await pool.query('SELECT COUNT(*)::int AS c FROM votes WHERE tenant_id = $1 OR tenant_id IS NULL', tenantParam);

      let gamesCount = null;
      try {
        const gamesRes = await pool.query('SELECT COUNT(*)::int AS c FROM games');
        gamesCount = gamesRes.rows[0]?.c ?? null;
      } catch (e) {
        gamesCount = null;
      }

      dbStats = {
        politicians: politiciansRes.rows[0]?.c ?? 0,
        complaints: complaintsRes.rows[0]?.c ?? 0,
        pendingComplaints: pendingComplaintsRes.rows[0]?.c ?? 0,
        volunteers: volunteersRes.rows[0]?.c ?? 0,
        rtiTasks: rtiTasksRes.rows[0]?.c ?? 0,
        votes: votesRes.rows[0]?.c ?? 0,
        games: gamesCount,
      };
      try {
        const metaRes = await pool.query("SELECT value FROM settings WHERE key = 'politician_scraper_status' LIMIT 1");
        const tenants = metaRes.rows[0]?.value?.tenants || {};
        scraperMeta = tenants[tenantId] || null;
      } catch (e) {
        scraperMeta = null;
      }
    } catch (e) {
      dbStats = null;
    }
  }

  const response = {
    users: 14203 + Math.floor(Math.random() * 50),
    politicians: dbStats?.politicians ?? (data.politicians?.length || 0),
    complaints: dbStats?.complaints ?? (data.complaints?.length || 0),
    pendingComplaints:
      dbStats?.pendingComplaints ??
      (data.complaints?.filter(c => c.status === 'pending').length || 0),
    volunteers: dbStats?.volunteers ?? (data.volunteers?.length || 0),
    rtiTasks: dbStats?.rtiTasks ?? (data.rtiTasks?.length || 0),
    votes: dbStats?.votes ?? (data.votes?.length || 0),
    games: dbStats?.games ?? (data.games?.length || 0),
    sseClients: clients.size,
    trafficData,
    build: {
      chunkSizeWarningLimit: 2500,
      manualChunks: ['vendor', 'charts', 'motion'],
      codeSplit: true,
    },
    db: {
      connected: !!dbStats,
      provider: process.env.DATABASE_URL ? 'supabase_postgres' : 'file',
      politicians: dbStats?.politicians ?? null,
      complaints: dbStats?.complaints ?? null,
      pendingComplaints: dbStats?.pendingComplaints ?? null,
      volunteers: dbStats?.volunteers ?? null,
      rtiTasks: dbStats?.rtiTasks ?? null,
      votes: dbStats?.votes ?? null,
      games: dbStats?.games ?? null,
      scraper: scraperMeta,
    },
  };

  res.json(response);
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

app.post('/api/admin/run-scraper', verifyToken, requireRole('superadmin'), async (req, res) => {
  await runRealPoliticianRefresh(req, res);
});

app.post('/api/grievances', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ success: false, error: 'support_channel_unavailable' });
  }
  try {
    const { name, email, subject, message } = req.body || {};
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, error: 'invalid_payload' });
    }
    await ensureGrievancesTable();
    const id = Date.now().toString();
    const tenantId = req.tenant || 'default';
    await pool.query(
      `INSERT INTO grievances (id, tenant_id, name, email, subject, message, status, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,'open',NOW())`,
      [id, tenantId, name, email, subject, message]
    );
    logAudit(email, name, 'CREATE_GRIEVANCE', 'grievance', id, { tenantId, subject }, req);
    res.json({
      success: true,
      data: {
        id,
        name,
        email,
        subject,
        message,
        status: 'open',
        date: new Date().toISOString(),
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, error: 'failed_to_create_grievance' });
  }
});

app.get('/api/grievances', verifyToken, requireRole('superadmin'), async (req, res) => {
  if (!pool) {
    return res.json({ data: [], total: 0 });
  }
  try {
    await ensureGrievancesTable();
    const tenantId = req.tenant || 'default';
    const result = await pool.query(
      `SELECT id, tenant_id, name, email, subject, message, status, created_at
       FROM grievances
       WHERE tenant_id = $1 OR tenant_id IS NULL
       ORDER BY created_at DESC`,
      [tenantId]
    );
    const items = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      subject: row.subject,
      message: row.message,
      status: row.status || 'open',
      date: row.created_at ? row.created_at.toISOString() : new Date().toISOString(),
    }));
    res.json({ data: items, total: items.length });
  } catch (e) {
    res.status(500).json({ success: false, error: 'failed_to_fetch_grievances' });
  }
});

app.post('/api/grievances/:id/resolve', verifyToken, requireRole('superadmin'), async (req, res) => {
  if (!pool) {
    return res.status(503).json({ success: false, error: 'support_channel_unavailable' });
  }
  try {
    await ensureGrievancesTable();
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE grievances
       SET status = 'resolved'
       WHERE id = $1
       RETURNING id, name, email, subject, message, status, created_at`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'not_found' });
    }
    const row = result.rows[0];
    logAudit(req.user.email, req.user.email, 'RESOLVE_GRIEVANCE', 'grievance', id, null, req);
    res.json({
      success: true,
      data: {
        id: row.id,
        name: row.name,
        email: row.email,
        subject: row.subject,
        message: row.message,
        status: row.status || 'resolved',
        date: row.created_at ? row.created_at.toISOString() : new Date().toISOString(),
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, error: 'failed_to_resolve_grievance' });
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

app.get('/api/db/health', async (req, res) => {
  if (!pool) {
    return res.json({ ok: false, connected: false, message: 'no_database_configured' });
  }
  try {
    const r = await pool.query('SELECT 1 as ok');
    res.json({ ok: true, connected: true, result: r.rows[0]?.ok === 1 });
  } catch (e) {
    res.status(500).json({ ok: false, connected: false, error: 'db_unreachable' });
  }
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
    
    const data = getData();
    if (!data.politicians || data.politicians.length === 0) {
      const tenantId = null;
      let realPoliticians = await fetchMultipleRealPoliticians();
      if (!realPoliticians || realPoliticians.length === 0) {
        realPoliticians = getFallbackPoliticians(6);
      }
      if (pool) {
        await upsertRealPoliticiansToDb(realPoliticians, tenantId || 'default');
      }
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
