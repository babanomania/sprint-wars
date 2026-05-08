import type { ChatPersona, ChatPrompt } from '../types';

const personaName = (p: ChatPersona): string => {
  const m: Record<ChatPersona, string> = {
    ceo: 'Diane Sterling',
    cto: 'Marcus Vale',
    cfo: 'Hank Webber',
    'vp-eng': 'Jordan Liu',
    cmo: 'Tasha Ng',
    board: 'Board Observer',
  };
  return m[p];
};

export const CHAT_PROMPTS: Omit<ChatPrompt, 'id'>[] = [
  {
    persona: 'ceo',
    authorName: personaName('ceo'),
    question: 'Quick one — can AI solve this?',
    options: [
      { id: 'yes', label: 'Yes, totally. We\'re on it.', effect: { trust: 4, techDebt: 6, patience: 4, politics: 4 }, replyText: 'Absolutely. We\'re already prototyping.' },
      { id: 'sometimes', label: 'For some workflows. We\'re evaluating.', effect: { trust: 2, patience: 1 }, replyText: 'For specific workflows, yes. We\'re scoping it.' },
      { id: 'no', label: 'No. It\'s a deterministic problem.', effect: { trust: -3, patience: -4, politics: -4 }, replyText: 'Not really — this is deterministic. AI would add risk.' },
    ],
  },
  {
    persona: 'cfo',
    authorName: personaName('cfo'),
    question: 'Why are cloud costs going up so fast?',
    options: [
      { id: 'growth', label: 'It\'s revenue-correlated growth.', effect: { trust: 3, patience: 2 }, replyText: 'Costs scale with usage; revenue is up commensurately.' },
      { id: 'audit', label: 'We\'re auditing. Will save 20%.', effect: { trust: 5, budget: 20000, velocity: -2 }, replyText: 'Running an audit. Targeting 20% reduction next quarter.' },
      { id: 'unknown', label: 'Honestly? Not sure yet.', effect: { trust: -8, patience: -4 }, replyText: 'I don\'t have a clean answer yet. Investigating.' },
    ],
  },
  {
    persona: 'cto',
    authorName: personaName('cto'),
    question: 'Why are competitors shipping faster?',
    options: [
      { id: 'tech-debt', label: 'Tech debt slows us. Need an investment.', effect: { patience: -4, trust: 3, techDebt: -2, politics: -4 }, replyText: 'We\'re paying interest on legacy. Need a debt sprint.' },
      { id: 'people', label: 'We need more headcount.', effect: { budget: -5000, trust: -2 }, replyText: 'We\'re short 3 engineers in the platform space.' },
      { id: 'optics', label: 'They\'re shipping vapor. We\'re building real.', effect: { patience: -3, politics: 4 }, replyText: 'They\'re demoing prototypes. Ours actually scales.' },
    ],
  },
  {
    persona: 'vp-eng',
    authorName: personaName('vp-eng'),
    question: 'Can we skip testing on the launch?',
    options: [
      { id: 'never', label: 'Absolutely not.', effect: { stability: 6, patience: -3, politics: -4 }, replyText: 'We won\'t skip testing. The risk-adjusted ROI is negative.' },
      { id: 'partial', label: 'Smoke tests only.', effect: { stability: -10, techDebt: 6, politics: 4 }, replyText: 'We can run smoke tests and feature-flag the rollout.' },
    ],
  },
  {
    persona: 'cmo',
    authorName: personaName('cmo'),
    question: 'Marketing announced the AI launch for next Tuesday. Confirm you\'re ready?',
    options: [
      { id: 'confirm', label: 'Confirmed. Ready.', effect: { trust: 6, burnout: 10, patience: 4, politics: 6 }, replyText: 'Confirmed.' },
      { id: 'pushback', label: 'We need 2 more weeks.', effect: { trust: -8, morale: 4, patience: -8, politics: -6 }, replyText: 'We\'re going to miss Tuesday. Need 2 more weeks.' },
      { id: 'flag', label: 'Soft launch via flag for 5%.', effect: { stability: 4, trust: 2 }, replyText: 'We\'ll launch behind a flag at 5% Tuesday and ramp.' },
    ],
  },
  {
    persona: 'board',
    authorName: personaName('board'),
    question: 'Board is asking: when will the platform be "fully migrated off the monolith"?',
    options: [
      { id: 'q4', label: 'Q4 of next year. Aggressive but doable.', effect: { patience: 6, trust: 4, burnout: 12, politics: 4 }, replyText: 'Q4 next year — aggressive plan, but committed.' },
      { id: 'never', label: 'Never. We\'ll modernize incrementally.', effect: { patience: -10, trust: -6, politics: -4 }, replyText: 'We will not "rewrite" — we\'ll strangle incrementally.' },
      { id: 'depends', label: 'Depends on headcount and scope freezes.', effect: { trust: 2 }, replyText: 'Depends on scope discipline and adding 2 platform teams.' },
    ],
  },
];

export function makePrompt(idx?: number): ChatPrompt {
  const i = idx ?? Math.floor(Math.random() * CHAT_PROMPTS.length);
  const p = CHAT_PROMPTS[i % CHAT_PROMPTS.length];
  return { id: `chat-${Date.now()}-${i}`, ...p };
}
