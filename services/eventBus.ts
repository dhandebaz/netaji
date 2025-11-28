import { sseService, connectSSE, onSSEEvent } from './sseService';

type EventCallback = (data: any) => void;

const eventListeners: Map<string, Set<EventCallback>> = new Map();

let sseInitialized = false;

export function initSSE(): void {
  if (sseInitialized) return;
  sseInitialized = true;
  
  connectSSE();
  
  onSSEEvent('*', (data) => {
    if (data.type && data.type !== 'heartbeat' && data.type !== 'connected') {
      emit(data.type, data.data, false);
    }
  });
  
  console.log('[EventBus] SSE integration initialized');
}

export function on(eventName: string, callback: EventCallback): () => void {
  if (!eventListeners.has(eventName)) {
    eventListeners.set(eventName, new Set());
  }
  eventListeners.get(eventName)!.add(callback);
  
  return () => {
    eventListeners.get(eventName)?.delete(callback);
  };
}

export function emit(eventName: string, data: any, local: boolean = true): void {
  console.log(`[EventBus] ${local ? 'Local' : 'SSE'} emit: ${eventName}`, data);
  const callbacks = eventListeners.get(eventName);
  if (callbacks) {
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[EventBus] Error in listener for ${eventName}:`, error);
      }
    });
  }
}

export function off(eventName: string): void {
  eventListeners.delete(eventName);
}

export const EVENTS = {
  POLITICIAN_ADDED: 'politician:added',
  POLITICIAN_UPDATED: 'politician:updated',
  POLITICIAN_DELETED: 'politician:deleted',
  POLITICIAN_VOTED: 'vote:recorded',
  POLITICIANS_REFRESHED: 'politicians:refreshed',

  COMPLAINT_FILED: 'complaint:filed',
  COMPLAINT_STATUS_CHANGED: 'complaint:updated',
  COMPLAINT_DELETED: 'complaint:deleted',
  COMPLAINT_UPVOTED: 'complaint:upvoted',

  VOLUNTEER_REGISTERED: 'volunteer:registered',
  VOLUNTEER_UPDATED: 'volunteer:updated',

  RTI_TASK_CREATED: 'rti:created',
  RTI_TASK_UPDATED: 'rti:updated',

  GAME_PLAYED: 'game:played',

  SETTINGS_UPDATED: 'settings:updated',
};

export default { on, emit, off, EVENTS, initSSE };
