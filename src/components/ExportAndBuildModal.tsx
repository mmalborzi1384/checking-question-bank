import React, { useRef, useState } from 'react';
import {
  Check,
  Cloud,
  Copy,
  Download,
  FileJson,
  FileText,
  Globe,
  Printer,
  Smartphone,
  Upload,
  X,
} from 'lucide-react';
import type { ReviewMap } from '../types/curriculum';
import { getReviewStatusLabel } from '../hooks/useProfessorReviews';
import { PWAInstallButton } from './PWAInstallButton';

interface ExportAndBuildModalProps {
  open: boolean;
  initialSection: 'export' | 'android';
  onClose: () => void;
  reviews: ReviewMap;
  summary: {
    total: number;
    approved: number;
    needsRevision: number;
    scientificError: number;
    withNote: number;
  };
  onExportJson: () => void;
  onExportText: () => void;
  onImportJson: (text: string) => { ok: boolean; count: number; error?: string };
}

const APK_COMMANDS = `# ۱. نصب وابستگی‌ها
npm install

# ۲. ساخت نسخهٔ تولید وب آفلاین
npm run build

# ۳. افزودن پلتفرم اندروید (فقط بار اول)
npx cap add android

# ۴. همگام‌سازی خروجی با پروژهٔ اندروید
npx cap sync android

# ۵. ساخت فایل APK در ترمینال (Debug)
cd android
./gradlew assembleDebug

# خروجی نهایی در مسیر زیر قرار می‌گیرد:
# android/app/build/outputs/apk/debug/app-debug.apk`;

export const ExportAndBuildModal: React.FC<ExportAndBuildModalProps> = ({
  open,
  initialSection,
  onClose,
  reviews,
  summary,
  onExportJson,
  onExportText,
  onImportJson,
}) => {
  const [section, setSection] = useState<'export' | 'android'>(initialSection);
  const [copied, setCopied] = useState(false);
  const [importFeedback, setImportFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setSection(initialSection);
      setImportFeedback(null);
    }
  }, [open, initialSection]);

  if (!open) return null;

  const entries = Object.values(reviews).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );

  const handleCopyCommands = async () => {
    try {
      await navigator.clipboard.writeText(APK_COMMANDS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = onImportJson(String(reader.result ?? ''));
      if (result.ok) {
        setImportFeedback(`${result.count} یادداشت با موفقیت بازیابی و ادغام شد.`);
      } else {
        setImportFeedback(result.error ?? 'خطا در بازیابی فایل.');
      }
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-0 md:p-4 no-print"
      role="dialog"
      aria-modal="true"
      aria-label="ابزارهای خروجی، PWA و ساخت اندروید"
    >
      <div className="w-full max-w-2xl max-h-[88vh] bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shadow-xl">
        {/* Grab handle on mobile */}
        <div className="md:hidden w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3" />

        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setSection('export')}
              className={`inline-flex items-center gap-1.5 min-h-[38px] px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                section === 'export'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>خروجی یادداشت‌ها</span>
            </button>
            <button
              type="button"
              onClick={() => setSection('android')}
              className={`inline-flex items-center gap-1.5 min-h-[38px] px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                section === 'android'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>نصب PWA، گیت‌هاب و APK</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="بستن پنجره"
            className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {section === 'export' ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono-num">
                    {summary.total}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    کل بررسی‌شده
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                  <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400 font-mono-num">
                    {summary.approved}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    تأیید شده
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                  <div className="text-xl font-bold text-amber-700 dark:text-amber-400 font-mono-num">
                    {summary.needsRevision}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    نیازمند اصلاح
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                  <div className="text-xl font-bold text-rose-700 dark:text-rose-400 font-mono-num">
                    {summary.scientificError}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    دارای خطای علمی
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={onExportText}
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-blue-900 dark:bg-blue-600 text-white text-xs font-semibold hover:bg-blue-800 dark:hover:bg-blue-500 transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>دانلود گزارش متنی (.txt)</span>
                </button>
                <button
                  type="button"
                  onClick={onExportJson}
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <FileJson className="w-4 h-4" />
                  <span>دانلود پشتیبان (.json)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setTimeout(() => window.print(), 180);
                  }}
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>چاپ / ذخیره PDF</span>
                </button>
              </div>

              {/* Restore JSON */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  بازیابی یادداشت‌ها از فایل JSON قبلی:
                </span>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/json,.json"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 min-h-[38px] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>بارگذاری فایل JSON</span>
                  </button>
                </div>
              </div>
              {importFeedback && (
                <p className="text-xs text-blue-800 dark:text-blue-200 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2">
                  {importFeedback}
                </p>
              )}

              {/* Preview of recorded reviews */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3">
                  فهرست یادداشت‌های ثبت‌شده ({entries.length})
                </h3>
                {entries.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
                    هنوز یادداشتی ثبت نشده است. روی کارت هر سؤال وضعیت یا نظر علمی خود را وارد کنید.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                    {entries.map((entry) => (
                      <div key={entry.itemKey} className="p-3 text-xs space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            <span className="font-mono-num text-blue-800 dark:text-blue-400 ml-1.5">
                              {entry.itemId}
                            </span>
                            {entry.title}
                          </span>
                          <span
                            className={`font-medium ${
                              entry.status === 'approved'
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : entry.status === 'needs-revision'
                                ? 'text-amber-700 dark:text-amber-400'
                                : entry.status === 'scientific-error'
                                ? 'text-rose-700 dark:text-rose-400'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {getReviewStatusLabel(entry.status)}
                          </span>
                        </div>
                        {entry.note && (
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            {entry.note}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-5">
              {/* Option 1: Direct Offline PWA Install */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                  <Smartphone className="w-4 h-4 text-blue-800 dark:text-blue-400" />
                  <span>۱. نصب مستقیم آفلاین روی گوشی (PWA — بدون نیاز به APK)</span>
                </div>
                <PWAInstallButton variant="panel" />
              </div>

              {/* Option 2: GitHub Pages + Cloud APK Build */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                  <Globe className="w-4 h-4 text-blue-800 dark:text-blue-400" />
                  <span>۲. انتشار خودکار روی GitHub Pages و ساخت ابری APK</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300">
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 space-y-1.5">
                    <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                      <span>انتشار وب‌سایت (GitHub Pages)</span>
                    </div>
                    <p className="leading-relaxed">
                      فایل <span dir="ltr" className="font-mono-num">deploy-pages.yml</span> آماده است. کافی است در مخزن گیت‌هاب به مسیر{' '}
                      <span dir="ltr" className="font-mono-num">Settings → Pages</span> رفته و Source را روی{' '}
                      <strong>GitHub Actions</strong> بگذارید تا سایت با مسیر زیرپوشهٔ صحیح منتشر شود.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 space-y-1.5">
                    <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Cloud className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                      <span>ساخت خودکار APK بدون Android Studio</span>
                    </div>
                    <p className="leading-relaxed">
                      فایل <span dir="ltr" className="font-mono-num">build-android-apk.yml</span> آماده است. در تب{' '}
                      <strong>Actions</strong> مخزن، روی <strong>Build Android APK</strong> کلیک کنید و پس از پایان، فایل{' '}
                      <span dir="ltr" className="font-mono-num">app-debug.apk</span> را مستقیم دانلود و روی گوشی نصب کنید.
                    </p>
                  </div>
                </div>
              </div>

              {/* Option 3: Local Capacitor APK build */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  ۳. ساخت محلی APK با Capacitor (روی کامپیوتر شخصی)
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 text-xs text-slate-400">
                    <span>دستورات ترمینال ساخت Android APK</span>
                    <button
                      type="button"
                      onClick={handleCopyCommands}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>کپی شد</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>کپی دستورات</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre
                    dir="ltr"
                    className="p-4 text-xs font-mono-num leading-relaxed overflow-x-auto text-left"
                  >
                    {APK_COMMANDS}
                  </pre>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  راهنمای کامل هر سه روش (PWA، GitHub Pages، GitHub Actions APK و ساخت محلی) در فایل{' '}
                  <span dir="ltr" className="font-mono-num">ANDROID_BUILD.md</span> نیز ذخیره شده است.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
