import React, { useMemo } from 'react';
import { competitionData } from '../data/datasets';
import type {
  CompetitionActivity,
  ReviewMap,
  ReviewStatus,
  TabKey,
} from '../types/curriculum';
import { resolveActivityGraph } from '../utils/graphTopology';
import { GraphRenderer } from './GraphRenderer';
import { MathText } from './MathText';
import { ProfessorReviewBox } from './ProfessorReviewBox';

interface CompetitionTabProps {
  searchQuery: string;
  reviewFilter: string;
  reviews: ReviewMap;
  onUpdateReview: (
    itemKey: string,
    meta: { tab: TabKey; itemId: string; title: string },
    patch: { status?: ReviewStatus | null; note?: string }
  ) => void;
  onClearReview: (itemKey: string) => void;
}

const CompetitionCard: React.FC<{
  activity: CompetitionActivity;
  reviews: ReviewMap;
  onUpdateReview: CompetitionTabProps['onUpdateReview'];
  onClearReview: CompetitionTabProps['onClearReview'];
}> = React.memo(({ activity, reviews, onUpdateReview, onClearReview }) => {
  const itemKey = `competition:${activity.questionId}`;

  const resolvedGraph = useMemo(
    () =>
      resolveActivityGraph({
        questionId: activity.questionId,
        places: activity.model.places,
        title: activity.title,
        prompt: activity.prompt,
        scenario: activity.model.scenario,
      }),
    [activity]
  );

  return (
    <article className="print-card bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4">
      <div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <span dir="ltr" className="font-mono-num font-bold text-blue-900 dark:text-blue-400">
            {activity.questionId}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            حالت:{' '}
            <span dir="ltr" className="font-mono-num text-slate-700 dark:text-slate-300">
              {activity.mode}
            </span>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            هدف:{' '}
            <span dir="ltr" className="font-mono-num text-slate-700 dark:text-slate-300">
              {activity.target}
            </span>
          </span>
          {activity.model.places && (
            <>
              <span aria-hidden="true">·</span>
              <span>
                تعداد مکان‌ها:{' '}
                <strong className="font-mono-num text-slate-700 dark:text-slate-300">
                  {activity.model.places.length}
                </strong>
              </span>
            </>
          )}
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-1.5">
          <MathText text={activity.title} />
        </h3>
      </div>

      <p className="text-sm sm:text-[15px] text-slate-800 dark:text-slate-200 leading-relaxed">
        <span className="font-semibold text-slate-900 dark:text-white">صورت سؤال مسابقه: </span>
        <MathText text={activity.prompt} />
      </p>

      {resolvedGraph && (
        <GraphRenderer
          vertices={resolvedGraph.vertices}
          edges={resolvedGraph.edges}
          directed={resolvedGraph.directed}
          multigraph={resolvedGraph.multigraph}
          places={resolvedGraph.places}
          title={resolvedGraph.familyLabel ?? activity.title}
          sourceLabel="چیدمان places از competition.json + توپولوژی استاندارد"
        />
      )}

      {/* Model details */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {activity.model.scenario && (
            <div className="md:col-span-2">
              <span className="font-semibold text-slate-900 dark:text-slate-100">سناریو: </span>
              <MathText text={activity.model.scenario} />
            </div>
          )}
          {activity.model.vertexMeaning && (
            <div>
              <span className="font-semibold text-slate-900 dark:text-slate-100">معنای رأس: </span>
              <MathText text={activity.model.vertexMeaning} />
            </div>
          )}
          {activity.model.edgeMeaning && (
            <div>
              <span className="font-semibold text-slate-900 dark:text-slate-100">معنای یال: </span>
              <MathText text={activity.model.edgeMeaning} />
            </div>
          )}
          {activity.model.boardLabel && (
            <div className="md:col-span-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-800 dark:text-slate-200">برچسب صفحه: </span>
              <MathText text={activity.model.boardLabel} />
            </div>
          )}
        </div>

        {/* Places coordinates table */}
        {activity.model.places && activity.model.places.length > 0 && (
          <details className="pt-1">
            <summary className="text-xs font-medium text-blue-800 dark:text-blue-400 hover:text-blue-950 dark:hover:text-blue-300 cursor-pointer select-none">
              جدول مختصات چیدمان مکان‌ها ({activity.model.places.length} رأس)
            </summary>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-xs border-collapse border border-slate-200 dark:border-slate-700">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <th className="border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-right">شناسه</th>
                    <th className="border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-right">برچسب فارسی</th>
                    <th className="border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-left font-mono-num">x</th>
                    <th className="border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-left font-mono-num">y</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.model.places.map((p) => (
                    <tr key={p.id}>
                      <td className="border border-slate-200 dark:border-slate-700 px-2.5 py-1 font-mono-num font-semibold" dir="ltr">
                        {p.id}
                      </td>
                      <td className="border border-slate-200 dark:border-slate-700 px-2.5 py-1">{p.label}</td>
                      <td className="border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-left font-mono-num" dir="ltr">
                        {Number(p.x).toFixed(1)}
                      </td>
                      <td className="border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-left font-mono-num" dir="ltr">
                        {Number(p.y).toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        )}
      </div>

      {/* Hints (activity hints + model hints) */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
        {activity.hints && activity.hints.length > 0 && (
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
              راهنماهای سؤال مسابقه ({activity.hints.length})
            </div>
            <ol className="list-decimal list-inside space-y-1">
              {activity.hints.map((h, i) => (
                <li key={i}>
                  <MathText text={h} />
                </li>
              ))}
            </ol>
          </div>
        )}
        {activity.model.hints && activity.model.hints.length > 0 && (
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
              راهنماهای مدل ({activity.model.hints.length})
            </div>
            <ol className="list-decimal list-inside space-y-1">
              {activity.model.hints.map((h, i) => (
                <li key={i}>
                  <MathText text={h} />
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {(activity.model.adaptationReason || activity.model.review) && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
          {activity.model.adaptationReason && (
            <p>
              <span className="font-semibold text-slate-700 dark:text-slate-300">دلیل انطباق: </span>
              {activity.model.adaptationReason}
            </p>
          )}
          {activity.model.review && (
            <p>
              <span className="font-semibold text-slate-700 dark:text-slate-300">بازبینی مدل: </span>
              <span dir="ltr" className="font-mono-num">{activity.model.review.status}</span>
              {activity.model.review.basis && ` — ${activity.model.review.basis}`}
            </p>
          )}
        </div>
      )}

      <ProfessorReviewBox
        itemKey={itemKey}
        tab="competition"
        itemId={activity.questionId}
        title={activity.title}
        entry={reviews[itemKey]}
        onUpdate={onUpdateReview}
        onClear={onClearReview}
      />
    </article>
  );
});

CompetitionCard.displayName = 'CompetitionCard';

export const CompetitionTab: React.FC<CompetitionTabProps> = ({
  searchQuery,
  reviewFilter,
  reviews,
  onUpdateReview,
  onClearReview,
}) => {
  const query = searchQuery.trim().toLowerCase();

  const filtered = useMemo(() => {
    return competitionData.activities.filter((act) => {
      const key = `competition:${act.questionId}`;
      const rev = reviews[key];
      if (reviewFilter === 'unreviewed' && (rev?.status || rev?.note?.trim()))
        return false;
      if (
        reviewFilter !== 'all' &&
        reviewFilter !== 'unreviewed' &&
        rev?.status !== reviewFilter
      ) {
        return false;
      }

      if (!query) return true;
      const haystack = [
        act.questionId,
        act.title,
        act.prompt,
        act.model.scenario ?? '',
        ...(act.hints ?? []),
        ...(act.model.places ?? []).map((p) => `${p.id} ${p.label}`),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [reviewFilter, reviews, query]);

  return (
    <div className="space-y-6">
      {/* Competition Settings Panel */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            تنظیمات مسابقه (competition.json)
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            نمایش{' '}
            <strong className="font-mono-num text-slate-900 dark:text-slate-100">
              {filtered.length}
            </strong>{' '}
            از{' '}
            <strong className="font-mono-num text-slate-900 dark:text-slate-100">
              {competitionData.activities.length}
            </strong>{' '}
            سؤال مسابقه
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              تعداد دورهای پیش‌فرض (defaultRounds)
            </div>
            <div className="text-lg font-bold text-blue-900 dark:text-blue-400 font-mono-num mt-0.5">
              {competitionData.defaultRounds}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              سقف امتیازها (caps)
            </div>
            <div
              dir="ltr"
              className="text-lg font-bold text-blue-900 dark:text-blue-400 font-mono-num mt-0.5 text-right"
            >
              [{competitionData.caps.join(', ')}]
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              نسخه بانک (bankVersion)
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100 font-mono-num mt-0.5">
              {competitionData.bankVersion}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">وضعیت بازبینی</div>
            <div
              dir="ltr"
              className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono-num mt-1.5 text-right"
            >
              {competitionData.reviewStatus}
            </div>
          </div>
        </div>

        {competitionData.adaptationReason && (
          <p className="text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              سیاست انتخاب سؤالات:{' '}
            </span>
            {competitionData.adaptationReason}
          </p>
        )}
      </section>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center text-sm text-slate-500 dark:text-slate-400">
          هیچ سؤال مسابقه‌ای با معیار جست‌وجوی شما یافت نشد.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((act) => (
            <CompetitionCard
              key={act.questionId}
              activity={act}
              reviews={reviews}
              onUpdateReview={onUpdateReview}
              onClearReview={onClearReview}
            />
          ))}
        </div>
      )}
    </div>
  );
};
