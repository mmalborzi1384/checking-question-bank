import type { GraphData, PlaceNode } from '../types/curriculum';

export interface ResolvedGraph {
  vertices: string[];
  edges: [string, string][];
  directed: boolean;
  multigraph: boolean;
  places?: PlaceNode[];
  sourceKind: 'explicit-json' | 'inferred-family' | 'inferred-textbook' | 'places-only';
  familyLabel?: string;
  secondaryGraph?: {
    label: string;
    graph: GraphData;
  };
}

export interface NodePosition {
  id: string;
  label?: string;
  x: number;
  y: number;
}

const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');

function makeVertexIds(n: number, places?: PlaceNode[]): string[] {
  if (places && places.length === n) {
    return places.map((p) => p.id);
  }
  return Array.from({ length: n }, (_, i) => LETTERS[i] ?? `v${i + 1}`);
}

export function buildPathGraph(n: number, places?: PlaceNode[]): GraphData {
  const vertices = makeVertexIds(n, places);
  const edges: [string, string][] = [];
  for (let i = 0; i < n - 1; i++) {
    edges.push([vertices[i], vertices[i + 1]]);
  }
  return { vertices, edges, directed: false, multigraph: false };
}

export function buildCycleGraph(n: number, places?: PlaceNode[]): GraphData {
  const vertices = makeVertexIds(n, places);
  const edges: [string, string][] = [];
  for (let i = 0; i < n; i++) {
    edges.push([vertices[i], vertices[(i + 1) % n]]);
  }
  return { vertices, edges, directed: false, multigraph: false };
}

export function buildCompleteGraph(n: number, places?: PlaceNode[]): GraphData {
  const vertices = makeVertexIds(n, places);
  const edges: [string, string][] = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      edges.push([vertices[i], vertices[j]]);
    }
  }
  return { vertices, edges, directed: false, multigraph: false };
}

/**
 * In the Persian textbook & JSON rubrics:
 * S_n has n vertices total: 'a' is the center, connected to b, c, ...
 * (verified via Q051 S5 -> {a}, Q071 S4 -> {a} and {b,c,d}, Q082 S5 -> a is مرکز).
 */
export function buildStarGraph(n: number, places?: PlaceNode[]): GraphData {
  const vertices = makeVertexIds(n, places);
  const center = vertices[0];
  const edges: [string, string][] = [];
  for (let i = 1; i < n; i++) {
    edges.push([center, vertices[i]]);
  }
  return { vertices, edges, directed: false, multigraph: false };
}

/**
 * In the JSON rubrics & places:
 * W_n has n+1 vertices: outer cycle v_0..v_{n-1}, hub is last vertex v_n
 * (verified via Q084/Q103 W4 -> 5 vertices a..e with hub {e}; Q073/Q104 W5 -> 6 vertices a..f with hub {f}).
 */
export function buildWheelGraph(rimCount: number, places?: PlaceNode[]): GraphData {
  const total = rimCount + 1;
  const vertices = makeVertexIds(total, places);
  const hub = vertices[total - 1];
  const edges: [string, string][] = [];
  for (let i = 0; i < rimCount; i++) {
    edges.push([vertices[i], vertices[(i + 1) % rimCount]]);
    edges.push([hub, vertices[i]]);
  }
  return { vertices, edges, directed: false, multigraph: false };
}

export function buildCompleteBipartiteGraph(
  m: number,
  n: number,
  places?: PlaceNode[]
): GraphData {
  const total = m + n;
  const vertices = makeVertexIds(total, places);
  const left = vertices.slice(0, m);
  const right = vertices.slice(m);
  const edges: [string, string][] = [];
  for (const u of left) {
    for (const v of right) {
      edges.push([u, v]);
    }
  }
  return { vertices, edges, directed: false, multigraph: false };
}

/**
 * Petersen graph on a..j matching Q140 rubric exactly:
 * Outer 5-cycle: a-b-c-d-e-a
 * Spokes: a-f, b-g, c-h, d-i, e-j
 * Inner 5-star: f-h, h-j, j-g, g-i, i-f
 */
export function buildPetersenGraph(places?: PlaceNode[]): GraphData {
  const vertices = makeVertexIds(10, places);
  const [a, b, c, d, e, f, g, h, i, j] = vertices;
  const edges: [string, string][] = [
    [a, b],
    [b, c],
    [c, d],
    [d, e],
    [e, a],
    [a, f],
    [b, g],
    [c, h],
    [d, i],
    [e, j],
    [f, h],
    [h, j],
    [j, g],
    [g, i],
    [i, f],
  ];
  return { vertices, edges, directed: false, multigraph: false };
}

const KONIGSBERG_GRAPH: GraphData = {
  vertices: ['x', 'y', 'z', 'w'],
  edges: [
    ['w', 'x'],
    ['w', 'x'],
    ['x', 'y'],
    ['w', 'y'],
    ['w', 'z'],
    ['w', 'z'],
    ['z', 'y'],
  ],
  directed: false,
  multigraph: true,
};

const FOOTBALL_DIRECTED_GRAPH: GraphData = {
  vertices: ['a', 'b', 'c', 'd', 'e'],
  edges: [
    ['a', 'b'],
    ['a', 'e'],
    ['b', 'd'],
    ['c', 'a'],
    ['c', 'e'],
    ['e', 'd'],
  ],
  directed: true,
  multigraph: false,
};

const ATM_GRAPH: GraphData = {
  vertices: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
  edges: [
    ['a', 'b'],
    ['b', 'c'],
    ['a', 'd'],
    ['d', 'e'],
    ['b', 'e'],
    ['d', 'f'],
    ['f', 'g'],
    ['f', 'h'],
    ['g', 'h'],
  ],
  directed: false,
  multigraph: false,
};

const FIG16_GRAPH: GraphData = {
  vertices: ['a', 'b', 'c', 'd', 'e'],
  edges: [
    ['a', 'b'],
    ['a', 'c'],
    ['a', 'd'],
    ['c', 'd'],
    ['c', 'e'],
    ['d', 'e'],
  ],
  directed: false,
  multigraph: false,
};

const FIG16_COMPLEMENT: GraphData = {
  vertices: ['a', 'b', 'c', 'd', 'e'],
  edges: [
    ['a', 'e'],
    ['b', 'c'],
    ['b', 'd'],
    ['b', 'e'],
  ],
  directed: false,
  multigraph: false,
};

const Q014_GRAPH: GraphData = {
  vertices: ['a', 'b', 'c', 'd'],
  edges: [
    ['a', 'b'],
    ['a', 'c'],
    ['c', 'a'],
    ['d', 'b'],
  ],
  directed: true,
  multigraph: false,
};

const Q015_GRAPH: GraphData = {
  vertices: ['a', 'b', 'c', 'd', 'e', 'f'],
  edges: [
    ['a', 'b'],
    ['a', 'c'],
    ['c', 'd'],
    ['e', 'f'],
    ['d', 'b'],
    ['c', 'f'],
    ['b', 'e'],
  ],
  directed: false,
  multigraph: false,
};

const Q111_GRAPH: GraphData = {
  vertices: ['a', 'b', 'c', 'd', 'e', 'f'],
  edges: [
    ['a', 'b'],
    ['a', 'c'],
    ['a', 'f'],
    ['b', 'e'],
    ['c', 'd'],
  ],
  directed: false,
  multigraph: false,
};

const Q133_GRAPH: GraphData = {
  vertices: ['a', 'b', 'c', 'd'],
  edges: [
    ['a', 'b'],
    ['b', 'c'],
  ],
  directed: false,
  multigraph: false,
};

const Q074_REFERENCE: GraphData = {
  vertices: ['u', 'v', 'w', 'x', 'y', 'z'],
  edges: [
    ['u', 'v'],
    ['u', 'w'],
    ['u', 'x'],
    ['v', 'y'],
    ['v', 'z'],
  ],
  directed: false,
  multigraph: false,
};

function detectFamilyFromText(
  text: string,
  places?: PlaceNode[]
): { graph: GraphData; label: string } | null {
  const normalized = text
    .replace(/₀/g, '0')
    .replace(/₁/g, '1')
    .replace(/₂/g, '2')
    .replace(/₃/g, '3')
    .replace(/₄/g, '4')
    .replace(/₅/g, '5')
    .replace(/₆/g, '6')
    .replace(/₇/g, '7')
    .replace(/₈/g, '8')
    .replace(/₉/g, '9');

  // Petersen
  if (/petersen|پترسن/i.test(normalized)) {
    return { graph: buildPetersenGraph(places), label: 'گراف پترسن (Petersen)' };
  }

  // Complete bipartite K_{m,n} or Kmn like K23, K22, K33, K_{1,4}
  const bipMatch =
    normalized.match(/K_\{(\d+)\s*,\s*(\d+)\}/) ??
    normalized.match(/K(\d+),(\d+)/) ??
    normalized.match(/\bK([1-9])([1-9])\b/);
  if (bipMatch) {
    const m = parseInt(bipMatch[1], 10);
    const n = parseInt(bipMatch[2], 10);
    if (m >= 1 && n >= 1 && m + n <= 16 && (!places || places.length === m + n)) {
      return {
        graph: buildCompleteBipartiteGraph(m, n, places),
        label: `گراف دوبخشی کامل K_{${m},${n}}`,
      };
    }
  }

  // Wheel W_n
  const wheelMatch =
    normalized.match(/W_\{?(\d+)\}?/) ?? normalized.match(/\bW(\d+)\b/);
  if (wheelMatch) {
    const n = parseInt(wheelMatch[1], 10);
    if (n >= 3 && n <= 12 && (!places || places.length === n + 1)) {
      return {
        graph: buildWheelGraph(n, places),
        label: `گراف چرخ W_${n}`,
      };
    }
  }

  // Star S_n
  const starMatch =
    normalized.match(/S_\{?(\d+)\}?/) ?? normalized.match(/\bS(\d+)\b/);
  if (starMatch) {
    const n = parseInt(starMatch[1], 10);
    if (n >= 3 && n <= 14 && (!places || places.length === n)) {
      return {
        graph: buildStarGraph(n, places),
        label: `گراف ستاره S_${n}`,
      };
    }
  }

  // Cycle C_n
  const cycleMatch =
    normalized.match(/C_\{?(\d+)\}?/) ?? normalized.match(/\bC(\d+)\b/);
  if (cycleMatch) {
    const n = parseInt(cycleMatch[1], 10);
    if (n >= 3 && n <= 16 && (!places || places.length === n)) {
      return {
        graph: buildCycleGraph(n, places),
        label: `دور C_${n}`,
      };
    }
  }

  // Path P_n
  const pathMatch =
    normalized.match(/P_\{?(\d+)\}?/) ?? normalized.match(/\bP(\d+)\b/);
  if (pathMatch) {
    const n = parseInt(pathMatch[1], 10);
    if (n >= 2 && n <= 16 && (!places || places.length === n)) {
      return {
        graph: buildPathGraph(n, places),
        label: `مسیر P_${n}`,
      };
    }
  }

  // Complete K_n
  const completeMatch =
    normalized.match(/K_\{?(\d+)\}?/) ?? normalized.match(/\bK(\d+)\b/);
  if (completeMatch) {
    const n = parseInt(completeMatch[1], 10);
    if (n >= 2 && n <= 12 && (!places || places.length === n)) {
      return {
        graph: buildCompleteGraph(n, places),
        label: `گراف کامل K_${n}`,
      };
    }
  }

  return null;
}

/**
 * Resolves a renderable graph for any activity across all 5 JSON files.
 * Returns null only when the question is purely conceptual with no concrete graph or places.
 */
export function resolveActivityGraph(params: {
  questionId?: string;
  explicitGraph?: GraphData;
  places?: PlaceNode[];
  title?: string;
  prompt?: string;
  scenario?: string;
  rubric?: string;
}): ResolvedGraph | null {
  const { questionId, explicitGraph, places, title = '', prompt = '', scenario = '', rubric = '' } =
    params;

  // 1. Explicit graph provided in JSON (teaching.json)
  if (explicitGraph && explicitGraph.vertices.length > 0) {
    return {
      ...explicitGraph,
      places,
      sourceKind: 'explicit-json',
    };
  }

  // 2. Known textbook / bank graphs matched by exact questionId
  switch (questionId) {
    case 'Q001':
    case 'Q002':
    case 'Q003':
    case 'Q004':
      return {
        ...KONIGSBERG_GRAPH,
        places,
        sourceKind: 'inferred-textbook',
        familyLabel: 'چندگراف پل‌های کونیگسبرگ',
      };
    case 'Q005':
    case 'Q006':
    case 'Q007':
      return {
        ...buildCompleteBipartiteGraph(3, 3, places),
        places,
        sourceKind: 'inferred-family',
        familyLabel: 'گراف دوبخشی کامل K_{3,3}',
      };
    case 'Q008':
    case 'Q009':
    case 'Q010':
    case 'Q011':
      return {
        ...FOOTBALL_DIRECTED_GRAPH,
        places,
        sourceKind: 'inferred-textbook',
        familyLabel: 'گراف جهت‌دار نتایج فوتبال',
      };
    case 'Q014':
      return {
        ...Q014_GRAPH,
        sourceKind: 'inferred-textbook',
        familyLabel: 'گراف جهت‌دار داده شده در صورت سؤال',
      };
    case 'Q015':
      return {
        ...Q015_GRAPH,
        sourceKind: 'inferred-textbook',
        familyLabel: 'گراف تمرین ۱ درس ۱ (از V و E)',
      };
    case 'Q017':
      return {
        ...buildCompleteBipartiteGraph(3, 3),
        sourceKind: 'inferred-family',
        familyLabel: 'گراف ۳-منتظم ۶ رأسی (K_{3,3})',
      };
    case 'Q024':
      return {
        ...FIG16_GRAPH,
        sourceKind: 'inferred-textbook',
        familyLabel: 'گراف شکل ۱۶ درس ۱ (G)',
        secondaryGraph: {
          label: 'مکمل گراف (Ḡ)',
          graph: FIG16_COMPLEMENT,
        },
      };
    case 'Q026':
      return {
        ...buildPathGraph(5),
        sourceKind: 'inferred-family',
        familyLabel: 'مسیر P_5',
        secondaryGraph: {
          label: 'دور C_5',
          graph: buildCycleGraph(5),
        },
      };
    case 'Q032':
    case 'Q033':
    case 'Q034':
    case 'Q035':
      return {
        ...ATM_GRAPH,
        sourceKind: 'inferred-textbook',
        familyLabel: 'گراف تقاطع‌ها و خودپردازها (شکل ۲ درس ۲)',
      };
    case 'Q048':
      return {
        ...buildPathGraph(5, places),
        places,
        sourceKind: 'inferred-family',
        familyLabel: 'مسیر P_5',
      };
    case 'Q067':
      return {
        ...buildPathGraph(6, places),
        places,
        sourceKind: 'inferred-family',
        familyLabel: 'مسیر P_6',
      };
    case 'Q070':
      return {
        ...buildCycleGraph(6, places),
        places,
        sourceKind: 'inferred-family',
        familyLabel: 'دور C_6',
      };
    case 'Q074':
      return {
        ...Q074_REFERENCE,
        sourceKind: 'inferred-family',
        familyLabel: 'نمونهٔ مرجع: دو ستارهٔ متصل (n=6, γ=2 یکتا)',
      };
    case 'Q075':
      return {
        ...buildCycleGraph(6),
        sourceKind: 'inferred-family',
        familyLabel: 'نمونهٔ مرجع: دور C_6 (n=6, γ=2 غیر یکتا)',
      };
    case 'Q079':
    case 'Q088':
      return {
        ...buildPathGraph(4, places),
        places,
        sourceKind: 'inferred-family',
        familyLabel: 'مسیر P_4',
      };
    case 'Q081':
      return {
        ...buildCompleteGraph(3, places),
        places,
        sourceKind: 'inferred-family',
        familyLabel: 'گراف کامل K_3',
      };
    case 'Q082':
      return {
        ...buildStarGraph(5, places),
        places,
        sourceKind: 'inferred-family',
        familyLabel: 'گراف ستاره S_5',
      };
    case 'Q087':
      return {
        ...buildPathGraph(3, places),
        places,
        sourceKind: 'inferred-family',
        familyLabel: 'مسیر P_3',
      };
    case 'Q111':
    case 'Q144':
      return {
        ...Q111_GRAPH,
        sourceKind: 'inferred-textbook',
        familyLabel: 'گراف ۶ رأسی (n=6, Δ=3, γ=3)',
      };
    case 'Q133':
      return {
        ...Q133_GRAPH,
        sourceKind: 'inferred-textbook',
        familyLabel: 'مسیر P_3 به علاوه رأس تنها d (n=4, γ=2 یکتا)',
      };
    case 'Q134':
      return {
        ...buildCycleGraph(4),
        sourceKind: 'inferred-family',
        familyLabel: 'دور C_4 (γ=2 با چند γ-مجموعه)',
      };
    case 'Q142':
      return {
        ...buildPathGraph(3),
        sourceKind: 'inferred-family',
        familyLabel: 'مسیر P_3 (نمونهٔ ایستگاه ۱)',
        secondaryGraph: {
          label: 'دور C_4 (نمونهٔ ایستگاه ۱)',
          graph: buildCycleGraph(4),
        },
      };
    default:
      break;
  }

  // 3. Detect standard graph family from title / scenario / prompt / rubric
  const priorityText = `${title} ${scenario}`;
  const detectedPrimary = detectFamilyFromText(priorityText, places);
  if (detectedPrimary) {
    return {
      ...detectedPrimary.graph,
      places,
      sourceKind: 'inferred-family',
      familyLabel: detectedPrimary.label,
    };
  }

  const detectedSecondary = detectFamilyFromText(`${prompt} ${rubric}`, places);
  if (detectedSecondary) {
    return {
      ...detectedSecondary.graph,
      places,
      sourceKind: 'inferred-family',
      familyLabel: detectedSecondary.label,
    };
  }

  // 4. Fallback: places layout without edges (e.g. Q037 11 cities from distance table)
  if (places && places.length > 0) {
    return {
      vertices: places.map((p) => p.id),
      edges: [],
      directed: false,
      multigraph: false,
      places,
      sourceKind: 'places-only',
      familyLabel: 'چیدمان مکان‌ها (یال‌ها از جدول فاصلهٔ کتاب)',
    };
  }

  return null;
}

export interface GraphMetrics {
  order: number;
  size: number;
  minDegree: number;
  maxDegree: number;
  hasLoops: boolean;
  hasParallel: boolean;
}

export function computeGraphMetrics(graph: {
  vertices: string[];
  edges: [string, string][];
  directed: boolean;
}): GraphMetrics {
  const degrees: Record<string, number> = {};
  for (const v of graph.vertices) {
    degrees[v] = 0;
  }
  let hasLoops = false;
  let hasParallel = false;
  const seen = new Set<string>();

  for (const [u, v] of graph.edges) {
    if (u === v) {
      hasLoops = true;
      degrees[u] = (degrees[u] ?? 0) + 2;
    } else {
      degrees[u] = (degrees[u] ?? 0) + 1;
      degrees[v] = (degrees[v] ?? 0) + 1;
    }
    const key = graph.directed ? `${u}->${v}` : [u, v].sort().join('--');
    if (seen.has(key)) {
      hasParallel = true;
    }
    seen.add(key);
  }

  const degValues = Object.values(degrees);
  return {
    order: graph.vertices.length,
    size: graph.edges.length,
    minDegree: degValues.length > 0 ? Math.min(...degValues) : 0,
    maxDegree: degValues.length > 0 ? Math.max(...degValues) : 0,
    hasLoops,
    hasParallel,
  };
}

/**
 * Computes clean deterministic SVG coordinates in a 600 x 320 canvas.
 */
export function computeLayout(
  graph: {
    vertices: string[];
    edges: [string, string][];
    directed: boolean;
    multigraph: boolean;
  },
  places?: PlaceNode[],
  alternate = false
): NodePosition[] {
  const W = 600;
  const H = 320;
  const cx = W / 2;
  const cy = H / 2;

  // If explicit places exist and alternate layout is not requested, normalize them cleanly
  if (places && places.length > 0 && !alternate) {
    const xs = places.map((p) => p.x);
    const ys = places.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const spanX = Math.max(maxX - minX, 1);
    const spanY = Math.max(maxY - minY, 1);
    const padX = 76;
    const padY = 56;
    const usableW = W - padX * 2;
    const usableH = H - padY * 2;

    const placeMap = new Map(places.map((p) => [p.id, p]));
    return graph.vertices.map((id, idx) => {
      const p = placeMap.get(id);
      if (p) {
        const nx =
          maxX === minX ? cx : padX + ((p.x - minX) / spanX) * usableW;
        const ny =
          maxY === minY ? cy : padY + ((p.y - minY) / spanY) * usableH;
        return { id, label: p.label, x: nx, y: ny };
      }
      const angle = (2 * Math.PI * idx) / Math.max(graph.vertices.length, 1);
      return { id, x: cx + 120 * Math.cos(angle), y: cy + 95 * Math.sin(angle) };
    });
  }

  const n = graph.vertices.length;
  const vKey = graph.vertices.join(',');

  // Alternate layout for representation-independence activities (e.g., L1-O1)
  if (alternate) {
    return graph.vertices.map((id, i) => {
      const row = i % 2;
      const col = Math.floor(i / 2);
      const cols = Math.ceil(n / 2);
      const stepX = cols > 1 ? 420 / (cols - 1) : 0;
      return {
        id,
        x: 90 + col * stepX + (row === 1 ? 28 : -14),
        y: row === 0 ? 85 : 235,
      };
    });
  }

  // Special iconic layouts for known textbook graphs
  // 1. Königsberg (x, y, z, w)
  if (vKey === 'x,y,z,w' && graph.multigraph) {
    return [
      { id: 'x', x: 300, y: 58 },
      { id: 'y', x: 475, y: 160 },
      { id: 'z', x: 300, y: 262 },
      { id: 'w', x: 145, y: 160 },
    ];
  }

  // 2. Petersen graph (10 vertices, 15 edges, 3-regular)
  if (n === 10 && graph.edges.length === 15) {
    const outerR = 122;
    const innerR = 58;
    return graph.vertices.map((id, idx) => {
      if (idx < 5) {
        const angle = -Math.PI / 2 + (2 * Math.PI * idx) / 5;
        return {
          id,
          x: cx + outerR * Math.cos(angle),
          y: cy + outerR * Math.sin(angle),
        };
      }
      const angle = -Math.PI / 2 + (2 * Math.PI * (idx - 5)) / 5;
      return {
        id,
        x: cx + innerR * Math.cos(angle),
        y: cy + innerR * Math.sin(angle),
      };
    });
  }

  // 3. Detect pure path graph P_n
  const isSimplePath =
    !graph.multigraph &&
    graph.edges.length === n - 1 &&
    graph.edges.every(
      ([u, v], i) =>
        (u === graph.vertices[i] && v === graph.vertices[i + 1]) ||
        (v === graph.vertices[i] && u === graph.vertices[i + 1])
    );
  if (isSimplePath && n >= 2) {
    if (n <= 8) {
      const margin = 65;
      const step = (W - margin * 2) / Math.max(n - 1, 1);
      return graph.vertices.map((id, i) => ({
        id,
        x: margin + i * step,
        y: cy + (n >= 6 ? (i % 2 === 0 ? -16 : 16) : 0),
      }));
    }
    // Snake path for P_9..P_12
    const half = Math.ceil(n / 2);
    const margin = 65;
    const step = (W - margin * 2) / Math.max(half - 1, 1);
    return graph.vertices.map((id, i) => {
      if (i < half) {
        return { id, x: margin + i * step, y: 95 };
      }
      const j = i - half;
      return { id, x: W - margin - j * step, y: 225 };
    });
  }

  // 4. Detect Star S_n (one hub connected to all others, n-1 edges)
  if (!graph.multigraph && n >= 4 && graph.edges.length === n - 1) {
    const degCount: Record<string, number> = {};
    for (const [u, v] of graph.edges) {
      degCount[u] = (degCount[u] ?? 0) + 1;
      degCount[v] = (degCount[v] ?? 0) + 1;
    }
    const hub = graph.vertices.find((v) => degCount[v] === n - 1);
    if (hub) {
      const leaves = graph.vertices.filter((v) => v !== hub);
      const posMap = new Map<string, NodePosition>();
      posMap.set(hub, { id: hub, x: cx, y: cy });
      leaves.forEach((leaf, i) => {
        const angle = -Math.PI / 2 + (2 * Math.PI * i) / leaves.length;
        posMap.set(leaf, {
          id: leaf,
          x: cx + 165 * Math.cos(angle),
          y: cy + 112 * Math.sin(angle),
        });
      });
      return graph.vertices.map((id) => posMap.get(id)!);
    }
  }

  // 5. Detect Wheel W_k (hub of degree n-1 and edges = 2*(n-1))
  if (!graph.multigraph && n >= 4 && graph.edges.length === 2 * (n - 1)) {
    const degCount: Record<string, number> = {};
    for (const [u, v] of graph.edges) {
      degCount[u] = (degCount[u] ?? 0) + 1;
      degCount[v] = (degCount[v] ?? 0) + 1;
    }
    const hub = graph.vertices.find((v) => degCount[v] === n - 1);
    if (hub) {
      const rim = graph.vertices.filter((v) => v !== hub);
      const posMap = new Map<string, NodePosition>();
      posMap.set(hub, { id: hub, x: cx, y: cy });
      rim.forEach((v, i) => {
        const angle = -Math.PI / 2 + (2 * Math.PI * i) / rim.length;
        posMap.set(v, {
          id: v,
          x: cx + 175 * Math.cos(angle),
          y: cy + 115 * Math.sin(angle),
        });
      });
      return graph.vertices.map((id) => posMap.get(id)!);
    }
  }

  // 6. Detect complete bipartite K_{3,3} or K_{2,3}
  if (
    !graph.multigraph &&
    ((n === 6 && graph.edges.length === 9) || (n === 5 && graph.edges.length === 6))
  ) {
    // Try 2-coloring to verify bipartite
    const color = new Map<string, number>();
    const adj = new Map<string, string[]>(graph.vertices.map((v) => [v, []]));
    for (const [u, v] of graph.edges) {
      adj.get(u)?.push(v);
      adj.get(v)?.push(u);
    }
    let bipartite = true;
    const queue: string[] = [graph.vertices[0]];
    color.set(graph.vertices[0], 0);
    while (queue.length > 0 && bipartite) {
      const curr = queue.shift()!;
      const c = color.get(curr)!;
      for (const nxt of adj.get(curr) ?? []) {
        if (!color.has(nxt)) {
          color.set(nxt, 1 - c);
          queue.push(nxt);
        } else if (color.get(nxt) === c) {
          bipartite = false;
        }
      }
    }
    if (bipartite && color.size === n) {
      const part0 = graph.vertices.filter((v) => color.get(v) === 0);
      const part1 = graph.vertices.filter((v) => color.get(v) === 1);
      const posMap = new Map<string, NodePosition>();
      part0.forEach((id, i) => {
        const step = part0.length > 1 ? 200 / (part0.length - 1) : 0;
        posMap.set(id, { id, x: 155, y: part0.length === 1 ? cy : 60 + i * step });
      });
      part1.forEach((id, i) => {
        const step = part1.length > 1 ? 200 / (part1.length - 1) : 0;
        posMap.set(id, { id, x: 445, y: part1.length === 1 ? cy : 60 + i * step });
      });
      return graph.vertices.map((id) => posMap.get(id)!);
    }
  }

  // 7. ATM graph (L2-A2 / Q032..Q035)
  if (vKey === 'a,b,c,d,e,f,g,h' && graph.edges.length === 9) {
    return [
      { id: 'a', x: 110, y: 80 },
      { id: 'b', x: 245, y: 80 },
      { id: 'c', x: 380, y: 80 },
      { id: 'd', x: 165, y: 185 },
      { id: 'e', x: 295, y: 185 },
      { id: 'f', x: 385, y: 255 },
      { id: 'g', x: 505, y: 195 },
      { id: 'h', x: 505, y: 280 },
    ];
  }

  // 8. L2-O4 9-vertex tree (a hub with b,c,d branches)
  if (vKey === 'a,b,c,d,e,f,g,h,i' && graph.edges.length === 8) {
    return [
      { id: 'a', x: 300, y: 58 },
      { id: 'b', x: 145, y: 155 },
      { id: 'c', x: 300, y: 155 },
      { id: 'd', x: 465, y: 155 },
      { id: 'e', x: 90, y: 262 },
      { id: 'f', x: 200, y: 262 },
      { id: 'g', x: 255, y: 262 },
      { id: 'h', x: 345, y: 262 },
      { id: 'i', x: 465, y: 262 },
    ];
  }

  // 9. L2-O4-transfer 7-vertex spider (a-b-c, a-d-e, a-f-g)
  if (
    vKey === 'a,b,c,d,e,f,g' &&
    graph.edges.length === 6 &&
    graph.edges.filter(([u, v]) => u === 'a' || v === 'a').length === 3
  ) {
    return [
      { id: 'a', x: 300, y: 55 },
      { id: 'b', x: 140, y: 155 },
      { id: 'c', x: 140, y: 260 },
      { id: 'd', x: 300, y: 155 },
      { id: 'e', x: 300, y: 260 },
      { id: 'f', x: 460, y: 155 },
      { id: 'g', x: 460, y: 260 },
    ];
  }

  // 10. Two connected stars (L2-S1..S3 / Q074): 6 vertices, 5 edges
  if (
    (vKey === 'a,b,c,d,e,f' || vKey === 'u,v,w,x,y,z') &&
    graph.edges.length === 5
  ) {
    const degCount: Record<string, number> = {};
    for (const [u, v] of graph.edges) {
      degCount[u] = (degCount[u] ?? 0) + 1;
      degCount[v] = (degCount[v] ?? 0) + 1;
    }
    const hubs = graph.vertices.filter((v) => degCount[v] === 3);
    if (hubs.length === 2) {
      const [h1, h2] = hubs;
      const leaves1 = graph.edges
        .filter(([u, v]) => (u === h1 && v !== h2) || (v === h1 && u !== h2))
        .map(([u, v]) => (u === h1 ? v : u));
      const leaves2 = graph.edges
        .filter(([u, v]) => (u === h2 && v !== h1) || (v === h2 && u !== h1))
        .map(([u, v]) => (u === h2 ? v : u));
      const posMap = new Map<string, NodePosition>();
      posMap.set(h1, { id: h1, x: 225, y: cy });
      posMap.set(h2, { id: h2, x: 375, y: cy });
      leaves1.forEach((id, i) =>
        posMap.set(id, { id, x: 105, y: i === 0 ? 85 : 235 })
      );
      leaves2.forEach((id, i) =>
        posMap.set(id, { id, x: 495, y: i === 0 ? 85 : 235 })
      );
      if (posMap.size === n) {
        return graph.vertices.map((id) => posMap.get(id)!);
      }
    }
  }

  // Default: balanced elliptical / circular layout
  const rx = n <= 4 ? 145 : n <= 8 ? 190 : 215;
  const ry = n <= 4 ? 95 : 112;
  return graph.vertices.map((id, idx) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * idx) / Math.max(n, 1);
    return {
      id,
      x: cx + rx * Math.cos(angle),
      y: cy + ry * Math.sin(angle),
    };
  });
}
