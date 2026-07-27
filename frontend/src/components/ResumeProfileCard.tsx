import React, { useRef, useState } from 'react';
import { Search, FileText, Plus, X, Info, Paperclip, Loader2, CheckCircle2, Trash2 } from 'lucide-react';
import { ResumeProfile } from '../types';
import { InfoTooltip } from './InfoTooltip';
import { api } from '../bridge';

interface ResumeProfileCardProps {
  profile: ResumeProfile;
  index: number;
  canRemove: boolean;
  onChange: (updated: ResumeProfile) => void;
  onRemove: () => void;
}

type PdfFileStatus = 'loading' | 'done' | 'error';
interface PdfFileEntry {
  name: string;
  status: PdfFileStatus;
  error?: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(((reader.result as string) || '').split(',')[1] || '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export const ResumeProfileCard: React.FC<ResumeProfileCardProps> = ({
  profile,
  index,
  canRemove,
  onChange,
  onRemove,
}) => {
  const [newTagInput, setNewTagInput] = useState('');
  const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null);
  const [editingTagValue, setEditingTagValue] = useState('');
  const [pdfFiles, setPdfFiles] = useState<PdfFileEntry[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (patch: Partial<ResumeProfile>) => onChange({ ...profile, ...patch });

  const handleAddTag = () => {
    const trimmed = newTagInput.trim();
    if (trimmed && !profile.searchTags.includes(trimmed)) {
      update({ searchTags: [...profile.searchTags, trimmed] });
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    update({ searchTags: profile.searchTags.filter((t) => t !== tagToRemove) });
  };

  const handleKeyDownTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const startEditTag = (i: number) => {
    setEditingTagIndex(i);
    setEditingTagValue(profile.searchTags[i]);
  };

  const commitEditTag = () => {
    if (editingTagIndex === null) return;
    const i = editingTagIndex;
    const trimmed = editingTagValue.trim();
    const tags = profile.searchTags;

    if (!trimmed) {
      update({ searchTags: tags.filter((_, idx) => idx !== i) });
    } else if (!tags.some((t, idx) => idx !== i && t === trimmed)) {
      const next = [...tags];
      next[i] = trimmed;
      update({ searchTags: next });
    }
    setEditingTagIndex(null);
  };

  const handleTagEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitEditTag();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditingTagIndex(null);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;

    const startIndex = pdfFiles.length;
    setPdfFiles((prev) => [...prev, ...files.map((f) => ({ name: f.name, status: 'loading' as PdfFileStatus }))]);

    let combinedText = profile.resumeSummary;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const entryIndex = startIndex + i;
      try {
        const base64 = await fileToBase64(file);
        const res = await api().import_resume_pdf(file.name, base64);
        if (res.ok && res.text) {
          combinedText = combinedText.trim()
            ? `${combinedText.trim()}\n\n--- ${file.name} ---\n${res.text}`
            : res.text;
          update({ resumeSummary: combinedText });
          setPdfFiles((prev) => prev.map((p, idx) => (idx === entryIndex ? { ...p, status: 'done' } : p)));
        } else {
          setPdfFiles((prev) =>
            prev.map((p, idx) =>
              idx === entryIndex ? { ...p, status: 'error', error: res.error || 'Не удалось извлечь текст' } : p
            )
          );
        }
      } catch (err) {
        setPdfFiles((prev) =>
          prev.map((p, idx) => (idx === entryIndex ? { ...p, status: 'error', error: String(err) } : p))
        );
      }
    }
  };

  const removePdfEntry = (i: number) => {
    setPdfFiles((prev) => prev.filter((_, idx) => idx !== i));
  };

  return (
    <section className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#e5e2e1] flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-[#ff6b1a]" />
          <span>Резюме {index + 1}{profile.name ? `: ${profile.name}` : ''}</span>
        </h3>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 text-[#888888] hover:text-rose-400 transition-colors"
            title="Удалить этот профиль резюме"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Resume title on hh.ru */}
      <div className="flex flex-col gap-2 mb-6">
        <label className="text-xs text-[#888888] uppercase tracking-wider font-medium flex items-center">
          НАЗВАНИЕ РЕЗЮМЕ (HH.RU)
          <InfoTooltip text="Резюме нужно ЗАРАНЕЕ создать на hh.ru — бот его не создаёт и не загружает, только выбирает по названию при отклике. Впишите точное название, как оно указано в личном кабинете." />
        </label>
        <input
          type="text"
          value={profile.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="Например, Frontend Developer (React)"
          className="input-glow rounded-lg border border-[#2A2A2A] bg-[#131313] px-4 py-2 text-[#e5e2e1] text-sm focus:outline-none focus:ring-0 w-full"
        />
      </div>

      {/* Search tags for this profile */}
      <div className="mb-6 flex flex-col gap-2">
        <label className="text-xs text-[#888888] uppercase tracking-wider font-medium flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-[#ff6b1a]" />
          ПОИСКОВЫЕ ЗАПРОСЫ ДЛЯ ЭТОГО РЕЗЮМЕ
        </label>
        <div className="min-h-[48px] input-glow rounded-lg border border-[#2A2A2A] bg-[#131313] p-2 flex flex-wrap gap-2 items-center">
          {profile.searchTags.map((tag, i) => (
            <div
              key={tag}
              className="bg-[#353535] text-[#e5e2e1] px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5"
            >
              {editingTagIndex === i ? (
                <input
                  autoFocus
                  type="text"
                  value={editingTagValue}
                  onChange={(e) => setEditingTagValue(e.target.value)}
                  onKeyDown={handleTagEditKeyDown}
                  onBlur={commitEditTag}
                  className="bg-transparent border-none focus:outline-none text-[#e5e2e1] text-xs w-28"
                />
              ) : (
                <span
                  onClick={() => startEditTag(i)}
                  className="cursor-text hover:text-[#ffb596] transition-colors"
                  title="Нажмите, чтобы изменить"
                >
                  {tag}
                </span>
              )}
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

      {/* PDF attach */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="hidden"
          onChange={handlePdfUpload}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#2A2A2A] bg-[#131313] text-[#e5e2e1] text-xs font-medium hover:border-[#ff6b1a]/50 hover:text-[#ffb596] transition-colors"
        >
          <Paperclip className="w-3.5 h-3.5 text-[#ff6b1a]" />
          <span>Прикрепить резюме (PDF, можно несколько)</span>
        </button>
        <span className="text-xs text-[#666666]">
          Текст пойдёт в контекст для ИИ — на hh.ru файл не загружается
        </span>
      </div>

      {pdfFiles.length > 0 && (
        <div className="flex flex-col gap-1.5 mb-3">
          {pdfFiles.map((f, i) => (
            <div key={`${f.name}-${i}`} className="flex items-center gap-2 text-xs">
              {f.status === 'loading' && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#888888]" />}
              {f.status === 'done' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              {f.status === 'error' && <X className="w-3.5 h-3.5 text-rose-400" />}
              <span className="text-[#e5e2e1]">{f.name}</span>
              {f.status === 'done' && <span className="text-emerald-400">текст добавлен ниже</span>}
              {f.status === 'error' && <span className="text-rose-400">{f.error}</span>}
              <button
                type="button"
                onClick={() => removePdfEntry(i)}
                className="ml-auto text-[#888888] hover:text-[#ff6b1a] transition-colors p-0.5"
                title="Убрать из списка"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Resume text context */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-[#888888] uppercase tracking-wider font-medium flex justify-between items-center">
          <span>БАЗОВЫЙ ТЕКСТ РЕЗЮМЕ (LLM БУДЕТ АДАПТИРОВАТЬ ЕГО)</span>
          <span
            className="inline-flex items-center gap-1 text-[#888888] hover:text-[#e5e2e1] cursor-help"
            title="Этот контекст передаётся в модель для составления сопроводительных писем именно для этого резюме"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Контекст</span>
          </span>
        </label>
        <textarea
          rows={6}
          value={profile.resumeSummary}
          onChange={(e) => update({ resumeSummary: e.target.value })}
          placeholder="Опишите ваш опыт, ключевые навыки и достижения для этого направления..."
          className="input-glow rounded-lg border border-[#2A2A2A] bg-[#131313] px-4 py-3 text-[#e5e2e1] text-sm focus:outline-none focus:ring-0 w-full resize-y font-normal leading-relaxed"
        />
        <div className="text-right text-xs text-[#888888]">{profile.resumeSummary.length} символов</div>
      </div>
    </section>
  );
};
