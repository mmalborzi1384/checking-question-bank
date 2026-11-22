import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MessageSquareText,
  Trash2,
  XCircle,
} from 'lucide-react';
import type { ReviewEntry, ReviewStatus, TabKey } from '../types/curriculum';

interface ProfessorReviewBoxProps {
  itemKey: string;
  tab: TabKey;
  itemId: string;
  title: string;
  entry?: ReviewEntry;
  onUpdate: (
    itemKey: string,
    meta: { tab: TabKey; itemId: string; title: string },
    patch: { status?: ReviewStatus | null; note?: string }
  ) => void;
  onClear: (itemKey: string) => void;
}

const STATUS_OPTIONS: {
  value: ReviewStatus;
  label: string;
  icon: React.FC<{ className?: string }>;
  activeClass: string;
  idleClass: string;
}[] = [
  {
    value: 'approved',
    label: 'تأیید شده',
    icon: CheckCircle2,
    activeClass: 'bg-emerald-700 dark:bg-emerald-600 text-white border-emerald-700 dark:border-emerald-600',
    idleClass:
      'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-300',
  },
  {
    value: 'needs-revision',
    label: 'نیازمند اصلاح',
    icon: AlertTriangle,
    activeClass: 'bg-amber-600 text-white border-amber-600',
    idleClass:
      'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-600 hover:text-amber-800 dark:hover:text-amber-300',
  },
  {
    value: 'scientific-error',
    label: 'دارای خطای علمی',
    icon: XCircle,
    activeClass: 'bg-rose-700 dark:bg-rose-600 text-white border-rose-700 dark:border-rose-600',
    idleClass:
      'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-600 hover:text-rose-800 dark:hover:text-rose-300',
  },
];

export const ProfessorReviewBox: React.FC<ProfessorReviewBoxProps> = React.memo(
  ({ itemKey, tab, itemId, title, entry, onUpdate, onClear }) => {
    const [noteOpen, setNoteOpen] = useState(() => Boolean(entry?.note?.trim()));

    const meta = { tab, itemId, title };
    const hasContent = Boolean(entry?.status || entry?.note?.trim());

    return (
      <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <MessageSquareText className="w-4 h-4 text-blue-800 dark:text-blue-400 shrink-0" />
            <span>یادداشت بررسی استاد</span>
            {entry?.updatedAt && (
              <span className="font-normal text-slate-400 dark:text-slate-500">
                · ذخیره در{' '}
                {new Date(entry.updatedAt).toLocaleTimeString('fa-IR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 no-print">
            <button
              type="button"
              onClick={() => setNoteOpen((o) => !o)}
              className="inline-flex items-center gap-1 min-h-[36px] px-2.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              {noteOpen ? (
                <>
                  <span>بستن یادداشت</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>
                    {entry?.note?.trim() ? 'ویرایش یادداشت' : 'افزودن یادداشت'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </button>
            {hasContent && (
              <button
                type="button"
                onClick={() => onClear(itemKey)}
                title="پاک کردن بررسی"
                className="inline-flex items-center justify-center min-h-[36px] min-w-[36px] text-slate-400 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Status buttons */}
        <div className="flex flex-wrap items-center gap-2 no-print">
          {STATUS_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isActive = entry?.status === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  onUpdate(itemKey, meta, {
                    status: isActive ? null : opt.value,
                  })
                }
                className={`inline-flex items-center gap-1.5 min-h-[40px] px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                  isActive ? opt.activeClass : opt.idleClass
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Print-only status line */}
        {entry?.status && (
          <div className="hidden print:block text-xs font-semibold text-slate-800 mt-1">
            وضعیت بررسی:{' '}
            {STATUS_OPTIONS.find((o) => o.value === entry.status)?.label}
          </div>
        )}

        {/* Note textarea */}
        {(noteOpen || Boolean(entry?.note?.trim())) && (
          <div className="mt-3">
            <textarea
              value={entry?.note ?? ''}
              onChange={(e) =>
                onUpdate(itemKey, meta, { note: e.target.value })
              }
              rows={2}
              placeholder="نقد علمی، پیشنهاد اصلاح صورت سؤال، بررسی صحت گراف یا معیار پاسخ را اینجا بنویسید (ذخیره خودکار در حافظه دستگاه)..."
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 focus:bg-white dark:focus:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
            />
          </div>
        )}
      </div>
    );
  }
);

ProfessorReviewBox.displayName = 'ProfessorReviewBox';
