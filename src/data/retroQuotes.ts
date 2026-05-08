// Generated retro quote — picked based on the worst metric of the sprint.

import type { Metrics, SprintSummary } from '../types';

const QUOTES = {
  burnout: [
    '"I just need a quiet sprint. We say this every sprint. The sprints have heard us. They are not listening."',
    '"Camera off Friday." — anon retro card',
    '"My calendar has a meeting called \'meeting prep meeting\' now."',
  ],
  techDebt: [
    '"We are not engineers. We are stewards of a haunted artifact."',
    '"Refactor speed run? more like REGRESSION speed run." — slack thread',
    '"The codebase has lore now."',
  ],
  trust: [
    '"They keep asking why velocity is down. We are the velocity."',
    '"Stakeholders want a roadmap. We want a thirty-minute lunch."',
    '"They asked for a confidence rating. I rated it \'low.\'"',
  ],
  stability: [
    '"PagerDuty is the only product that has 100% uptime here."',
    '"Three rollbacks in a sprint feels like a personal failing. It isn\'t. It is a system failing."',
    '"The status page is so red it has its own brand guidelines."',
  ],
  morale: [
    '"Lunch chat has gone fully passive-aggressive emoji."',
    '"Three people opened LinkedIn during retro. I counted."',
    '"Someone left a Glassdoor review titled \'mid.\'"',
  ],
  velocity: [
    '"We were heroes. We are tired heroes."',
    '"Five tickets shipped, eleven created. Math is hard."',
    '"Someone said \'we should write fewer bugs.\' Yes."',
  ],
  default: [
    '"It is what it is." — every retro card, eventually',
    '"We did our best. Allegedly."',
    '"More wins than losses. We think. Did we count?"',
    '"Strong sprint. Sleep is for sprint review days."',
  ],
};

export function generateRetroQuote(summary: SprintSummary, metrics: Metrics): string {
  // Pick category based on worst-performing metric.
  const candidates: { key: keyof typeof QUOTES; severity: number }[] = [
    { key: 'burnout', severity: metrics.burnout },
    { key: 'techDebt', severity: metrics.techDebt },
    { key: 'trust', severity: 100 - metrics.trust },
    { key: 'stability', severity: 100 - metrics.stability },
    { key: 'morale', severity: 100 - metrics.morale },
    { key: 'velocity', severity: summary.velocity < summary.committed ? 80 : 30 },
  ];
  candidates.sort((a, b) => b.severity - a.severity);
  const top = candidates[0];
  const list = top.severity > 60 ? QUOTES[top.key] : QUOTES.default;
  const idx = (summary.sprint * 7) % list.length;
  return list[idx];
}

export function generateHighlight(summary: SprintSummary): string | undefined {
  if (summary.velocity > summary.committed * 1.2) return 'You overdelivered. Watch for retaliation.';
  if (summary.bugsCreated === 0) return 'Zero bugs created. Suspiciously clean.';
  if (summary.incidents === 0 && summary.sprint > 1) return 'No incidents. Production held its breath.';
  return undefined;
}

export function generateLowlight(summary: SprintSummary): string | undefined {
  if (summary.resignations > 0) return `${summary.resignations} resignation${summary.resignations > 1 ? 's' : ''} this sprint.`;
  if (summary.bugsCreated > 5) return `${summary.bugsCreated} new bugs created. Velocity is borrowed.`;
  if (summary.velocity < summary.committed * 0.6) return 'Missed commitment by a wide margin.';
  return undefined;
}

// ---------- RCA generator ---------------------------------------------------
const RCA_FIRST = [
  'Root cause: a configuration value was changed without review.',
  'Root cause: a dependency upstream silently changed behavior.',
  'Root cause: a memory leak compounded over 36 hours.',
  'Root cause: a deploy bypassed the canary stage.',
  'Root cause: a circular retry storm overwhelmed the queue.',
];

const RCA_FIVEWHYS = [
  '1. The deploy broke. 2. Because no canary. 3. Because canary was disabled "for the release." 4. Because the release was urgent. 5. Because of the launch we promised marketing.',
  '1. Auth failed. 2. Because tokens expired early. 3. Because clock drift. 4. Because the NTP daemon hadn\'t been restarted. 5. Because nobody owns NTP.',
  '1. Billing double-charged. 2. Because retry without idempotency. 3. Because we didn\'t add the idempotency key. 4. Because it was "follow-up." 5. Because of the velocity push two sprints ago.',
];

const RCA_ACTIONS = [
  'Action items: (1) restore canary stage; (2) write a runbook; (3) add a dashboard nobody will read.',
  'Action items: (1) add idempotency key; (2) backfill audit logs; (3) schedule a "fire drill" we will postpone twice.',
  'Action items: (1) set up alerting; (2) document the on-call; (3) circulate this RCA in #incidents and never speak of it again.',
];

export function generateRCA(rng: () => number): string {
  const a = RCA_FIRST[Math.floor(rng() * RCA_FIRST.length)];
  const b = RCA_FIVEWHYS[Math.floor(rng() * RCA_FIVEWHYS.length)];
  const c = RCA_ACTIONS[Math.floor(rng() * RCA_ACTIONS.length)];
  return `${a}\n\nFive whys:\n${b}\n\n${c}`;
}
