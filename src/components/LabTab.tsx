import React, { useMemo } from 'react';
import { labData, questionCrossRefById } from '../data/datasets';
import type {
  ActivityModel,
  ReviewMap,
  ReviewStatus,
  TabKey,
} from '../types/curriculum';
import { resolveActivityGraph } from '../utils/graphTopology';
import { GraphRenderer } from './GraphRenderer';
import { MathText } from './MathText';
import { ProfessorReviewBox } from './ProfessorReviewBox';

interface LabTabProps {
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

const LabModelCard: React.FC<{
  questionId: string;
  model: ActivityModel;
  reviews: ReviewMap;
  onUpdateReview: LabTabProps['onUpdateReview'];
  onClearReview: LabTabProps['onClearReview'];
}> = React.memo(({ questionId, model, reviews, onUpdateReview, onClearReview }) => {
  const crossRef = questionCrossRefById[questionId];
  const displayTitle = crossRef?.title ?? `مدل آزمایشگاهی ${questionId}`;
  const itemKey = `lab:model:${questionId}`;

  const resolvedGraph = useMemo(
    () =>
      resolveActivityGraph({
        questionId,
        places: model.places,
        title: crossRef?.title ?? '',
        prompt: crossRef?.prompt ?? '',
        scenario: model.scenario ?? '',
        rubric: crossRef?.rubric ?? '',
      }),
    [questionId, model, crossRef]
  );

  return (
    <article className="print-card bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4">
      <div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <span dir="ltr" className="font-mono-num font-bold text-blue-900 dark:text-blue-400">
            {questionId}
          </span>
          <span aria-hidden="true">·</span>
          <span>مدل گراف آزمایشگاه</span>
          {model.places && (
            <>
              <span aria-hidden="true">·</span>
              <span>
                تعداد رأس‌ها:{' '}
                <strong className="font-mono-num text-slate-700 dark:text-slate-300">
                  {model.places.length}
                </strong>
              </span>
            </>
          )}
          {model.review?.status && (
            <>
              <span aria-hidden="true">·</span>
              <span dir="ltr" className="font-mono-num">
                {model.review.status}
              </span>
            </>
          )}
        </div>

        <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
          <MathText text={displayTitle} />
        </h4>
      </div>

      {resolvedGraph && (
        <GraphRenderer
          vertices={resolvedGraph.vertices}
          edges={resolvedGraph.edges}
          directed={resolvedGraph.directed}
          multigraph={resolvedGraph.multigraph}
          places={resolvedGraph.places}
          title={resolvedGraph.familyLabel ?? `گراف ${questionId}`}
          sourceLabel={
            resolvedGraph.sourceKind === 'places-only'
              ? 'چیدمان مکان‌ها در lab.json (بدون یال صریح)'
              : 'مختصات lab.json + توپولوژی استاندارد'
          }
        />
      )}

      {/* Model description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
        {model.scenario && (
          <div className="md:col-span-2">
            <span className="font-semibold text-slate-900 dark:text-slate-100">سناریو: </span>
            <MathText text={model.scenario} />
          </div>
        )}
        {model.vertexMeaning && (
          <div>
            <span className="font-semibold text-slate-900 dark:text-slate-100">معنای رأس: </span>
            <MathText text={model.vertexMeaning} />
          </div>
        )}
        {model.edgeMeaning && (
          <div>
            <span className="font-semibold text-slate-900 dark:text-slate-100">معنای یال: </span>
            <MathText text={model.edgeMeaning} />
          </div>
        )}
        {model.boardLabel && (
          <div className="md:col-span-2 text-xs text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-slate-800 dark:text-slate-200">برچسب برد: </span>
            <MathText text={model.boardLabel} />
          </div>
        )}
      </div>

      {/* Places coordinates table */}
      {model.places && model.places.length > 0 && (
        <details>
          <summary className="text-xs font-medium text-blue-800 dark:text-blue-400 hover:text-blue-950 dark:hover:text-blue-300 cursor-pointer select-none">
            جدول کامل مختصات ({model.places.length} مکان)
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
                {model.places.map((p) => (
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

      {/* Hints */}
      {model.hints && model.hints.length > 0 && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
            راهنماهای مدل ({model.hints.length})
          </div>
          <ol className="list-decimal list-inside space-y-1">
            {model.hints.map((h, i) => (
              <li key={i}>
                <MathText text={h} />
              </li>
            ))}
          </ol>
        </div>
      )}

      {(model.adaptationReason || model.review?.basis) && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
          {model.adaptationReason && (
            <p>
              <span className="font-semibold text-slate-700 dark:text-slate-300">دلیل انطباق: </span>
              {model.adaptationReason}
            </p>
          )}
          {model.review?.basis && (
            <p>
              <span className="font-semibold text-slate-700 dark:text-slate-300">مبنای بازبینی: </span>
              {model.review.basis}
            </p>
          )}
        </div>
      )}

      <ProfessorReviewBox
        itemKey={itemKey}
        tab="lab"
        itemId={questionId}
        title={displayTitle}
        entry={reviews[itemKey]}
        onUpdate={onUpdateReview}
        onClear={onClearReview}
      />
    </article>
  );
});

LabModelCard.displayName = 'LabModelCard';

export const LabTab: React.FC<LabTabProps> = ({
  searchQuery,
  reviewFilter,
  reviews,
  onUpdateReview,
  onClearReview,
}) => {
  const query = searchQuery.trim().toLowerCase();

  const filteredStations = useMemo(() => {
    return labData.stations.filter((st) => {
      const key = `lab:station:${st.id}`;
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
      return `${st.id} ${st.title} ${st.body} ${st.focus_fa}`
        .toLowerCase()
        .includes(query);
    });
  }, [query, reviewFilter, reviews]);

  const orderedModelEntries = useMemo(() => {
    const ids = Array.from(
      new Set([...labData.questionIds, ...Object.keys(labData.models)])
    );
    return ids
      .map((qid) => ({ qid, model: labData.models[qid] }))
      .filter((entry): entry is { qid: string; model: ActivityModel } =>
        Boolean(entry.model)
      )
      .filter(({ qid, model }) => {
        const key = `lab:model:${qid}`;
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
        const cross = questionCrossRefById[qid];
        const haystack = [
          qid,
          cross?.title ?? '',
          model.scenario ?? '',
          model.boardLabel ?? '',
          ...(model.hints ?? []),
          ...(model.places ?? []).map((p) => `${p.id} ${p.label}`),
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      });
  }, [query, reviewFilter, reviews]);

  return (
    <div className="space-y-8">
      {/* Lab Settings Overview */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            تنظیمات عمومی آزمایشگاه (lab.json)
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            <strong className="font-mono-num text-slate-900 dark:text-slate-100">
              {labData.stations.length}
            </strong>{' '}
            ایستگاه ·{' '}
            <strong className="font-mono-num text-slate-900 dark:text-slate-100">
              {Object.keys(labData.models).length}
            </strong>{' '}
            مدل گراف
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <div className="text-slate-500 dark:text-slate-400">بازه گراف سفارشی (رأس)</div>
            <div className="text-base font-bold text-blue-900 dark:text-blue-400 font-mono-num mt-0.5">
              {labData.customMin} تا {labData.customMax}
            </div>
          </div>
          <div>
            <div className="text-slate-500 dark:text-slate-400">تعداد گراف‌های چالش</div>
            <div className="text-base font-bold text-blue-900 dark:text-blue-400 font-mono-num mt-0.5">
              {labData.challengeCount}
            </div>
          </div>
          <div>
            <div className="text-slate-500 dark:text-slate-400">زمان چالش (ثانیه)</div>
            <div className="text-base font-bold text-blue-900 dark:text-blue-400 font-mono-num mt-0.5">
              {labData.challengeSeconds} ثانیه
            </div>
          </div>
          <div>
            <div className="text-slate-500 dark:text-slate-400">وضعیت بازبینی</div>
            <div
              dir="ltr"
              className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono-num mt-1.5 text-right"
            >
              {labData.reviewStatus}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-400">
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">سناریوی پایه: </span>
            {labData.model.scenario}
          </div>
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">معنای رأس: </span>
            {labData.model.vertexMeaning}
          </div>
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">معنای یال: </span>
            {labData.model.edgeMeaning}
          </div>
        </div>
      </section>

      {/* Section 1: 5 Lab Stations */}
      <section className="space-y-4">
        <div className="pb-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            ۵ ایستگاه آزمایشگاه ({filteredStations.length} مورد)
          </h3>
        </div>

        {filteredStations.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-center">
            ایستگاهی با فیلتر فعلی پیدا نشد.
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredStations.map((station) => {
              const itemKey = `lab:station:${station.id}`;
              return (
                <article
                  key={station.id}
                  className="print-card bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono-num" dir="ltr">
                      station · {station.id}
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {station.title}
                    </h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      <MathText text={station.body} />
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/70 dark:border-slate-700/70 p-3 leading-relaxed">
                      <span className="font-bold text-slate-800 dark:text-slate-100">تمرکز فعالیت: </span>
                      <MathText text={station.focus_fa} />
                    </p>
                  </div>

                  <ProfessorReviewBox
                    itemKey={itemKey}
                    tab="lab"
                    itemId={`station:${station.id}`}
                    title={station.title}
                    entry={reviews[itemKey]}
                    onUpdate={onUpdateReview}
                    onClear={onClearReview}
                  />
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Section 2: All 27 Lab Models */}
      <section className="space-y-4">
        <div className="pb-2 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            فهرست کامل ۲۷ مدل گراف آزمایشگاه ({orderedModelEntries.length} مورد)
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono-num" dir="ltr">
            questionIds ({labData.questionIds.length})
          </span>
        </div>

        {orderedModelEntries.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-center">
            مدلی با فیلتر فعلی پیدا نشد.
          </p>
        ) : (
          <div className="space-y-4">
            {orderedModelEntries.map(({ qid, model }) => (
              <LabModelCard
                key={qid}
                questionId={qid}
                model={model}
                reviews={reviews}
                onUpdateReview={onUpdateReview}
                onClearReview={onClearReview}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
