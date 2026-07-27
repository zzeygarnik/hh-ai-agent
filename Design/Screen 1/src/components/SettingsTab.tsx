import React, { useState } from 'react';
import { BotSettings } from '../types';
import {
  Save,
  Key,
  User,
  FileText,
  Clock,
  ShieldAlert,
  CheckCircle2,
  DollarSign,
  MapPin,
  Sliders,
} from 'lucide-react';

interface SettingsTabProps {
  settings: BotSettings;
  onSaveSettings: (newSettings: BotSettings) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<BotSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#e5e2e1] tracking-tight">
            Настройки бота
          </h2>
          <p className="text-sm text-[#888888] mt-1">
            Конфигурация авторизации HH.ru, параметры поиска и шаблоны сопроводительных писем.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 rounded-lg text-xs font-medium animate-in fade-in slide-in-from-right-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Настройки успешно сохранены!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: HH.ru Session & Profile */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-3 pb-3 border-b border-[#2A2A2A]">
            <Key className="w-5 h-5 text-[#ff6b1a]" />
            <h3 className="font-semibold text-[#e5e2e1] text-base">
              Авторизация HH.ru & Профиль
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#888888] mb-1">
                Токен сессии / API Token
              </label>
              <input
                type="password"
                name="hhToken"
                value={formData.hhToken}
                onChange={handleChange}
                placeholder="hh_token_x8f92a..."
                className="w-full bg-[#131313] border border-[#2A2A2A] focus:border-[#ff6b1a] rounded-lg px-3.5 py-2.5 text-xs text-[#e5e2e1] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#888888] mb-1">
                Имя профиля
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#888888] absolute left-3 top-2.5" />
                <input
                  type="text"
                  name="profileName"
                  value={formData.profileName}
                  onChange={handleChange}
                  placeholder="Frontend Developer Profile"
                  className="w-full bg-[#131313] border border-[#2A2A2A] focus:border-[#ff6b1a] rounded-lg pl-9 pr-3.5 py-2.5 text-xs text-[#e5e2e1] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#888888] mb-1">
                Целевая должность (Ключевые слова)
              </label>
              <input
                type="text"
                name="targetRole"
                value={formData.targetRole}
                onChange={handleChange}
                placeholder="Frontend Developer, React Developer"
                className="w-full bg-[#131313] border border-[#2A2A2A] focus:border-[#ff6b1a] rounded-lg px-3.5 py-2.5 text-xs text-[#e5e2e1] focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-[#888888] mb-1">
                  Локация
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-[#888888] absolute left-2.5 top-3" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Москва / Удаленно"
                    className="w-full bg-[#131313] border border-[#2A2A2A] focus:border-[#ff6b1a] rounded-lg pl-8 pr-2 py-2.5 text-xs text-[#e5e2e1] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#888888] mb-1">
                  Желаемый доход (₽)
                </label>
                <div className="relative">
                  <DollarSign className="w-3.5 h-3.5 text-[#888888] absolute left-2.5 top-3" />
                  <input
                    type="number"
                    name="desiredSalary"
                    value={formData.desiredSalary}
                    onChange={handleChange}
                    placeholder="180000"
                    className="w-full bg-[#131313] border border-[#2A2A2A] focus:border-[#ff6b1a] rounded-lg pl-8 pr-2 py-2.5 text-xs text-[#e5e2e1] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Cover Letter Template */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-3 pb-3 border-b border-[#2A2A2A]">
            <FileText className="w-5 h-5 text-[#ff6b1a]" />
            <h3 className="font-semibold text-[#e5e2e1] text-base">
              Шаблон сопроводительного письма
            </h3>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-[#888888]">
                Текст письма
              </label>
              <span className="text-[11px] text-[#ffb596]/80 font-mono">
                Доступные плейсхолдеры: {'{vacancy}'}, {'{company}'}
              </span>
            </div>
            <textarea
              name="coverLetter"
              rows={4}
              value={formData.coverLetter}
              onChange={handleChange}
              className="w-full bg-[#131313] border border-[#2A2A2A] focus:border-[#ff6b1a] rounded-lg p-3 text-xs text-[#e5e2e1] focus:outline-none font-mono transition-colors leading-relaxed"
            />
          </div>
        </div>

        {/* Section 3: Automation Limits & Rules */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-3 pb-3 border-b border-[#2A2A2A]">
            <Sliders className="w-5 h-5 text-[#ff6b1a]" />
            <h3 className="font-semibold text-[#e5e2e1] text-base">
              Лимиты и интервалы задержки
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#888888] mb-1">
                Макс. откликов в сутки
              </label>
              <input
                type="number"
                name="maxDailyApplications"
                value={formData.maxDailyApplications}
                onChange={handleChange}
                className="w-full bg-[#131313] border border-[#2A2A2A] focus:border-[#ff6b1a] rounded-lg px-3.5 py-2.5 text-xs text-[#e5e2e1] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#888888] mb-1">
                Задержка между откликами (секунд)
              </label>
              <input
                type="number"
                name="delayBetweenAppsSeconds"
                value={formData.delayBetweenAppsSeconds}
                onChange={handleChange}
                className="w-full bg-[#131313] border border-[#2A2A2A] focus:border-[#ff6b1a] rounded-lg px-3.5 py-2.5 text-xs text-[#e5e2e1] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#888888] mb-1">
                Черный список компаний (через запятую)
              </label>
              <input
                type="text"
                name="blacklistedCompanies"
                value={formData.blacklistedCompanies}
                onChange={handleChange}
                placeholder="ООО Рога и Копыта, ScamCorp"
                className="w-full bg-[#131313] border border-[#2A2A2A] focus:border-[#ff6b1a] rounded-lg px-3.5 py-2.5 text-xs text-[#e5e2e1] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#888888] mb-1">
                Исключать ключевые слова
              </label>
              <input
                type="text"
                name="blacklistedKeywords"
                value={formData.blacklistedKeywords}
                onChange={handleChange}
                placeholder="стажер, неоплачиваемая, 1С"
                className="w-full bg-[#131313] border border-[#2A2A2A] focus:border-[#ff6b1a] rounded-lg px-3.5 py-2.5 text-xs text-[#e5e2e1] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <input
              type="checkbox"
              id="skipWithTests"
              name="skipWithTests"
              checked={formData.skipWithTests}
              onChange={handleChange}
              className="w-4 h-4 rounded border-[#2A2A2A] bg-[#131313] text-[#ff6b1a] focus:ring-[#ff6b1a] cursor-pointer"
            />
            <label htmlFor="skipWithTests" className="text-xs text-[#e5e2e1] cursor-pointer">
              Пропускать вакансии с обязательными сопроводительными тестами / опросниками
            </label>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-3 bg-[#ff6b1a] hover:bg-[#ffb596] text-[#0D0D0D] font-semibold text-xs rounded-lg flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-lg shadow-orange-950/30"
          >
            <Save className="w-4 h-4" />
            <span>Сохранить настройки</span>
          </button>
        </div>
      </form>
    </div>
  );
};
