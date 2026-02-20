import { Politician, NewsItem, PublicComplaint, Volunteer, RTITask } from '../types';
import { MOCK_POLITICIANS, STATES } from '../constants';
import { fetchNewsForPolitician } from './rssService';
import { fetchRealPoliticiansFromMyNeta } from './mynetaService';

// Generate slug from politician name
const generateSlug = (name: string): string => {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
};

// Ensure politician has slug
const ensureSlug = (politician: Politician): Politician => {
  if (!politician.slug) {
    return { ...politician, slug: generateSlug(politician.name) };
  }
  return politician;
};

// Backend API URL - uses Vite proxy to forward to backend
const API_BASE = '/api';
const getAPI_URL = () => API_BASE;

// In-memory cache for fast sync access
let politicianCache: Politician[] = [];

// Event emitter for data updates
export const dataSyncEvents = {
  on: (event: string, callback: (data: any) => void) => {
    const handler = (e: any) => callback(e.detail);
    window.addEventListener(`neta:${event}`, handler);
    return () => window.removeEventListener(`neta:${event}`, handler);
  },
  emit: (event: string, data: any) => {
    window.dispatchEvent(new CustomEvent(`neta:${event}`, { detail: data }));
  }
};

const STORAGE_KEYS = {
  POLITICIANS: 'neta_politicians',
  CONST_INTEL: 'neta_constituency_intel',
  COMPLAINTS: 'neta_complaints',
  VOLUNTEERS: 'neta_volunteers',
  RTI_TASKS: 'neta_rti_tasks',
  VOTES: 'neta_votes',
  USER_VOTES: 'neta_user_votes',
  LAST_NEWS_FETCH: 'neta_last_news_fetch',
  CACHED_NEWS: 'neta_cached_news',
  CLAIMS: 'neta_claims',
  GAMES: 'neta_games',
};

const safeGetItem = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const safeSetItem = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error:', e);
  }
};

export const initializeData = (): void => {
  const existingPoliticians = safeGetItem<Politician[]>(STORAGE_KEYS.POLITICIANS, []);
  if (existingPoliticians.length === 0) {
    // Try to fetch real politicians from backend (server-side data fetcher)
    const apiURL = getAPI_URL();
    fetch(`${apiURL}/fetch-real-data`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.politicians?.length > 0) {
          // console.debug(`✓ Loaded ${data.politicians.length} real politicians from backend`);
          safeSetItem(STORAGE_KEYS.POLITICIANS, data.politicians);
          politicianCache = data.politicians;
        } else {
          throw new Error('No politicians in response');
        }
      })
      .catch(() => {
        // Fallback to mock data
        console.warn('Using mock politician data as fallback');
        const politiciansWithEmptyNews = MOCK_POLITICIANS.map(p => ({
          ...p,
          news: [],
          votes: { up: 0, down: 0 }
        }));
        safeSetItem(STORAGE_KEYS.POLITICIANS, politiciansWithEmptyNews);
        politicianCache = politiciansWithEmptyNews;
      });
  } else {
    politicianCache = existingPoliticians;
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.COMPLAINTS)) {
    safeSetItem(STORAGE_KEYS.COMPLAINTS, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.VOLUNTEERS)) {
    const seedVolunteers = [
      { id: 'v1', name: 'Priya Sharma', state: 'Delhi', rtisFiled: 12, points: 450, email: 'priya@neta.in', phone: '+91-9876543210', claimsResolved: 8 },
      { id: 'v2', name: 'Rajesh Kumar', state: 'Maharashtra', rtisFiled: 8, points: 320, email: 'rajesh@neta.in', phone: '+91-9876543211', claimsResolved: 5 },
      { id: 'v3', name: 'Anjali Verma', state: 'Karnataka', rtisFiled: 15, points: 550, email: 'anjali@neta.in', phone: '+91-9876543212', claimsResolved: 10 },
      { id: 'v4', name: 'Vikram Singh', state: 'Uttar Pradesh', rtisFiled: 10, points: 380, email: 'vikram@neta.in', phone: '+91-9876543213', claimsResolved: 7 },
      { id: 'v5', name: 'Meera Reddy', state: 'Telangana', rtisFiled: 18, points: 680, email: 'meera@neta.in', phone: '+91-9876543214', claimsResolved: 12 },
    ];
    safeSetItem(STORAGE_KEYS.VOLUNTEERS, seedVolunteers);
  }
  if (!localStorage.getItem(STORAGE_KEYS.RTI_TASKS)) {
    const seedRTITasks = [
      { id: 'r1', politicianId: 1, politicianName: 'Narendra Modi', topic: 'Asset Declaration', status: 'filed', priority: 'high', generatedDate: '2025-10-15', claimedBy: 'Priya Sharma', filedDate: '2025-10-20', pioDetails: { name: 'PIO', address: 'PMO, South Block, New Delhi' } },
      { id: 'r2', politicianId: 2, politicianName: 'Rahul Gandhi', topic: 'Attendance Records', status: 'pending', priority: 'medium', generatedDate: '2025-10-18', claimedBy: 'Rajesh Kumar', filedDate: '2025-10-25', pioDetails: { name: 'PIO', address: 'Parliament House, New Delhi' } },
      { id: 'r3', politicianId: 3, politicianName: 'Arvind Kejriwal', topic: 'Criminal Cases', status: 'responded', priority: 'high', generatedDate: '2025-10-12', claimedBy: 'Anjali Verma', filedDate: '2025-10-19', pioDetails: { name: 'PIO', address: 'Delhi Secretariat, New Delhi' } },
    ];
    safeSetItem(STORAGE_KEYS.RTI_TASKS, seedRTITasks);
  }
  if (!localStorage.getItem(STORAGE_KEYS.USER_VOTES)) {
    safeSetItem(STORAGE_KEYS.USER_VOTES, {});
  }
  if (!localStorage.getItem(STORAGE_KEYS.GAMES)) {
    const mockGames = [
      { id: 'g1', title: 'Chair Saver', description: 'Help the politician dodge accountability and keep their seat!', thumbnailUrl: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?auto=format&fit=crop&q=80&w=400', plays: 12450, rating: 4.8, playUrl: '/games/play/g1' },
      { id: 'g2', title: 'Scam Dodger', description: 'Run through the bureaucracy maze without getting caught!', thumbnailUrl: 'https://images.unsplash.com/photo-1633419461186-7d7507690054?auto=format&fit=crop&q=80&w=400', plays: 8900, rating: 4.5, playUrl: '/games/play/g2' },
      { id: 'g3', title: 'Debate Master', description: 'Shout louder than your opponent to win the argument!', thumbnailUrl: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&q=80&w=400', plays: 5600, rating: 4.2, playUrl: '/games/play/g3' }
    ];
    safeSetItem(STORAGE_KEYS.GAMES, mockGames);
  }
  
  // Initial syncs
  syncComplaints();
  syncRTITasks();
  syncVolunteers();
  syncGamesWithBackend();
};

export const syncComplaints = async () => {
    try {
        const API_URL = getAPI_URL();
        const res = await fetch(`${API_URL}/complaints`);
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
                safeSetItem(STORAGE_KEYS.COMPLAINTS, data);
                dataSyncEvents.emit('complaintsFiled', data);
            }
        }
    } catch (e) { console.error('Failed to sync complaints', e); }
};

export const syncRTITasks = async () => {
    try {
        const API_URL = getAPI_URL();
        const res = await fetch(`${API_URL}/rti-tasks`);
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
                safeSetItem(STORAGE_KEYS.RTI_TASKS, data);
                dataSyncEvents.emit('rtiTasksUpdated', data);
            }
        }
    } catch (e) { console.error('Failed to sync RTI tasks', e); }
};

export const syncVolunteers = async () => {
    try {
        const API_URL = getAPI_URL();
        const res = await fetch(`${API_URL}/volunteers`);
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
                safeSetItem(STORAGE_KEYS.VOLUNTEERS, data);
                dataSyncEvents.emit('volunteersUpdated', data);
            }
        }
    } catch (e) { console.error('Failed to sync volunteers', e); }
};


// Fetch real data from backend and sync (with optional state parameter)
export const fetchRealDataFromBackend = async (state: string = 'Delhi'): Promise<boolean> => {
  try {
    const API_URL = getAPI_URL();
    const token = typeof window !== 'undefined' ? localStorage.getItem('neta_auth_token') : null;
    console.debug(`[dataService] Fetching politicians from ${state}...`);
    const res = await fetch(`${API_URL}/admin/run-scraper?state=${encodeURIComponent(state)}&strict=1`, {  
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal: AbortSignal.timeout(10000) 
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.politicians?.length > 0) {
        // Fetch full politician data after scraping
        const fullRes = await fetch(`${API_URL}/politicians`);
        if (fullRes.ok) {
          const fullData = await fullRes.json();
          if (Array.isArray(fullData) && fullData.length > 0) {
            politicianCache = fullData;
            safeSetItem(STORAGE_KEYS.POLITICIANS, fullData);
            dataSyncEvents.emit('politiciansUpdated', fullData);
            // console.debug(`✓ Real data fetched: ${fullData.length} politicians from ${state}`);
            return true;
          }
        }
      }
    }
  } catch (e) {
    console.error('[dataService] Real data fetch failed:', e instanceof Error ? e.message : String(e));
  }
  return false;
};

// Async function to load from backend and update cache
export const syncPoliticiansWithBackend = async () => {
  try {
    const API_URL = getAPI_URL();
    const res = await fetch(`${API_URL}/politicians`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data) && data.length > 0) {
        politicianCache = data;
        safeSetItem(STORAGE_KEYS.POLITICIANS, data);
        dataSyncEvents.emit('politiciansUpdated', data);
        console.debug('✓ Backend sync successful:', data.length, 'politicians loaded');
        return true;
      }
    }
  } catch (e) {
    console.debug('Backend sync failed, using local cache:', e instanceof Error ? e.message : String(e));
  }
  return false;
};

// Synchronous getter - uses cache or localStorage
export const getAllPoliticians = (): Politician[] => {
  if (politicianCache.length > 0) return politicianCache.map(ensureSlug);
  const stored = safeGetItem<Politician[]>(STORAGE_KEYS.POLITICIANS, MOCK_POLITICIANS);
  const withSlugs = stored.map(ensureSlug);
  politicianCache = withSlugs;
  return withSlugs;
};

export const getConstituencyIntelByState = (state: string) => {
  const politicians = getPoliticiansByState(state);
  const total = politicians.length;
  const verified = politicians.filter(p => p.verified).length;
  const avgApproval = total > 0 ? Math.round(politicians.reduce((sum, p) => sum + (p.approvalRating || 0), 0) / total) : 0;
  return { total, verified, avgApproval };
};

export const getPoliticianById = (id: number): Politician | undefined => {
  const politicians = getAllPoliticians();
  return politicians.find(p => p.id === id);
};

export const fetchPoliticianById = async (id: number): Promise<Politician | undefined> => {
  // 1. Check local cache first
  const cached = getPoliticianById(id);
  if (cached) return cached;

  // 2. Fetch from backend
  try {
    const apiURL = getAPI_URL();
    const res = await fetch(`${apiURL}/politicians/${id}`);
    if (res.ok) {
      const politician = await res.json();
      // Update cache if not already present
      if (!politicianCache.find(p => p.id === politician.id)) {
        politicianCache.push(politician);
        dataSyncEvents.emit('politiciansUpdated', politicianCache);
      }
      return politician;
    }
  } catch (e) {
    console.error(`Error fetching politician ${id}:`, e);
  }
  return undefined;
};

export const fetchPoliticiansByIds = async (ids: number[]): Promise<Politician[]> => {
  const uniqueIds = [...new Set(ids)];
  const results: Politician[] = [];
  
  // Try to find as many as possible in cache first
  const missingIds: number[] = [];
  uniqueIds.forEach(id => {
    const p = getPoliticianById(id);
    if (p) results.push(p);
    else missingIds.push(id);
  });

  if (missingIds.length === 0) return results;

  // Fetch missing ones in bulk from backend
  try {
    const res = await getPoliticians({ ids: missingIds });
    const fetched = Array.isArray(res) ? res : (res.data || []);
    
    fetched.forEach((p: Politician) => {
      // Update cache
      if (!politicianCache.find(cached => cached.id === p.id)) {
        politicianCache.push(p);
      }
      results.push(p);
    });
    
    // Emit update event
    if (fetched.length > 0) {
      dataSyncEvents.emit('politiciansUpdated', politicianCache);
    }
  } catch (e) {
    console.error('Error fetching multiple politicians:', e);
  }

  return results;
};

export const getPoliticianBySlug = (slug: string): Politician | undefined => {
  const politicians = getAllPoliticians();
  return politicians.find(p => p.slug === slug);
};

export const fetchPoliticianBySlug = async (slug: string): Promise<Politician | undefined> => {
  // 1. Check local cache first
  const cached = getPoliticianBySlug(slug);
  if (cached) return cached;

  // 2. Fetch from backend
  try {
    const apiURL = getAPI_URL();
    const res = await fetch(`${apiURL}/politicians/${slug}`);
    if (res.ok) {
      const politician = await res.json();
      // Update cache if not already present
      if (!politicianCache.find(p => p.id === politician.id)) {
        politicianCache.push(politician);
        dataSyncEvents.emit('politiciansUpdated', politicianCache);
      }
      return politician;
    }
  } catch (e) {
    console.error(`Error fetching politician ${slug}:`, e);
  }
  return undefined;
};

export const getPoliticiansByState = (state: string): Politician[] => {
  const politicians = getAllPoliticians();
  return politicians.filter(p => p.state === state);
};

export const updatePolitician = (id: number, updates: Partial<Politician>): Politician | null => {
  const politicians = getAllPoliticians();
  const index = politicians.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  politicians[index] = { ...politicians[index], ...updates };
  safeSetItem(STORAGE_KEYS.POLITICIANS, politicians);
  politicianCache = politicians;
  // Async backend sync (fire-and-forget)
  const API_URL = getAPI_URL();
  fetch(`${API_URL}/politicians/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(politicians[index]) }).catch(() => {});
  return politicians[index];
};

export const fetchAndCacheNewsForPolitician = async (politicianId: number): Promise<NewsItem[]> => {
  const politician = getPoliticianById(politicianId);
  if (!politician) return [];
  
  const cacheKey = `${STORAGE_KEYS.CACHED_NEWS}_${politicianId}`;
  const lastFetchKey = `${STORAGE_KEYS.LAST_NEWS_FETCH}_${politicianId}`;
  
  const lastFetch = safeGetItem<number>(lastFetchKey, 0);
  const now = Date.now();
  const CACHE_DURATION = 15 * 60 * 1000;
  
  if (now - lastFetch < CACHE_DURATION) {
    const cached = safeGetItem<NewsItem[]>(cacheKey, []);
    if (cached.length > 0) return cached;
  }
  
  try {
    const news = await fetchNewsForPolitician(politician.name);
    safeSetItem(cacheKey, news);
    safeSetItem(lastFetchKey, now);
    
    updatePolitician(politicianId, { news });
    
    return news;
  } catch (error) {
    console.error('Failed to fetch news:', error);
    return safeGetItem<NewsItem[]>(cacheKey, []);
  }
};

export const getUserVotes = (): Record<number, 'up' | 'down'> => {
  return safeGetItem<Record<number, 'up' | 'down'>>(STORAGE_KEYS.USER_VOTES, {});
};

export const hasUserVoted = (politicianId: number): 'up' | 'down' | null => {
  const userVotes = getUserVotes();
  return userVotes[politicianId] || null;
};

export const recordVote = (politicianId: number, voteType: 'up' | 'down'): { success: boolean; newVotes: { up: number; down: number } } => {
  const politician = getPoliticianById(politicianId);
  if (!politician) return { success: false, newVotes: { up: 0, down: 0 } };
  
  const userVotes = getUserVotes();
  const previousVote = userVotes[politicianId];
  
  let newVotes = { ...politician.votes };
  
  if (previousVote === voteType) {
    if (voteType === 'up') newVotes.up = Math.max(0, newVotes.up - 1);
    else newVotes.down = Math.max(0, newVotes.down - 1);
    delete userVotes[politicianId];
  } else {
    if (previousVote) {
      if (previousVote === 'up') newVotes.up = Math.max(0, newVotes.up - 1);
      else newVotes.down = Math.max(0, newVotes.down - 1);
    }
    if (voteType === 'up') newVotes.up++;
    else newVotes.down++;
    userVotes[politicianId] = voteType;
  }
  
  safeSetItem(STORAGE_KEYS.USER_VOTES, userVotes);
  updatePolitician(politicianId, { votes: newVotes });
  
  // Emit vote event for real-time updates
  dataSyncEvents.emit('politiciansUpdated', getAllPoliticians());
  
  return { success: true, newVotes };
};

export const getAllComplaints = (): PublicComplaint[] => {
  return safeGetItem<PublicComplaint[]>(STORAGE_KEYS.COMPLAINTS, []);
};

export const getComplaintsByPolitician = (politicianId: number): PublicComplaint[] => {
  const complaints = getAllComplaints();
  return complaints.filter(c => c.politicianId === politicianId);
};

export const addComplaint = (complaint: Omit<PublicComplaint, 'id' | 'upvotes' | 'status' | 'filedAt'>): PublicComplaint => {
  const complaints = getAllComplaints();
  const newComplaint: PublicComplaint = {
    ...complaint,
    id: `complaint_${Date.now()}`,
    upvotes: 0,
    status: 'pending',
    filedAt: new Date().toISOString().split('T')[0],
  };
  complaints.unshift(newComplaint);
  safeSetItem(STORAGE_KEYS.COMPLAINTS, complaints);
  // Async backend sync
  const API_URL = getAPI_URL();
  fetch(`${API_URL}/complaints`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newComplaint) }).catch(() => {});
  
  const politician = getPoliticianById(complaint.politicianId);
  if (politician) {
    const stats = politician.complaintStats || { total: 0, resolved: 0, pending: 0 };
    updatePolitician(complaint.politicianId, {
      complaintStats: {
        ...stats,
        total: stats.total + 1,
        pending: stats.pending + 1
      }
    });
  }
  
  // Emit complaint event for real-time updates
  dataSyncEvents.emit('complaintsFiled', getAllComplaints());
  
  return newComplaint;
};

export const upvoteComplaint = (complaintId: string): PublicComplaint | null => {
  const complaints = getAllComplaints();
  const index = complaints.findIndex(c => c.id === complaintId);
  if (index === -1) return null;
  
  complaints[index].upvotes++;
  safeSetItem(STORAGE_KEYS.COMPLAINTS, complaints);
  return complaints[index];
};

export const updateComplaintStatus = (complaintId: string, status: PublicComplaint['status'], proofOfWork?: string): PublicComplaint | null => {
  const complaints = getAllComplaints();
  const index = complaints.findIndex(c => c.id === complaintId);
  if (index === -1) return null;
  
  const oldStatus = complaints[index].status;
  complaints[index].status = status;
  if (proofOfWork) complaints[index].proofOfWork = proofOfWork;
  safeSetItem(STORAGE_KEYS.COMPLAINTS, complaints);
  // Async backend sync
  const API_URL_2 = getAPI_URL();
  fetch(`${API_URL_2}/complaints/${complaintId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(complaints[index]) }).catch(() => {});
  
  const politician = getPoliticianById(complaints[index].politicianId);
  if (politician && politician.complaintStats) {
    const stats = { ...politician.complaintStats };
    if (oldStatus === 'pending') stats.pending--;
    if (status === 'resolved') stats.resolved++;
    else if (status === 'pending') stats.pending++;
    updatePolitician(complaints[index].politicianId, { complaintStats: stats });
  }
  
  // Emit complaint status change event for real-time updates
  dataSyncEvents.emit('complaintsFiled', getAllComplaints());
  
  return complaints[index];
};

export const getAllVolunteers = (): Volunteer[] => {
  return safeGetItem<Volunteer[]>(STORAGE_KEYS.VOLUNTEERS, []);
};

export const registerVolunteer = (name: string, state: string): Volunteer => {
  const volunteers = getAllVolunteers();
  const newVolunteer: Volunteer = {
    id: volunteers.length + 1,
    name,
    rank: volunteers.length + 1,
    rtisFiled: 0,
    points: 0,
    state
  };
  volunteers.push(newVolunteer);
  safeSetItem(STORAGE_KEYS.VOLUNTEERS, volunteers);
  // Async backend sync
  const API_URL_3 = getAPI_URL();
  fetch(`${API_URL_3}/volunteers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newVolunteer) }).catch(() => {});
  // Emit volunteer event
  dataSyncEvents.emit('volunteersUpdated', getAllVolunteers());
  return newVolunteer;
};

export const updateVolunteerStats = (volunteerId: number, points: number, rtisFiled: number = 0): Volunteer | null => {
  const volunteers = getAllVolunteers();
  const index = volunteers.findIndex(v => v.id === volunteerId);
  if (index === -1) return null;
  
  volunteers[index].points += points;
  volunteers[index].rtisFiled += rtisFiled;
  
  volunteers.sort((a, b) => b.points - a.points);
  volunteers.forEach((v, i) => v.rank = i + 1);
  
  safeSetItem(STORAGE_KEYS.VOLUNTEERS, volunteers);
  dataSyncEvents.emit('volunteersUpdated', volunteers);
  
  return volunteers[index];
};

export interface Game {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  plays: number;
  rating?: number;
  playUrl?: string;
}

export const getAllGames = (limit?: number): Game[] => {
  const games = safeGetItem<Game[]>(STORAGE_KEYS.GAMES, []);
  return limit ? games.slice(0, limit) : games;
};

export const getLeaderboard = (limit: number = 10): Volunteer[] => {
  const volunteers = getAllVolunteers();
  return volunteers.sort((a, b) => b.points - a.points).slice(0, limit);
};

export const getAllRTITasks = (): RTITask[] => {
  return safeGetItem<RTITask[]>(STORAGE_KEYS.RTI_TASKS, []);
};

export const getRTITasksByStatus = (status: RTITask['status']): RTITask[] => {
  const tasks = getAllRTITasks();
  return tasks.filter(t => t.status === status);
};

export const addRTITask = (task: Omit<RTITask, 'id' | 'status' | 'generatedDate'> & { id?: string, status?: RTITask['status'], generatedDate?: string }): RTITask => {
  const tasks = getAllRTITasks();
  const newTask: RTITask = {
    status: 'generated',
    generatedDate: new Date().toISOString().split('T')[0],
    ...task,
    id: task.id || `rti_${Date.now()}`,
  };
  tasks.unshift(newTask);
  safeSetItem(STORAGE_KEYS.RTI_TASKS, tasks);
  // Async backend sync
  const API_URL_5 = getAPI_URL();
  fetch(`${API_URL_5}/rti-tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newTask) }).catch(() => {});
  // Emit RTI event
  dataSyncEvents.emit('rtiTasksUpdated', getAllRTITasks());
  return newTask;
};

export const claimRTITask = (taskId: string, volunteerName: string): RTITask | null => {
  const tasks = getAllRTITasks();
  const index = tasks.findIndex(t => t.id === taskId);
  if (index === -1 || tasks[index].status !== 'generated') return null;
  
  tasks[index].status = 'claimed';
  tasks[index].claimedBy = volunteerName;
  safeSetItem(STORAGE_KEYS.RTI_TASKS, tasks);
  // Async backend sync
  const API_URL_6 = getAPI_URL();
  fetch(`${API_URL_6}/rti-tasks/${taskId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(tasks[index]) }).catch(() => {});
  // Emit RTI event
  dataSyncEvents.emit('rtiTasksUpdated', getAllRTITasks());
  return tasks[index];
};

export const fileRTITask = (taskId: string, proofUrl?: string): RTITask | null => {
  const tasks = getAllRTITasks();
  const index = tasks.findIndex(t => t.id === taskId);
  if (index === -1 || tasks[index].status !== 'claimed') return null;
  
  tasks[index].status = 'filed';
  tasks[index].filedDate = new Date().toISOString().split('T')[0];
  if (proofUrl) tasks[index].proofOfFilingUrl = proofUrl;
  safeSetItem(STORAGE_KEYS.RTI_TASKS, tasks);
  // Async backend sync
  const API_URL_7 = getAPI_URL();
  fetch(`${API_URL_7}/rti-tasks/${taskId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(tasks[index]) }).catch(() => {});
  // Emit RTI event
  dataSyncEvents.emit('rtiTasksUpdated', getAllRTITasks());
  return tasks[index];
};

export const submitRTIResponse = (taskId: string, responseUrl: string): RTITask | null => {
  const tasks = getAllRTITasks();
  const index = tasks.findIndex(t => t.id === taskId);
  if (index === -1) return null;
  
  tasks[index].status = 'response_received';
  tasks[index].responseDate = new Date().toISOString();
  tasks[index].governmentResponseUrl = responseUrl;
  
  safeSetItem(STORAGE_KEYS.RTI_TASKS, tasks);
  // Async backend sync
  const API_URL = getAPI_URL();
  fetch(`${API_URL}/rti-tasks/${taskId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(tasks[index]) }).catch(() => {});
  dataSyncEvents.emit('rtiTasksUpdated', getAllRTITasks());
  return tasks[index];
};

export const verifyRTITask = (taskId: string): RTITask | null => {
  const tasks = getAllRTITasks();
  const index = tasks.findIndex(t => t.id === taskId);
  if (index === -1) return null;
  
  tasks[index].status = 'verified';
  
  safeSetItem(STORAGE_KEYS.RTI_TASKS, tasks);
  // Async backend sync
  const API_URL = getAPI_URL();
  fetch(`${API_URL}/rti-tasks/${taskId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(tasks[index]) }).catch(() => {});
  dataSyncEvents.emit('rtiTasksUpdated', getAllRTITasks());
  return tasks[index];
};

export const updateRTITaskStatus = (taskId: string, status: RTITask['status'], responseUrl?: string): RTITask | null => {
  const tasks = getAllRTITasks();
  const index = tasks.findIndex(t => t.id === taskId);
  if (index === -1) return null;
  
  tasks[index].status = status;
  if (status === 'response_received' || status === 'verified') {
    tasks[index].responseDate = new Date().toISOString().split('T')[0];
    if (responseUrl) tasks[index].governmentResponseUrl = responseUrl;
  }
  safeSetItem(STORAGE_KEYS.RTI_TASKS, tasks);
  // Async backend sync
  const API_URL_8 = getAPI_URL();
  fetch(`${API_URL_8}/rti-tasks/${taskId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(tasks[index]) }).catch(() => {});
  // Emit RTI event
  dataSyncEvents.emit('rtiTasksUpdated', getAllRTITasks());
  return tasks[index];
};

export const searchPoliticians = (query: string): Politician[] => {
  const politicians = getAllPoliticians();
  const lowerQuery = query.toLowerCase();
  
  return politicians.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) ||
    p.party.toLowerCase().includes(lowerQuery) ||
    p.state.toLowerCase().includes(lowerQuery) ||
    p.constituency.toLowerCase().includes(lowerQuery)
  );
};

export const getStates = (): string[] => STATES;

export const addPolitician = (politician: Partial<Politician>): Politician => {
  const politicians = getAllPoliticians();
  const maxId = politicians.length > 0 ? Math.max(...politicians.map(p => p.id)) : 0;
  const newPolitician: Politician = {
    id: maxId + 1,
    name: politician.name || 'Unknown',
    slug: (politician.name || 'unknown').toLowerCase().replace(/ /g, '-'),
    party: politician.party || 'Independent',
    partyLogo: '👤',
    state: politician.state || 'Unknown',
    constituency: politician.constituency || 'Unknown',
    photoUrl: politician.photoUrl || 'https://via.placeholder.com/200?text=No+Image',
    age: politician.age || 0,
    approvalRating: politician.approvalRating || 50,
    totalAssets: politician.totalAssets || 0,
    criminalCases: politician.criminalCases || 0,
    education: politician.education || 'Unknown',
    attendance: politician.attendance || 0,
    verified: politician.verified || false,
    status: politician.status || 'active',
    votes: politician.votes || { up: 0, down: 0 },
    history: politician.history || [],
    assetsBreakdown: politician.assetsBreakdown || [],
    news: politician.news || [],
    ...politician
  };
  politicians.unshift(newPolitician);
  safeSetItem(STORAGE_KEYS.POLITICIANS, politicians);
  politicianCache = politicians;
  // Emit politician event
  dataSyncEvents.emit('politiciansUpdated', politicians);
  // Async backend sync
  const API_URL = getAPI_URL();
  fetch(`${API_URL}/politicians`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newPolitician) }).catch(() => {});
  return newPolitician;
};

export const deletePolitician = (id: number): boolean => {
  const politicians = getAllPoliticians();
  const filtered = politicians.filter(p => p.id !== id);
  if (filtered.length === politicians.length) return false;
  safeSetItem(STORAGE_KEYS.POLITICIANS, filtered);
  politicianCache = filtered;
  // Async backend sync
  const API_URL = getAPI_URL();
  fetch(`${API_URL}/politicians/${id}`, { method: 'DELETE' }).catch(() => {});
  // Emit politician event
  dataSyncEvents.emit('politiciansUpdated', filtered);
  return true;
};

export const getClaims = (): any[] => {
  return safeGetItem<any[]>(STORAGE_KEYS.CLAIMS, []);
};

export const saveClaim = (claim: any): void => {
  const claims = getClaims();
  claims.push(claim);
  safeSetItem(STORAGE_KEYS.CLAIMS, claims);
  // Emit claims event
  dataSyncEvents.emit('claimsUpdated', claims);
};

export const updateClaimStatus = (id: string, status: string): any => {
  const claims = getClaims();
  const index = claims.findIndex((c: any) => c.id === id);
  if (index === -1) return null;
  claims[index].status = status;
  safeSetItem(STORAGE_KEYS.CLAIMS, claims);
  // Emit claims event
  dataSyncEvents.emit('claimsUpdated', claims);
  return claims[index];
};

export const calculateApprovalRating = (politician: Politician): number => {
  const totalVotes = politician.votes.up + politician.votes.down;
  if (totalVotes === 0) return 50;
  return Math.round((politician.votes.up / totalVotes) * 100);
};

export const recalculateAllApprovalRatings = (): void => {
  const politicians = getAllPoliticians();
  politicians.forEach(p => {
    const newRating = calculateApprovalRating(p);
    updatePolitician(p.id, { approvalRating: newRating });
  });
};

export const addGame = (game: Omit<Game, 'id' | 'plays'>): Game => {
  const games = getAllGames();
  const newGame: Game = {
    ...game,
    id: `g_${Date.now()}`,
    plays: 0,
  };
  games.unshift(newGame);
  safeSetItem(STORAGE_KEYS.GAMES, games);
  // Async backend sync
  const API_URL_9 = getAPI_URL();
  fetch(`${API_URL_9}/games`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newGame) }).catch(() => {});
  // Emit game event
  dataSyncEvents.emit('gamesUpdated', getAllGames());
  return newGame;
};

export const updateGame = (id: string, updates: Partial<Game>): Game | null => {
  const games = getAllGames();
  const index = games.findIndex((g: Game) => g.id === id);
  if (index === -1) return null;
  games[index] = { ...games[index], ...updates };
  safeSetItem(STORAGE_KEYS.GAMES, games);
  // Async backend sync
  const API_URL_10 = getAPI_URL();
  fetch(`${API_URL_10}/games/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(games[index]) }).catch(() => {});
  // Emit game event
  dataSyncEvents.emit('gamesUpdated', getAllGames());
  return games[index];
};

export const deleteGame = (id: string): boolean => {
  const games = getAllGames();
  const filtered = games.filter((g: Game) => g.id !== id);
  if (filtered.length === games.length) return false;
  safeSetItem(STORAGE_KEYS.GAMES, filtered);
  // Async backend sync
  const API_URL_11 = getAPI_URL();
  fetch(`${API_URL_11}/games/${id}`, { method: 'DELETE' }).catch(() => {});
  // Emit game event
  dataSyncEvents.emit('gamesUpdated', filtered);
  return true;
};

export const playGame = (id: string): { success: boolean; plays: number } => {
  const games = getAllGames();
  const index = games.findIndex((g: Game) => g.id === id);
  if (index === -1) return { success: false, plays: 0 };
  
  games[index].plays += 1;
  safeSetItem(STORAGE_KEYS.GAMES, games);
  
  // Async backend sync
  const API_URL = getAPI_URL();
  fetch(`${API_URL}/games/${id}/play`, { method: 'POST' }).catch(() => {});
  
  // Emit game event
  dataSyncEvents.emit('gamesUpdated', games);
  
  return { success: true, plays: games[index].plays };
};

export const syncGamesWithBackend = async () => {
  try {
    const API_URL = getAPI_URL();
    const res = await fetch(`${API_URL}/games`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        safeSetItem(STORAGE_KEYS.GAMES, data);
        dataSyncEvents.emit('gamesUpdated', data);
        return true;
      }
    }
  } catch (e) {
    console.error('Failed to sync games', e);
  }
  return false;
};

initializeData();
