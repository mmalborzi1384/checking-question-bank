import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReviewEntry, ReviewMap, ReviewStatus, TabKey } from '../types/curriculum';

const STORAGE_KEY = 'graph_theory_professor_reviews_v1';

const STATUS_LABELS: Record<ReviewStatus, string> = {
  approved: 'تأیید شده',
  'needs-revision': 'نیازمند اصلاح',
  'scientific-error': 'دارای خطای علمی',
};

const TAB_LABELS: Record<TabKey, string> = {
  teaching: 'آموزش (teaching.json)',
  practice: 'تمرین‌ها (practice.json)',
  'bank-lab': 'آزمایشگاه بانک (bank-lab.json)',
  competition: 'مسابقه (competition.json)',
  lab: 'ایستگاه‌های آزمایشگاه (lab.json)',
};

export function getReviewStatusLabel(status?: ReviewStatus): string {
  if (!status) return 'بررسی‌نشده';
  return STATUS_LABELS[status];
}

export function useProfessorReviews() {
  const [reviews, setReviews] = useState<ReviewMap>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? (parsed as ReviewMap) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    } catch {
      // Ignore storage quota errors in restricted webviews
    }
  }, [reviews]);

  const updateReview = useCallback(
    (
      itemKey: string,
      meta: { tab: TabKey; itemId: string; title: string },
      patch: { status?: ReviewStatus | null; note?: string }
    ) => {
      setReviews((prev) => {
        const existing = prev[itemKey];
        const nextStatus =
          patch.status === null
            ? undefined
            : patch.status !== undefined
            ? patch.status
            : existing?.status;
        const nextNote =
          patch.note !== undefined ? patch.note : existing?.note ?? '';

        if (!nextStatus && nextNote.trim() === '') {
          const clone = { ...prev };
          delete clone[itemKey];
          return clone;
        }

        const nextEntry: ReviewEntry = {
          itemKey,
          tab: meta.tab,
          itemId: meta.itemId,
          title: meta.title,
          status: nextStatus,
          note: nextNote,
          updatedAt: new Date().toISOString(),
        };
        return { ...prev, [itemKey]: nextEntry };
      });
    },
    []
  );

  const clearReview = useCallback((itemKey: string) => {
    setReviews((prev) => {
      const clone = { ...prev };
      delete clone[itemKey];
      return clone;
    });
  }, []);

  const importReviews = useCallback((jsonText: string): { ok: boolean; count: number; error?: string } => {
    try {
      const parsed = JSON.parse(jsonText);
      const source: ReviewMap = parsed?.reviews && typeof parsed.reviews === 'object' ? parsed.reviews : parsed;
      if (!source || typeof source !== 'object') {
        return { ok: false, count: 0, error: 'ساختار فایل JSON معتبر نیست.' };
      }
      const valid: ReviewMap = {};
      for (const [k, v] of Object.entries(source)) {
        if (v && typeof v === 'object' && 'itemId' in v && 'tab' in v) {
          valid[k] = v as ReviewEntry;
        }
      }
      setReviews((prev) => ({ ...prev, ...valid }));
      return { ok: true, count: Object.keys(valid).length };
    } catch {
      return { ok: false, count: 0, error: 'خطا در خواندن فایل JSON.' };
    }
  }, []);

  const summary = useMemo(() => {
    const entries = Object.values(reviews);
    let approved = 0;
    let needsRevision = 0;
    let scientificError = 0;
    let withNote = 0;

    for (const entry of entries) {
      if (entry.status === 'approved') approved++;
      else if (entry.status === 'needs-revision') needsRevision++;
      else if (entry.status === 'scientific-error') scientificError++;
      if (entry.note.trim().length > 0) withNote++;
    }

    return {
      total: entries.length,
      approved,
      needsRevision,
      scientificError,
      withNote,
    };
  }, [reviews]);

  const exportJson = useCallback(() => {
    const payload = {
      exportedAt: new Date().toISOString(),
      app: 'سامانه بازبینی علمی گراف و احاطه‌گری',
      summary,
      reviews,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `professor-review-notes-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [reviews, summary]);

  const exportTextReport = useCallback(() => {
    const entries = Object.values(reviews).sort((a, b) =>
      a.itemKey.localeCompare(b.itemKey)
    );
    const lines: string[] = [
      '====================================================',
      'گزارش نقد و بازبینی علمی سامانه آموزشی نظریه گراف',
      `تاریخ خروجی: ${new Date().toLocaleString('fa-IR')}`,
      `تعداد کل موارد یادداشت‌گذاری‌شده: ${summary.total}`,
      `تأیید شده: ${summary.approved} | نیازمند اصلاح: ${summary.needsRevision} | دارای خطای علمی: ${summary.scientificError}`,
      '====================================================',
      '',
    ];

    if (entries.length === 0) {
      lines.push('هنوز هیچ وضعیت یا یادداشتی ثبت نشده است.');
    } else {
      const grouped: Record<string, ReviewEntry[]> = {};
      for (const e of entries) {
        if (!grouped[e.tab]) grouped[e.tab] = [];
        grouped[e.tab].push(e);
      }

      for (const tab of Object.keys(grouped) as TabKey[]) {
        lines.push(`## ${TAB_LABELS[tab] ?? tab}`);
        lines.push('----------------------------------------------------');
        for (const item of grouped[tab]) {
          lines.push(`[${item.itemId}] ${item.title}`);
          lines.push(`وضعیت: ${getReviewStatusLabel(item.status)}`);
          if (item.note.trim()) {
            lines.push(`یادداشت استاد: ${item.note.trim()}`);
          }
          lines.push(`زمان ثبت: ${new Date(item.updatedAt).toLocaleString('fa-IR')}`);
          lines.push('');
        }
      }
    }

    const blob = new Blob([lines.join('\n')], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `professor-review-report-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [reviews, summary]);

  return {
    reviews,
    summary,
    updateReview,
    clearReview,
    importReviews,
    exportJson,
    exportTextReport,
  };
}
