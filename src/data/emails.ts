import type { Email, EmailChoice, EmailSender, EmailTone } from '../types';

export interface EmailTemplate {
  id: string;
  weight: number;
  minSprint?: number;
  maxSprint?: number;
  sender: EmailSender;
  senderName: string;
  tone: EmailTone;
  subject: () => string;
  body: () => string;
  choices: () => EmailChoice[];
}

const senderName = (s: EmailSender): string => {
  const map: Record<EmailSender, string[]> = {
    'product-manager': ['Brittany Howell', 'Greg Patel', 'Lila Trang'],
    'cto': ['Marcus Vale (CTO)'],
    'ceo': ['Diane Sterling (CEO)'],
    'cfo': ['Hank Webber (CFO)'],
    'qa-lead': ['Priya Rao (QA Lead)'],
    'security': ['SecOps <noc@security>'],
    'developer': ['Alex Reyes', 'Tomas Park', 'Yuki Tanaka'],
    'client': ['Trent @ Acme Corp', 'Beatrice @ Northwind'],
    'vp-eng': ['Jordan Liu (VP Eng)'],
    'devops': ['SRE Bot <pager@devops>'],
    'legal': ['Compliance <legal@corp>'],
  };
  const names = map[s];
  return names[Math.floor(Math.random() * names.length)];
};

// Each choice has *real* tradeoffs — at least 2 metrics moved, with at least
// one negative effect. Loyalty deltas are added where relevant.

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'ai-friday',
    weight: 8,
    sender: 'ceo',
    senderName: senderName('ceo'),
    tone: 'urgent',
    subject: () => 'Re: AI integration — must ship by Friday',
    body: () =>
      'Team,\n\nI was at a dinner last night and our top three competitors all have AI. We need it shipped by Friday.\n\nMake it happen.\n\n— Diane',
    choices: () => [
      {
        id: 'commit',
        label: 'Commit. We\'ll figure it out.',
        effect: { trust: 8, techDebt: 12, burnout: 8, patience: 6, security: 8, politics: 8 },
        message: 'Team begins integrating an LLM behind the billing flow. What could go wrong.',
      },
      {
        id: 'pushback',
        label: 'Push back. Send a 6-week plan with milestones.',
        effect: { trust: -10, patience: -8, morale: 6, politics: -10 },
        loyaltyDelta: { specialization: 'qa', amount: 6 },
        message: 'Diane forwards your reply to the board with "thoughts??".',
      },
      {
        id: 'duct-tape',
        label: 'Wrap GPT around our search box. Call it AI.',
        effect: { trust: 5, security: 14, techDebt: 18, patience: 4, morale: -4 },
        spawnTask: { title: 'Ship "AI search" (proxy to OpenAI)', type: 'feature', storyPoints: 5, priority: 'critical', source: 'exec' },
      },
    ],
  },
  {
    id: 'security-criticals',
    weight: 7,
    sender: 'security',
    senderName: senderName('security'),
    tone: 'panic',
    subject: () => '[ACTION REQUIRED] 14 Critical CVEs detected in production',
    body: () =>
      'Automated scan found 14 critical CVEs across our dependency tree, including 3 in the auth path.\n\nPolicy SLA: 72 hours. Please advise.',
    choices: () => [
      {
        id: 'patch-now',
        label: 'Patch immediately. Block this sprint.',
        effect: { security: -22, velocity: -4, morale: -4, trust: -4, patience: -4 },
        loyaltyDelta: { specialization: 'security', amount: 8 },
        spawnTask: { title: 'Patch 14 CVEs in dependency tree', type: 'security', storyPoints: 8, priority: 'critical', source: 'security' },
      },
      {
        id: 'next-sprint',
        label: 'Triage. Patch top 3 next sprint.',
        effect: { security: 6, techDebt: 5, trust: -2 },
      },
      {
        id: 'ignore-cves',
        label: 'Mark accepted-risk. Move on.',
        effect: { security: 20, trust: -4, patience: 4, politics: 6 },
        loyaltyDelta: { specialization: 'security', amount: -16 },
        message: 'You have accepted the risk. The risk has not accepted you back.',
      },
    ],
  },
  {
    id: 'demo-failed',
    weight: 5,
    sender: 'client',
    senderName: senderName('client'),
    tone: 'passive-aggressive',
    subject: () => 'Following up — demo experience',
    body: () =>
      'Hi team,\n\nWanted to circle back on the demo. The page froze for ~40s during the live walkthrough and our CEO asked "is it always like this?"\n\nLooping in your account team. Hope we can make this right!\n\nThanks!',
    choices: () => [
      {
        id: 'apologize-investigate',
        label: 'Apologize, open an incident, send RCA.',
        effect: { trust: 8, morale: -3, burnout: 4, velocity: -2 },
        spawnIncident: true,
      },
      {
        id: 'blame-network',
        label: 'Blame their conference WiFi.',
        effect: { trust: -14, patience: -6, politics: 4 },
      },
      {
        id: 'free-credits',
        label: 'Comp 3 months. Smooth it over.',
        effect: { trust: 12, budget: -15000, patience: 4 },
      },
    ],
  },
  {
    id: 'velocity-question',
    weight: 6,
    sender: 'vp-eng',
    senderName: senderName('vp-eng'),
    tone: 'passive-aggressive',
    subject: () => 'quick q: velocity trend?',
    body: () =>
      'Hey —\n\nNoticed velocity is trending down for the third sprint. Wanted to understand what\'s going on before the QBR.\n\nNot a big deal, just want to be prepared 🙂',
    choices: () => [
      {
        id: 'tech-debt-honest',
        label: 'Be honest: tech debt is killing us.',
        effect: { trust: 4, patience: -3, morale: 3, politics: -4 },
      },
      {
        id: 'reassure',
        label: 'Reassure. Promise a stretch sprint.',
        effect: { burnout: 10, morale: -6, trust: 4, patience: 4 },
      },
      {
        id: 'blame-scope',
        label: 'Blame Product for shifting scope.',
        effect: { trust: -6, patience: -5, morale: 6, politics: -10 },
      },
    ],
  },
  {
    id: 'prod-deploy-today',
    weight: 6,
    sender: 'product-manager',
    senderName: senderName('product-manager'),
    tone: 'urgent',
    subject: () => 'Can we move the prod deploy to TODAY?',
    body: () =>
      'Sales promised the new pricing flow to a customer for a Tuesday demo. I know we said Thursday but can we pull it forward?\n\nThis would unlock $1.2M ARR.',
    choices: () => [
      {
        id: 'ship-today',
        label: 'Ship today. YOLO.',
        effect: { stability: -16, techDebt: 10, trust: 6, burnout: 8, politics: 8 },
        spawnIncident: true,
      },
      {
        id: 'hold-thursday',
        label: 'Hold the line. Thursday.',
        effect: { trust: -6, stability: 4, patience: -4, politics: -6 },
        loyaltyDelta: { specialization: 'qa', amount: 4 },
      },
      {
        id: 'compromise',
        label: 'Ship Wed with a feature flag for that customer.',
        effect: { trust: 4, techDebt: 4, burnout: 3 },
      },
    ],
  },
  {
    id: 'resignation-rumor',
    weight: 4,
    minSprint: 4,
    sender: 'developer',
    senderName: senderName('developer'),
    tone: 'neutral',
    subject: () => 'Quick chat?',
    body: () =>
      'Hey, do you have 15 min today? Want to talk through something. Nothing urgent.\n\n(It is urgent.)',
    choices: () => [
      {
        id: 'hear-out',
        label: 'Drop everything. Listen.',
        effect: { morale: 8, trust: -2, velocity: -1 },
        loyaltyDelta: { amount: 12 },
      },
      {
        id: 'reschedule',
        label: 'Reschedule for next week.',
        effect: { morale: -12, burnout: 4, trust: -2 },
        loyaltyDelta: { amount: -18 },
        message: 'They are now updating LinkedIn.',
      },
      {
        id: 'counter-offer',
        label: 'Offer a retention bonus preemptively.',
        effect: { budget: -25000, morale: 8, patience: -3 },
        loyaltyDelta: { amount: 6 },
      },
    ],
  },
  {
    id: 'cloud-bill',
    weight: 5,
    sender: 'cfo',
    senderName: senderName('cfo'),
    tone: 'corporate-cheerful',
    subject: () => 'Cloud spend +47% MoM — let\'s align!',
    body: () =>
      'Hi! Cloud spend is up 47% month-over-month. Walking through it with the board next Tues. Want to make sure I have the right narrative.\n\nThanks!! 🙏',
    choices: () => [
      {
        id: 'audit-now',
        label: 'Pause feature work. Cost audit.',
        effect: { budget: 40000, velocity: -5, morale: -3, patience: -3 },
      },
      {
        id: 'rightsize',
        label: 'Right-size next sprint. Live with it now.',
        effect: { budget: 12000, techDebt: 4, trust: 2 },
      },
      {
        id: 'ai-blame',
        label: 'Blame the AI integration.',
        effect: { patience: -6, trust: -4, politics: 4 },
      },
    ],
  },
  {
    id: 'qa-blockers',
    weight: 6,
    sender: 'qa-lead',
    senderName: senderName('qa-lead'),
    tone: 'passive-aggressive',
    subject: () => 'PRs merging without test coverage (again)',
    body: () =>
      'Hi — flagging that 6 PRs merged this sprint with <30% coverage on changed lines. We had this conversation last sprint.\n\nThis is going to bite us.',
    choices: () => [
      {
        id: 'enforce-cov',
        label: 'Enforce 80% coverage gate. Slow down.',
        effect: { stability: 10, velocity: -5, morale: -4 },
        loyaltyDelta: { specialization: 'qa', amount: 10 },
      },
      {
        id: 'discuss-retro',
        label: 'Add to retro. Continue shipping.',
        effect: { techDebt: 6, stability: -3, trust: -2 },
      },
      {
        id: 'side-with-qa',
        label: 'Stop the line. Coverage debt sprint.',
        effect: { stability: 16, techDebt: -10, velocity: -10, morale: -6, patience: -4 },
        loyaltyDelta: { specialization: 'qa', amount: 14 },
      },
    ],
  },
  {
    id: 'audit-finding',
    weight: 4,
    minSprint: 6,
    sender: 'legal',
    senderName: senderName('legal'),
    tone: 'corporate-cheerful',
    subject: () => 'SOC2 finding — encryption at rest',
    body: () =>
      'Hi team!\n\nAuditor found we have unencrypted PII in the analytics warehouse. Need a remediation plan within 30 days for the report.\n\nNo pressure, just legally required! 🙂',
    choices: () => [
      {
        id: 'remediate',
        label: 'Spin up encryption project this sprint.',
        effect: { security: -16, velocity: -5, budget: -8000, trust: 4 },
        spawnTask: { title: 'Encrypt analytics PII at rest (SOC2)', type: 'security', storyPoints: 13, priority: 'high', source: 'security' },
      },
      {
        id: 'paper-over',
        label: 'Document compensating controls. Defer.',
        effect: { security: 10, trust: -4, patience: -3 },
      },
    ],
  },
  {
    id: 'exec-skip-testing',
    weight: 5,
    minSprint: 3,
    sender: 'cto',
    senderName: senderName('cto'),
    tone: 'urgent',
    subject: () => 'Can we skip testing for the launch?',
    body: () =>
      'Need to launch the new tier on Monday. Testing is taking too long. Can we just ship and watch metrics?',
    choices: () => [
      {
        id: 'no',
        label: 'No. We test. Period.',
        effect: { stability: 10, patience: -6, trust: -4, politics: -6 },
        loyaltyDelta: { specialization: 'qa', amount: 10 },
      },
      {
        id: 'limited-test',
        label: 'Smoke test only. Ship Monday.',
        effect: { stability: -10, techDebt: 6, trust: 4 },
      },
      {
        id: 'full-yolo',
        label: 'Yes. Ship Monday. Pray.',
        effect: { stability: -25, techDebt: 12, trust: 8, patience: 6, politics: 10 },
        spawnIncident: true,
      },
    ],
  },
  {
    id: 'dev-conflict',
    weight: 4,
    minSprint: 2,
    sender: 'developer',
    senderName: senderName('developer'),
    tone: 'passive-aggressive',
    subject: () => 'Re: PR #4423 — concerns',
    body: () =>
      'I cannot in good conscience approve this PR. The architecture introduces unnecessary coupling and doesn\'t align with the patterns we agreed on in the design doc nobody read.\n\nHappy to walk through it.',
    choices: () => [
      {
        id: 'side-with-architect',
        label: 'Tell the team to follow the architect\'s pattern.',
        effect: { morale: -6, techDebt: -8, velocity: -4 },
        loyaltyDelta: { archetype: 'difficult-architect', amount: 12 },
      },
      {
        id: 'override',
        label: 'Override. Ship it.',
        effect: { morale: 6, techDebt: 12, trust: 2 },
        loyaltyDelta: { archetype: 'difficult-architect', amount: -16 },
      },
      {
        id: 'mediate',
        label: 'Hold a 90-min design review.',
        effect: { velocity: -3, morale: 4, trust: 2 },
      },
    ],
  },
  {
    id: 'on-call-burnout',
    weight: 4,
    minSprint: 4,
    sender: 'devops',
    senderName: senderName('devops'),
    tone: 'neutral',
    subject: () => 'On-call rotation is burning people out',
    body: () =>
      'We had 11 pages last week. Three were genuine. The team is asking to either (a) cut the rotation, (b) add headcount, or (c) actually fix the noisy alerts.',
    choices: () => [
      {
        id: 'fix-noise',
        label: 'Pause feature work. Fix noisy alerts.',
        effect: { stability: 8, velocity: -4, burnout: -8 },
        loyaltyDelta: { specialization: 'devops', amount: 14 },
      },
      {
        id: 'add-rotation',
        label: 'Add a second on-call rotation.',
        effect: { burnout: -4, budget: -8000, morale: 4 },
      },
      {
        id: 'tough-it-out',
        label: 'Tough it out. We\'ll hire next quarter.',
        effect: { burnout: 12, morale: -8 },
        loyaltyDelta: { specialization: 'devops', amount: -18 },
      },
    ],
  },
  {
    id: 'roadmap-change',
    weight: 5,
    minSprint: 5,
    sender: 'product-manager',
    senderName: senderName('product-manager'),
    tone: 'corporate-cheerful',
    subject: () => 'Roadmap reshuffle — let\'s align!',
    body: () =>
      'Hi! Quick one — we\'re re-prioritizing the roadmap based on the executive offsite.\n\nAdding three "must-haves" and dropping one. Same sprint.\n\nWill follow up with the spec! 🙏',
    choices: () => [
      {
        id: 'absorb',
        label: 'Absorb the new scope. Same sprint.',
        effect: { burnout: 10, morale: -8, trust: 4, politics: 8 },
      },
      {
        id: 'push-back',
        label: 'Push back. Cut something to make room.',
        effect: { trust: -4, patience: -4, morale: 4, politics: -6 },
      },
      {
        id: 'next-sprint',
        label: 'Defer the new scope to next sprint.',
        effect: { trust: -2 },
      },
    ],
  },
];

export function pickEmailTemplate(sprint: number, rng: () => number): EmailTemplate {
  const eligible = EMAIL_TEMPLATES.filter(
    (t) => (t.minSprint ?? 0) <= sprint && (t.maxSprint ?? 999) >= sprint,
  );
  const total = eligible.reduce((s, t) => s + t.weight, 0);
  let r = rng() * total;
  for (const t of eligible) {
    r -= t.weight;
    if (r <= 0) return t;
  }
  return eligible[0];
}

export function emailFromTemplate(
  t: EmailTemplate,
  sprint: number,
  day: number,
): Email {
  return {
    id: `email-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    sender: t.sender,
    senderName: t.senderName,
    subject: t.subject(),
    body: t.body(),
    tone: t.tone,
    receivedSprint: sprint,
    receivedDay: day,
    read: false,
    resolved: false,
    choices: t.choices(),
    templateId: t.id,
  };
}
