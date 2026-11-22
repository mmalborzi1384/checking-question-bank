import React, { useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import type {
  GraphConstructionTarget,
  PracticeActivity,
  ReviewMap,
  ReviewStatus,
  TabKey,
} from '../types/curriculum';
import { resolveActivityGraph } from '../utils/graphTopology';
import { GraphRenderer } from './GraphRenderer';
import { MathText } from './MathText';
import { ProfessorReviewBox } from './ProfessorReviewBox';

interface ActivityBankTabProps {
  tab: 'practice' | 'bank-lab';
  datasetTitle: string;
  bankVersion: string;
  datasetReviewStatus?: string;
  datasetAdaptationReason?: string;
  activities: PracticeActivity[];
  searchQuery: string;
  modeFilter: string;
  targetFilter: string;
  reviewFilter: string;
  onlyWithFigure: boolean;
  reviews: ReviewMap;
  onUpdateReview: (
    itemKey: string,
    meta: { tab: TabKey; itemId: string; title: string },
    patch: { status?: ReviewStatus | null; note?: string }
  ) => void;
  onClearReview: (itemKey: string) => void;
}

export function formatTargetValue(
  target: string | GraphConstructionTarget
): string {
  if (typeof target === 'string') return target;
  const parts = [`n=${target.n}`, `γ=${target.gamma}`];
  if (target.minimumSetCountMin !== undefined) {
    parts.push(`minSets≥${target.minimumSetCountMin}`);
  }
  if (target.minimumSetCountMax !== undefined) {
    parts.push(`minSets≤${target.minimumSetCountMax}`);
  }
  return `graph-target(${parts.join(', ')})`;
}

export function getTargetKey(target: string | GraphConstructionTarget): string {
  return typeof target === 'string' ? target : 'graph-construction-spec';
}

const ActivityBankCard: React.FC<{
  tab: 'practice' | 'bank-lab';
  activity: PracticeActivity;
  reviews: ReviewMap;
  onUpdateReview: ActivityBankTabProps['onUpdateReview'];
  onClearReview: ActivityBankTabProps['onClearReview'];
}> = React.memo(({ tab, activity, reviews, onUpdateReview, onClearReview }) => {
  const itemKey = `${tab}:${activity.questionId}`;

  const resolvedGraph = useMemo(
    () =>
      resolveActivityGraph({
        questionId: activity.questionId,
        places: activity.model?.places,
        title: activity.title,
        prompt: activity.prompt,
        scenario: activity.model?.scenario,
        rubric: activity.rubric,
      }),
    [activity]
  );

  const sourceModeTabsEntries = activity.sourceModeByTab
    ? Object.entries(activity.sourceModeByTab)
    : [];

  return (
    <article className="print-card bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4">
      {/* Metadata kicker */}
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
              {formatTargetValue(activity.target)}
            </span>
          </span>
          {activity.sourceMode && (
            <>
              <span aria-hidden="true">·</span>
              <span>
                نوع منبع:{' '}
                <span dir="ltr" className="font-mono-num text-slate-700 dark:text-slate-300">
                  {activity.sourceMode}
                </span>
              </span>
            </>
          )}
          {activity.figurePage !== null && activity.figurePage !== undefined && (
            <>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 font-semibold text-blue-800 dark:text-blue-400">
                <BookOpen className="w-3.5 h-3.5" />
                صفحه شکل کتاب: <span className="font-mono-num">{activity.figurePage}</span>
              </span>
            </>
          )}
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-1.5">
          <MathText text={activity.title} />
        </h3>
      </div>

      {/* Prompt */}
      <div className="text-sm sm:text-[15px] text-slate-800 dark:text-slate-200 leading-relaxed">
        <span className="font-semibold text-slate-900 dark:text-white">صورت سؤال: </span>
        <MathText text={activity.prompt} />
      </div>

      {/* Auto-rendered Graph */}
      {resolvedGraph && (
        <div
          className={`grid gap-4 ${
            resolvedGraph.secondaryGraph
              ? 'grid-cols-1 lg:grid-cols-2'
              : 'grid-cols-1'
          }`}
        >
          <GraphRenderer
            vertices={resolvedGraph.vertices}
            edges={resolvedGraph.edges}
            directed={resolvedGraph.directed}
            multigraph={resolvedGraph.multigraph}
            places={resolvedGraph.places}
            title={resolvedGraph.familyLabel ?? `گراف ${activity.questionId}`}
            sourceLabel={
              resolvedGraph.sourceKind === 'places-only'
                ? 'چیدمان مکان‌ها در JSON'
                : resolvedGraph.sourceKind === 'inferred-family'
                ? 'توپولوژی استاندارد استخراج‌شده'
                : 'ساختار مرجع کتاب'
            }
          />
          {resolvedGraph.secondaryGraph && (
            <GraphRenderer
              vertices={resolvedGraph.secondaryGraph.graph.vertices}
              edges={resolvedGraph.secondaryGraph.graph.edges}
              directed={resolvedGraph.secondaryGraph.graph.directed}
              multigraph={resolvedGraph.secondaryGraph.graph.multigraph}
              title={resolvedGraph.secondaryGraph.label}
              sourceLabel="گراف مکمل / مقایسه‌ای"
            />
          )}
        </div>
      )}

      {/* Model Information */}
      {activity.model && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
            اطلاعات مدل‌سازی (Model)
          </div>
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
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  برچسب صفحه تعاملی:{' '}
                </span>
                <MathText text={activity.model.boardLabel} />
              </div>
            )}
          </div>

          {activity.model.places && activity.model.places.length > 0 && (
            <details className="pt-1">
              <summary className="text-xs font-medium text-blue-800 dark:text-blue-400 hover:text-blue-950 dark:hover:text-blue-300 cursor-pointer select-none">
                مشاهدهٔ مختصات دقیق {activity.model.places.length} مکان (places)
              </summary>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full text-xs border-collapse border border-slate-200 dark:border-slate-700">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      <th className="border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-right">شناسه</th>
                      <th className="border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-right">برچسب</th>
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

          {activity.model.hints && activity.model.hints.length > 0 && (
            <div className="pt-1 text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200">راهنماهای مدل:</span>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-600 dark:text-slate-400">
                {activity.model.hints.map((h, i) => (
                  <li key={i}>
                    <MathText text={h} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activity.model.adaptationReason && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">دلیل انطباق مدل: </span>
              <MathText text={activity.model.adaptationReason} />
            </p>
          )}

          {activity.model.review && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">وضعیت بازبینی مدل: </span>
              <span dir="ltr" className="font-mono-num">{activity.model.review.status}</span>
              {activity.model.review.basis && ` — ${activity.model.review.basis}`}
            </p>
          )}
        </div>
      )}

      {/* Activity Hints */}
      {activity.hints && activity.hints.length > 0 && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1.5">
            راهنماها (Hints — {activity.hints.length} مورد)
          </div>
          <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            {activity.hints.map((hint, idx) => (
              <li key={idx}>
                <MathText text={hint} />
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Rubric */}
      {activity.rubric && (
        <div className="bg-emerald-50/50 dark:bg-emerald-950/35 border border-emerald-200/80 dark:border-emerald-800/70 rounded-xl p-3.5 text-sm">
          <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-1">
            پاسخ و معیار ارزیابی (Rubric)
          </div>
          <p className="text-slate-800 dark:text-emerald-100 leading-relaxed">
            <MathText text={activity.rubric} />
          </p>
        </div>
      )}

      {/* Assessment Policy, Review Status, SourceModeByTab */}
      {(activity.assessmentPolicy ||
        activity.reviewStatus ||
        activity.adaptationReason ||
        sourceModeTabsEntries.length > 0) && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs text-slate-500 dark:text-slate-400">
          {activity.assessmentPolicy && (
            <p>
              <span className="font-semibold text-slate-700 dark:text-slate-300">سیاست ارزیابی: </span>
              <MathText text={activity.assessmentPolicy} />
            </p>
          )}
          {activity.adaptationReason && (
            <p>
              <span className="font-semibold text-slate-700 dark:text-slate-300">توضیح انطباق: </span>
              <MathText text={activity.adaptationReason} />
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {activity.reviewStatus && (
              <span>
                وضعیت ثبت‌شده:{' '}
                <span dir="ltr" className="font-mono-num text-slate-700 dark:text-slate-300">
                  {activity.reviewStatus}
                </span>
              </span>
            )}
            {sourceModeTabsEntries.length > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  حالت در تب‌ها:{' '}
                  <span dir="ltr" className="font-mono-num text-slate-700 dark:text-slate-300">
                    {sourceModeTabsEntries.map(([k, v]) => `${k}: ${v}`).join(' | ')}
                  </span>
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Professor Review Box */}
      <ProfessorReviewBox
        itemKey={itemKey}
        tab={tab}
        itemId={activity.questionId}
        title={activity.title}
        entry={reviews[itemKey]}
        onUpdate={onUpdateReview}
        onClear={onClearReview}
      />
    </article>
  );
});

ActivityBankCard.displayName = 'ActivityBankCard';

export const ActivityBankTab: React.FC<ActivityBankTabProps> = ({
  tab,
  datasetTitle,
  bankVersion,
  datasetReviewStatus,
  datasetAdaptationReason,
  activities,
  searchQuery,
  modeFilter,
  targetFilter,
  reviewFilter,
  onlyWithFigure,
  reviews,
  onUpdateReview,
  onClearReview,
}) => {
  const query = searchQuery.trim().toLowerCase();

  const filtered = useMemo(() => {
    return activities.filter((act) => {
      if (modeFilter !== 'all' && act.mode !== modeFilter) return false;
      if (targetFilter !== 'all' && getTargetKey(act.target) !== targetFilter)
        return false;
      if (onlyWithFigure && (act.figurePage === null || act.figurePage === undefined)) {
        return false;
      }

      const key = `${tab}:${act.questionId}`;
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
        act.mode,
        formatTargetValue(act.target),
        act.rubric ?? '',
        act.sourceMode ?? '',
        act.model?.scenario ?? '',
        act.model?.vertexMeaning ?? '',
        act.model?.edgeMeaning ?? '',
        ...(act.hints ?? []),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [
    activities,
    modeFilter,
    targetFilter,
    onlyWithFigure,
    reviewFilter,
    reviews,
    tab,
    query,
  ]);

  return (
    <div className="space-y-5">
      <div className="bg-slate-100/70 dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
            {datasetTitle}
          </span>
          <span>
            نمایش{' '}
            <strong className="text-slate-900 dark:text-slate-100 font-mono-num">
              {filtered.length}
            </strong>{' '}
            از{' '}
            <strong className="text-slate-900 dark:text-slate-100 font-mono-num">
              {activities.length}
            </strong>{' '}
            آیتم · نسخه بانک <span className="font-mono-num">{bankVersion}</span>
          </span>
        </div>
        {datasetAdaptationReason && (
          <p className="leading-relaxed">
            <span className="font-semibold text-slate-800 dark:text-slate-200">توضیح بسته: </span>
            {datasetAdaptationReason}
          </p>
        )}
        {datasetReviewStatus && (
          <p>
            وضعیت بررسی منبع:{' '}
            <span dir="ltr" className="font-mono-num text-slate-700 dark:text-slate-300">
              {datasetReviewStatus}
            </span>
          </p>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center text-sm text-slate-500 dark:text-slate-400">
          هیچ سؤالی با فیلتر یا جست‌وجوی انتخاب‌شده یافت نشد.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((activity) => (
            <ActivityBankCard
              key={activity.questionId}
              tab={tab}
              activity={activity}
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
