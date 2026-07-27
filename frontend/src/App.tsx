/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { SettingsForm } from './components/SettingsForm';
import { BottomSaveBar } from './components/BottomSaveBar';
import { LogsView } from './components/LogsView';
import { AgentSettings, ActiveTab } from './types';
import { api, onAgentStatus, whenApiReady } from './bridge';

const EMPTY_SETTINGS: AgentSettings = {
  botToken: '',
  adminUserId: '',
  llmProvider: 'deepseek',
  deepseekApiKey: '',
  ollamaUrl: '',
  ollamaModel: '',
  candidateName: '',
  githubUrl: '',
  resumeTitle: '',
  searchTags: [],
  regions: {
    moscow: false,
    spb: true,
    remote: true,
    customRegions: [],
  },
  coverLetterTemplate: '',
};

// env-ключи, которые форма не редактирует (DEEPSEEK_MODEL и т.п.) — сохраняем как есть.
function envToSettings(env: Record<string, string>): AgentSettings {
  return {
    botToken: env.TG_BOT_TOKEN || '',
    adminUserId: env.TG_USER_ID || '',
    llmProvider: env.LLM_PROVIDER === 'ollama' ? 'ollama' : 'deepseek',
    deepseekApiKey: env.DEEPSEEK_API_KEY || '',
    ollamaUrl: env.OLLAMA_URL || '',
    ollamaModel: env.OLLAMA_MODEL || '',
    candidateName: env.MY_NAME || '',
    githubUrl: env.MY_GITHUB || '',
    resumeTitle: env.TARGET_RESUME_NAME || '',
    searchTags: (env.SEARCH_QUERIES || '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
    regions: {
      moscow: env.SEARCH_REGION_MOSCOW === 'true',
      spb: env.SEARCH_REGION_SPB !== 'false',
      remote: env.SEARCH_REGION_REMOTE !== 'false',
      customRegions: [],
    },
    coverLetterTemplate: env.MY_RESUME_SUMMARY || '',
  };
}

function settingsToEnvPatch(s: AgentSettings): Record<string, string> {
  return {
    TG_BOT_TOKEN: s.botToken,
    TG_USER_ID: s.adminUserId,
    LLM_PROVIDER: s.llmProvider,
    DEEPSEEK_API_KEY: s.deepseekApiKey,
    OLLAMA_URL: s.ollamaUrl,
    OLLAMA_MODEL: s.ollamaModel,
    MY_NAME: s.candidateName,
    MY_GITHUB: s.githubUrl,
    TARGET_RESUME_NAME: s.resumeTitle,
    SEARCH_QUERIES: s.searchTags.join('\n'),
    MY_RESUME_SUMMARY: s.coverLetterTemplate,
    SEARCH_REGION_MOSCOW: String(s.regions.moscow),
    SEARCH_REGION_SPB: String(s.regions.spb),
    SEARCH_REGION_REMOTE: String(s.regions.remote),
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('settings');
  const [isBotRunning, setIsBotRunning] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const [rawEnv, setRawEnv] = useState<Record<string, string>>({});
  const [savedSettings, setSavedSettings] = useState<AgentSettings>(EMPTY_SETTINGS);
  const [currentSettings, setCurrentSettings] = useState<AgentSettings>(EMPTY_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const hasUnsavedChanges = JSON.stringify(currentSettings) !== JSON.stringify(savedSettings);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    whenApiReady().then(async () => {
      const cfg = await api().get_config();
      const { running, ...env } = cfg as { running: boolean } & Record<string, string>;
      const settings = envToSettings(env);
      setRawEnv(env);
      setSavedSettings(settings);
      setCurrentSettings(settings);
      setIsBotRunning(!!running);
      setIsLoaded(true);

      unsubscribe = onAgentStatus((running) => setIsBotRunning(running));
    });

    return () => unsubscribe?.();
  }, []);

  const buildEnvPayload = (settings: AgentSettings) => ({
    ...rawEnv,
    ...settingsToEnvPatch(settings),
  });

  const handleSave = () => {
    setIsSaving(true);
    api()
      .save_config(buildEnvPayload(currentSettings))
      .then(() => {
        setRawEnv((prev) => ({ ...prev, ...settingsToEnvPatch(currentSettings) }));
        setSavedSettings(currentSettings);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      })
      .catch((e) => console.error('Не удалось сохранить настройки:', e))
      .finally(() => setIsSaving(false));
  };

  const handleReset = () => {
    setCurrentSettings(savedSettings);
  };

  const startBot = async () => {
    const res = await api().start_bot(buildEnvPayload(currentSettings));
    if (!res.ok) {
      console.error('Не удалось запустить бота:', res.error);
      return;
    }
    setSavedSettings(currentSettings);
    setIsBotRunning(true);
  };

  const stopBot = async () => {
    await api().stop_bot();
    setIsBotRunning(false);
  };

  const toggleBot = () => {
    if (isBotRunning) {
      stopBot();
    } else {
      startBot();
    }
  };

  if (!isLoaded) {
    return (
      <div className="bg-[#0D0D0D] text-[#e5e2e1] min-h-screen flex items-center justify-center font-sans text-sm text-[#888888]">
        Загрузка конфигурации...
      </div>
    );
  }

  return (
    <div className="bg-[#0D0D0D] text-[#e5e2e1] min-h-screen flex selection:bg-[#FF6B1A] selection:text-white font-sans">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-950 border border-emerald-500 text-emerald-200 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm animate-in fade-in slide-in-from-top duration-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Конфигурация ZGRNK HH Agent успешно сохранена!</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isBotRunning={isBotRunning}
        setIsBotRunning={toggleBot}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Workspace */}
      <main className="lg:ml-[280px] flex-1 flex flex-col min-h-screen relative w-full">
        <TopHeader
          activeTab={activeTab}
          isBotRunning={isBotRunning}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          hasUnsavedChanges={hasUnsavedChanges}
        />

        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
          {activeTab === 'settings' ? (
            <div className="pb-32">
              <SettingsForm
                settings={currentSettings}
                onChange={setCurrentSettings}
              />
            </div>
          ) : (
            <LogsView
              isBotRunning={isBotRunning}
              setIsBotRunning={toggleBot}
              botToken={currentSettings.botToken}
              candidateName={currentSettings.candidateName}
            />
          )}
        </div>

        {/* Sticky Footer Bar for Settings view */}
        {activeTab === 'settings' && (
          <BottomSaveBar
            hasUnsavedChanges={hasUnsavedChanges}
            onSave={handleSave}
            onReset={handleReset}
            isSaving={isSaving}
          />
        )}
      </main>
    </div>
  );
}
