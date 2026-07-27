import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardTab } from './components/DashboardTab';
import { SettingsTab } from './components/SettingsTab';
import { ExportModal } from './components/ExportModal';
import { ActiveTab, BotStatus, LogEntry, BotSettings, BotStats } from './types';
import { initialLogs } from './data/initialLogs';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('logs');
  const [botStatus, setBotStatus] = useState<BotStatus>('stopped');
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const [stats, setStats] = useState<BotStats>({
    appliedToday: 0,
    inQueue: 12,
    lastRunTime: 'Вчера 18:30',
    successRatePercent: 94,
  });

  const [settings, setSettings] = useState<BotSettings>({
    hhToken: 'hh_token_x8f92a93817412e',
    profileName: 'Frontend Developer Profile',
    targetRole: 'Frontend Developer, React Developer',
    location: 'Москва / Удаленно',
    desiredSalary: 180000,
    coverLetter:
      'Здравствуйте! Меня заинтересовала ваша вакансия {vacancy} в компании {company}. Имею большой опыт коммерческой разработки на React, TypeScript и Tailwind CSS.',
    maxDailyApplications: 50,
    delayBetweenAppsSeconds: 3,
    skipWithTests: true,
    blacklistedCompanies: 'ООО Скамер, NoPay Ltd',
    blacklistedKeywords: 'стажер, 1С, без опыта',
    autoResponseEnabled: true,
  });

  // Simulated bot execution when running
  useEffect(() => {
    if (botStatus !== 'running') return;

    const vacanciesSample = [
      { title: 'Frontend Developer (React)', company: 'Тинькофф', id: '104601' },
      { title: 'Senior React Engineer', company: 'Яндекс Практикум', id: '104602' },
      { title: 'Middle Frontend Разработчик', company: 'Авито', id: '104603' },
      { title: 'Lead Web Developer', company: 'VK', id: '104604' },
      { title: 'Fullstack React/Node Developer', company: 'Ozon', id: '104605' },
    ];

    let stepIndex = 0;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      const currentItem = vacanciesSample[stepIndex % vacanciesSample.length];
      stepIndex++;

      // Create log entries
      const newLog1: LogEntry = {
        id: `sim-log-${Date.now()}-1`,
        timestamp: timeStr,
        level: 'INFO',
        message: `Analyzing vacancy: '${currentItem.title}' at '${currentItem.company}' (ID: ${currentItem.id})`,
      };

      const isSuccess = Math.random() > 0.15;

      const newLog2: LogEntry = isSuccess
        ? {
            id: `sim-log-${Date.now()}-2`,
            timestamp: timeStr,
            level: 'INFO',
            message: `Successfully sent application for JobID: ${currentItem.id} with custom cover letter.`,
            jobId: currentItem.id,
          }
        : {
            id: `sim-log-${Date.now()}-2`,
            timestamp: timeStr,
            level: 'WARN',
            message: `Vacancy JobID: ${currentItem.id} requires mandatory test. Skipped per configuration rule.`,
            jobId: currentItem.id,
          };

      setLogs((prev) => [...prev, newLog1, newLog2]);

      if (isSuccess) {
        setStats((prev) => ({
          ...prev,
          appliedToday: prev.appliedToday + 1,
          inQueue: Math.max(0, prev.inQueue - 1),
          lastRunTime: `Сегодня ${timeStr.slice(0, 5)}`,
        }));
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [botStatus]);

  const toggleBot = () => {
    if (botStatus === 'running') {
      stopBot();
    } else {
      startBot();
    }
  };

  const startBot = () => {
    setBotStatus('running');
    const nowStr = new Date().toTimeString().split(' ')[0];
    setLogs((prev) => [
      ...prev,
      {
        id: `sys-start-${Date.now()}`,
        timestamp: nowStr,
        level: 'SYS',
        message: 'Agent started by user. Initializing search parameters...',
      },
      {
        id: `sys-start-info-${Date.now()}`,
        timestamp: nowStr,
        level: 'INFO',
        message: `Active target query: '${settings.targetRole}'. Delay: ${settings.delayBetweenAppsSeconds}s.`,
      },
    ]);
  };

  const stopBot = () => {
    setBotStatus('stopped');
    const nowStr = new Date().toTimeString().split(' ')[0];
    setLogs((prev) => [
      ...prev,
      {
        id: `sys-stop-${Date.now()}`,
        timestamp: nowStr,
        level: 'SYS',
        message: 'Agent stopped by user request. Terminating active requests...',
      },
    ]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const addManualLog = (level: 'INFO' | 'WARN' | 'ERROR', message: string) => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    setLogs((prev) => [
      ...prev,
      {
        id: `manual-${Date.now()}`,
        timestamp: timeStr,
        level,
        message,
      },
    ]);
  };

  const handleSaveSettings = (newSettings: BotSettings) => {
    setSettings(newSettings);
  };

  return (
    <div className="bg-[#0D0D0D] text-[#e5e2e1] h-screen overflow-hidden flex font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        botStatus={botStatus}
        toggleBot={toggleBot}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          botStatus={botStatus}
          onOpenExportModal={() => setIsExportModalOpen(true)}
        />

        {/* Main View Canvas */}
        <main className="flex-1 overflow-y-auto p-8">
          {activeTab === 'logs' ? (
            <DashboardTab
              botStatus={botStatus}
              toggleBot={toggleBot}
              stopBot={stopBot}
              startBot={startBot}
              logs={logs}
              stats={stats}
              clearLogs={clearLogs}
              addManualLog={addManualLog}
            />
          ) : (
            <SettingsTab
              settings={settings}
              onSaveSettings={handleSaveSettings}
            />
          )}
        </main>
      </div>

      {/* HTML + Tailwind CSS Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        logs={logs}
        stats={stats}
        settings={settings}
        botStatus={botStatus === 'running' ? 'running' : 'stopped'}
      />
    </div>
  );
}
