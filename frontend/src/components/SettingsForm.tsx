import React, { useRef, useState } from 'react';
import { Send, Brain, UserCheck, Search, FileText, Key, User, Eye, EyeOff, Plus, X, Info, Paperclip, Loader2, CheckCircle2 } from 'lucide-react';
import { AgentSettings } from '../types';
import { InfoTooltip } from './InfoTooltip';
import { api } from '../bridge';

interface SettingsFormProps {
  settings: AgentSettings;
  onChange: (updated: AgentSettings) => void;
}

type PdfStatus = 'idle' | 'loading' | 'done' | 'error';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(((reader.result as string) || '').split(',')[1] || '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export const SettingsForm: React.FC<SettingsFormProps> = ({ settings, onChange }) => {
  const [showBotToken, setShowBotToken] = useState(false);
  const [showDeepseekKey, setShowDeepseekKey] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [pdfStatus, setPdfStatus] = useState<PdfStatus>('idle');
  const [pdfError, setPdfError] = useState('');
  const [pdfName, setPdfName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = <K extends keyof AgentSettings>(field: K, value: AgentSettings[K]) => {
    onChange({
      ...settings,
      [field]: value
    });
  };

  const handleAddTag = () => {
    const trimmed = newTagInput.trim();
    if (trimmed && !settings.searchTags.includes(trimmed)) {
      updateField('searchTags', [...settings.searchTags, trimmed]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateField('searchTags', settings.searchTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDownTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const toggleRegion = (regionKey: 'moscow' | 'spb' | 'remote') => {
    onChange({
      ...settings,
      regions: {
        ...settings.regions,
        [regionKey]: !settings.regions[regionKey]
      }
    });
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setPdfStatus('loading');
    setPdfError('');
    try {
      const base64 = await fileToBase64(file);
      const res = await api().import_resume_pdf(file.name, base64);
      if (res.ok && res.text) {
        updateField('coverLetterTemplate', res.text);
        setPdfName(file.name);
        setPdfStatus('done');
      } else {
        setPdfStatus('error');
        setPdfError(res.error || 'Не удалось извлечь текст из PDF');
      }
    } catch (err) {
      setPdfStatus('error');
      setPdfError(String(err));
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8">
      {/* Section 1: Telegram Настройки */}
      <section className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-[#e5e2e1] mb-6 flex items-center gap-2.5">
          <Send className="w-5 h-5 text-[#ff6b1a]" />
          <span>Telegram Настройки</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bot Token */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#888888] uppercase tracking-wider font-medium flex items-center">
              BOT TOKEN
              <InfoTooltip text="Создайте бота через @BotFather в Telegram (команда /newbot) и скопируйте выданный токен." />
            </label>
            <div className="relative flex items-center input-glow rounded-lg border border-[#2A2A2A] bg-[#131313] px-3 py-2 transition-all">
              <Key className="w-4 h-4 text-[#888888] mr-2 shrink-0" />
              <input
                type={showBotToken ? 'text' : 'password'}
                value={settings.botToken}
                onChange={(e) => updateField('botToken', e.target.value)}
                placeholder="123456789:AAHxxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-[#e5e2e1] font-mono text-sm p-0"
              />
              <button
                type="button"
                onClick={() => setShowBotToken(!showBotToken)}
                className="text-[#888888] hover:text-[#e5e2e1] p-1 ml-1"
                title={showBotToken ? 'Скрыть токен' : 'Показать токен'}
              >
                {showBotToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* User ID (Admin) */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#888888] uppercase tracking-wider font-medium flex items-center">
              USER ID (ADMIN)
              <InfoTooltip text="Ваш числовой Telegram ID. Узнать можно, написав боту @userinfobot." />
            </label>
            <div className="relative flex items-center input-glow rounded-lg border border-[#2A2A2A] bg-[#131313] px-3 py-2 transition-all">
              <User className="w-4 h-4 text-[#888888] mr-2 shrink-0" />
              <input
                type="text"
                value={settings.adminUserId}
                onChange={(e) => updateField('adminUserId', e.target.value)}
                placeholder="Telegram ID"
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-[#e5e2e1] font-mono text-sm p-0"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: LLM Провайдер */}
      <section className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-[#e5e2e1] mb-6 flex items-center gap-2.5">
          <Brain className="w-5 h-5 text-[#ff6b1a]" />
          <span>LLM Провайдер</span>
        </h3>

        {/* Segmented Control */}
        <div className="bg-[#131313] p-1 rounded-lg border border-[#2A2A2A] flex gap-1 w-full md:w-96 mb-6">
          <button
            type="button"
            onClick={() => updateField('llmProvider', 'deepseek')}
            className={`flex-1 py-2 text-center rounded-md text-xs font-medium transition-all ${
              settings.llmProvider === 'deepseek'
                ? 'bg-[#2A2A2A] text-[#e5e2e1] shadow-sm'
                : 'text-[#888888] hover:text-[#e5e2e1]'
            }`}
          >
            DeepSeek (облако)
          </button>
          <button
            type="button"
            onClick={() => updateField('llmProvider', 'ollama')}
            className={`flex-1 py-2 text-center rounded-md text-xs font-medium transition-all ${
              settings.llmProvider === 'ollama'
                ? 'bg-[#2A2A2A] text-[#e5e2e1] shadow-sm'
                : 'text-[#888888] hover:text-[#e5e2e1]'
            }`}
          >
            Ollama (локально)
          </button>
        </div>

        {/* Provider Specific Input Fields */}
        {settings.llmProvider === 'deepseek' ? (
          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#888888] uppercase tracking-wider font-medium flex items-center">
              DEEPSEEK API KEY
              <InfoTooltip text="Получите ключ на platform.deepseek.com → API Keys. Нужен баланс на аккаунте (оплата по факту использования)." />
            </label>
            <div className="relative flex items-center input-glow rounded-lg border border-[#2A2A2A] bg-[#131313] px-3 py-2 transition-all">
              <Key className="w-4 h-4 text-[#888888] mr-2 shrink-0" />
              <input
                type={showDeepseekKey ? 'text' : 'password'}
                value={settings.deepseekApiKey}
                onChange={(e) => updateField('deepseekApiKey', e.target.value)}
                placeholder="sk-xxxxxxxxxxxxxxxx"
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-[#e5e2e1] font-mono text-sm p-0"
              />
              <button
                type="button"
                onClick={() => setShowDeepseekKey(!showDeepseekKey)}
                className="text-[#888888] hover:text-[#e5e2e1] p-1 ml-1"
                title={showDeepseekKey ? 'Скрыть ключ' : 'Показать ключ'}
              >
                {showDeepseekKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-[#888888] uppercase tracking-wider font-medium flex items-center">
                OLLAMA SERVER HOST
                <InfoTooltip text="Адрес локального сервера Ollama. Обычно http://localhost:11434 — нужно, чтобы Ollama была установлена и запущена на этом компьютере." />
              </label>
              <div className="relative flex items-center input-glow rounded-lg border border-[#2A2A2A] bg-[#131313] px-3 py-2 transition-all">
                <input
                  type="text"
                  value={settings.ollamaUrl}
                  onChange={(e) => updateField('ollamaUrl', e.target.value)}
                  placeholder="http://localhost:11434"
                  className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-[#e5e2e1] font-mono text-sm p-0"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-[#888888] uppercase tracking-wider font-medium">
                OLLAMA MODEL
              </label>
              <div className="relative flex items-center input-glow rounded-lg border border-[#2A2A2A] bg-[#131313] px-3 py-2 transition-all">
                <input
                  type="text"
                  value={settings.ollamaModel}
                  onChange={(e) => updateField('ollamaModel', e.target.value)}
                  placeholder="llama3:latest"
                  className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-[#e5e2e1] font-mono text-sm p-0"
                />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Section 3: Профиль Кандидата */}
      <section className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-[#e5e2e1] mb-6 flex items-center gap-2.5">
          <UserCheck className="w-5 h-5 text-[#ff6b1a]" />
          <span>Профиль Кандидата</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#888888] uppercase tracking-wider font-medium">
              ИМЯ (ДЛЯ СОПРОВОДИТЕЛЬНЫХ)
            </label>
            <input
              type="text"
              value={settings.candidateName}
              onChange={(e) => updateField('candidateName', e.target.value)}
              placeholder="Александр Сергеевич"
              className="input-glow rounded-lg border border-[#2A2A2A] bg-[#131313] px-4 py-2 text-[#e5e2e1] text-sm focus:outline-none focus:ring-0 w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#888888] uppercase tracking-wider font-medium">
              ССЫЛКА НА GITHUB
            </label>
            <input
              type="url"
              value={settings.githubUrl}
              onChange={(e) => updateField('githubUrl', e.target.value)}
              placeholder="https://github.com/username"
              className="input-glow rounded-lg border border-[#2A2A2A] bg-[#131313] px-4 py-2 text-[#e5e2e1] text-sm focus:outline-none focus:ring-0 w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#888888] uppercase tracking-wider font-medium flex items-center">
              НАЗВАНИЕ РЕЗЮМЕ (HH.RU)
              <InfoTooltip text="Точное название резюме, как оно указано в личном кабинете hh.ru — иначе бот не сможет выбрать его при отклике." />
            </label>
            <input
              type="text"
              value={settings.resumeTitle}
              onChange={(e) => updateField('resumeTitle', e.target.value)}
              placeholder="Frontend Developer (React)"
              className="input-glow rounded-lg border border-[#2A2A2A] bg-[#131313] px-4 py-2 text-[#e5e2e1] text-sm focus:outline-none focus:ring-0 w-full"
            />
          </div>
        </div>
      </section>

      {/* Section 4: Параметры Поиска */}
      <section className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-[#e5e2e1] mb-6 flex items-center gap-2.5">
          <Search className="w-5 h-5 text-[#ff6b1a]" />
          <span>Параметры Поиска</span>
        </h3>

        {/* Tags / Queries */}
        <div className="mb-6 flex flex-col gap-2">
          <label className="text-xs text-[#888888] uppercase tracking-wider font-medium">
            ПОИСКОВЫЕ ЗАПРОСЫ (ТЕГИ)
          </label>
          <div className="min-h-[48px] input-glow rounded-lg border border-[#2A2A2A] bg-[#131313] p-2 flex flex-wrap gap-2 items-center">
            {settings.searchTags.map((tag) => (
              <div
                key={tag}
                className="bg-[#353535] text-[#e5e2e1] px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-[#ff6b1a] transition-colors p-0.5"
                  title="Удалить тег"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <div className="flex items-center gap-1 flex-1 min-w-[140px]">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={handleKeyDownTag}
                placeholder="Добавить тег..."
                className="bg-transparent border-none focus:outline-none focus:ring-0 text-[#e5e2e1] p-1 text-sm w-full"
              />
              {newTagInput.trim() && (
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="p-1 rounded bg-[#ff6b1a] text-white hover:bg-opacity-90"
                  title="Добавить"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Regions */}
        <div className="flex flex-col gap-3">
          <label className="text-xs text-[#888888] uppercase tracking-wider font-medium mb-1">
            РЕГИОНЫ ПОИСКА
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="flex items-center gap-3 cursor-pointer group bg-[#131313] p-3 rounded-lg border border-[#2A2A2A] hover:border-[#ff6b1a]/50 transition-colors">
              <input
                type="checkbox"
                checked={settings.regions.moscow}
                onChange={() => toggleRegion('moscow')}
                className="w-4 h-4 rounded bg-[#1E1E1E] border-[#2A2A2A] text-[#ff6b1a] focus:ring-[#ff6b1a] focus:ring-offset-[#0D0D0D] cursor-pointer"
              />
              <span className="text-sm font-medium text-[#e5e2e1] group-hover:text-[#ffb596] transition-colors">Москва</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group bg-[#131313] p-3 rounded-lg border border-[#2A2A2A] hover:border-[#ff6b1a]/50 transition-colors">
              <input
                type="checkbox"
                checked={settings.regions.spb}
                onChange={() => toggleRegion('spb')}
                className="w-4 h-4 rounded bg-[#1E1E1E] border-[#2A2A2A] text-[#ff6b1a] focus:ring-[#ff6b1a] focus:ring-offset-[#0D0D0D] cursor-pointer"
              />
              <span className="text-sm font-medium text-[#e5e2e1] group-hover:text-[#ffb596] transition-colors">Санкт-Петербург</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group bg-[#131313] p-3 rounded-lg border border-[#2A2A2A] hover:border-[#ff6b1a]/50 transition-colors">
              <input
                type="checkbox"
                checked={settings.regions.remote}
                onChange={() => toggleRegion('remote')}
                className="w-4 h-4 rounded bg-[#1E1E1E] border-[#2A2A2A] text-[#ff6b1a] focus:ring-[#ff6b1a] focus:ring-offset-[#0D0D0D] cursor-pointer"
              />
              <span className="text-sm font-medium text-[#e5e2e1] group-hover:text-[#ffb596] transition-colors">Удаленная работа</span>
            </label>
          </div>
        </div>
      </section>

      {/* Section 5: Шаблон сопроводительного письма (Контекст) */}
      <section className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-[#e5e2e1] mb-4 flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-[#ff6b1a]" />
          <span>Шаблон сопроводительного письма (Контекст)</span>
        </h3>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={handlePdfUpload}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={pdfStatus === 'loading'}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#2A2A2A] bg-[#131313] text-[#e5e2e1] text-xs font-medium hover:border-[#ff6b1a]/50 hover:text-[#ffb596] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pdfStatus === 'loading' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Paperclip className="w-3.5 h-3.5 text-[#ff6b1a]" />
            )}
            <span>Прикрепить резюме (PDF)</span>
          </button>

          {pdfStatus === 'done' && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Текст из «{pdfName}» подставлен ниже — проверьте и подправьте при необходимости
            </span>
          )}
          {pdfStatus === 'error' && (
            <span className="text-xs text-rose-400">Ошибка: {pdfError}</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-[#888888] uppercase tracking-wider font-medium flex justify-between items-center">
            <span>БАЗОВЫЙ ТЕКСТ РЕЗЮМЕ (LLM БУДЕТ АДАПТИРОВАТЬ ЕГО)</span>
            <span className="inline-flex items-center gap-1 text-[#888888] hover:text-[#e5e2e1] cursor-help" title="Этот контекст передается в модель для составления персональных сопроводительных писем">
              <Info className="w-3.5 h-3.5" />
              <span>Контекст</span>
            </span>
          </label>
          <textarea
            rows={6}
            value={settings.coverLetterTemplate}
            onChange={(e) => updateField('coverLetterTemplate', e.target.value)}
            placeholder="Опишите ваш опыт, ключевые навыки и достижения..."
            className="input-glow rounded-lg border border-[#2A2A2A] bg-[#131313] px-4 py-3 text-[#e5e2e1] text-sm focus:outline-none focus:ring-0 w-full resize-y font-normal leading-relaxed"
          />
          <div className="text-right text-xs text-[#888888]">
            {settings.coverLetterTemplate.length} символов
          </div>
        </div>
      </section>
    </div>
  );
};
