// Fake industry news ticker. Some lines are pure flavor; some can shift metrics
// (e.g. a competitor outage briefly buys patience).
import type { Metrics } from '../types';

export interface NewsTemplate {
  id: string;
  text: () => string;
  flavor: 'industry' | 'internal' | 'meme';
  weight: number;
  effect?: Partial<Metrics>;
  minSprint?: number;
}

export const NEWS_TEMPLATES: NewsTemplate[] = [
  { id: 'hn-pivot', weight: 6, flavor: 'industry', text: () => 'HN — "AI startup pivots to AI"' },
  { id: 'hn-launch', weight: 5, flavor: 'industry', text: () => 'TechCrunch — Competitor launches "AI-native" feature you shipped 14 months ago' },
  { id: 'hn-outage', weight: 4, flavor: 'industry', text: () => 'Competitor down for 6 hours — engineers post status page screenshots', effect: { patience: 4 } },
  { id: 'hn-hiring-freeze', weight: 4, flavor: 'industry', text: () => 'Industry hiring freeze deepens; recruiters now using LinkedIn ironically' },
  { id: 'meme-jira', weight: 3, flavor: 'meme', text: () => 'Atlassian announces "Jira AI" — search bar is now a chatbot' },
  { id: 'meme-typescript', weight: 3, flavor: 'meme', text: () => 'TypeScript 7 deprecates `any`. Senate hearings tomorrow.' },
  { id: 'internal-onboarding', weight: 4, flavor: 'internal', text: () => 'HR rolled out a 47-slide onboarding deck. Mandatory.' },
  { id: 'internal-allhands', weight: 5, flavor: 'internal', text: () => 'CEO scheduled an "urgent all-hands" for Friday at 4:30pm', effect: { patience: -2 } },
  { id: 'industry-ai-bubble', weight: 3, flavor: 'industry', text: () => 'Analyst warns "the AI bubble is showing cracks" for the 19th week running' },
  { id: 'industry-layoffs', weight: 3, flavor: 'industry', text: () => 'Big-Co lays off 8% of engineering; "right-sizing for AI"', effect: { morale: -2 } },
  { id: 'meme-postman', weight: 2, flavor: 'meme', text: () => 'Postman acquires three startups you forgot existed' },
  { id: 'industry-soc2', weight: 2, flavor: 'industry', text: () => 'SOC2 auditor caught using ChatGPT to write the report' },
  { id: 'internal-coffee', weight: 2, flavor: 'internal', text: () => 'Office coffee machine replaced with one that requires an app login' },
  { id: 'industry-rsu', weight: 3, flavor: 'industry', text: () => 'RSUs vested. Three engineers updated their LinkedIn headlines.' },
  { id: 'meme-tweet', weight: 3, flavor: 'meme', text: () => 'A VC tweet thread is making the rounds about "the death of microservices"' },
  { id: 'industry-stripe-outage', weight: 2, flavor: 'industry', text: () => 'Stripe API degraded — every billing engineer in the world is online' },
  { id: 'industry-acquisition', weight: 2, flavor: 'industry', minSprint: 4, text: () => 'Globex acquires a competitor; press release uses the phrase "synergize the AI native cloud"' },
  { id: 'internal-allhands-rec', weight: 3, flavor: 'internal', text: () => 'All-hands recording posted; "available for 7 days then deleted for compliance reasons"' },
  { id: 'meme-rss', weight: 2, flavor: 'meme', text: () => 'GitHub Copilot review left a comment that just says "lgtm 🤖"' },
];

export function pickNews(sprint: number, rng: () => number): NewsTemplate {
  const eligible = NEWS_TEMPLATES.filter((t) => (t.minSprint ?? 0) <= sprint);
  const total = eligible.reduce((s, t) => s + t.weight, 0);
  let r = rng() * total;
  for (const t of eligible) {
    r -= t.weight;
    if (r <= 0) return t;
  }
  return eligible[0];
}
