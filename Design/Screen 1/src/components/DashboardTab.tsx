import React, { useRef, useEffect } from 'react';
import { BotStatus, LogEntry, BotStats } from '../types';
import {
  Play,
  Square,
  Send,
  Clock,
  Trash2,
  ListOrdered,
  Terminal,
  PlusCircle,
  Copy,
  Check,
  Zap,
} from 'lucide-react';

interface DashboardTabProps {
  botStatus: BotStatus;
  toggleBot: () => void;
  stopBot: () => void;
  startBot: () => void;
  logs: LogEntry[];
  stats: BotStats;
  clearLogs: () => void;
  addManualLog: (level: 'INFO' | 'WARN' | 'ERROR', message: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  botStatus,
  toggleBot,
  stopBot,
  startBot,
  logs,
  stats,
  clearLogs,
  addManualLog,
}) => {
  const isRunning = botStatus === 'running';
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [copiedLogs, setCopiedLogs] = React.useState(false);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleCopyLogs = () => {
    const text = logs
      .map((l) => `[${l.timestamp}] ${l.level}: ${l.message}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2000);
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Section: Status & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Card */}
        <div className="lg:col-span-1 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-6 flex flex-col justify-center shadow-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#353535]/20 to-transparent pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="font-medium text-xs text-[#888888] mb-1 uppercase tracking-wider">
                Текущий статус
              </p>
              <div className="flex items-center gap-3 mt-2">
                <div
                  className={`w-3.5 h-3.5 rounded-full ${
                    isRunning
                      ? 'bg-[#ff6b1a] pulse-indicator border border-[#ffb596]'
                      : 'bg-[#353535] border border-[#a98a7e]'
                  }`}
                />
                <h3
                  className={`font-semibold text-3xl tracking-tight ${
                    isRunning ? 'text-[#ffb596]' : 'text-[#e2bfb2]'
                  }`}
                >
                  {isRunning ? 'Запущен' : 'Остановлен'}
                </h3>
              </div>
            </div>
            {isRunning && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff6b1a]/10 border border-[#ff6b1a]/30 text-[#ffb596] text-xs font-mono">
                <Zap className="w-3.5 h-3.5 text-[#ff6b1a] animate-bounce" />
                <span>HH API Active</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="lg:col-span-2 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-6 flex items-center justify-end gap-4 shadow-lg">
          <button
            onClick={stopBot}
            disabled={!isRunning}
            className={`px-6 py-3 rounded-lg border text-xs font-medium transition-all flex items-center gap-2 cursor-pointer active:scale-95 ${
              isRunning
                ? 'border-[#2A2A2A] text-[#e2bfb2] hover:bg-[#353535] hover:text-[#e5e2e1]'
                : 'border-[#2A2A2A]/50 text-[#888888]/50 cursor-not-allowed'
            }`}
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Остановить</span>
          </button>

          <button
            onClick={startBot}
            disabled={isRunning}
            className={`px-8 py-3 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-md ${
              !isRunning
                ? 'bg-[#ff6b1a] text-[#0D0D0D] hover:bg-[#ffb596] hover:shadow-[0_0_15px_rgba(255,107,26,0.4)]'
                : 'bg-[#ff6b1a]/30 text-[#0D0D0D]/50 cursor-not-allowed'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Запустить бота</span>
          </button>
        </div>
      </div>

      {/* Stats Row (Bento Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-5 hover:border-[#5a4137] transition-all group shadow-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-[#888888] font-medium">Откликов сегодня</span>
            <Send className="w-5 h-5 text-[#e2bfb2] group-hover:text-[#ffb596] transition-colors" />
          </div>
          <div className="font-semibold text-3xl text-[#e5e2e1] tracking-tight">
            {stats.appliedToday}
          </div>
        </div>

        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-5 hover:border-[#5a4137] transition-all group shadow-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-[#888888] font-medium">В очереди</span>
            <ListOrdered className="w-5 h-5 text-[#e2bfb2] group-hover:text-[#ffb596] transition-colors" />
          </div>
          <div className="font-semibold text-3xl text-[#e5e2e1] tracking-tight">
            {stats.inQueue}
          </div>
        </div>

        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-5 hover:border-[#5a4137] transition-all group shadow-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-[#888888] font-medium">Последний запуск</span>
            <Clock className="w-5 h-5 text-[#e2bfb2] group-hover:text-[#ffb596] transition-colors" />
          </div>
          <div className="text-base font-medium text-[#e5e2e1] mt-2">
            {stats.lastRunTime}
          </div>
        </div>
      </div>

      {/* Terminal Log Panel */}
      <div className="bg-[#000000] border border-[#2A2A2A] rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col h-[420px]">
        {/* Terminal Header */}
        <div className="bg-[#1E1E1E] border-b border-[#2A2A2A] px-4 py-2.5 flex items-center justify-between select-none">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#93000a] border border-[#ffb4ab]/30" />
            <div className="w-3 h-3 rounded-full bg-[#ae4f00] border border-[#ffb68d]/30" />
            <div className="w-3 h-3 rounded-full bg-[#353535] border border-[#a98a7e]/30" />
          </div>

          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-[#888888]" />
            <span className="font-mono text-xs text-[#888888]">
              zgrnk_agent_process.log
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick manual log simulation buttons */}
            <button
              onClick={() =>
                addManualLog(
                  'INFO',
                  `Fetched ${Math.floor(Math.random() * 20 + 5)} new vacancies from HH.ru search`
                )
              }
              className="p-1 text-[#888888] hover:text-[#8dcdff] transition-colors rounded hover:bg-[#353535]"
              title="Добавить INFO лог"
            >
              <PlusCircle className="w-4 h-4" />
            </button>

            <button
              onClick={handleCopyLogs}
              className="p-1 text-[#888888] hover:text-[#ffb596] transition-colors rounded hover:bg-[#353535]"
              title="Скопировать логи"
            >
              {copiedLogs ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={clearLogs}
              className="p-1 text-[#888888] hover:text-[#ffb4ab] transition-colors rounded hover:bg-[#353535]"
              title="Очистить логи"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Terminal Output */}
        <div className="flex-1 p-4 font-mono text-xs overflow-y-auto terminal-scroll leading-relaxed space-y-1">
          {logs.map((log) => {
            let levelBadge = null;
            if (log.level === 'INFO') {
              levelBadge = <span className="text-[#8dcdff]">INFO:</span>;
            } else if (log.level === 'WARN') {
              levelBadge = <span className="text-[#ff6b1a] font-medium">WARN:</span>;
            } else if (log.level === 'ERROR') {
              levelBadge = <span className="text-[#ffb4ab] font-bold">ERROR:</span>;
            }

            return (
              <div
                key={log.id}
                className={`flex items-start gap-2 ${
                  log.level === 'SYS' ? 'opacity-80' : ''
                }`}
              >
                <span className="text-[#888888] shrink-0 w-20">
                  [{log.timestamp}]
                </span>

                {levelBadge && <span className="shrink-0">{levelBadge}</span>}

                <span
                  className={`flex-1 break-all ${
                    log.level === 'ERROR'
                      ? 'text-[#ffdad6] bg-[#93000a]/30 px-1 rounded border border-[#93000a]'
                      : log.level === 'WARN'
                      ? 'text-[#ffb596]'
                      : 'text-[#e5e2e1]'
                  }`}
                >
                  {log.message}
                </span>
              </div>
            );
          })}

          <div ref={terminalEndRef} />

          <div className="flex items-center gap-1 pt-2">
            <span className="w-2 h-4 bg-[#ff6b1a] animate-pulse inline-block" />
          </div>
        </div>
      </div>
    </div>
  );
};
