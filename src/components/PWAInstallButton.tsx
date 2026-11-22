import React, { useState } from 'react';
import { Download, Share, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'panel';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    if (variant === 'panel') {
      return (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/70 dark:bg-emerald-950/40 px-3.5 py-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
          اپلیکیشن در حال حاضر به‌صورت نصب‌شده (Standalone) و آفلاین اجرا می‌شود.
        </div>
      );
    }
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={
          variant === 'header'
            ? 'inline-flex items-center gap-1.5 min-h-[40px] px-3 py-2 text-xs font-semibold rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors whitespace-nowrap shrink-0 cursor-pointer'
            : 'inline-flex items-center justify-center gap-2 min-h-[44px] w-full px-4 py-2.5 text-xs font-semibold rounded-xl bg-blue-900 dark:bg-blue-600 text-white hover:bg-blue-800 dark:hover:bg-blue-500 transition-colors cursor-pointer'
        }
      >
        <Download className="w-4 h-4 shrink-0" />
        <span>نصب اپ آفلاین (PWA)</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={
            variant === 'header'
              ? 'inline-flex items-center gap-1.5 min-h-[40px] px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer'
              : 'inline-flex items-center justify-center gap-2 min-h-[44px] w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer'
          }
        >
          <Smartphone className="w-4 h-4 shrink-0" />
          <span>نصب روی iPhone / iPad</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 no-print"
            role="dialog"
            aria-modal="true"
            aria-label="راهنمای نصب روی iOS"
          >
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  نصب آفلاین روی آیفون و آیپد
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="بستن"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <li>
                  در نوار پایین مرورگر Safari، دکمهٔ{' '}
                  <strong className="inline-flex items-center gap-1 text-slate-900 dark:text-white">
                    <Share className="w-3.5 h-3.5 inline" />
                    Share
                  </strong>{' '}
                  را لمس کنید.
                </li>
                <li>
                  به پایین اسکرول کرده و گزینهٔ{' '}
                  <strong className="text-slate-900 dark:text-white" dir="ltr">
                    Add to Home Screen
                  </strong>{' '}
                  را انتخاب کنید.
                </li>
                <li>
                  دکمهٔ <strong className="text-slate-900 dark:text-white">Add</strong>{' '}
                  را بزنید تا اپلیکیشن کاملاً آفلاین روی صفحهٔ اصلی نصب شود.
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full min-h-[42px] rounded-xl bg-blue-900 dark:bg-blue-600 text-white text-xs font-semibold hover:bg-blue-800 dark:hover:bg-blue-500 transition-colors cursor-pointer"
              >
                متوجه شدم
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  if (variant === 'panel') {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        برای نصب مستقیم از مرورگر Chrome روی اندروید: پس از باز کردن لینک GitHub Pages، از منوی سه‌نقطهٔ مرورگر گزینهٔ{' '}
        <strong className="text-slate-900 dark:text-slate-100">Install app / Add to Home screen</strong>{' '}
        را انتخاب کنید تا اپ بدون نیاز به APK و کاملاً آفلاین روی گوشی نصب شود.
      </div>
    );
  }

  return null;
};
