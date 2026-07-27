/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { SettingsForm } from './components/SettingsForm';
import { BottomSaveBar } from './components/BottomSaveBar';
import { LogsView } from './components/LogsView';
import { HtmlExportModal } from './components/HtmlExportModal';
import { AgentSettings, ActiveTab } from './types';

const INITIAL_SETTINGS: AgentSettings = {
  botToken: '123456789:AAHxxxxxxxxxxxxxxxxxxxx',
  adminUserId: '987654321',
  llmProvider: 'deepseek',
  deepseekApiKey: 'sk-xxxxxxxxxxxxxxx',
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: 'llama3:latest',
  candidateName: 'Александр Сергеевич',
  githubUrl: 'https://github.com/username',
  mainProjectUrl: 'https://github.com/username/my-pet-project',
  resumeTitle: 'Frontend Developer (React)',
  searchTags: ['Frontend', 'React Developer'],
  regions: {
    moscow: true,
    spb: false,
    remote: true,
    customRegions: []
  },
  coverLetterTemplate: 'Опишите ваш опыт, ключевые навыки и достижения...\nЗдравствуйте! Имею более 3-х лет опыта коммерческой разработки на React, TypeScript, Redux Toolkit и Next.js. Успешно проектировал сложные интерактивные интерфейсы и проводил оптимизацию производительности.'
};

const LOCAL_STORAGE_KEY = 'zgrnk_agent_settings_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('settings');
  const [isBotRunning, setIsBotRunning] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Saved settings in storage
  const [savedSettings, setSavedSettings] = useState<AgentSettings>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load settings from storage:', e);
    }
    return INITIAL_SETTINGS;
  });

  // Current edited settings form state
  const [currentSettings, setCurrentSettings] = useState<AgentSettings>(savedSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Compare if settings have unsaved modifications
  const hasUnsavedChanges = JSON.stringify(currentSettings) !== JSON.stringify(savedSettings);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentSettings));
        setSavedSettings(currentSettings);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } catch (e) {
        console.error('Error saving settings:', e);
      } finally {
        setIsSaving(false);
      }
    }, 400);
  };

  const handleReset = () => {
    setCurrentSettings(savedSettings);
  };

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
        setIsBotRunning={setIsBotRunning}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Workspace */}
      <main className="lg:ml-[280px] flex-1 flex flex-col min-h-screen relative w-full">
        <TopHeader
          activeTab={activeTab}
          isBotRunning={isBotRunning}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenExportModal={() => setIsExportModalOpen(true)}
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
              setIsBotRunning={setIsBotRunning}
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

      {/* Export to HTML Modal */}
      <HtmlExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        settings={currentSettings}
      />
    </div>
  );
}
