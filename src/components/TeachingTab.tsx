import React, { useMemo } from 'react';
import { Check, GitBranch } from 'lucide-react';
import { teachingData } from '../data/datasets';
import type {
  GraphData,
  ReviewMap,
  ReviewStatus,
  TabKey,
  TeachingActivity,
  TeachingExitVariant,
  TeachingPart,
  TeachingUnit,
} from '../types/curriculum';
import { GraphRenderer } from './GraphRenderer';
import { MathText } from './MathText';
import { ProfessorReviewBox } from './ProfessorReviewBox';

interface TeachingTabProps {
  searchQuery: string;
  lessonFilter: string;
  stageFilter: string;
  reviewFilter: string;
  onlyExitVariants: boolean;
  reviews: ReviewMap;
  onUpdateReview: (
    itemKey: string,
    meta: { tab: TabKey; itemId: string; title: string },
    patch: { status?: ReviewStatus | null; note?: string }
  ) => void;
  onClearReview: (itemKey: string) => void;
}

const STAGE_FA: Record<string, string> = {
  Action: 'کنش (Action)',
  Process: 'فرایند (Process)',
  Object: 'شیء (Object)',
  Schema: 'طرحواره (Schema)',
};

const PART_TYPE_FA: Record<string, string> = {
  choice: 'چندگزینه‌ای',
  number: 'پاسخ عددی',
  model: 'ساخت مدل گراف',
  reflection: 'خودبازبینی / تأمل',
  prediction: 'پیش‌بینی پیش از آزمایش',
  neighborhood: 'همسایگی رأس',
  route: 'ساخت مسیر',
  classification: 'طبقه‌بندی ویژگی',
  counterexample: 'مثال نقض',
  coverageTable: 'جدول پوشش',
  deletionTable: 'جدول آزمون حذف',
  dominatingSet: 'انتخاب مجموعه احاطه‌گر',
  minimumArgument: 'استدلال دوطرفه کمینه',
  minimumFamily: 'خانواده مجموعه‌های کمینه',
};

function isGraphData(val: unknown): val is GraphData {
  return (
    Boolean(val) &&
    typeof val === 'object' &&
    Array.isArray((val as GraphData).vertices) &&
    Array.isArray((val as GraphData).edges)
  );
}

function graphsDiffer(a: GraphData, b: GraphData): boolean {
  if (a.directed !== b.directed || a.multigraph !== b.multigraph) return true;
  if (a.vertices.length !== b.vertices.length || a.edges.length !== b.edges.length)
    return true;
  const norm = (g: GraphData) =>
    g.edges
      .map(([u, v]) => (g.directed ? `${u}->${v}` : [u, v].sort().join('--')))
      .sort()
      .join('|');
  return norm(a) !== norm(b);
}

function collectExpectedGraphs(
  mainGraph: GraphData,
  parts: TeachingPart[]
): { partId: string; label: string; graph: GraphData; sameAsMain: boolean }[] {
  const result: {
    partId: string;
    label: string;
    graph: GraphData;
    sameAsMain: boolean;
  }[] = [];

  const inspect = (p: TeachingPart) => {
    if (isGraphData(p.expected)) {
      result.push({
        partId: p.id,
        label: p.label,
        graph: p.expected,
        sameAsMain: !graphsDiffer(mainGraph, p.expected),
      });
    }
    if (p.part) inspect(p.part);
  };

  for (const part of parts) {
    inspect(part);
  }
  return result;
}

function extractVisualHighlights(parts: TeachingPart[]): {
  selectedVertices?: string[];
  focusVertex?: string;
  routeEnds?: [string, string];
} {
  let selectedVertices: string[] | undefined;
  let focusVertex: string | undefined;
  let routeEnds: [string, string] | undefined;

  const inspect = (p: TeachingPart) => {
    if (!selectedVertices && p.selected && p.selected.length > 0) {
      selectedVertices = p.selected;
    }
    if (!focusVertex && p.vertexId) {
      focusVertex = p.vertexId;
    }
    if (!routeEnds && p.start && p.end) {
      routeEnds = [p.start, p.end];
    }
    if (p.part) inspect(p.part);
  };

  for (const part of parts) inspect(part);
  return { selectedVertices, focusVertex, routeEnds };
}

const PartItemView: React.FC<{ part: TeachingPart; index: number; isNested?: boolean }> = ({
  part,
  index,
  isNested = false,
}) => {
  return (
    <div
      className={
        isNested
          ? 'mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 pr-3'
          : 'py-3 border-t border-slate-100 dark:border-slate-800 first:border-t-0 first:pt-0'
      }
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
        <div className="flex flex-wrap items-center gap-2">
          {!isNested && (
            <span className="font-mono-num font-semibold text-slate-700 dark:text-slate-200">
              بخش {index + 1}
            </span>
          )}
          <span className="font-mono-num text-slate-400 dark:text-slate-500" dir="ltr">
            {part.id}
          </span>
          <span aria-hidden="true">·</span>
          <span className="text-blue-800 dark:text-blue-400 font-medium">
            {PART_TYPE_FA[part.type] ?? part.type} ({part.type})
          </span>
        </div>
      </div>

      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
        <MathText text={part.label} />
      </p>

      {/* Choice options */}
      {part.options && part.options.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {part.options.map((opt) => {
            const isExpected = String(part.expected) === String(opt.value);
            return (
              <li
                key={opt.value}
                className={`flex items-start gap-2 text-sm px-3 py-1.5 rounded-lg border ${
                  isExpected
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 font-medium'
                    : 'bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="font-mono-num text-xs text-slate-500 dark:text-slate-400 mt-0.5 shrink-0">
                  [{opt.value}]
                </span>
                <span className="flex-1">
                  <MathText text={opt.label} />
                </span>
                {isExpected && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                    پاسخ درست
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Scalar expected (number or non-choice string) */}
      {!part.options &&
        part.expected !== undefined &&
        !isGraphData(part.expected) && (
          <div className="mt-2 text-xs text-emerald-800 dark:text-emerald-400 font-semibold">
            پاسخ مورد انتظار (expected):{' '}
            <span dir="ltr" className="font-mono-num text-sm">
              {String(part.expected)}
            </span>
          </div>
        )}

      {/* Model expected summary */}
      {isGraphData(part.expected) && (
        <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-blue-900 dark:text-blue-400">
            مدل گراف مورد انتظار:
          </span>{' '}
          <span dir="ltr" className="font-mono-num">
            |V|={part.expected.vertices.length}, |E|={part.expected.edges.length}
            {part.expected.directed ? ', directed' : ''}
            {part.expected.multigraph ? ', multigraph' : ''}
          </span>
        </div>
      )}

      {/* Neighborhood metadata */}
      {part.vertexId && (
        <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
          رأس هدف:{' '}
          <span dir="ltr" className="font-mono-num font-semibold text-slate-900 dark:text-slate-100">
            {part.vertexId}
          </span>{' '}
          · نوع همسایگی:{' '}
          <span className="font-medium text-slate-800 dark:text-slate-200">
            {part.closed ? 'بسته N[v]' : 'باز N(v)'}
          </span>
        </div>
      )}

      {/* Route metadata */}
      {part.start && part.end && (
        <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
          مبدأ و مقصد مسیر:{' '}
          <span dir="ltr" className="font-mono-num font-semibold text-slate-900 dark:text-slate-100">
            {part.start} → {part.end}
          </span>
        </div>
      )}

      {/* Classification / Selected vertices */}
      {(part.property || (part.selected && part.selected.length > 0)) && (
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
          {part.property && (
            <span>
              ویژگی مورد سنجش:{' '}
              <span dir="ltr" className="font-mono-num font-semibold text-slate-900 dark:text-slate-100">
                {part.property}
              </span>
            </span>
          )}
          {part.selected && part.selected.length > 0 && (
            <span>
              رأس‌های منتخب:{' '}
              <span dir="ltr" className="font-mono-num font-semibold text-blue-900 dark:text-blue-400">
                &#123;{part.selected.join(', ')}&#125;
              </span>
            </span>
          )}
        </div>
      )}

      {/* Counterexample claim */}
      {part.claim && (
        <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
          ادعای مورد نقض:{' '}
          <span dir="ltr" className="font-mono-num font-semibold text-rose-800 dark:text-rose-400">
            {part.claim}
          </span>
        </div>
      )}

      {/* Minimum proof parameters */}
      {(part.count !== undefined || part.lowerBoundMethods) && (
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
          {part.count !== undefined && (
            <span>
              تعداد مجموعه‌های متمایز خواسته‌شده:{' '}
              <span className="font-mono-num font-semibold text-slate-900 dark:text-slate-100">
                {part.count}
              </span>
            </span>
          )}
          {part.lowerBoundMethods && part.lowerBoundMethods.length > 0 && (
            <span>
              روش‌های مجاز کران پایین:{' '}
              <span dir="ltr" className="font-mono-num text-slate-800 dark:text-slate-200">
                {part.lowerBoundMethods.join(', ')}
              </span>
            </span>
          )}
        </div>
      )}

      {/* Reflection criteria */}
      {part.criteria && part.criteria.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside">
          {part.criteria.map((c) => (
            <li key={c.id}>
              <span className="font-mono-num text-slate-400 dark:text-slate-500 ml-1">[{c.id}]</span>
              <MathText text={c.label} />
            </li>
          ))}
        </ul>
      )}

      {/* Nested prediction part */}
      {part.part && <PartItemView part={part.part} index={0} isNested />}
    </div>
  );
};

const ExitVariantBlock: React.FC<{ variant: TeachingExitVariant; idx: number }> = ({
  variant,
  idx,
}) => {
  const expectedGraphs = useMemo(
    () => collectExpectedGraphs(variant.graph, variant.parts),
    [variant]
  );
  const distinctExpected = expectedGraphs.filter((g) => !g.sameAsMain);
  const highlights = useMemo(
    () => extractVisualHighlights(variant.parts),
    [variant.parts]
  );

  return (
    <div className="mt-4 pt-4 border-t border-dashed border-slate-300 dark:border-slate-700 space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <GitBranch className="w-4 h-4 text-blue-800 dark:text-blue-400" />
        <span className="font-bold text-blue-950 dark:text-blue-300">
          نسخهٔ خروج / انتقال {idx + 1} (Exit Variant)
        </span>
        <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
          ·
        </span>
        <span dir="ltr" className="font-mono-num text-slate-600 dark:text-slate-400">
          {variant.id}
        </span>
      </div>

      {/* Variant context */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 dark:text-slate-300 bg-slate-50/80 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
        <div className="sm:col-span-2">
          <span className="font-semibold text-slate-900 dark:text-slate-100">سناریو: </span>
          <MathText text={variant.context.scenario} />
        </div>
        <div>
          <span className="font-semibold text-slate-900 dark:text-slate-100">معنای رأس: </span>
          <MathText text={variant.context.vertexMeaning} />
        </div>
        <div>
          <span className="font-semibold text-slate-900 dark:text-slate-100">معنای یال: </span>
          <MathText text={variant.context.edgeMeaning} />
        </div>
        <div className="sm:col-span-2">
          <span className="font-semibold text-slate-900 dark:text-slate-100">هدف: </span>
          <MathText text={variant.context.goal} />
        </div>
      </div>

      {/* Variant graphs */}
      <div
        className={`grid gap-4 ${
          distinctExpected.length > 0 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        }`}
      >
        <GraphRenderer
          vertices={variant.graph.vertices}
          edges={variant.graph.edges}
          directed={variant.graph.directed}
          multigraph={variant.graph.multigraph}
          title={`گراف اصلی (${variant.id})`}
          sourceLabel="داده‌شده در exitVariants"
          selectedVertices={highlights.selectedVertices}
          focusVertex={highlights.focusVertex}
          routeEnds={highlights.routeEnds}
          compact
        />
        {distinctExpected.map((eg) => (
          <GraphRenderer
            key={eg.partId}
            vertices={eg.graph.vertices}
            edges={eg.graph.edges}
            directed={eg.graph.directed}
            multigraph={eg.graph.multigraph}
            title={`گراف پاسخ مورد انتظار (${eg.partId})`}
            sourceLabel={eg.label}
            compact
          />
        ))}
      </div>

      {/* Variant parts */}
      <div className="space-y-1">
        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
          بخش‌های نسخهٔ خروج ({variant.parts.length})
        </h5>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {variant.parts.map((p, i) => (
            <PartItemView key={p.id} part={p} index={i} />
          ))}
        </div>
      </div>

      {/* Variant instructions, hints, explanation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
        {variant.instructionSteps.length > 0 && (
          <div>
            <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">
              گام‌های راهنمایی اجرا:
            </div>
            <ol className="list-decimal list-inside space-y-1">
              {variant.instructionSteps.map((s, i) => (
                <li key={i}>
                  <MathText text={s} />
                </li>
              ))}
            </ol>
          </div>
        )}
        {variant.hints.length > 0 && (
          <div>
            <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">
              راهنماها (Hints):
            </div>
            <ul className="list-disc list-inside space-y-1">
              {variant.hints.map((h, i) => (
                <li key={i}>
                  <MathText text={h} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="text-xs text-slate-800 dark:text-emerald-100 bg-emerald-50/60 dark:bg-emerald-950/35 border border-emerald-200/80 dark:border-emerald-800/70 rounded-xl p-3">
        <span className="font-bold text-emerald-900 dark:text-emerald-300">
          توضیح علمی پاسخ:{' '}
        </span>
        <MathText text={variant.explanation} />
      </div>
    </div>
  );
};

const TeachingActivityCard: React.FC<{
  activity: TeachingActivity;
  unit: TeachingUnit;
  reviews: ReviewMap;
  onUpdateReview: TeachingTabProps['onUpdateReview'];
  onClearReview: TeachingTabProps['onClearReview'];
}> = ({ activity, unit, reviews, onUpdateReview, onClearReview }) => {
  const itemKey = `teaching:${activity.id}`;
  const isExit = unit.exitActivityId === activity.id;

  const expectedGraphs = useMemo(
    () => collectExpectedGraphs(activity.graph, activity.parts),
    [activity.graph, activity.parts]
  );
  const distinctExpected = expectedGraphs.filter((g) => !g.sameAsMain);
  const highlights = useMemo(
    () => extractVisualHighlights(activity.parts),
    [activity.parts]
  );

  return (
    <article className="print-card bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-5">
      {/* Unboxed editorial metadata kicker */}
      <div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <span dir="ltr" className="font-mono-num font-bold text-blue-900 dark:text-blue-400">
            {activity.id}
          </span>
          <span aria-hidden="true">·</span>
          <span>{STAGE_FA[activity.stageId] ?? activity.stageId}</span>
          <span aria-hidden="true">·</span>
          <span dir="ltr" className="font-mono-num">
            {activity.unitId}
          </span>
          {isExit && (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-blue-800 dark:text-blue-400">
                فعالیت خروج واحد
              </span>
            </>
          )}
          {activity.prerequisites.length > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span>
                پیشنیاز:{' '}
                <span dir="ltr" className="font-mono-num text-slate-700 dark:text-slate-300">
                  {activity.prerequisites.join(', ')}
                </span>
              </span>
            </>
          )}
        </div>

        <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-1.5">
          <MathText text={activity.title} />
        </h4>

        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            عملیات شناختی:{' '}
          </span>
          <MathText text={activity.cognitiveOperation} />
        </p>
      </div>

      {/* Context block */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-700 dark:text-slate-300">
        <div className="md:col-span-2">
          <span className="font-semibold text-slate-900 dark:text-slate-100">سناریو: </span>
          <MathText text={activity.context.scenario} />
        </div>
        <div>
          <span className="font-semibold text-slate-900 dark:text-slate-100">معنای رأس: </span>
          <MathText text={activity.context.vertexMeaning} />
        </div>
        <div>
          <span className="font-semibold text-slate-900 dark:text-slate-100">معنای یال: </span>
          <MathText text={activity.context.edgeMeaning} />
        </div>
        <div className="md:col-span-2">
          <span className="font-semibold text-slate-900 dark:text-slate-100">هدف فعالیت: </span>
          <MathText text={activity.context.goal} />
        </div>
        {activity.figure && (
          <div className="md:col-span-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              ارجاع تصویر کتاب:{' '}
            </span>
            {activity.figure.alt} (
            <span dir="ltr" className="font-mono-num">
              {activity.figure.path}
            </span>
            )
          </div>
        )}
      </div>

      {/* Graphs: main + any distinct expected model graphs (e.g. complement or simplified) */}
      <div
        className={`grid gap-4 ${
          distinctExpected.length > 0 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        }`}
      >
        <GraphRenderer
          vertices={activity.graph.vertices}
          edges={activity.graph.edges}
          directed={activity.graph.directed}
          multigraph={activity.graph.multigraph}
          title={`گراف اصلی فعالیت ${activity.id}`}
          sourceLabel="داده‌شده در teaching.json"
          selectedVertices={highlights.selectedVertices}
          focusVertex={highlights.focusVertex}
          routeEnds={highlights.routeEnds}
          allowAlternateLayout={Boolean(activity.alternateLayout)}
        />
        {distinctExpected.map((eg) => (
          <GraphRenderer
            key={eg.partId}
            vertices={eg.graph.vertices}
            edges={eg.graph.edges}
            directed={eg.graph.directed}
            multigraph={eg.graph.multigraph}
            title={`گراف مورد انتظار در بخش ${eg.partId}`}
            sourceLabel={eg.label}
          />
        ))}
      </div>

      {/* All Parts */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
          تمام بخش‌های فعالیت ({activity.parts.length} بخش)
        </h5>
        <div>
          {activity.parts.map((part, idx) => (
            <PartItemView key={part.id} part={part} index={idx} />
          ))}
        </div>
      </div>

      {/* Instruction Steps & Hints */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700 dark:text-slate-300">
        {activity.instructionSteps.length > 0 && (
          <div>
            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              گام‌های آموزش (Instruction Steps)
            </h5>
            <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm leading-relaxed">
              {activity.instructionSteps.map((step, i) => (
                <li key={i}>
                  <MathText text={step} />
                </li>
              ))}
            </ol>
          </div>
        )}
        {activity.hints.length > 0 && (
          <div>
            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              راهنماها (Hints)
            </h5>
            <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm leading-relaxed">
              {activity.hints.map((hint, i) => (
                <li key={i}>
                  <MathText text={hint} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Explanation & Rubric */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 text-sm">
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-3.5">
          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
            توضیح علمی (Explanation)
          </div>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            <MathText text={activity.explanation} />
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-3.5">
          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
            معیار ارزیابی (Rubric)
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 leading-relaxed">
            {activity.rubric.map((r, i) => (
              <li key={i}>
                <MathText text={r} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Source References */}
      {activity.sourceReferences.length > 0 && (
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
            منابع ارجاعی بانک ({activity.sourceReferences.length})
          </h5>
          <div className="space-y-2">
            {activity.sourceReferences.map((ref, idx) => (
              <div
                key={`${ref.questionId}-${idx}`}
                className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed"
              >
                <span dir="ltr" className="font-mono-num font-bold text-blue-900 dark:text-blue-400">
                  {ref.questionId}
                </span>
                <span className="mx-1.5 text-slate-300 dark:text-slate-600">·</span>
                <span>نسخه بانک {ref.bankVersion}</span>
                <span className="mx-1.5 text-slate-300 dark:text-slate-600">·</span>
                <span>نوع استفاده: {ref.use}</span>
                <span className="mx-1.5 text-slate-300 dark:text-slate-600">·</span>
                <span>مرحله اصلی APOS: {ref.originalAposStage}</span>
                <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                  <MathText text={ref.adaptationReason} />
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exit Variants */}
      {activity.exitVariants && activity.exitVariants.length > 0 && (
        <div>
          {activity.exitVariants.map((variant, idx) => (
            <ExitVariantBlock key={variant.id} variant={variant} idx={idx} />
          ))}
        </div>
      )}

      {/* Professor Review Box */}
      <ProfessorReviewBox
        itemKey={itemKey}
        tab="teaching"
        itemId={activity.id}
        title={activity.title}
        entry={reviews[itemKey]}
        onUpdate={onUpdateReview}
        onClear={onClearReview}
      />
    </article>
  );
};

export const TeachingTab: React.FC<TeachingTabProps> = ({
  searchQuery,
  lessonFilter,
  stageFilter,
  reviewFilter,
  onlyExitVariants,
  reviews,
  onUpdateReview,
  onClearReview,
}) => {
  const query = searchQuery.trim().toLowerCase();

  const activityById = useMemo(
    () => new Map(teachingData.activities.map((a) => [a.id, a])),
    []
  );

  const unitById = useMemo(
    () => new Map(teachingData.units.map((u) => [u.id, u])),
    []
  );

  const filteredTree = useMemo(() => {
    const matchesActivity = (act: TeachingActivity): boolean => {
      if (lessonFilter !== 'all' && act.lessonId !== lessonFilter) return false;
      if (stageFilter !== 'all' && act.stageId !== stageFilter) return false;
      if (onlyExitVariants && (!act.exitVariants || act.exitVariants.length === 0)) {
        return false;
      }

      const key = `teaching:${act.id}`;
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
        act.id,
        act.unitId,
        act.title,
        act.cognitiveOperation,
        act.context.scenario,
        act.context.goal,
        act.explanation,
        ...act.rubric,
        ...act.hints,
        ...act.sourceReferences.map((r) => `${r.questionId} ${r.adaptationReason}`),
        ...(act.exitVariants ?? []).map(
          (v) => `${v.id} ${v.context.scenario} ${v.explanation}`
        ),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    };

    return teachingData.lessons
      .filter((lesson) => lessonFilter === 'all' || lesson.id === lessonFilter)
      .map((lesson) => {
        const units = lesson.unitIds
          .map((uid) => unitById.get(uid))
          .filter((u): u is TeachingUnit => Boolean(u))
          .filter((u) => stageFilter === 'all' || u.stageId === stageFilter)
          .map((unit) => {
            const acts = unit.requiredActivityIds
              .map((aid) => activityById.get(aid))
              .filter((a): a is TeachingActivity => Boolean(a))
              .filter(matchesActivity);
            return { unit, activities: acts };
          })
          .filter((entry) => entry.activities.length > 0);

        return { lesson, units };
      })
      .filter((entry) => entry.units.length > 0);
  }, [
    activityById,
    unitById,
    lessonFilter,
    stageFilter,
    onlyExitVariants,
    reviewFilter,
    reviews,
    query,
  ]);

  const totalShown = filteredTree.reduce(
    (s, l) => s + l.units.reduce((su, u) => su + u.activities.length, 0),
    0
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>
          نمایش <strong className="text-slate-900 dark:text-slate-100 font-mono-num">{totalShown}</strong> از{' '}
          <strong className="text-slate-900 dark:text-slate-100 font-mono-num">
            {teachingData.activities.length}
          </strong>{' '}
          فعالیت آموزشی (نسخه برنامه درسی {teachingData.curriculumVersion} · نسخه محصول{' '}
          {teachingData.productVersion} · نسخه بانک {teachingData.bankVersion})
        </span>
      </div>

      {filteredTree.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center text-sm text-slate-500 dark:text-slate-400">
          هیچ فعالیت آموزشی با فیلتر یا عبارت جست‌وجوی فعلی پیدا نشد.
        </div>
      ) : (
        filteredTree.map(({ lesson, units }) => (
          <section key={lesson.id} className="space-y-6">
            {/* Lesson Header */}
            <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono-num" dir="ltr">
                {lesson.id}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white mt-0.5">
                {lesson.title}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  هدف کلان درس:{' '}
                </span>
                <MathText text={lesson.objective} />
              </p>
            </div>

            {/* Units in Lesson */}
            {units.map(({ unit, activities }) => (
              <div key={unit.id} className="space-y-4">
                {/* Unit metadata header */}
                <div className="bg-slate-100/80 dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 space-y-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2">
                        <span
                          dir="ltr"
                          className="font-mono-num font-semibold text-blue-900 dark:text-blue-400"
                        >
                          {unit.id}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>مرحله APOS: {STAGE_FA[unit.stageId]}</span>
                        <span aria-hidden="true">·</span>
                        <span>فعالیت خروج: {unit.exitActivityId}</span>
                        <span aria-hidden="true">·</span>
                        <span>وزن پیشرفت: {unit.progressWeight}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                        واحد {unit.title} — <MathText text={unit.objective} />
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                        پیشنیازها و داربست (Scaffolding)
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mb-1">
                        پیشنیاز واحد:{' '}
                        {unit.prerequisites.length > 0 ? (
                          <span dir="ltr" className="font-mono-num font-medium">
                            {unit.prerequisites.join(', ')}
                          </span>
                        ) : (
                          'ندارد (واحد آغازین)'
                        )}
                      </p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {unit.scaffolding.map((s, i) => (
                          <li key={i}>
                            <MathText text={s} />
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="font-bold text-rose-900 dark:text-rose-400 mb-1">
                        بدفهمی‌های هدف (Misconceptions)
                      </div>
                      <ul className="list-disc list-inside space-y-0.5">
                        {unit.misconceptions.map((m, i) => (
                          <li key={i}>
                            <MathText text={m} />
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                        معیارهای شواهد یادگیری (Evidence Criteria)
                      </div>
                      <ul className="list-disc list-inside space-y-0.5">
                        {unit.evidenceCriteria.map((e, i) => (
                          <li key={i}>
                            <MathText text={e} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Activities in Unit */}
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <TeachingActivityCard
                      key={activity.id}
                      activity={activity}
                      unit={unit}
                      reviews={reviews}
                      onUpdateReview={onUpdateReview}
                      onClearReview={onClearReview}
                    />
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))
      )}
    </div>
  );
};
