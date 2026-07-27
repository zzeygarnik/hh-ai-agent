import React, { useState } from 'react';
import { Send, Brain, UserCheck, Search, FileText, Key, User, Eye, EyeOff, Plus, X, Info } from 'lucide-react';
import { AgentSettings } from '../types';

interface SettingsFormProps {
  settings: AgentSettings;
  onChange: (updated: AgentSettings) => void;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({ settings, onChange }) => {
  const [showBotToken, setShowBotToken] = useState(false);
  const [showDeepseekKey, setShowDeepseekKey] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

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
            <label className="text-xs text-[#888888] uppercase tracking-wider font-medium">
              BOT TOKEN
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
            <label className="text-xs text-[#888888] uppercase tracking-wider font-medium">
              USER ID (ADMIN)
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
            <label className="text-xs text-[#888888] uppercase tracking-wider font-medium">
              DEEPSEEK API KEY
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
              <label className="text-xs text-[#888888] uppercase tracking-wider font-medium">
                OLLAMA SERVER HOST
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
            <label className="text-xs text-[#888888] uppercase tracking-wider font-medium">
              ОСНОВНОЙ ПЕТ-ПРОЕКТ
            </label>
            <input
              type="text"
              value={settings.mainProjectUrl}
              onChange={(e) => updateField('mainProjectUrl', e.target.value)}
              placeholder="URL или название"
              className="input-glow rounded-lg border border-[#2A2A2A] bg-[#131313] px-4 py-2 text-[#e5e2e1] text-sm focus:outline-none focus:ring-0 w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#888888] uppercase tracking-wider font-medium">
              НАЗВАНИЕ РЕЗЮМЕ (HH.RU)
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
        <h3 className="text-xl font-semibold text-[#e5e2e1] mb-6 flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-[#ff6b1a]" />
          <span>Шаблон сопроводительного письма (Контекст)</span>
        </h3>
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
