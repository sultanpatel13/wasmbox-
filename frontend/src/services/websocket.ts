import type { ExecutionLog } from "../types/execution";

export type LogHandler = (log: ExecutionLog) => void;

interface WebSocketOptions {
  url?: string;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function connectLogStream(
  onLog: LogHandler,
  options: WebSocketOptions = {}
): () => void {
  const {
    url = import.meta.env.VITE_WS_URL,
    reconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 10,
  } = options;

  let socket: WebSocket | null = null;
  let reconnectAttempts = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let isManuallyClosed = false;
  let mockInterval: ReturnType<typeof setInterval> | null = null;

  const connect = () => {
    if (isManuallyClosed) return;

    if (url) {
      try {
        socket = new WebSocket(url);

        socket.onopen = () => {
          reconnectAttempts = 0;
        };

        socket.onmessage = (event) => {
          try {
            const log = JSON.parse(event.data) as ExecutionLog;
            onLog(log);
          } catch {
            // Ignore malformed messages
          }
        };

        socket.onclose = () => {
          if (!isManuallyClosed && reconnect && reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            reconnectTimer = setTimeout(connect, reconnectInterval * reconnectAttempts);
          }
        };

        socket.onerror = () => {
          // Error handled by onclose
        };
      } catch {
        // Fall back to mock
        startMockStream();
      }
    } else {
      startMockStream();
    }
  };

  const startMockStream = () => {
    mockInterval = setInterval(() => {
      if (!isManuallyClosed) {
        onLog({
          id: crypto.randomUUID(),
          executionId: "exec-live",
          level: "info",
          message: "Mock heartbeat from local log stream",
          timestamp: new Date().toISOString(),
        });
      }
    }, 6000);
  };

  connect();

  return () => {
    isManuallyClosed = true;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (mockInterval) clearInterval(mockInterval);
    if (socket) {
      socket.onclose = null;
      socket.close();
    }
  };
}