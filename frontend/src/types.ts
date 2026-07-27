export type LlmProvider = 'deepseek' | 'ollama';

export interface ResumeProfile {
  id: string;
  name: string; // точное название резюме на hh.ru
  searchTags: string[]; // поисковые запросы для этого резюме
  resumeSummary: string; // текст резюме — контекст для LLM
}

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

  // Регионы — общие для всех резюме-профилей
  regions: {
    moscow: boolean;
    spb: boolean;
    remote: boolean;
    customRegions: string[];
  };

  // Один или несколько профилей резюме — бот ищет и откликается по каждому отдельно
  resumeProfiles: ResumeProfile[];
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
