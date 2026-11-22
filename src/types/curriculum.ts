export interface GraphData {
  vertices: string[];
  edges: [string, string][];
  directed: boolean;
  multigraph: boolean;
}

export interface PlaceNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface ModelReviewInfo {
  status?: string;
  basis?: string;
}

export interface ActivityModel {
  scenario?: string;
  vertexMeaning?: string;
  edgeMeaning?: string;
  boardLabel?: string;
  places?: PlaceNode[];
  hints?: string[];
  adaptationReason?: string;
  review?: ModelReviewInfo;
}

export interface TeachingOption {
  value: string;
  label: string;
}

export interface TeachingCriterion {
  id: string;
  label: string;
}

export interface TeachingPart {
  id: string;
  type: string;
  label: string;
  options?: TeachingOption[];
  expected?: string | number | GraphData;
  criteria?: TeachingCriterion[];
  part?: TeachingPart;
  vertexId?: string;
  closed?: boolean;
  start?: string;
  end?: string;
  property?: string;
  selected?: string[];
  claim?: string;
  lowerBoundMethods?: string[];
  count?: number;
}

export interface TeachingSourceReference {
  questionId: string;
  bankVersion: string;
  use: string;
  originalAposStage: string;
  adaptationReason: string;
}

export interface TeachingContext {
  scenario: string;
  vertexMeaning: string;
  edgeMeaning: string;
  goal: string;
}

export interface TeachingExitVariant {
  id: string;
  graph: GraphData;
  context: TeachingContext;
  parts: TeachingPart[];
  instructionSteps: string[];
  explanation: string;
  hints: string[];
}

export interface TeachingActivity {
  id: string;
  unitId: string;
  lessonId: string;
  stageId: 'Action' | 'Process' | 'Object' | 'Schema';
  title: string;
  cognitiveOperation: string;
  context: TeachingContext;
  graph: GraphData;
  parts: TeachingPart[];
  instructionSteps: string[];
  hints: string[];
  explanation: string;
  rubric: string[];
  sourceReferences: TeachingSourceReference[];
  prerequisites: string[];
  figure?: {
    path: string;
    alt: string;
  };
  alternateLayout?: boolean;
  exitVariants?: TeachingExitVariant[];
}

export interface TeachingUnit {
  id: string;
  lessonId: string;
  stageId: 'Action' | 'Process' | 'Object' | 'Schema';
  title: string;
  objective: string;
  prerequisites: string[];
  scaffolding: string[];
  misconceptions: string[];
  evidenceCriteria: string[];
  requiredActivityIds: string[];
  exitActivityId: string;
  progressWeight: number;
}

export interface TeachingLesson {
  id: string;
  title: string;
  objective: string;
  unitIds: string[];
}

export interface TeachingDataset {
  productVersion: string;
  curriculumVersion: number;
  bankVersion: string;
  lessons: TeachingLesson[];
  units: TeachingUnit[];
  activities: TeachingActivity[];
}

export interface GraphConstructionTarget {
  n: number;
  gamma: number;
  minimumSetCountMin?: number;
  minimumSetCountMax?: number;
}

export interface PracticeActivity {
  questionId: string;
  title: string;
  mode: string;
  target: string | GraphConstructionTarget;
  prompt: string;
  model: ActivityModel;
  hints: string[];
  rubric?: string;
  sourceMode?: string;
  assessmentPolicy?: string;
  reviewStatus?: string;
  figurePage: number | null;
  sourceModeByTab?: Record<string, string>;
  adaptationReason?: string;
}

export interface PracticeDataset {
  version: number;
  bankVersion: string;
  reviewStatus?: string;
  adaptationReason?: string;
  activities: PracticeActivity[];
}

export interface BankLabDataset {
  version: number;
  bankVersion: string;
  activities: PracticeActivity[];
}

export interface CompetitionActivity {
  questionId: string;
  mode: string;
  target: string;
  title: string;
  prompt: string;
  model: ActivityModel;
  hints: string[];
}

export interface CompetitionDataset {
  version: number;
  bankVersion: string;
  defaultRounds: number;
  caps: number[];
  reviewStatus?: string;
  adaptationReason?: string;
  activities: CompetitionActivity[];
}

export interface LabStation {
  id: string;
  title: string;
  body: string;
  focus_fa: string;
}

export interface LabDataset {
  version: number;
  stations: LabStation[];
  model: {
    scenario: string;
    vertexMeaning: string;
    edgeMeaning: string;
  };
  questionIds: string[];
  models: Record<string, ActivityModel>;
  customMin: number;
  customMax: number;
  challengeCount: number;
  challengeSeconds: number;
  reviewStatus?: string;
}

export type TabKey = 'teaching' | 'practice' | 'bank-lab' | 'competition' | 'lab';

export type ReviewStatus = 'approved' | 'needs-revision' | 'scientific-error';

export interface ReviewEntry {
  itemKey: string;
  tab: TabKey;
  itemId: string;
  title: string;
  status?: ReviewStatus;
  note: string;
  updatedAt: string;
}

export type ReviewMap = Record<string, ReviewEntry>;
