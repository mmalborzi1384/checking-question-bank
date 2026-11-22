import React from 'react';
import { ChevronDown, ChevronUp, Database } from 'lucide-react';
import { datasetStats } from '../data/datasets';
import type { TabKey } from '../types/curriculum';

interface DataAuditSummaryProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  expanded: boolean;
  onToggleExpanded: () => void;
  reviewSummary: {
    total: number;
    approved: number;
    needsRevision: number;
    scientificError: number;
    withNote: number;
  };
}

export const DataAuditSummary: React.FC<DataAuditSummaryProps> = ({
  activeTab,
  onSelectTab,
  expanded,
  onToggleExpanded,
  reviewSummary,
}) => {
  const fileCards: {
    tab: TabKey;
    file: string;
    label: string;
    primaryCount: number;
    primaryUnit: string;
    detail: string;
  }[] = [
    {
      tab: 'teaching',
      file: 'teaching.json',
      label: 'آموزش (APOS)',
      primaryCount: datasetStats.teaching.activities,
      primaryUnit: 'فعالیت',
      detail: `${datasetStats.teaching.lessons} درس · ${datasetStats.teaching.units} واحد · ${datasetStats.teaching.exitVariants} نسخهٔ خروج · ${datasetStats.teaching.parts} بخش`,
    },
    {
      tab: 'practice',
      file: 'practice.json',
      label: 'تمرین‌ها',
      primaryCount: datasetStats.practice.activities,
      primaryUnit: 'سؤال',
      detail: `نسخه بانک ${datasetStats.practice.bankVersion} · بارگذاری کامل`,
    },
    {
      tab: 'bank-lab',
      file: 'bank-lab.json',
      label: 'آزمایشگاه بانک',
      primaryCount: datasetStats.bankLab.activities,
      primaryUnit: 'فعالیت',
      detail: `نسخه بانک ${datasetStats.bankLab.bankVersion} · معیار و سیاست کامل`,
    },
    {
      tab: 'competition',
      file: 'competition.json',
      label: 'مسابقه',
      primaryCount: datasetStats.competition.activities,
      primaryUnit: 'سؤال',
      detail: `${datasetStats.competition.defaultRounds} دور · سقف [${datasetStats.competition.caps.join(', ')}]`,
    },
    {
      tab: 'lab',
      file: 'lab.json',
      label: 'ایستگاه‌های آزمایشگاه',
      primaryCount: datasetStats.lab.models,
      primaryUnit: 'مدل گراف',
      detail: `${datasetStats.lab.stations} ایستگاه · بازه ${datasetStats.lab.customMin} تا ${datasetStats.lab.customMax} رأس`,
    },
  ];

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden no-print">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs sm:text-sm">
          <Database className="w-4 h-4 text-blue-900 dark:text-blue-400 shrink-0" />
          <span className="font-bold text-slate-900 dark:text-slate-100">
            آمار کامل داده‌های بارگذاری‌شده (آفلاین · ۵ فایل JSON)
          </span>
          <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">
            ·
          </span>
          <span className="text-slate-600 dark:text-slate-400">
            کل موارد قابل بازبینی:{' '}
            <strong className="font-mono-num text-slate-900 dark:text-slate-100">
              {datasetStats.totalReviewableItems}
            </strong>
          </span>
          <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">
            ·
          </span>
          <span className="text-slate-600 dark:text-slate-400">
            بررسی‌شده:{' '}
            <strong className="font-mono-num text-blue-900 dark:text-blue-400">
              {reviewSummary.total}
            </strong>
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleExpanded}
          className="inline-flex items-center gap-1 min-h-[36px] px-2.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
        >
          <span>{expanded ? 'جمع‌کردن آمار' : 'نمایش آمار فایل‌ها'}</span>
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {expanded && (
        <div className="px-4 sm:px-5 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {fileCards.map((card) => {
              const isActive = activeTab === card.tab;
              return (
                <button
                  key={card.tab}
                  type="button"
                  onClick={() => onSelectTab(card.tab)}
                  className={`text-right p-3.5 rounded-xl border transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-50/70 dark:bg-blue-950/50 border-blue-300 dark:border-blue-700'
                      : 'bg-slate-50/60 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:bg-slate-100/70 dark:hover:bg-slate-800'
                  }`}
                >
                  <div
                    dir="ltr"
                    className="text-[11px] font-mono-num text-slate-500 dark:text-slate-400 text-right"
                  >
                    {card.file}
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    {card.label}
                  </div>
                  <div className="mt-1.5 flex items-baseline gap-1.5">
                    <span className="text-xl font-extrabold text-blue-900 dark:text-blue-400 font-mono-num">
                      {card.primaryCount}
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {card.primaryUnit}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {card.detail}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Review Progress Strip */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              وضعیت بازبینی استاد:
            </span>
            <span>
              تأیید شده:{' '}
              <strong className="font-mono-num text-emerald-700 dark:text-emerald-400">
                {reviewSummary.approved}
              </strong>
            </span>
            <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">
              ·
            </span>
            <span>
              نیازمند اصلاح:{' '}
              <strong className="font-mono-num text-amber-700 dark:text-amber-400">
                {reviewSummary.needsRevision}
              </strong>
            </span>
            <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">
              ·
            </span>
            <span>
              دارای خطای علمی:{' '}
              <strong className="font-mono-num text-rose-700 dark:text-rose-400">
                {reviewSummary.scientificError}
              </strong>
            </span>
            <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">
              ·
            </span>
            <span>
              دارای یادداشت متنی:{' '}
              <strong className="font-mono-num text-slate-900 dark:text-slate-100">
                {reviewSummary.withNote}
              </strong>
            </span>
          </div>
        </div>
      )}
    </section>
  );
};
