export type ActiveTab = 'logs' | 'settings';

export type BotStatus = 'stopped' | 'running' | 'paused';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SYS';
  message: string;
  highlightedText?: string;
  jobId?: string;
}

export interface BotSettings {
  hhToken: string;
  profileName: string;
  targetRole: string;
  location: string;
  desiredSalary: number;
  coverLetter: string;
  maxDailyApplications: number;
  delayBetweenAppsSeconds: number;
  skipWithTests: boolean;
  blacklistedCompanies: string;
  blacklistedKeywords: string;
  autoResponseEnabled: boolean;
}

export interface BotStats {
  appliedToday: number;
  inQueue: number;
  lastRunTime: string;
  successRatePercent: number;
}
