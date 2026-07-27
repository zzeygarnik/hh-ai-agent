import React, { useState } from 'react';
import { X, Copy, Check, Download, Code, Eye, FileCode2 } from 'lucide-react';
import { LogEntry, BotSettings, BotStats } from '../types';
import { generateExportHtml } from '../utils/exportHtml';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: LogEntry[];
  stats: BotStats;
  settings: BotSettings;
  botStatus: 'stopped' | 'running';
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  logs,
  stats,
  settings,
  botStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const htmlCode = generateExportHtml(logs, stats, settings, botStatus);

  const handleCopy = () => {
    navigator.clipboard.writeText(htmlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zgrnk_hh_agent_exported.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#131313] border-b border-[#2A2A2A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#ff6b1a]/20 border border-[#ff6b1a]/40 flex items-center justify-center text-[#ff6b1a]">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#e5e2e1]">
                Экспорт в HTML + Tailwind CSS
              </h3>
              <p className="text-xs text-[#888888]">
                Автономный готовый файл с оформлением Tailwind CSS и системными логами.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch */}
            <div className="flex p-1 bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg mr-2">
              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'code'
                    ? 'bg-[#2a2a2a] text-[#ffb596] shadow-sm'
                    : 'text-[#888888] hover:text-[#e5e2e1]'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>HTML Исходник</span>
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-[#2a2a2a] text-[#ffb596] shadow-sm'
                    : 'text-[#888888] hover:text-[#e5e2e1]'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Предпросмотр</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-[#888888] hover:text-[#e5e2e1] p-1.5 rounded-lg hover:bg-[#2A2A2A] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden p-4 bg-[#0D0D0D]">
          {activeTab === 'code' ? (
            <div className="relative h-full flex flex-col">
              <pre className="flex-1 p-4 bg-[#000000] border border-[#2A2A2A] rounded-xl font-mono text-xs text-[#8dcdff] overflow-auto terminal-scroll leading-relaxed">
                <code>{htmlCode}</code>
              </pre>
            </div>
          ) : (
            <div className="h-full border border-[#2A2A2A] rounded-xl overflow-hidden bg-white">
              <iframe
                srcDoc={htmlCode}
                title="HTML Export Preview"
                className="w-full h-full border-none"
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#131313] border-t border-[#2A2A2A] flex items-center justify-between">
          <div className="text-xs text-[#888888]">
            <span className="font-semibold text-[#e5e2e1]">Размер:</span> ~{(htmlCode.length / 1024).toFixed(1)} KB (Все стили встроенны через Tailwind CDN)
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 bg-[#2a2a2a] hover:bg-[#353535] border border-[#a98a7e]/30 text-[#e5e2e1] text-xs font-medium rounded-lg flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Скопировано!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#ffb596]" />
                  <span>Скопировать HTML</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="px-5 py-2.5 bg-[#ff6b1a] hover:bg-[#ffb596] text-[#0D0D0D] text-xs font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-lg shadow-orange-950/40"
            >
              <Download className="w-4 h-4" />
              <span>Скачать index.html</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
