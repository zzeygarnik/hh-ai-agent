import React, { useState } from 'react';
import { X, Copy, Check, Download, Eye, Code, FileText, Sparkles } from 'lucide-react';
import { AgentSettings } from '../types';
import { generateExportHtml } from '../utils/exportHtml';

interface HtmlExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AgentSettings;
}

export const HtmlExportModal: React.FC<HtmlExportModalProps> = ({
  isOpen,
  onClose,
  settings
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');

  if (!isOpen) return null;

  const exportedHtmlCode = generateExportHtml(settings);
  const htmlBlobUrl = `data:text/html;charset=utf-8,${encodeURIComponent(exportedHtmlCode)}`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(exportedHtmlCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy html:', err);
    }
  };

  const handleDownloadHtml = () => {
    const element = document.createElement('a');
    const file = new Blob([exportedHtmlCode], { type: 'text/html;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `zgrnk-hh-agent-config.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const lineCount = exportedHtmlCode.split('\n').length;
  const sizeInKb = (new Blob([exportedHtmlCode]).size / 1024).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#131313] border border-[#2A2A2A] rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#1E1E1E] border-b border-[#2A2A2A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FF6B1A]/10 border border-[#FF6B1A]/30 rounded-lg text-[#FF6B1A]">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#e5e2e1] flex items-center gap-2">
                Экспорт в чистый HTML + Tailwind CSS
              </h3>
              <p className="text-xs text-[#888888]">
                Готовый единый HTML-файл с интегрированными стилями, шрифтами и вашими текущими настройками
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#888888] hover:text-[#e5e2e1] hover:bg-[#2A2A2A] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-bar Actions & Stats */}
        <div className="px-6 py-3 bg-[#181817] border-b border-[#2A2A2A] flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                activeTab === 'code'
                  ? 'bg-[#2A2A2A] text-[#ffb596] border border-[#ff6b1a]/40'
                  : 'text-[#888888] hover:text-[#e5e2e1]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Исходный код ({lineCount} строк)</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                activeTab === 'preview'
                  ? 'bg-[#2A2A2A] text-[#ffb596] border border-[#ff6b1a]/40'
                  : 'text-[#888888] hover:text-[#e5e2e1]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Живой предпросмотр HTML</span>
            </button>
          </div>

          {/* Stats & Actions */}
          <div className="flex items-center gap-3">
            <span className="text-[#888888]">Размер: <strong className="text-[#e5e2e1]">{sizeInKb} KB</strong></span>

            <button
              onClick={handleCopyCode}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#2A2A2A] text-[#e5e2e1] hover:bg-[#353535] border border-[#2A2A2A]'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Скопировано!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#FF6B1A]" />
                  <span>Копировать HTML</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadHtml}
              className="px-4 py-1.5 bg-[#FF6B1A] text-white hover:bg-opacity-90 rounded-lg font-medium transition-all flex items-center gap-1.5 shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Скачать .html</span>
            </button>
          </div>
        </div>

        {/* Modal Main Area */}
        <div className="flex-1 bg-[#0D0D0D] overflow-hidden relative">
          {activeTab === 'code' ? (
            <div className="h-full overflow-auto p-4 font-mono text-xs text-[#e5e2e1] leading-relaxed selection:bg-[#FF6B1A]">
              <pre className="whitespace-pre-wrap break-all">{exportedHtmlCode}</pre>
            </div>
          ) : (
            <iframe
              src={htmlBlobUrl}
              title="HTML Export Live Preview"
              className="w-full h-full border-none"
            />
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-[#1E1E1E] border-t border-[#2A2A2A] flex justify-between items-center text-xs text-[#888888]">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FF6B1A]" />
            Экспортированный HTML полностью автономен и открывается в любом браузере без сборщиков.
          </span>
          <button
            onClick={onClose}
            className="hover:text-[#e5e2e1] underline"
          >
            Закрыть окно
          </button>
        </div>
      </div>
    </div>
  );
};
