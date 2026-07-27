import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Play, Square, Trash2, CheckCircle2, AlertTriangle, Info, XCircle, Search, Sparkles } from 'lucide-react';
import { LogMessage } from '../types';

interface LogsViewProps {
  isBotRunning: boolean;
  setIsBotRunning: (running: boolean) => void;
  botToken: string;
  candidateName: string;
}

export const LogsView: React.FC<LogsViewProps> = ({
  isBotRunning,
  setIsBotRunning,
  botToken,
  candidateName
}) => {
  const [logs, setLogs] = useState<LogMessage[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 300000).toLocaleTimeString(),
      level: 'info',
      message: 'Инициализация агента ZGRNK HH v1.0.4 Premium...'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 250000).toLocaleTimeString(),
      level: 'info',
      message: `Проверка токена Telegram бота (${botToken ? 'Токен найден' : 'Токен не задан'})...`
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 200000).toLocaleTimeString(),
      level: 'success',
      message: `Профиль кандидата загружен: ${candidateName || 'Александр Сергеевич'}`
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 150000).toLocaleTimeString(),
      level: 'info',
      message: 'Загружены поисковые теги: Frontend, React Developer'
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 100000).toLocaleTimeString(),
      level: 'success',
      message: 'Авторизация в hh.ru успешна. Сессия действительна.',
      company: 'hh.ru API'
    }
  ]);

  const [filterLevel, setFilterLevel] = useState<'all' | 'info' | 'success' | 'warn' | 'error'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Stats
  const [stats, setStats] = useState({
    totalScanned: 42,
    applicationsSent: 18,
    lettersGenerated: 18,
    invitesReceived: 3
  });

  // Simulated live log generator when bot is running
  useEffect(() => {
    if (!isBotRunning) return;

    const sampleCompanies = [
      'Яндекс', 'VK', 'Тинькофф', 'Сбер', 'Ozon', 'Авито', 'МТС Digital', 'VK Tech', 'Альфа-Банк'
    ];
    const sampleVacancies = [
      'Senior React Developer', 'Frontend Engineer (React / TS)', 'Middle+ Frontend Разработчик', 'Fullstack React/Node Developer'
    ];

    const interval = setInterval(() => {
      const time = new Date().toLocaleTimeString();
      const company = sampleCompanies[Math.floor(Math.random() * sampleCompanies.length)];
      const vacancy = sampleVacancies[Math.floor(Math.random() * sampleVacancies.length)];
      
      const rand = Math.random();
      let newLog: LogMessage;

      if (rand < 0.4) {
        newLog = {
          id: Date.now().toString(),
          timestamp: time,
          level: 'info',
          message: `Найдена подходящая вакансия "${vacancy}" в ${company}`,
          company,
          vacancy
        };
      } else if (rand < 0.75) {
        newLog = {
          id: Date.now().toString(),
          timestamp: time,
          level: 'success',
          message: `Сгенерировано сопроводительное письмо и успешно отправлен отклик!`,
          company,
          vacancy
        };
        setStats(prev => ({
          ...prev,
          totalScanned: prev.totalScanned + 1,
          applicationsSent: prev.applicationsSent + 1,
          lettersGenerated: prev.lettersGenerated + 1
        }));
      } else if (rand < 0.9) {
        newLog = {
          id: Date.now().toString(),
          timestamp: time,
          level: 'warn',
          message: `Вакансия "${vacancy}" в ${company} требует заполнения формы работодателя. Пропущено.`,
          company
        };
        setStats(prev => ({ ...prev, totalScanned: prev.totalScanned + 1 }));
      } else {
        newLog = {
          id: Date.now().toString(),
          timestamp: time,
          level: 'error',
          message: `Превышен лимит откликов hh.ru на сегодня для вакансии "${vacancy}". Ожидание сброса.`,
          company
        };
      }

      setLogs(prev => [...prev.slice(-100), newLog]);
    }, 3500);

    return () => clearInterval(interval);
  }, [isBotRunning]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const filteredLogs = logs.filter(log => {
    if (filterLevel !== 'all' && log.level !== filterLevel) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        log.message.toLowerCase().includes(term) ||
        (log.company && log.company.toLowerCase().includes(term)) ||
        (log.vacancy && log.vacancy.toLowerCase().includes(term))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-24">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-4 flex flex-col">
          <span className="text-xs text-[#888888] font-medium uppercase tracking-wider">Всего сканировано</span>
          <span className="text-2xl font-bold text-[#e5e2e1] mt-1">{stats.totalScanned}</span>
          <span className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> В реальном времени
          </span>
        </div>

        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-4 flex flex-col">
          <span className="text-xs text-[#888888] font-medium uppercase tracking-wider">Отправлено откликов</span>
          <span className="text-2xl font-bold text-[#FF6B1A] mt-1">{stats.applicationsSent}</span>
          <span className="text-xs text-[#ffb596] mt-2">Авто-отклики с письмом</span>
        </div>

        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-4 flex flex-col">
          <span className="text-xs text-[#888888] font-medium uppercase tracking-wider">Писем сгенерировано</span>
          <span className="text-2xl font-bold text-[#e5e2e1] mt-1">{stats.lettersGenerated}</span>
          <span className="text-xs text-[#888888] mt-2">LLM DeepSeek / Ollama</span>
        </div>

        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-4 flex flex-col">
          <span className="text-xs text-[#888888] font-medium uppercase tracking-wider">Приглашения</span>
          <span className="text-2xl font-bold text-emerald-400 mt-1">{stats.invitesReceived}</span>
          <span className="text-xs text-emerald-500/80 mt-2">Контакт в Telegram</span>
        </div>
      </div>

      {/* Terminal Logs Window */}
      <div className="bg-[#131313] border border-[#2A2A2A] rounded-xl overflow-hidden shadow-2xl flex flex-col h-[580px]">
        {/* Terminal Header */}
        <div className="bg-[#1E1E1E] px-4 py-3 border-b border-[#2A2A2A] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#FF6B1A]" />
            <span className="text-sm font-semibold text-[#e5e2e1] font-mono">zgrnk-agent-console.log</span>
            {isBotRunning && (
              <span className="ml-2 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE STREAMING
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search filter */}
            <div className="relative flex items-center bg-[#131313] border border-[#2A2A2A] rounded-md px-2 py-1 text-xs">
              <Search className="w-3.5 h-3.5 text-[#888888] mr-1.5" />
              <input
                type="text"
                placeholder="Поиск по логам..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none text-[#e5e2e1] focus:outline-none text-xs w-28 sm:w-36"
              />
            </div>

            {/* Level Selector */}
            <div className="flex gap-1 bg-[#131313] p-1 rounded-md border border-[#2A2A2A] text-xs">
              <button
                onClick={() => setFilterLevel('all')}
                className={`px-2 py-0.5 rounded ${filterLevel === 'all' ? 'bg-[#2A2A2A] text-[#e5e2e1]' : 'text-[#888888]'}`}
              >
                Все
              </button>
              <button
                onClick={() => setFilterLevel('success')}
                className={`px-2 py-0.5 rounded ${filterLevel === 'success' ? 'bg-emerald-950 text-emerald-400' : 'text-[#888888]'}`}
              >
                Успех
              </button>
              <button
                onClick={() => setFilterLevel('warn')}
                className={`px-2 py-0.5 rounded ${filterLevel === 'warn' ? 'bg-amber-950 text-amber-400' : 'text-[#888888]'}`}
              >
                Варн
              </button>
              <button
                onClick={() => setFilterLevel('error')}
                className={`px-2 py-0.5 rounded ${filterLevel === 'error' ? 'bg-rose-950 text-rose-400' : 'text-[#888888]'}`}
              >
                Ошибки
              </button>
            </div>

            {/* Clear Button */}
            <button
              onClick={() => setLogs([])}
              className="p-1.5 hover:bg-[#2A2A2A] text-[#888888] hover:text-[#e5e2e1] rounded transition-colors"
              title="Очистить консоль"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Run / Stop Button */}
            <button
              onClick={() => setIsBotRunning(!isBotRunning)}
              className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
                isBotRunning
                  ? 'bg-rose-600/20 border border-rose-500/40 text-rose-400 hover:bg-rose-600/30'
                  : 'bg-[#FF6B1A]/20 border border-[#FF6B1A]/40 text-[#FF6B1A] hover:bg-[#FF6B1A]/30'
              }`}
            >
              {isBotRunning ? (
                <>
                  <Square className="w-3 h-3 fill-rose-400" />
                  <span>Пауза</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-[#FF6B1A]" />
                  <span>Старт</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Console Log List */}
        <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-2 bg-[#0d0d0d]">
          {filteredLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[#888888] gap-2">
              <Terminal className="w-8 h-8 opacity-40" />
              <p>Записи логов отсутствуют или отфильтрованы</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 py-1 border-b border-[#1E1E1E]/60 hover:bg-[#1E1E1E]/40 px-2 rounded transition-colors"
              >
                <span className="text-[#888888] shrink-0">{log.timestamp}</span>

                {/* Level Icon */}
                <span className="shrink-0 mt-0.5">
                  {log.level === 'info' && <Info className="w-3.5 h-3.5 text-sky-400" />}
                  {log.level === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  {log.level === 'warn' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                  {log.level === 'error' && <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                </span>

                {/* Log message */}
                <div className="flex-1 space-y-0.5">
                  <p className={`
                    ${log.level === 'info' ? 'text-[#e5e2e1]' : ''}
                    ${log.level === 'success' ? 'text-emerald-300 font-medium' : ''}
                    ${log.level === 'warn' ? 'text-amber-300' : ''}
                    ${log.level === 'error' ? 'text-rose-400' : ''}
                  `}>
                    {log.message}
                  </p>
                  {(log.company || log.vacancy) && (
                    <div className="flex items-center gap-2 text-[11px] text-[#888888]">
                      {log.company && <span className="bg-[#1E1E1E] px-1.5 py-0.5 rounded border border-[#2A2A2A]">{log.company}</span>}
                      {log.vacancy && <span>{log.vacancy}</span>}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
};
