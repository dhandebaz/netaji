const API_BASE = '/api';

type SSEEventHandler = (data: any) => void;

interface SSEEventHandlers {
  [key: string]: Set<SSEEventHandler>;
}

class SSEService {
  private eventSource: EventSource | null = null;
  private handlers: SSEEventHandlers = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private heartbeatTimeout: ReturnType<typeof setTimeout> | null = null;

  connect(): void {
    if (this.eventSource || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    console.log('[SSE] Connecting to server...');

    try {
      this.eventSource = new EventSource(`${API_BASE}/sse`);

      this.eventSource.onopen = () => {
        console.log('[SSE] Connected successfully');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        this.startHeartbeatMonitor();
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleEvent(data);
        } catch (error) {
          console.error('[SSE] Failed to parse message:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('[SSE] Connection error:', error);
        this.handleDisconnect();
      };

    } catch (error) {
      console.error('[SSE] Failed to create EventSource:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private handleEvent(data: any): void {
    const { type } = data;
    
    if (type === 'heartbeat') {
      this.resetHeartbeatMonitor();
      return;
    }

    if (type === 'connected') {
      console.log('[SSE] Server confirmed connection');
      return;
    }

    console.log(`[SSE] Received event: ${type}`, data);

    const typeHandlers = this.handlers[type];
    if (typeHandlers) {
      typeHandlers.forEach(handler => {
        try {
          handler(data.data);
        } catch (error) {
          console.error(`[SSE] Handler error for ${type}:`, error);
        }
      });
    }

    const allHandlers = this.handlers['*'];
    if (allHandlers) {
      allHandlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error('[SSE] Wildcard handler error:', error);
        }
      });
    }
  }

  private handleDisconnect(): void {
    this.isConnecting = false;
    this.stopHeartbeatMonitor();
    
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[SSE] Max reconnection attempts reached');
      return;
    }

    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(`[SSE] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
    
    this.reconnectAttempts++;
    setTimeout(() => this.connect(), delay);
  }

  private startHeartbeatMonitor(): void {
    this.resetHeartbeatMonitor();
  }

  private resetHeartbeatMonitor(): void {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
    }
    this.heartbeatTimeout = setTimeout(() => {
      console.warn('[SSE] No heartbeat received, reconnecting...');
      this.handleDisconnect();
    }, 45000);
  }

  private stopHeartbeatMonitor(): void {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  on(eventType: string, handler: SSEEventHandler): () => void {
    if (!this.handlers[eventType]) {
      this.handlers[eventType] = new Set();
    }
    this.handlers[eventType].add(handler);

    return () => {
      this.handlers[eventType]?.delete(handler);
    };
  }

  off(eventType: string, handler?: SSEEventHandler): void {
    if (!handler) {
      delete this.handlers[eventType];
    } else {
      this.handlers[eventType]?.delete(handler);
    }
  }

  disconnect(): void {
    this.stopHeartbeatMonitor();
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.handlers = {};
    console.log('[SSE] Disconnected');
  }

  isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }
}

export const sseService = new SSEService();

export const connectSSE = () => sseService.connect();
export const disconnectSSE = () => sseService.disconnect();
export const onSSEEvent = (type: string, handler: SSEEventHandler) => sseService.on(type, handler);
export const offSSEEvent = (type: string, handler?: SSEEventHandler) => sseService.off(type, handler);
export const isSSEConnected = () => sseService.isConnected();
