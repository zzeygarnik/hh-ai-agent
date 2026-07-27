import React from 'react';
import { Menu, RefreshCw } from 'lucide-react';
import { ActiveTab } from '../types';

interface TopHeaderProps {
  activeTab: ActiveTab;
  isBotRunning: boolean;
  onOpenMobileMenu: () => void;
  hasUnsavedChanges: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  isBotRunning,
  onOpenMobileMenu,
  hasUnsavedChanges
}) => {
  return (
    <header className="h-16 w-full sticky top-0 z-40 bg-[#0D0D0D]/90 border-b border-[#2A2A2A] flex items-center justify-between px-4 lg:px-8 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-[#e5e2e1] hover:bg-[#1E1E1E]"
          aria-label="Открыть меню"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold text-[#e5e2e1]">
          {activeTab === 'settings' ? 'Конфигурация агента' : 'Логи работы и активность HH'}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Статус — просто точка + текст, без плашки-бейджа */}
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className={`w-1.5 h-1.5 rounded-full ${isBotRunning ? 'bg-[#FF6B1A]' : 'bg-[#555555]'}`} />
          <span className={isBotRunning ? 'text-[#e5e2e1]' : 'text-[#888888]'}>
            {isBotRunning ? 'Бот работает' : 'Бот остановлен'}
          </span>
        </div>

        {hasUnsavedChanges && (
          <span className="flex items-center gap-1.5 text-xs text-[#FF6B1A] bg-[#FF6B1A]/10 px-2.5 py-1 rounded-md border border-[#FF6B1A]/30 font-medium">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span className="hidden sm:inline">Не сохранено</span>
          </span>
        )}
      </div>
    </header>
  );
};
