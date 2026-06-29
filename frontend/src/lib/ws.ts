import type { WsMessage } from "@/types";

type MessageHandler = (msg: WsMessage) => void;
type StatusHandler = (connected: boolean) => void;

export function connectJobWs(
  jobId: string,
  onMessage: MessageHandler,
  onStatus?: StatusHandler
): () => void {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host;
  const ws = new WebSocket(`${protocol}//${host}/api/v1/ws/${jobId}`);

  ws.onopen = () => onStatus?.(true);
  ws.onclose = () => onStatus?.(false);

  ws.onmessage = (event) => {
    try {
      const msg: WsMessage = JSON.parse(event.data);
      onMessage(msg);
    } catch {
      // ignore malformed messages
    }
  };

  ws.onerror = () => {
    onStatus?.(false);
  };

  return () => ws.close();
}
