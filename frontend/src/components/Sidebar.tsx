import React from 'react';
import { Settings, Terminal, Play, Square, Bot } from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isBotRunning: boolean;
  setIsBotRunning: (running: boolean) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isBotRunning,
  setIsBotRunning,
  isOpenMobile = false,
  onCloseMobile
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={onCloseMobile}
        />
      )}

      <nav className={`
        bg-[#20201f] text-[#e5e2e1] w-[280px] h-screen fixed left-0 top-0 border-r border-[#5a4137]/40 z-50 flex flex-col py-4
        transition-transform duration-300 ease-in-out
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#1E1E1E] border border-[#2A2A2A] flex items-center justify-center text-[#ffb596] shadow-sm">
            <Bot className="w-6 h-6 text-[#ff6b1a]" />
          </div>
          <div>
            <h1 className="font-semibold text-lg leading-tight text-[#ffb596]">ZGRNK HH Agent</h1>
            <p className="text-xs text-[#888888] mt-0.5 font-medium tracking-wide">v1.0.4</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-col gap-1.5 px-3">
          <button
            onClick={() => {
              setActiveTab('settings');
              onCloseMobile?.();
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 w-full text-left ${
              activeTab === 'settings'
                ? 'text-[#ffb596] bg-[#2a2a2a] border-r-2 border-[#ff6b1a]'
                : 'text-[#e2bfb2] hover:text-[#e5e2e1] hover:bg-[#353535]/50'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Настройки</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('logs');
              onCloseMobile?.();
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 w-full text-left ${
              activeTab === 'logs'
                ? 'text-[#ffb596] bg-[#2a2a2a] border-r-2 border-[#ff6b1a]'
                : 'text-[#e2bfb2] hover:text-[#e5e2e1] hover:bg-[#353535]/50'
            }`}
          >
            <Terminal className="w-5 h-5" />
            <span>Логи и запуск</span>
            {isBotRunning && (
              <span className="ml-auto flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6B1A] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF6B1A]"></span>
              </span>
            )}
          </button>
        </div>

        {/* Bottom Bot Action */}
        <div className="mt-auto px-6 mb-4">
          <button
            onClick={() => setIsBotRunning(!isBotRunning)}
            className={`w-full text-white text-sm font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg ${
              isBotRunning 
                ? 'bg-rose-600 hover:bg-rose-700' 
                : 'bg-[#ff6b1a] hover:bg-opacity-90'
            }`}
          >
            {isBotRunning ? (
              <>
                <Square className="w-4 h-4 fill-white" />
                <span>Остановить бота</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Запустить бота</span>
              </>
            )}
          </button>
        </div>
      </nav>
    </>
  );
};
