import { LogMessage } from '../types';

// Формат из main.py: logging.basicConfig(format="%(asctime)s %(levelname)s %(name)s: %(message)s")
// Пример: "2026-07-27 20:31:04,512 INFO hh_client: Вакансия подходит: Backend Developer"
const LOG_LINE_RE = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3}) (\w+) ([\w.]+): ([\s\S]*)$/;

const SUCCESS_HINTS = ['✅', 'Отклик отправлен', 'Авторизация успешна', 'Капча пройдена'];

let counter = 0;
function nextId(): string {
  counter += 1;
  return `log-${Date.now()}-${counter}`;
}

export function parseLogLine(rawLine: string): LogMessage | null {
  const line = rawLine.replace(/\r?\n$/, '');
  if (!line.trim()) return null;

  const match = line.match(LOG_LINE_RE);
  if (!match) {
    // Строка без префикса (например, продолжение traceback) — покажем как есть.
    return { id: nextId(), timestamp: '', level: 'info', message: line };
  }

  const [, timestamp, levelName, , message] = match;
  let level: LogMessage['level'] = 'info';
  if (levelName === 'WARNING') level = 'warn';
  else if (levelName === 'ERROR' || levelName === 'CRITICAL') level = 'error';
  if (SUCCESS_HINTS.some((hint) => message.includes(hint))) level = 'success';

  return {
    id: nextId(),
    timestamp: timestamp.split(',')[0].split(' ')[1] || timestamp,
    level,
    message,
  };
}
