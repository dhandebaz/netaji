
import { dataSyncEvents } from './dataService';

let eventSource: EventSource | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;
const RECONNECT_DELAY = 5000;
const MAX_RETRIES = 5;
let retryCount = 0;

type SSECallback = (data: any) => void;
const listeners: Map<string, Set<SSECallback>> = new Map();

export const connectSSE = () => {
  if (eventSource?.readyState === EventSource.OPEN) return;

  const connect = () => {
    const sseUrl = '/api/sse';
    
    console.log('[SSE] Connecting to:', sseUrl);
    eventSource = new EventSource(sseUrl);

    eventSource.onopen = () => {
      console.log('[SSE] Connected');
      retryCount = 0;
      notifyListeners('connected', { message: 'Connected' });
    };

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        // console.log('[SSE] Received:', payload.type); // Verbose logging

        notifyListeners(payload.type, payload);
        notifyListeners('*', payload);

        // Handle specific system-wide syncs
        switch (payload.type) {
          case 'politician:added':
          case 'politician:updated':
          case 'politician:deleted':
          case 'politicians:refreshed':
             import('./dataService').then(({ syncPoliticiansWithBackend }) => {
                 syncPoliticiansWithBackend();
             });
             break;
          case 'game:played':
          case 'game:updated':
          case 'game:deleted':
          case 'gamesUpdated':
             import('./dataService').then(({ syncGamesWithBackend }) => {
                 syncGamesWithBackend();
             });
             break;
        }
        
        // Also re-emit as a local event via dataService for legacy support
        if (payload.type && payload.data) {
             dataSyncEvents.emit(payload.type, payload.data);
        }

      } catch (e) {
        console.error('[SSE] Error parsing message:', e);
      }
    };

    eventSource.onerror = (err) => {
      console.error('[SSE] Connection error:', err);
      eventSource?.close();
      eventSource = null;
      
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        console.info(`[SSE] Reconnecting in ${RECONNECT_DELAY}ms (Attempt ${retryCount}/${MAX_RETRIES})...`);
        reconnectTimer = setTimeout(connect, RECONNECT_DELAY);
      } else {
        console.error('[SSE] Max retries reached. Giving up.');
      }
    };
  };

  connect();
};

export const closeSSE = () => {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
};

export const onSSEEvent = (event: string, callback: SSECallback) => {
  if (!listeners.has(event)) {
    listeners.set(event, new Set());
  }
  listeners.get(event)!.add(callback);
  
  return () => {
    listeners.get(event)?.delete(callback);
  };
};

const notifyListeners = (event: string, data: any) => {
  if (listeners.has(event)) {
    listeners.get(event)!.forEach(cb => cb(data));
  }
};

export const sseService = {
  connect: connectSSE,
  close: closeSSE,
  on: onSSEEvent
};

// Legacy support for my previous edit (if any file imported it)
export const initSSEService = connectSSE;
export const closeSSEService = closeSSE;
