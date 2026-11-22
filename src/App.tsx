import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  ClipboardList,
  Download,
  FlaskConical,
  GraduationCap,
  Moon,
  RotateCcw,
  Search,
  Sun,
  Trophy,
  X,
} from 'lucide-react';
import {
  bankLabData,
  competitionData,
  labData,
  practiceData,
  teachingData,
} from './data/datasets';
import type { TabKey } from './types/curriculum';
import { useProfessorReviews } from './hooks/useProfessorReviews';
import { useTheme } from './hooks/useTheme';
import { DataAuditSummary } from './components/DataAuditSummary';
import { TeachingTab } from './components/TeachingTab';
import {
  ActivityBankTab,
  getTargetKey,
} from './components/ActivityBankTab';
import { CompetitionTab } from './components/CompetitionTab';
import { LabTab } from './components/LabTab';
import { ExportAndBuildModal } from './components/ExportAndBuildModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';

const TABS: {
  key: TabKey;
  label: string;
  shortLabel: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  { key: 'teaching', label: 'آموزش', shortLabel: 'آموزش', icon: GraduationCap },
  { key: 'practice', label: 'تمرین‌ها', shortLabel: 'تمرین‌ها', icon: BookOpen },
  {
    key: 'bank-lab',
    label: 'آزمایشگاه بانک',
    shortLabel: 'بانک',
    icon: ClipboardList,
  },
  { key: 'competition', label: 'مسابقه', shortLabel: 'مسابقه', icon: Trophy },
  {
    key: 'lab',
    label: 'ایستگاه‌های آزمایشگاه',
    shortLabel: 'آزمایشگاه',
    icon: FlaskConical,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('teaching');
  const [auditExpanded, setAuditExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Tab-specific filters
  const [lessonFilter, setLessonFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [onlyExitVariants, setOnlyExitVariants] = useState(false);

  const [modeFilter, setModeFilter] = useState('all');
  const [targetFilter, setTargetFilter] = useState('all');
  const [onlyWithFigure, setOnlyWithFigure] = useState(false);

  const [reviewFilter, setReviewFilter] = useState('all');

  // Export & Android APK modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSection, setModalSection] = useState<'export' | 'android'>('export');

  const { isDark, toggleTheme } = useTheme();

  const {
    reviews,
    summary: reviewSummary,
    updateReview,
    clearReview,
    importReviews,
    exportJson,
    exportTextReport,
  } = useProfessorReviews();

  // Compute available modes and targets dynamically from active dataset
  const availableModesAndTargets = useMemo(() => {
    const source =
      activeTab === 'practice'
        ? practiceData.activities
        : activeTab === 'bank-lab'
        ? bankLabData.activities
        : [];
    const modes = Array.from(new Set(source.map((a) => a.mode)));
    const targets = Array.from(new Set(source.map((a) => getTargetKey(a.target))));
    return { modes, targets };
  }, [activeTab]);

  const handleTabChange = (nextTab: TabKey) => {
    setActiveTab(nextTab);
    setModeFilter('all');
    setTargetFilter('all');
    setOnlyWithFigure(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    reviewFilter !== 'all' ||
    (activeTab === 'teaching' &&
      (lessonFilter !== 'all' || stageFilter !== 'all' || onlyExitVariants)) ||
    ((activeTab === 'practice' || activeTab === 'bank-lab') &&
      (modeFilter !== 'all' || targetFilter !== 'all' || onlyWithFigure));

  const resetFilters = () => {
    setSearchQuery('');
    setLessonFilter('all');
    setStageFilter('all');
    setOnlyExitVariants(false);
    setModeFilter('all');
    setTargetFilter('all');
    setOnlyWithFigure(false);
    setReviewFilter('all');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Bar Contract: 3 clean zones separated by gap-6/gap-8 */}
      <header className="sticky top-0 z-30 h-[56px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 no-print">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4 md:gap-8">
          {/* Zone 1: Single-element Brand Wordmark */}
          <button
            type="button"
            onClick={() => handleTabChange('teaching')}
            className="text-base sm:text-lg font-extrabold tracking-tight text-slate-950 dark:text-white whitespace-nowrap shrink-0 cursor-pointer"
          >
            بازبینی علمی گراف
          </button>

          {/* Zone 2: 5 clean single-line desktop nav links */}
          <nav
            aria-label="ناوبری اصلی"
            className="hidden md:flex items-center gap-6 text-sm font-medium"
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleTabChange(tab.key)}
                  className={`py-4 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'border-blue-800 dark:border-blue-400 text-blue-900 dark:text-blue-400 font-bold'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Theme Toggle, Contextual PWA Install, Primary Action */}
          <div className="flex items-center gap-2 shrink-0">
            <PWAInstallButton variant="header" />

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'تغییر به حالت روز' : 'تغییر به حالت شب'}
              title={isDark ? 'حالت روز' : 'حالت شب'}
              className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setModalSection('export');
                setModalOpen(true);
              }}
              className="inline-flex items-center gap-2 min-h-[40px] px-3.5 sm:px-4 py-2 text-xs font-semibold text-white bg-blue-900 dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-500 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>خروجی و نصب</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-24 md:pb-12 space-y-5">
        {/* Print-only Header */}
        <div className="hidden print:block pb-4 border-b border-slate-300 mb-4">
          <h1 className="text-xl font-bold text-slate-950">
            گزارش بازبینی علمی بانک سؤالات و ساختار آموزشی نظریه گراف
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            تاریخ چاپ: {new Date().toLocaleDateString('fa-IR')} · کل بررسی‌شده:{' '}
            {reviewSummary.total}
          </p>
        </div>

        {/* Exact Data Integrity Audit Panel */}
        <DataAuditSummary
          activeTab={activeTab}
          onSelectTab={handleTabChange}
          expanded={auditExpanded}
          onToggleExpanded={() => setAuditExpanded((v) => !v)}
          reviewSummary={reviewSummary}
        />

        {/* Search & Filter Toolbar */}
        <section
          aria-label="جست‌وجو و فیلتر"
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 no-print"
        >
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جست‌وجو بر اساس شناسه (مثل Q048، L1-A1) یا متن سؤال، معیار و سناریو..."
                className="w-full min-h-[44px] pr-10 pl-9 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 focus:bg-white dark:focus:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="پاک کردن جست‌وجو"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Common Review Status Filter */}
            <select
              aria-label="فیلتر وضعیت بررسی استاد"
              value={reviewFilter}
              onChange={(e) => setReviewFilter(e.target.value)}
              className="min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600"
            >
              <option value="all">همه وضعیت‌های بررسی</option>
              <option value="unreviewed">بررسی‌نشده</option>
              <option value="approved">تأیید شده</option>
              <option value="needs-revision">نیازمند اصلاح</option>
              <option value="scientific-error">دارای خطای علمی</option>
            </select>
          </div>

          {/* Context-specific filter row */}
          <div className="flex flex-wrap items-center gap-2.5">
            {activeTab === 'teaching' && (
              <>
                <select
                  aria-label="فیلتر درس"
                  value={lessonFilter}
                  onChange={(e) => setLessonFilter(e.target.value)}
                  className="min-h-[40px] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                >
                  <option value="all">همه درس‌ها (۲ درس)</option>
                  {teachingData.lessons.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title} ({l.id})
                    </option>
                  ))}
                </select>

                <select
                  aria-label="فیلتر مرحله APOS"
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="min-h-[40px] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                >
                  <option value="all">همه مراحل APOS</option>
                  <option value="Action">کنش (Action)</option>
                  <option value="Process">فرایند (Process)</option>
                  <option value="Object">شیء (Object)</option>
                  <option value="Schema">طرحواره (Schema)</option>
                </select>

                <button
                  type="button"
                  onClick={() => setOnlyExitVariants((v) => !v)}
                  className={`min-h-[40px] px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    onlyExitVariants
                      ? 'bg-blue-900 dark:bg-blue-600 text-white border-blue-900 dark:border-blue-600'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  فقط دارای نسخهٔ خروج (exitVariants)
                </button>
              </>
            )}

            {(activeTab === 'practice' || activeTab === 'bank-lab') && (
              <>
                <select
                  aria-label="فیلتر نوع فعالیت (mode)"
                  value={modeFilter}
                  onChange={(e) => setModeFilter(e.target.value)}
                  className="min-h-[40px] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                >
                  <option value="all">همه انواع (mode)</option>
                  {availableModesAndTargets.modes.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="فیلتر هدف (target)"
                  value={targetFilter}
                  onChange={(e) => setTargetFilter(e.target.value)}
                  className="min-h-[40px] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                >
                  <option value="all">همه هدف‌ها (target)</option>
                  {availableModesAndTargets.targets.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setOnlyWithFigure((v) => !v)}
                  className={`min-h-[40px] px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    onlyWithFigure
                      ? 'bg-blue-900 dark:bg-blue-600 text-white border-blue-900 dark:border-blue-600'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  فقط دارای شماره صفحه شکل کتاب
                </button>
              </>
            )}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer whitespace-nowrap mr-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>پاک‌کردن فیلترها</span>
              </button>
            )}
          </div>
        </section>

        {/* Active Tab View */}
        {activeTab === 'teaching' && (
          <TeachingTab
            searchQuery={searchQuery}
            lessonFilter={lessonFilter}
            stageFilter={stageFilter}
            reviewFilter={reviewFilter}
            onlyExitVariants={onlyExitVariants}
            reviews={reviews}
            onUpdateReview={updateReview}
            onClearReview={clearReview}
          />
        )}

        {activeTab === 'practice' && (
          <ActivityBankTab
            tab="practice"
            datasetTitle="بانک کامل تمرین‌ها (practice.json)"
            bankVersion={practiceData.bankVersion}
            datasetReviewStatus={practiceData.reviewStatus}
            datasetAdaptationReason={practiceData.adaptationReason}
            activities={practiceData.activities}
            searchQuery={searchQuery}
            modeFilter={modeFilter}
            targetFilter={targetFilter}
            reviewFilter={reviewFilter}
            onlyWithFigure={onlyWithFigure}
            reviews={reviews}
            onUpdateReview={updateReview}
            onClearReview={clearReview}
          />
        )}

        {activeTab === 'bank-lab' && (
          <ActivityBankTab
            tab="bank-lab"
            datasetTitle="فعالیت‌های آزمایشگاه بانک (bank-lab.json)"
            bankVersion={bankLabData.bankVersion}
            activities={bankLabData.activities}
            searchQuery={searchQuery}
            modeFilter={modeFilter}
            targetFilter={targetFilter}
            reviewFilter={reviewFilter}
            onlyWithFigure={onlyWithFigure}
            reviews={reviews}
            onUpdateReview={updateReview}
            onClearReview={clearReview}
          />
        )}

        {activeTab === 'competition' && (
          <CompetitionTab
            searchQuery={searchQuery}
            reviewFilter={reviewFilter}
            reviews={reviews}
            onUpdateReview={updateReview}
            onClearReview={clearReview}
          />
        )}

        {activeTab === 'lab' && (
          <LabTab
            searchQuery={searchQuery}
            reviewFilter={reviewFilter}
            reviews={reviews}
            onUpdateReview={updateReview}
            onClearReview={clearReview}
          />
        )}
      </main>

      {/* Offline Status Banner */}
      <OfflineIndicator />

      {/* Mobile Fixed 5-Tab Bottom Navigation Bar */}
      <nav
        aria-label="تب‌های پایین صفحه"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe no-print"
      >
        <div className="grid grid-cols-5 h-16">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTabChange(tab.key)}
                className={`flex flex-col items-center justify-center gap-1 min-h-[44px] transition-colors cursor-pointer ${
                  isActive
                    ? 'text-blue-900 dark:text-blue-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[11px] leading-none whitespace-nowrap">
                  {tab.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Export, PWA & Capacitor Android Build Modal */}
      <ExportAndBuildModal
        open={modalOpen}
        initialSection={modalSection}
        onClose={() => setModalOpen(false)}
        reviews={reviews}
        summary={reviewSummary}
        onExportJson={exportJson}
        onExportText={exportTextReport}
        onImportJson={importReviews}
      />
    </div>
  );
}
