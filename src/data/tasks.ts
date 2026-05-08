import type { Task } from '../types';

const FEATURE_TITLES = [
  'Implement OAuth login flow',
  'Refactor checkout state machine',
  'Add multi-tenant org switcher',
  'Build admin reporting dashboard',
  'Integrate Stripe webhooks',
  'Migrate analytics to ClickHouse',
  'Ship dark mode',
  'Bulk export CSV from billing',
  'In-app notifications v2',
  'Add SSO for enterprise tier',
  'Internationalize the marketing site',
  'Audit log for admin actions',
  'Rate limiter for public API',
  'Replace cron with scheduler service',
  'Real-time collaboration cursors',
];

const BUG_TITLES = [
  'Login form double-submits on Safari',
  'Webhook retry storm in billing',
  'Memory leak in long-poll endpoint',
  'Date picker shows tomorrow in UTC+13',
  'Race condition in cart checkout',
  'Empty state crashes on null user',
  'CSV export truncates unicode',
];

const DEBT_TITLES = [
  'Remove unused feature flags (47 found)',
  'Upgrade React 17 → 18 in monolith',
  'Split god-object UserService',
  'Replace deprecated lodash imports',
  'Document undocumented batch jobs',
];

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

let taskCounter = 1000;
export function nextTaskId(): string {
  taskCounter += 1;
  return `SW-${taskCounter}`;
}

export function generateBacklogTask(sprint: number, rng: () => number): Task {
  const roll = rng();
  let type: Task['type'] = 'feature';
  let title = pick(FEATURE_TITLES, rng);
  if (roll < 0.18) {
    type = 'bug';
    title = pick(BUG_TITLES, rng);
  } else if (roll < 0.32) {
    type = 'tech-debt';
    title = pick(DEBT_TITLES, rng);
  }
  const sp = [1, 2, 3, 5, 5, 8, 8, 13][Math.floor(rng() * 8)];
  // True cost is ±50% — players see sp, but reality is truePoints.
  const variance = 0.5 + rng();
  const truePoints = Math.max(1, Math.round(sp * variance));
  const priority: Task['priority'] = (['low', 'medium', 'medium', 'high', 'critical'] as const)[
    Math.floor(rng() * 5)
  ];
  return {
    id: nextTaskId(),
    title,
    description: '',
    type,
    storyPoints: sp,
    truePoints,
    priority,
    hiddenComplexity: rng(),
    complexityRevealed: false,
    bugProbability: 0.05 + rng() * 0.25,
    dependencies: [],
    status: 'backlog',
    rushed: false,
    progress: 0,
    createdSprint: sprint,
    source: 'product',
  };
}

export function generateInitialBacklog(): Task[] {
  const rng = Math.random;
  const tasks: Task[] = [];
  for (let i = 0; i < 12; i++) {
    tasks.push(generateBacklogTask(1, rng));
  }
  return tasks;
}
