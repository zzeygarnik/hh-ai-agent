import React from 'react';
import { Check, RefreshCw } from 'lucide-react';

interface BottomSaveBarProps {
  hasUnsavedChanges: boolean;
  onSave: () => void;
  onReset: () => void;
  isSaving?: boolean;
}

export const BottomSaveBar: React.FC<BottomSaveBarProps> = ({
  hasUnsavedChanges,
  onSave,
  onReset,
  isSaving = false
}) => {
  return (
    <div className="fixed bottom-0 right-0 w-full lg:w-[calc(100%-280px)] bg-[#0D0D0D]/90 backdrop-blur-xl border-t border-[#2A2A2A] p-4 z-40">
      <div className="max-w-4xl mx-auto flex flex-wrap justify-between items-center gap-4">
        {/* Status Indicator */}
        <div className="flex items-center gap-2 text-xs font-medium">
          {hasUnsavedChanges ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B1A] animate-pulse" />
              <span className="text-[#888888]">Конфигурация изменена</span>
            </>
          ) : (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-emerald-400">Все изменения сохранены</span>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 ml-auto">
          <button
            type="button"
            onClick={onReset}
            disabled={!hasUnsavedChanges || isSaving}
            className="px-5 py-2 rounded-lg border border-[#2A2A2A] text-[#e5e2e1] hover:bg-[#353535] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            Отмена
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={!hasUnsavedChanges && !isSaving}
            className="px-6 py-2 rounded-lg bg-[#ff6b1a] text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg text-sm font-medium flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Сохранение...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Сохранить</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
