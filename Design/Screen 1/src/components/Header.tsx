import React, { useState } from 'react';
import { ActiveTab, BotStatus } from '../types';
import { Bell, User, Code, Check } from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  botStatus: BotStatus;
  onOpenExportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  botStatus,
  onOpenExportModal,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  return (
    <header className="h-16 shrink-0 w-full z-40 bg-[#0D0D0D] border-b border-[#5a4137]/40 flex items-center justify-between px-8">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-medium text-[#e5e2e1]">
          {activeTab === 'logs' ? 'Рабочая панель' : 'Настройки бота'}
        </h2>
        {botStatus === 'running' && (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ff6b1a]/15 text-[#ffb596] border border-[#ff6b1a]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b1a] animate-ping" />
            Бот активен
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Export HTML button */}
        <button
          onClick={onOpenExportModal}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#e5e2e1] bg-[#1E1E1E] border border-[#2A2A2A] hover:border-[#ff6b1a]/50 hover:text-[#ffb596] rounded-lg transition-all active:scale-95 cursor-pointer"
        >
          <Code className="w-3.5 h-3.5 text-[#ff6b1a]" />
          <span>Экспорт в HTML + Tailwind</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setHasUnread(false);
            }}
            className="text-[#e2bfb2] hover:text-[#ffb596] transition-all w-10 h-10 rounded-full hover:bg-[#353535] flex items-center justify-center relative cursor-pointer active:scale-95"
            title="Уведомления"
          >
            <Bell className="w-5 h-5" />
            {hasUnread && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#ff6b1a] ring-2 ring-[#0D0D0D]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2A2A2A]">
                <h4 className="text-xs font-semibold uppercase text-[#888888] tracking-wider">
                  Уведомления
                </h4>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-[#ffb596] hover:underline"
                >
                  Закрыть
                </button>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded bg-[#20201f] border border-[#2A2A2A]">
                  <p className="text-[#e5e2e1] font-medium">Сессия HH.ru активна</p>
                  <p className="text-[#888888] text-[11px] mt-0.5">Токен авторизован. 12 вакансий в очереди.</p>
                </div>
                <div className="p-2 rounded bg-[#20201f] border border-[#2A2A2A]">
                  <p className="text-[#ffb4ab] font-medium">Rate limit 500ms</p>
                  <p className="text-[#888888] text-[11px] mt-0.5">Автоматическая задержка откликов для защиты аккаунта.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Account */}
        <button
          className="text-[#e2bfb2] hover:text-[#ffb596] transition-all w-10 h-10 rounded-full hover:bg-[#353535] flex items-center justify-center cursor-pointer active:scale-95"
          title="Профиль агента"
        >
          <User className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
