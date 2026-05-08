import type { RandomEvent, RandomEventKind, Metrics } from '../types';

export interface EventTemplate {
  kind: RandomEventKind;
  weight: number;
  minSprint?: number;
  title: () => string;
  body: () => string;
  effects: () => Partial<Metrics>;
  spawnIncident?: boolean;
  spawnEmail?: boolean;
}

export const EVENT_TEMPLATES: EventTemplate[] = [
  {
    kind: 'outage',
    weight: 5,
    title: () => 'Production degraded — checkout 5xx spike',
    body: () => 'PagerDuty fired. Checkout 5xx > 4% for 8 minutes. Customers tweeting.',
    effects: () => ({ stability: -12, trust: -4, morale: -3 }),
    spawnIncident: true,
  },
  {
    kind: 'security-breach',
    weight: 2,
    minSprint: 5,
    title: () => 'Security: anomalous access pattern detected',
    body: () => 'SecOps observed a spike in failed auth from a single ASN. Could be a credential-stuffing attempt.',
    effects: () => ({ security: 14, trust: -6, morale: -4 }),
    spawnEmail: true,
  },
  {
    kind: 'resignation',
    weight: 3,
    minSprint: 3,
    title: () => 'Resignation: a senior engineer is leaving',
    body: () => 'Two weeks notice. Cited "growth opportunities" but everyone knows.',
    effects: () => ({ morale: -10, velocity: -3, burnout: 4 }),
  },
  {
    kind: 'audit',
    weight: 2,
    minSprint: 6,
    title: () => 'Surprise audit: SOC2 spot-check',
    body: () => 'Auditor showed up unannounced. Wants evidence of access reviews from Q1.',
    effects: () => ({ patience: -4, security: 8, morale: -3 }),
    spawnEmail: true,
  },
  {
    kind: 'cloud-bill-spike',
    weight: 4,
    title: () => 'Cloud bill spike: +$48K in 4 days',
    body: () => 'Someone left a GPU autoscaler in dev. Finance has questions.',
    effects: () => ({ budget: -48000, patience: -6 }),
    spawnEmail: true,
  },
  {
    kind: 'vendor-outage',
    weight: 4,
    title: () => 'Vendor outage: payment provider down',
    body: () => 'Stripe reports a regional outage. We have no fallback.',
    effects: () => ({ stability: -8, trust: -3 }),
    spawnIncident: true,
  },
  {
    kind: 'ai-hallucination',
    weight: 4,
    minSprint: 4,
    title: () => 'AI feature hallucinated a customer\'s legal status',
    body: () => 'Support flagged that the AI told a user they were "permanently banned" when they weren\'t.',
    effects: () => ({ trust: -8, security: 4, morale: -2 }),
    spawnEmail: true,
  },
  {
    kind: 'db-corruption',
    weight: 1,
    minSprint: 7,
    title: () => 'Database corruption in billing partition',
    body: () => '0.3% of rows have inconsistent state. Restoring from snapshot.',
    effects: () => ({ stability: -20, trust: -10, burnout: 8 }),
    spawnIncident: true,
  },
  {
    kind: 'accidental-deploy',
    weight: 3,
    minSprint: 2,
    title: () => 'Accidental prod deploy from a feature branch',
    body: () => 'Someone\'s shell history is going to be very interesting.',
    effects: () => ({ stability: -15, morale: -3, techDebt: 4 }),
    spawnIncident: true,
  },
  {
    kind: 'ransomware-scare',
    weight: 1,
    minSprint: 8,
    title: () => 'Ransomware-style email demanding bitcoin',
    body: () => 'Probably a hoax. Legal wants a 12-page memo regardless.',
    effects: () => ({ security: 10, morale: -3, patience: -2 }),
    spawnEmail: true,
  },
  {
    kind: 'exec-panic',
    weight: 4,
    title: () => 'Exec panic in #general at 11pm',
    body: () => 'CEO saw a competitor demo. There are 47 messages and one of them is a video.',
    effects: () => ({ patience: -6, burnout: 4 }),
    spawnEmail: true,
  },
];

export function pickEvent(sprint: number, rng: () => number): EventTemplate {
  const eligible = EVENT_TEMPLATES.filter((t) => (t.minSprint ?? 0) <= sprint);
  const total = eligible.reduce((s, t) => s + t.weight, 0);
  let r = rng() * total;
  for (const t of eligible) {
    r -= t.weight;
    if (r <= 0) return t;
  }
  return eligible[0];
}

export function makeRandomEvent(
  template: EventTemplate,
  sprint: number,
  day: number,
): RandomEvent {
  return {
    id: `evt-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    kind: template.kind,
    title: template.title(),
    body: template.body(),
    sprint,
    day,
    effects: template.effects(),
  };
}
