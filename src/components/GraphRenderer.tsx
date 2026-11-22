import React, { useId, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import type { PlaceNode } from '../types/curriculum';
import {
  computeGraphMetrics,
  computeLayout,
  type NodePosition,
} from '../utils/graphTopology';

export interface GraphRendererProps {
  vertices: string[];
  edges: [string, string][];
  directed?: boolean;
  multigraph?: boolean;
  places?: PlaceNode[];
  title?: string;
  sourceLabel?: string;
  selectedVertices?: string[];
  focusVertex?: string;
  routeEnds?: [string, string];
  allowAlternateLayout?: boolean;
  compact?: boolean;
}

const NODE_RADIUS = 17;

interface EdgeRenderGroup {
  u: string;
  v: string;
  indexInGroup: number;
  totalInGroup: number;
  isReversePair: boolean;
}

function groupEdgesForRendering(
  edges: [string, string][],
  directed: boolean
): EdgeRenderGroup[] {
  // Count occurrences per unordered pair so parallel & opposing directed edges curve cleanly
  const pairMap = new Map<string, number[]>();
  edges.forEach(([u, v], idx) => {
    const key = u === v ? `LOOP:${u}` : [u, v].sort().join('::');
    const arr = pairMap.get(key) ?? [];
    arr.push(idx);
    pairMap.set(key, arr);
  });

  return edges.map(([u, v], idx) => {
    const key = u === v ? `LOOP:${u}` : [u, v].sort().join('::');
    const indices = pairMap.get(key) ?? [idx];
    const indexInGroup = indices.indexOf(idx);
    const totalInGroup = indices.length;
    const isReversePair = directed && u !== v && u > v;
    return { u, v, indexInGroup, totalInGroup, isReversePair };
  });
}

function getEdgePath(
  p1: NodePosition,
  p2: NodePosition,
  item: EdgeRenderGroup,
  directed: boolean,
  centroid: { x: number; y: number }
): { d: string; labelX: number; labelY: number } {
  // Self-loop (e.g. c -> c)
  if (item.u === item.v) {
    let dirX = p1.x - centroid.x;
    let dirY = p1.y - centroid.y;
    const len = Math.hypot(dirX, dirY);
    if (len < 1) {
      dirX = 0;
      dirY = -1;
    } else {
      dirX /= len;
      dirY /= len;
    }
    const baseAngle = Math.atan2(dirY, dirX);
    const spread = 0.52;
    const loopSize = 44 + item.indexInGroup * 16;

    const startAngle = baseAngle - spread;
    const endAngle = baseAngle + spread;
    const endOffset = directed ? NODE_RADIUS + 4 : NODE_RADIUS;

    const sx = p1.x + NODE_RADIUS * Math.cos(startAngle);
    const sy = p1.y + NODE_RADIUS * Math.sin(startAngle);
    const ex = p1.x + endOffset * Math.cos(endAngle);
    const ey = p1.y + endOffset * Math.sin(endAngle);

    const cp1x = p1.x + (NODE_RADIUS + loopSize) * Math.cos(baseAngle - 0.65);
    const cp1y = p1.y + (NODE_RADIUS + loopSize) * Math.sin(baseAngle - 0.65);
    const cp2x = p1.x + (NODE_RADIUS + loopSize) * Math.cos(baseAngle + 0.65);
    const cp2y = p1.y + (NODE_RADIUS + loopSize) * Math.sin(baseAngle + 0.65);

    return {
      d: `M ${sx.toFixed(1)} ${sy.toFixed(1)} C ${cp1x.toFixed(1)} ${cp1y.toFixed(
        1
      )}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${ex.toFixed(1)} ${ey.toFixed(1)}`,
      labelX: p1.x + (NODE_RADIUS + loopSize * 0.72) * Math.cos(baseAngle),
      labelY: p1.y + (NODE_RADIUS + loopSize * 0.72) * Math.sin(baseAngle),
    };
  }

  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dist = Math.hypot(dx, dy) || 1;
  const ux = dx / dist;
  const uy = dy / dist;

  // Canonical perpendicular vector so parallel edges don't collide even if reversed
  const canonDx = p1.id < p2.id ? dx : -dx;
  const canonDy = p1.id < p2.id ? dy : -dy;
  const canonDist = Math.hypot(canonDx, canonDy) || 1;
  const nx = -canonDy / canonDist;
  const ny = canonDx / canonDist;

  const midOffsetIndex = item.indexInGroup - (item.totalInGroup - 1) / 2;
  const curveAmp = item.totalInGroup === 1 ? 0 : midOffsetIndex * 34;

  if (Math.abs(curveAmp) < 0.5) {
    const startX = p1.x + ux * NODE_RADIUS;
    const startY = p1.y + uy * NODE_RADIUS;
    const endMargin = directed ? NODE_RADIUS + 4 : NODE_RADIUS;
    const endX = p2.x - ux * endMargin;
    const endY = p2.y - uy * endMargin;
    return {
      d: `M ${startX.toFixed(1)} ${startY.toFixed(1)} L ${endX.toFixed(1)} ${endY.toFixed(1)}`,
      labelX: (startX + endX) / 2,
      labelY: (startY + endY) / 2,
    };
  }

  const cpx = (p1.x + p2.x) / 2 + nx * curveAmp;
  const cpy = (p1.y + p2.y) / 2 + ny * curveAmp;

  // Compute exact tangent vectors at start & end so arrowhead lands cleanly on node perimeter
  const sdx = cpx - p1.x;
  const sdy = cpy - p1.y;
  const sLen = Math.hypot(sdx, sdy) || 1;
  const startX = p1.x + (sdx / sLen) * NODE_RADIUS;
  const startY = p1.y + (sdy / sLen) * NODE_RADIUS;

  const edx = p2.x - cpx;
  const edy = p2.y - cpy;
  const eLen = Math.hypot(edx, edy) || 1;
  const endMargin = directed ? NODE_RADIUS + 4 : NODE_RADIUS;
  const endX = p2.x - (edx / eLen) * endMargin;
  const endY = p2.y - (edy / eLen) * endMargin;

  return {
    d: `M ${startX.toFixed(1)} ${startY.toFixed(1)} Q ${cpx.toFixed(1)} ${cpy.toFixed(
      1
    )} ${endX.toFixed(1)} ${endY.toFixed(1)}`,
    labelX: 0.25 * startX + 0.5 * cpx + 0.25 * endX,
    labelY: 0.25 * startY + 0.5 * cpy + 0.25 * endY,
  };
}

export const GraphRenderer: React.FC<GraphRendererProps> = ({
  vertices,
  edges,
  directed = false,
  multigraph = false,
  places,
  title,
  sourceLabel,
  selectedVertices,
  focusVertex,
  routeEnds,
  allowAlternateLayout = false,
  compact = false,
}) => {
  const uid = useId().replace(/:/g, '');
  const [useAltLayout, setUseAltLayout] = useState(false);

  const selectedSet = useMemo(
    () => new Set(selectedVertices ?? []),
    [selectedVertices]
  );

  const positions = useMemo(
    () =>
      computeLayout(
        { vertices, edges, directed, multigraph },
        places,
        useAltLayout
      ),
    [vertices, edges, directed, multigraph, places, useAltLayout]
  );

  const posById = useMemo(
    () => new Map(positions.map((p) => [p.id, p])),
    [positions]
  );

  const centroid = useMemo(() => {
    if (positions.length === 0) return { x: 300, y: 160 };
    const sx = positions.reduce((a, p) => a + p.x, 0);
    const sy = positions.reduce((a, p) => a + p.y, 0);
    return { x: sx / positions.length, y: sy / positions.length };
  }, [positions]);

  const metrics = useMemo(
    () => computeGraphMetrics({ vertices, edges, directed }),
    [vertices, edges, directed]
  );

  const groupedEdges = useMemo(
    () => groupEdgesForRendering(edges, directed),
    [edges, directed]
  );

  const hasPlacesLabels = useMemo(
    () => Boolean(places && places.some((p) => p.label && p.label !== p.id)),
    [places]
  );

  const markerId = `arrow-${uid}`;
  const svgHeight = compact ? 220 : 285;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-900/70 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0">
          {title && (
            <span className="font-semibold text-slate-800 dark:text-slate-100 truncate">
              {title}
            </span>
          )}
          {title && sourceLabel && (
            <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">
              ·
            </span>
          )}
          {sourceLabel && (
            <span className="text-slate-500 dark:text-slate-400">{sourceLabel}</span>
          )}
        </div>
        <div
          className="flex items-center gap-2.5 shrink-0 font-mono-num text-[11px] text-slate-500 dark:text-slate-400"
          dir="ltr"
        >
          <span>|V|={metrics.order}</span>
          <span>·</span>
          <span>|E|={metrics.size}</span>
          {metrics.size > 0 && (
            <>
              <span>·</span>
              <span>δ={metrics.minDegree}</span>
              <span>·</span>
              <span>Δ={metrics.maxDegree}</span>
            </>
          )}
          {directed && (
            <>
              <span>·</span>
              <span className="text-blue-700 dark:text-blue-400 font-medium">جهت‌دار</span>
            </>
          )}
          {(multigraph || metrics.hasParallel) && (
            <>
              <span>·</span>
              <span className="text-amber-700 dark:text-amber-400 font-medium">چندگراف</span>
            </>
          )}
          {metrics.hasLoops && (
            <>
              <span>·</span>
              <span className="text-rose-700 dark:text-rose-400 font-medium">طوقه</span>
            </>
          )}
          {allowAlternateLayout && (
            <button
              type="button"
              onClick={() => setUseAltLayout((v) => !v)}
              dir="rtl"
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-sans font-medium text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              {useAltLayout ? 'چیدمان اول' : 'چیدمان دوم'}
            </button>
          )}
        </div>
      </div>

      <div className="w-full bg-white/60 dark:bg-slate-950/60 flex items-center justify-center p-2">
        <svg
          viewBox="0 0 600 320"
          className="w-full max-w-[600px] h-auto select-none"
          style={{ maxHeight: `${svgHeight}px` }}
          role="img"
          aria-label={title ?? 'نمودار گراف'}
        >
          <defs>
            <marker
              id={markerId}
              viewBox="0 0 10 10"
              refX="8.2"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.2 L 9.5 5 L 0 8.8 z" fill="var(--graph-arrow)" />
            </marker>
          </defs>

          {/* Subtle blueprint dot grid */}
          <pattern
            id={`grid-${uid}`}
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1.5" cy="1.5" r="0.85" fill="var(--graph-dot)" />
          </pattern>
          <rect width="600" height="320" fill={`url(#grid-${uid})`} />

          {/* Edges */}
          <g>
            {groupedEdges.map((edge, idx) => {
              const p1 = posById.get(edge.u);
              const p2 = posById.get(edge.v);
              if (!p1 || !p2) return null;
              const { d } = getEdgePath(p1, p2, edge, directed, centroid);
              const isLoop = edge.u === edge.v;
              const isParallel = edge.totalInGroup > 1;
              return (
                <path
                  key={`${edge.u}-${edge.v}-${idx}`}
                  d={d}
                  fill="none"
                  stroke={
                    isLoop
                      ? 'var(--graph-edge-loop)'
                      : directed
                      ? 'var(--graph-edge-directed)'
                      : isParallel
                      ? 'var(--graph-edge-parallel)'
                      : 'var(--graph-edge)'
                  }
                  strokeWidth={isParallel || isLoop ? 2.1 : 1.9}
                  strokeLinecap="round"
                  markerEnd={directed ? `url(#${markerId})` : undefined}
                />
              );
            })}
          </g>

          {/* Vertices */}
          <g>
            {positions.map((pos) => {
              const isSelected = selectedSet.has(pos.id);
              const isFocus = focusVertex === pos.id;
              const isRouteEnd =
                routeEnds &&
                (routeEnds[0] === pos.id || routeEnds[1] === pos.id);

              let fill = 'var(--graph-node-fill)';
              let stroke = 'var(--graph-node-stroke)';
              let textFill = 'var(--graph-node-text)';
              let strokeWidth = 2;

              if (isSelected) {
                fill = 'var(--graph-selected-fill)';
                stroke = 'var(--graph-selected-stroke)';
                textFill = 'var(--graph-selected-text)';
                strokeWidth = 2.5;
              } else if (isFocus) {
                fill = 'var(--graph-focus-fill)';
                stroke = 'var(--graph-focus-stroke)';
                textFill = 'var(--graph-focus-text)';
                strokeWidth = 2.5;
              } else if (isRouteEnd) {
                fill = 'var(--graph-route-fill)';
                stroke = 'var(--graph-route-stroke)';
                textFill = 'var(--graph-route-text)';
                strokeWidth = 2.5;
              }

              // Place Persian label outside circle cleanly
              const placeLabelY =
                pos.y > 250 ? pos.y - NODE_RADIUS - 8 : pos.y + NODE_RADIUS + 15;

              return (
                <g key={pos.id}>
                  {isSelected && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={NODE_RADIUS + 4.5}
                      fill="none"
                      stroke="var(--graph-selected-halo)"
                      strokeWidth="2"
                    />
                  )}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={NODE_RADIUS}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                  />
                  <text
                    x={pos.x}
                    y={pos.y + 1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={textFill}
                    fontSize="13"
                    fontWeight="700"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {pos.id}
                  </text>
                  {hasPlacesLabels && pos.label && pos.label !== pos.id && (
                    <g>
                      <text
                        x={pos.x}
                        y={placeLabelY}
                        textAnchor="middle"
                        fill="var(--graph-label)"
                        fontSize="11.5"
                        fontWeight="600"
                        stroke="var(--graph-label-halo)"
                        strokeWidth="3.5"
                        paintOrder="stroke"
                        style={{ fontFamily: 'var(--font-sans)' }}
                      >
                        {pos.label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Edge list summary line for professor audit */}
      <div className="px-3.5 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 text-[11px] text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span dir="ltr" className="font-mono-num">
          V = &#123;{vertices.join(', ')}&#125;
        </span>
        {edges.length > 0 ? (
          <span dir="ltr" className="font-mono-num text-slate-500 dark:text-slate-400">
            E = &#123;
            {edges
              .map(([u, v]) => (directed ? `${u}→${v}` : `${u}${v}`))
              .join(', ')}
            &#125;
          </span>
        ) : (
          <span className="text-slate-400 dark:text-slate-500">
            (فهرست یال صریح در JSON ثبت نشده است)
          </span>
        )}
      </div>
    </div>
  );
};
