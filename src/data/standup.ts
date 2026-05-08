// Daily standup — 3 lines per dev, generated from their state.

import type { Developer, Task } from '../types';

const YESTERDAY_HIGH_MORALE = [
  'shipped the auth fix',
  'paired with QA on the regression',
  'rebased the PR for the seventh time',
  'cleaned up some flake',
];
const YESTERDAY_LOW_MORALE = [
  'tried to debug a flaky test',
  'attended four meetings',
  'updated a Confluence page nobody reads',
  'sat in a roadmap review',
];
const YESTERDAY_HIGH_BURNOUT = [
  'worked late on the rollback',
  'paged at 2am for a noisy alert',
  'wrote postmortem #4 of the quarter',
];

const TODAY_AVAILABLE = [
  'pick up something from the backlog',
  'finish the PR cleanup',
  'pair on the QA blocker',
];
const TODAY_BLOCKED = [
  'unblock myself on the API contract',
  'wait on review',
  'wait on infra',
];

const BLOCKER_HIGH_DEBT = [
  'The legacy billing path is fighting me.',
  'Half of this code has no owner.',
  'This component has no tests.',
];
const BLOCKER_LOW_MORALE = [
  'Nothing major. Just tired.',
  'Just want to finish what I started 3 sprints ago.',
];
const BLOCKER_HIGH_EGO = [
  'Architecture is wrong. We discussed this.',
  'Blocked on a design I disagree with.',
];
const BLOCKER_NORMAL = ['No blockers.', 'All good.', 'Nothing to flag.'];

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

export interface StandupLine {
  devId: string;
  devName: string;
  yesterday: string;
  today: string;
  blockers: string;
  vibeColor: 'green' | 'yellow' | 'red';
}

export function generateStandupLines(
  team: Developer[],
  tasks: Task[],
  techDebtScore: number,
  rng: () => number,
): StandupLine[] {
  return team
    .filter((d) => d.status !== 'resigned' && d.status !== 'vacation')
    .map((d) => {
      const task = tasks.find((t) => t.id === d.taskId);
      const lowMorale = d.morale < 45;
      const highBurnout = d.burnout > 70;
      const highEgo = d.ego > 80;
      const yesterdayPool = highBurnout
        ? YESTERDAY_HIGH_BURNOUT
        : lowMorale
        ? YESTERDAY_LOW_MORALE
        : YESTERDAY_HIGH_MORALE;
      const todayPool = d.status === 'blocked' ? TODAY_BLOCKED : TODAY_AVAILABLE;
      let blockers = pick(BLOCKER_NORMAL, rng);
      if (techDebtScore > 60 && rng() < 0.5) blockers = pick(BLOCKER_HIGH_DEBT, rng);
      else if (lowMorale && rng() < 0.4) blockers = pick(BLOCKER_LOW_MORALE, rng);
      else if (highEgo && rng() < 0.35) blockers = pick(BLOCKER_HIGH_EGO, rng);
      const today = task ? `Continue ${task.id} — ${task.title}` : pick(todayPool, rng);
      const vibeColor: StandupLine['vibeColor'] = highBurnout || d.morale < 35 ? 'red' : lowMorale ? 'yellow' : 'green';
      return {
        devId: d.id,
        devName: d.name,
        yesterday: pick(yesterdayPool, rng),
        today,
        blockers,
        vibeColor,
      };
    });
}
