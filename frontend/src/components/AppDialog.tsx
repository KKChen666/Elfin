import { ReactNode, useEffect, useState } from 'react';
import { WarningCircle, X } from '@phosphor-icons/react';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  detail?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  detail,
  confirmLabel = '确认',
  cancelLabel = '取消',
  danger = false,
  loading = false,
  icon,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading, onCancel, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/35 px-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onCancel();
      }}
    >
      <section className="w-full max-w-sm rounded-[28px] border border-[#e5e7eb] bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-start gap-3">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${danger ? 'bg-[#fee2e2] text-[#dc2626]' : 'bg-[#ececf1] text-[#202123]'}`}>
            {icon || <WarningCircle size={21} weight="fill" />}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-[#202123]">{title}</h2>
            {detail && <p className="mt-1 truncate text-sm font-medium text-[#4b5563]">{detail}</p>}
          </div>
        </div>
        {description && <p className="text-sm leading-6 text-[#6b7280]">{description}</p>}
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onCancel} disabled={loading} className="ios-button-secondary flex-1">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex min-h-11 flex-1 items-center justify-center rounded-full px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 ${
              danger ? 'bg-[#dc2626] hover:bg-[#b91c1c]' : 'bg-[#202123] hover:bg-[#111827]'
            }`}
          >
            {loading ? '处理中...' : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

type TextPromptDialogProps = {
  open: boolean;
  title: string;
  label: string;
  initialValue: string;
  placeholder?: string;
  confirmLabel?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: (value: string) => void;
};

export function TextPromptDialog({
  open,
  title,
  label,
  initialValue,
  placeholder,
  confirmLabel = '保存',
  loading = false,
  onCancel,
  onConfirm,
}: TextPromptDialogProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (open) setValue(initialValue);
  }, [initialValue, open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading, onCancel, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/35 px-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onCancel();
      }}
    >
      <section className="w-full max-w-sm rounded-[28px] border border-[#e5e7eb] bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#202123]">{title}</h2>
            <p className="mt-1 text-sm text-[#6b7280]">{label}</p>
          </div>
          <button type="button" onClick={onCancel} className="ios-icon-button !h-9 !w-9" aria-label="关闭">
            <X size={16} />
          </button>
        </div>
        <input
          autoFocus
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') onConfirm(value);
          }}
          placeholder={placeholder}
          className="ios-input"
        />
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onCancel} disabled={loading} className="ios-button-secondary flex-1">
            取消
          </button>
          <button
            type="button"
            onClick={() => onConfirm(value)}
            disabled={loading}
            className="ios-button-primary flex-1"
          >
            {loading ? '保存中...' : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
