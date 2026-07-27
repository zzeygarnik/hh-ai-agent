import React from 'react';
import { ActiveTab, BotStatus } from '../types';
import { Settings, Terminal, Play, Square, Code, ShieldCheck } from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  botStatus: BotStatus;
  toggleBot: () => void;
  onOpenExportModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  botStatus,
  toggleBot,
  onOpenExportModal,
}) => {
  const isRunning = botStatus === 'running';

  return (
    <nav className="w-[280px] shrink-0 h-screen bg-[#20201f] border-r border-[#5a4137]/40 z-50 flex flex-col py-4 select-none">
      {/* Header */}
      <div className="px-6 mb-8 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-[#1E1E1E] border border-[#2A2A2A] flex items-center justify-center shrink-0 shadow-md">
          <span className="font-bold text-xl text-[#ffb596] tracking-tight">Z</span>
        </div>
        <div>
          <h1 className="font-bold text-[#ffb596] text-lg leading-tight tracking-tight">
            ZGRNK HH Agent
          </h1>
          <p className="text-xs text-[#888888] flex items-center gap-1 mt-0.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#ffb596]/80 inline" />
            v1.0.4 Premium
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex-1 px-3 space-y-1">
        {/* Настройки (Settings) */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 rounded-lg cursor-pointer active:scale-98 ${
            activeTab === 'settings'
              ? 'text-[#ffb596] bg-[#2a2a2a] border-r-2 border-[#ff6b1a] font-semibold shadow-sm'
              : 'text-[#e2bfb2] hover:text-[#e5e2e1] hover:bg-[#353535]/50'
          }`}
        >
          <Settings className={`w-5 h-5 ${activeTab === 'settings' ? 'text-[#ffb596]' : 'text-[#e2bfb2]'}`} />
          <span>Настройки</span>
        </button>

        {/* Логи и запуск (Logs & Run) */}
        <button
          onClick={() => setActiveTab('logs')}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 rounded-lg cursor-pointer active:scale-98 ${
            activeTab === 'logs'
              ? 'text-[#ffb596] bg-[#2a2a2a] border-r-2 border-[#ff6b1a] font-semibold shadow-sm'
              : 'text-[#e2bfb2] hover:text-[#e5e2e1] hover:bg-[#353535]/50'
          }`}
        >
          <Terminal className={`w-5 h-5 ${activeTab === 'logs' ? 'text-[#ffb596]' : 'text-[#e2bfb2]'}`} />
          <span>Логи и запуск</span>
        </button>

        {/* HTML + Tailwind Export Quick Button */}
        <div className="pt-4 mt-2 border-t border-[#2A2A2A]/80 px-1">
          <button
            onClick={onOpenExportModal}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs text-[#8dcdff] bg-[#00344f]/30 border border-[#00a2eb]/30 hover:bg-[#00344f]/60 hover:border-[#00a2eb]/60 rounded-lg transition-all duration-200 cursor-pointer active:scale-95"
            title="Экспорт в HTML + Tailwind CSS"
          >
            <Code className="w-4 h-4 text-[#8dcdff]" />
            <span className="font-medium">Экспорт в HTML + Tailwind</span>
          </button>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-4 mt-auto space-y-2">
        <button
          onClick={toggleBot}
          className={`w-full text-[#0D0D0D] font-medium text-xs py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer active:scale-95 ${
            isRunning
              ? 'bg-[#ffb4ab] hover:bg-[#ffdad6] text-[#690005] shadow-lg shadow-red-950/30'
              : 'bg-[#ff6b1a] hover:bg-[#ffb596] text-[#0D0D0D] font-semibold shadow-lg shadow-orange-950/40'
          }`}
        >
          {isRunning ? (
            <>
              <Square className="w-4 h-4 fill-current" />
              <span>Остановить бота</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Запустить бота</span>
            </>
          )}
        </button>
      </div>
    </nav>
  );
};
