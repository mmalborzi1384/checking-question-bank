import teachingRaw from './teaching.json';
import practiceRaw from './practice.json';
import bankLabRaw from './bank-lab.json';
import competitionRaw from './competition.json';
import labRaw from './lab.json';

import type {
  BankLabDataset,
  CompetitionDataset,
  LabDataset,
  PracticeDataset,
  TeachingDataset,
} from '../types/curriculum';

export const teachingData = teachingRaw as unknown as TeachingDataset;
export const practiceData = practiceRaw as unknown as PracticeDataset;
export const bankLabData = bankLabRaw as unknown as BankLabDataset;
export const competitionData = competitionRaw as unknown as CompetitionDataset;
export const labData = labRaw as unknown as LabDataset;

export const totalExitVariants = teachingData.activities.reduce(
  (sum, act) => sum + (act.exitVariants?.length ?? 0),
  0
);

export const totalTeachingParts = teachingData.activities.reduce((sum, act) => {
  const exitParts = (act.exitVariants ?? []).reduce((s, v) => s + v.parts.length, 0);
  return sum + act.parts.length + exitParts;
}, 0);

export const datasetStats = {
  teaching: {
    lessons: teachingData.lessons.length,
    units: teachingData.units.length,
    activities: teachingData.activities.length,
    exitVariants: totalExitVariants,
    parts: totalTeachingParts,
    bankVersion: teachingData.bankVersion,
    curriculumVersion: teachingData.curriculumVersion,
    productVersion: teachingData.productVersion,
  },
  practice: {
    activities: practiceData.activities.length,
    bankVersion: practiceData.bankVersion,
  },
  bankLab: {
    activities: bankLabData.activities.length,
    bankVersion: bankLabData.bankVersion,
  },
  competition: {
    activities: competitionData.activities.length,
    defaultRounds: competitionData.defaultRounds,
    caps: competitionData.caps,
    bankVersion: competitionData.bankVersion,
  },
  lab: {
    stations: labData.stations.length,
    questionIds: labData.questionIds.length,
    models: Object.keys(labData.models).length,
    customMin: labData.customMin,
    customMax: labData.customMax,
    challengeCount: labData.challengeCount,
    challengeSeconds: labData.challengeSeconds,
  },
  totalReviewableItems:
    teachingData.activities.length +
    practiceData.activities.length +
    bankLabData.activities.length +
    competitionData.activities.length +
    labData.stations.length +
    Object.keys(labData.models).length,
};

export interface QuestionCrossRef {
  title: string;
  prompt?: string;
  rubric?: string;
  sourceTab: string;
}

export const questionCrossRefById: Record<string, QuestionCrossRef> = (() => {
  const map: Record<string, QuestionCrossRef> = {};
  for (const act of practiceData.activities) {
    map[act.questionId] = {
      title: act.title,
      prompt: act.prompt,
      rubric: act.rubric,
      sourceTab: 'practice',
    };
  }
  for (const act of bankLabData.activities) {
    if (!map[act.questionId]) {
      map[act.questionId] = {
        title: act.title,
        prompt: act.prompt,
        rubric: act.rubric,
        sourceTab: 'bank-lab',
      };
    }
  }
  for (const act of competitionData.activities) {
    const existing = map[act.questionId];
    if (!existing) {
      map[act.questionId] = {
        title: act.title,
        prompt: act.prompt,
        sourceTab: 'competition',
      };
    } else if (
      !/[PCKSW]\d|K\d\d|K_\{\d,\d\}|Petersen/i.test(existing.title) &&
      /[PCKSW]\d|K\d\d|K_\{\d,\d\}|Petersen/i.test(act.title)
    ) {
      map[act.questionId] = {
        ...existing,
        title: `${existing.title} (${act.title})`,
      };
    }
  }
  return map;
})();
