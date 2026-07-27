import React, { useState } from 'react';
import { Send, Brain, UserCheck, MapPin, Key, User, Eye, EyeOff, Plus } from 'lucide-react';
import { AgentSettings, ResumeProfile } from '../types';
import { InfoTooltip } from './InfoTooltip';
import { ResumeProfileCard } from './ResumeProfileCard';

interface SettingsFormProps {
  settings: AgentSettings;
  onChange: (updated: AgentSettings) => void;
}

function makeProfileId(): string {
  return `profile-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({ settings, onChange }) => {
  const [showBotToken, setShowBotToken] = useState(false);
  const [showDeepseekKey, setShowDeepseekKey] = useState(false);

  const updateField = <K extends keyof AgentSettings>(field: K, value: AgentSettings[K]) => {
    onChange({
      ...settings,
      [field]: value
    });
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

  const updateProfile = (index: number, updated: ResumeProfile) => {
    const next = [...settings.resumeProfiles];
    next[index] = updated;
    updateField('resumeProfiles', next);
  };

  const addProfile = () => {
    updateField('resumeProfiles', [
      ...settings.resumeProfiles,
      { id: makeProfileId(), name: '', searchTags: [], resumeSummary: '' },
    ]);
  };

  const removeProfile = (index: number) => {
    updateField('resumeProfiles', settings.resumeProfiles.filter((_, i) => i !== index));
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
        </div>
      </section>

      {/* Section 4: Регионы поиска (общие для всех резюме) */}
      <section className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-[#e5e2e1] mb-6 flex items-center gap-2.5">
          <MapPin className="w-5 h-5 text-[#ff6b1a]" />
          <span>Регионы поиска</span>
        </h3>
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
      </section>

      {/* Section 5: Резюме-профили */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#e5e2e1]">
          Резюме-профили
          <span className="text-[#888888] font-normal text-sm ml-2">
            бот ищет и откликается отдельно по каждому
          </span>
        </h2>
      </div>

      {settings.resumeProfiles.map((profile, index) => (
        <ResumeProfileCard
          key={profile.id}
          profile={profile}
          index={index}
          canRemove={settings.resumeProfiles.length > 1}
          onChange={(updated) => updateProfile(index, updated)}
          onRemove={() => removeProfile(index)}
        />
      ))}

      <button
        type="button"
        onClick={addProfile}
        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-[#2A2A2A] text-[#888888] text-sm font-medium hover:border-[#ff6b1a]/50 hover:text-[#ffb596] transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>Добавить ещё резюме</span>
      </button>
    </div>
  );
};
