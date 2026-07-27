/**
 * Мост между Python-бекендом (gui_app.py, pywebview) и React.
 *
 * gui_app.py вызывает window.appendLog(line) / window.setStatus(running)
 * через window.evaluate_js() из фонового потока, читающего stdout main.py.
 * Здесь эти глобальные функции регистрируются и раздаются подписчикам
 * через простой pub/sub, чтобы компоненты могли на них подписаться в useEffect.
 */

type LogListener = (line: string) => void;
type StatusListener = (running: boolean) => void;

const logListeners = new Set<LogListener>();
const statusListeners = new Set<StatusListener>();

// Буфер живёт вне React-дерева, поэтому переключение вкладок (LogsView
// монтируется/размонтируется) не теряет строки, пришедшие, пока панель была скрыта.
const MAX_BUFFERED_LOGS = 500;
const logBuffer: string[] = [];

declare global {
  interface Window {
    appendLog: (line: string) => void;
    setStatus: (running: boolean) => void;
    pywebview?: {
      api: {
        get_config: () => Promise<Record<string, any>>;
        save_config: (data: Record<string, string>) => Promise<{ ok: boolean; error?: string }>;
        start_bot: (data: Record<string, string>) => Promise<{ ok: boolean; error?: string }>;
        stop_bot: () => Promise<{ ok: boolean }>;
        get_status: () => Promise<{ running: boolean }>;
        import_resume_pdf: (
          filename: string,
          base64Content: string
        ) => Promise<{ ok: boolean; text?: string; error?: string }>;
        import_resumes_from_hh: () => Promise<{
          ok: boolean;
          resumes?: { name: string; summary: string }[];
          error?: string;
        }>;
      };
    };
  }
}

window.appendLog = (line: string) => {
  logBuffer.push(line);
  if (logBuffer.length > MAX_BUFFERED_LOGS) logBuffer.shift();
  logListeners.forEach((fn) => fn(line));
};

export function getBufferedLogs(): string[] {
  return logBuffer;
}

window.setStatus = (running: boolean) => {
  statusListeners.forEach((fn) => fn(running));
};

export function onAgentLog(fn: LogListener): () => void {
  logListeners.add(fn);
  return () => logListeners.delete(fn);
}

export function onAgentStatus(fn: StatusListener): () => void {
  statusListeners.add(fn);
  return () => statusListeners.delete(fn);
}

export function whenApiReady(): Promise<void> {
  if (window.pywebview?.api) return Promise.resolve();
  return new Promise((resolve) => {
    window.addEventListener('pywebviewready', () => resolve(), { once: true });
  });
}

export function api() {
  if (!window.pywebview?.api) {
    throw new Error('pywebview API ещё не готов');
  }
  return window.pywebview.api;
}
