export type LlmProvider = 'deepseek' | 'ollama';

export interface AgentSettings {
  // Telegram
  botToken: string;
  adminUserId: string;

  // LLM
  llmProvider: LlmProvider;
  deepseekApiKey: string;
  ollamaUrl: string;
  ollamaModel: string;

  // Candidate profile
  candidateName: string;
  githubUrl: string;
  mainProjectUrl: string;
  resumeTitle: string;

  // Search parameters
  searchTags: string[];
  regions: {
    moscow: boolean;
    spb: boolean;
    remote: boolean;
    customRegions: string[];
  };

  // Cover letter / Resume context
  coverLetterTemplate: string;
}

export interface LogMessage {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
  company?: string;
  vacancy?: string;
}

export type ActiveTab = 'settings' | 'logs';
