import { parseApiError, AppError, ERROR_CODES } from './errorHandler';

const API_BASE = '/api';

function getTenant() {
  try {
    const host = typeof window !== 'undefined' ? window.location.host : '';
    if (!host || host.includes('localhost')) return '';
    const parts = host.split('.');
    if (parts.length > 2) return parts[0];
    return '';
  } catch {
    return '';
  }
}

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success?: boolean;
}

class ApiError extends Error {
  status: number;
  code: string;
  details?: any;

  constructor(status: number, message: string, code?: string, details?: any) {
    super(message);
    this.status = status;
    this.code = code || ERROR_CODES.UNKNOWN;
    this.details = details;
    this.name = 'ApiError';
  }
}

async function apiCall<T = any>(
  method: string, 
  endpoint: string, 
  data?: any, 
  token?: string
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const options: RequestInit = {
    method,
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(getTenant() ? { 'X-Tenant': getTenant() } : {}),
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
  };
  if (data) options.body = JSON.stringify(data);

  try {
    const response = await fetch(url, options);
    
    let responseData: ApiResponse<T>;
    try {
      responseData = await response.json();
    } catch {
      responseData = {};
    }

    if (!response.ok) {
      throw new ApiError(
        response.status,
        responseData.error || `Request failed with status ${response.status}`,
        response.status === 429 ? ERROR_CODES.RATE_LIMITED : 
        response.status === 401 ? ERROR_CODES.UNAUTHORIZED :
        response.status === 403 ? ERROR_CODES.FORBIDDEN :
        response.status === 404 ? ERROR_CODES.NOT_FOUND :
        ERROR_CODES.SERVER_ERROR
      );
    }

    return (responseData.data !== undefined ? responseData.data : responseData) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError(0, 'Network connection failed', ERROR_CODES.NETWORK_ERROR);
    }
    console.error(`[API] ${method} ${endpoint} failed:`, error);
    throw error;
  }
}

async function safeApiCall<T = any>(
  method: string,
  endpoint: string,
  data?: any,
  token?: string
): Promise<{ data: T | null; error: AppError | null }> {
  try {
    const result = await apiCall<T>(method, endpoint, data, token);
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: parseApiError(error) };
  }
}

export const getPoliticians = (params?: { state?: string; party?: string; search?: string; limit?: number; offset?: number; sort?: string; role?: 'elected' | 'candidate'; ids?: number[] }) => {
  const queryParams = new URLSearchParams();
  if (params?.state) queryParams.set('state', params.state);
  if (params?.party) queryParams.set('party', params.party);
  if (params?.search) queryParams.set('search', params.search);
  if (params?.limit) queryParams.set('limit', String(params.limit));
  if (params?.offset) queryParams.set('offset', String(params.offset));
  if (params?.sort) queryParams.set('sort', params.sort);
  if (params?.role) queryParams.set('role', params.role);
  if (params?.ids && params.ids.length > 0) queryParams.set('ids', params.ids.join(','));
  const query = queryParams.toString();
  return apiCall('GET', `/politicians${query ? `?${query}` : ''}`);
};

export const getPolitician = (idOrSlug: string | number) => 
  apiCall('GET', `/politicians/${idOrSlug}`);

export const addPolitician = (data: any) => 
  apiCall('POST', '/politicians', data);

export const scrapePolitician = (url: string) => 
  apiCall('POST', '/politicians/scrape', { url });

export const updatePolitician = (id: number, data: any) => 
  apiCall('PUT', `/politicians/${id}`, data);

export const deletePolitician = (id: number) => 
  apiCall('DELETE', `/politicians/${id}`);

export const getVotes = () => apiCall('GET', '/votes');
export const addVote = (data: any) => apiCall('POST', '/votes', data);

export const getComplaints = (params?: { status?: string; politicianId?: number; limit?: number }) => {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.set('status', params.status);
  if (params?.politicianId) queryParams.set('politicianId', String(params.politicianId));
  if (params?.limit) queryParams.set('limit', String(params.limit));
  const query = queryParams.toString();
  return apiCall('GET', `/complaints${query ? `?${query}` : ''}`);
};

export const addComplaint = (data: any) => apiCall('POST', '/complaints', data);
export const updateComplaint = (id: string, data: any) => apiCall('PUT', `/complaints/${id}`, data);
export const upvoteComplaint = (id: string) => apiCall('POST', `/complaints/${id}/upvote`);

export const getVolunteers = () => apiCall('GET', '/volunteers');
export const addVolunteer = (data: any) => apiCall('POST', '/volunteers', data);
export const updateVolunteer = (id: string, data: any) => apiCall('PUT', `/volunteers/${id}`, data);

export const getRTITasks = (params?: { status?: string; priority?: string }) => {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.set('status', params.status);
  if (params?.priority) queryParams.set('priority', params.priority);
  const query = queryParams.toString();
  return apiCall('GET', `/rti-tasks${query ? `?${query}` : ''}`);
};

export const addRTITask = (data: any) => apiCall('POST', '/rti-tasks', data);
export const updateRTITask = (id: string, data: any) => apiCall('PUT', `/rti-tasks/${id}`, data);

export const getGames = () => apiCall('GET', '/games');
export const addGame = (data: any) => apiCall('POST', '/games', data);
export const playGame = (id: string) => apiCall('POST', `/games/${id}/play`);

export const login = async (email: string, password: string, role?: string) => {
  return apiCall('POST', '/auth/login', { email, password, role });
};

export const firebaseLogin = async (idToken: string, role?: string) => {
  return apiCall('POST', '/auth/firebase-login', { idToken, role });
};

export const verifyToken = async (token: string) => {
  return apiCall('POST', '/auth/verify', {}, token);
};

export const fetchRealData = () => apiCall('GET', '/fetch-real-data');
export const runScraper = () => apiCall('GET', '/scraper/fetch-politicians');

export const getAdminSettings = (token: string) => apiCall('GET', '/admin/settings', undefined, token);
export const saveAdminSettings = (settings: any, token: string) => apiCall('POST', '/admin/settings', settings, token);
export const getAdminStats = (token: string) => apiCall('GET', '/admin/stats', undefined, token);
export const getAuditLogs = (token: string, params?: { limit?: number; offset?: number; action?: string }) => {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.set('limit', String(params.limit));
  if (params?.offset) queryParams.set('offset', String(params.offset));
  if (params?.action) queryParams.set('action', params.action);
  const query = queryParams.toString();
  return apiCall('GET', `/admin/audit-logs${query ? `?${query}` : ''}`, undefined, token);
};

export const getDbStatus = (token: string) => apiCall('GET', '/db/status', undefined, token);
export const testDbConnection = (type: string, connectionString: string, token: string) => 
  apiCall('POST', '/db/test-connection', { type, connectionString }, token);

export const aiChat = (message: string, context: string, history: any[], token: string) => 
  apiCall('POST', '/ai/chat', { message, context, history }, token);

export const aiAnalyze = (analysisType: string, token: string) => 
  apiCall('POST', '/ai/analyze', { analysisType }, token);

export const healthCheck = () => apiCall('GET', '/health');

export const submitSupportTicket = (data: { name: string; email: string; subject: string; message: string }) =>
  apiCall('POST', '/grievances', data);

export const getSupportTickets = (token: string) =>
  apiCall<{ data: any[] }>('GET', '/grievances', undefined, token);

export const resolveSupportTicket = (id: string, token: string) =>
  apiCall('POST', `/grievances/${id}/resolve`, {}, token);

export { safeApiCall, ApiError };
