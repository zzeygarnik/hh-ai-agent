import { LogEntry } from '../types';

export const initialLogs: LogEntry[] = [
  {
    id: 'log-1',
    timestamp: '10:15:02',
    level: 'SYS',
    message: 'System initialization started...',
  },
  {
    id: 'log-2',
    timestamp: '10:15:05',
    level: 'INFO',
    message: 'Loading configuration from /settings.yaml',
  },
  {
    id: 'log-3',
    timestamp: '10:15:06',
    level: 'INFO',
    message: 'Connected to HH.ru API (Session ID: x8f9...2a)',
  },
  {
    id: 'log-4',
    timestamp: '10:15:12',
    level: 'WARN',
    message: 'Rate limit threshold approaching. Backing off for 500ms.',
  },
  {
    id: 'log-5',
    timestamp: '10:15:15',
    level: 'INFO',
    message: "Fetched 42 new job listings matching profile 'Frontend Developer'.",
  },
  {
    id: 'log-6',
    timestamp: '10:15:22',
    level: 'ERROR',
    message: 'Failed to apply for JobID: 104592. Response: 403 Forbidden.',
    highlightedText: 'Failed to apply for JobID: 104592. Response: 403 Forbidden.',
    jobId: '104592',
  },
  {
    id: 'log-7',
    timestamp: '10:15:23',
    level: 'SYS',
    message: 'Agent stopped by user request. Terminating threads...',
  },
];
