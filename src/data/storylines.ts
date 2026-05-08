import type { ActiveStoryline, Email, EmailChoice, StorylineId, Task } from '../types';

// A storyline is a sequence of "steps" — each step can produce an email or a
// task, depending on prior choices. The store advances the step index when
// the player resolves the current step's email.

export interface StorylineStep {
  storylineId: StorylineId;
  step: number;
  // produced when this step activates
  email: Omit<Email, 'id' | 'receivedSprint' | 'receivedDay' | 'read' | 'resolved'>;
  // optional auto-task spawned at activation
  taskTemplate?: Partial<Task>;
}

const choice = (
  id: string,
  label: string,
  effect: EmailChoice['effect'],
  extras: Partial<EmailChoice> = {},
): EmailChoice => ({ id, label, effect, ...extras });

export const STORYLINES: Record<StorylineId, { title: string; totalSteps: number; steps: StorylineStep[] }> = {
  helios: {
    title: 'Project Helios — the AI rewrite',
    totalSteps: 4,
    steps: [
      {
        storylineId: 'helios',
        step: 1,
        email: {
          sender: 'ceo',
          senderName: 'Diane Sterling (CEO)',
          subject: 'Project Helios — internal name. Don\'t leak it.',
          body:
            'Top secret for now: I want us to rebuild the recommendation flow on a new AI core. Code-name Helios.\n\nThree-sprint scope. We tell the board we\'re "leading with AI." This is your headline initiative.\n\n— D',
          tone: 'urgent',
          choices: [
            choice('commit-3', 'Commit. 3 sprints. We make Helios our headline.', { trust: 8, burnout: 6, techDebt: 6, politics: 8 }, {
              message: 'Helios is greenlit. The codebase is now haunted.',
            }),
            choice('counter-6', 'Counter: 6 sprints with a real plan.', { trust: -4, patience: -8, morale: 6, politics: -10 }),
            choice('decline', 'Decline. We don\'t need this. Sell what we have.', { trust: -12, patience: -16, morale: 10, politics: -16 }),
          ],
        },
      },
      {
        storylineId: 'helios',
        step: 2,
        email: {
          sender: 'developer',
          senderName: 'Tomas Park',
          subject: 'Helios POC works! …in a way.',
          body:
            'POC running. It hallucinates 8% of recommendations. Demo-able if you don\'t click on the third one.\n\nDo we ship to 5%, gate it, or keep iterating?',
          tone: 'neutral',
          choices: [
            choice('ship-5', 'Ship to 5% under a feature flag.', { trust: 4, security: 8, stability: -4, politics: 6 }, {
              spawnIncident: true,
              message: 'We are now A/B-testing hallucinations against reality.',
            }),
            choice('iterate', 'Hold. Two more weeks.', { trust: -6, morale: 4, patience: -6, techDebt: -2 }),
            choice('kill', 'Kill it. Frame as "scope discipline."', { trust: -10, patience: -10, morale: 8, politics: -12 }),
          ],
        },
      },
      {
        storylineId: 'helios',
        step: 3,
        email: {
          sender: 'product-manager',
          senderName: 'Tasha Ng (CMO)',
          subject: 'Press wants a Helios case study by Friday',
          body:
            'Recode reached out. They want a case study on our AI launch by Friday. I told them we\'d talk.\n\nI need talking points and a metric we can be proud of.',
          tone: 'corporate-cheerful',
          choices: [
            choice('be-honest', 'Honest numbers. Hallucination rate disclosed.', { trust: 8, patience: -4, security: -4, politics: -4 }),
            choice('massage', 'Massage the numbers. They\'ll never check.', { trust: -8, security: 12, patience: 6, politics: 10 }),
            choice('decline-press', 'Decline the interview.', { patience: -8, trust: 2 }),
          ],
        },
      },
      {
        storylineId: 'helios',
        step: 4,
        email: {
          sender: 'cto',
          senderName: 'Marcus Vale (CTO)',
          subject: 'Helios — keep, fold, or kill?',
          body:
            'Adoption is stuck at 11%. Costs are 3× the deck. Tell me how you want to play this in front of the board.',
          tone: 'neutral',
          choices: [
            choice('double-down', 'Double down. Ship v2.', { burnout: 12, techDebt: 12, trust: 10, patience: 6, politics: 12 }),
            choice('fold-in', 'Fold the wins into the existing platform; sunset Helios.', { trust: -2, morale: 8, techDebt: -6 }),
            choice('kill-public', 'Public kill switch with dignity.', { trust: -10, patience: -10, morale: 12 }),
          ],
        },
      },
    ],
  },

  merger: {
    title: 'Globex Merger',
    totalSteps: 3,
    steps: [
      {
        storylineId: 'merger',
        step: 1,
        email: {
          sender: 'cto',
          senderName: 'Marcus Vale (CTO)',
          subject: '[CONFIDENTIAL] Globex acquisition talks — keep airtight',
          body:
            'You did not get this email. Globex is serious. They want a "platform compatibility report" in two sprints.\n\nThis will be… disruptive. Keep your team focused without telling them.',
          tone: 'urgent',
          choices: [
            choice('hide', 'Keep it tight. Don\'t spook the team.', { morale: 4, trust: 4, burnout: 6 }),
            choice('warn-leads', 'Quietly brief tech leads.', { morale: -3, trust: -2 }),
            choice('open-letter', 'Tell the team it\'s coming. Damage control.', { trust: -10, morale: -10, patience: -8, politics: -8 }),
          ],
        },
      },
      {
        storylineId: 'merger',
        step: 2,
        email: {
          sender: 'legal',
          senderName: 'Compliance <legal@corp>',
          subject: 'Globex due diligence: 312-question security questionnaire',
          body:
            'Globex sent a security DD questionnaire. 312 questions. They need answers in 10 days, including "audit logs of every admin action since 2021."',
          tone: 'corporate-cheerful',
          choices: [
            choice('all-hands', 'Pause feature work. All-hands DD.', { velocity: -6, burnout: 8, trust: 8, security: -10 }),
            choice('best-effort', 'Answer what we can. Footnote the rest.', { trust: -4, security: 6, patience: -3 }),
            choice('contractor', 'Hire a compliance contractor.', { budget: -45000, trust: 4 }),
          ],
        },
      },
      {
        storylineId: 'merger',
        step: 3,
        email: {
          sender: 'ceo',
          senderName: 'Diane Sterling (CEO)',
          subject: 'Deal closed. Now we integrate.',
          body:
            'It\'s done. Welcome to Globex. Their CTO wants our team to migrate to their dev platform "by quarter-end." No, that is not realistic.\n\nGet me a counter-proposal by Monday.',
          tone: 'neutral',
          choices: [
            choice('counter-real', 'Counter with a 4-quarter plan, milestones.', { trust: 8, patience: -4, burnout: 6 }),
            choice('refuse', 'Refuse outright. We are the modern stack.', { trust: -8, patience: -10, politics: -8, morale: 8 }),
            choice('agree-quarter', 'Agree to quarter-end. We\'ll figure it out.', { burnout: 16, techDebt: 18, morale: -10, trust: 6 }),
          ],
        },
      },
    ],
  },

  compliance: {
    title: 'Regulator on the Way',
    totalSteps: 3,
    steps: [
      {
        storylineId: 'compliance',
        step: 1,
        email: {
          sender: 'legal',
          senderName: 'Compliance <legal@corp>',
          subject: 'Regulator inquiry — informal for now',
          body:
            'A state regulator opened an "informal inquiry" into our data retention. Informal means "without subpoena yet."\n\nWe need an inventory of every place we store user PII by Sprint+2.',
          tone: 'corporate-cheerful',
          choices: [
            choice('inventory', 'Run the inventory this sprint.', { velocity: -4, security: -8, trust: 4 }),
            choice('delay', 'Stall politely. They\'ll lose interest.', { security: 10, trust: -6, patience: -4 }),
          ],
        },
      },
      {
        storylineId: 'compliance',
        step: 2,
        email: {
          sender: 'security',
          senderName: 'SecOps <noc@security>',
          subject: 'Inventory complete. The PII is everywhere.',
          body:
            'You\'re going to want to sit down. We have unencrypted PII in: analytics, the data lake, three abandoned services, and a Google Sheet someone shared in 2022.',
          tone: 'panic',
          choices: [
            choice('encrypt-all', 'Encrypt everything. Dedicated sprint.', { velocity: -8, security: -20, trust: 6, techDebt: -6 }),
            choice('hot-spots', 'Encrypt the hot spots. File the rest as "known."', { security: -8, techDebt: 4 }),
            choice('delete', 'Delete what we don\'t need.', { security: -16, trust: 4, techDebt: -8, morale: 4 }),
          ],
        },
      },
      {
        storylineId: 'compliance',
        step: 3,
        email: {
          sender: 'legal',
          senderName: 'Compliance <legal@corp>',
          subject: 'Regulator wants a 30-min briefing',
          body:
            'They want me, Marcus, and you on the call. Tone is "we just want to learn about your stack." Translation: prepare.',
          tone: 'corporate-cheerful',
          choices: [
            choice('rehearse', 'Rehearse the briefing with the team.', { velocity: -2, trust: 10, patience: 4 }),
            choice('wing-it', 'Wing it. We have nothing to hide.', { trust: -10, patience: -10 }),
            choice('outside-counsel', 'Bring outside counsel.', { budget: -25000, trust: 6 }),
          ],
        },
      },
    ],
  },

  'platform-rift': {
    title: 'Monolith vs. Platform — the rift',
    totalSteps: 3,
    steps: [
      {
        storylineId: 'platform-rift',
        step: 1,
        email: {
          sender: 'developer',
          senderName: 'Alex Reyes',
          subject: 'We need to decompose the monolith',
          body:
            'Five of us drafted a decomposition plan. It\'s aggressive (six new services in 8 sprints) but the alternative is dying inside the monolith.\n\nWill you sponsor it?',
          tone: 'neutral',
          choices: [
            choice('sponsor', 'Sponsor the decomposition.', { morale: 12, techDebt: -4, velocity: -4, politics: -12 }, { spawnTask: { title: 'Kick off Monolith decomposition (Phase 1)', type: 'tech-debt', storyPoints: 13, priority: 'high', source: 'storyline' } }),
            choice('strangle', 'Strangler fig only — incremental.', { morale: 4, techDebt: -2 }),
            choice('decline', 'Decline. We don\'t have the runway.', { morale: -16, techDebt: 8, politics: 8 }),
          ],
        },
      },
      {
        storylineId: 'platform-rift',
        step: 2,
        email: {
          sender: 'developer',
          senderName: 'Diego Marchetti',
          subject: 'Re: decomposition — concerns from senior eng',
          body:
            'I\'ve been here longer than the monolith. The decomposition plan is too aggressive. We\'ll create six fragile services instead of one fragile system.\n\nI\'d like to discuss publicly.',
          tone: 'passive-aggressive',
          choices: [
            choice('public-debate', 'Hold a public design review.', { velocity: -3, morale: 6, trust: 4 }),
            choice('private', 'Have it privately. Don\'t fork the team.', { morale: -4, trust: 2 }),
            choice('overrule', 'Overrule. We\'re going forward.', { morale: -10, politics: -6 }),
          ],
        },
      },
      {
        storylineId: 'platform-rift',
        step: 3,
        email: {
          sender: 'vp-eng',
          senderName: 'Jordan Liu (VP Eng)',
          subject: 'The team has factions now',
          body:
            'The decomposition advocates and the monolith defenders are no longer talking in the same Slack threads.\n\nNeed your call: pick a side, or merge them?',
          tone: 'neutral',
          choices: [
            choice('pick-side', 'Pick the platform side. Make it official.', { morale: -6, techDebt: -8, politics: -10 }),
            choice('merge', 'Merge factions. Joint design.', { velocity: -4, morale: 8, trust: 4, techDebt: -2 }),
            choice('do-nothing', 'Do nothing. They\'ll work it out.', { morale: -12, techDebt: 6 }),
          ],
        },
      },
    ],
  },

  'series-d': {
    title: 'Series D Fundraise',
    totalSteps: 2,
    steps: [
      {
        storylineId: 'series-d',
        step: 1,
        email: {
          sender: 'cfo',
          senderName: 'Hank Webber (CFO)',
          subject: 'Series D — diligence starts Monday',
          body:
            'We\'re raising. Lead investor is asking for a "product velocity narrative" + a credible 3-year tech roadmap.\n\nNeed your draft by EOW.',
          tone: 'urgent',
          choices: [
            choice('honest-roadmap', 'Honest, conservative roadmap.', { trust: 8, patience: -4 }),
            choice('aspirational', 'Aspirational roadmap. Hand-wave the gaps.', { trust: -4, patience: 8, techDebt: 4 }),
          ],
        },
      },
      {
        storylineId: 'series-d',
        step: 2,
        email: {
          sender: 'ceo',
          senderName: 'Diane Sterling (CEO)',
          subject: 'Round closed. We have $80M in runway.',
          body:
            'Done. Here\'s the catch: investors want us to ship 2 of the 3 marquee features in the deck within 4 sprints.',
          tone: 'corporate-cheerful',
          choices: [
            choice('all-in', 'Commit. Push everything else.', { burnout: 12, techDebt: 10, trust: 6, velocity: 4 }),
            choice('renegotiate', 'Renegotiate. Realistic targets.', { trust: -4, patience: -4, morale: 6 }),
          ],
        },
      },
    ],
  },
};

// Pick which storyline kicks off based on run modifier + sprint.
export function pickStorylineForStart(modifierId: string): StorylineId | null {
  if (modifierId === 'recently-acquired') return 'merger';
  if (modifierId === 'fresh-funding') return 'series-d';
  if (modifierId === 'pre-ipo') return 'compliance';
  if (modifierId === 'post-incident') return 'platform-rift';
  return 'helios';
}

// Build the active storyline state object.
export function activateStoryline(id: StorylineId, sprint: number): ActiveStoryline {
  const sl = STORYLINES[id];
  return {
    id,
    title: sl.title,
    step: 1,
    totalSteps: sl.totalSteps,
    startedSprint: sprint,
    state: {},
  };
}

// Get the email for the current step of an active storyline.
export function emailForStep(id: StorylineId, step: number) {
  const sl = STORYLINES[id];
  return sl.steps.find((s) => s.step === step)?.email;
}
