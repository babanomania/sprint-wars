import type { Archetype, Candidate } from '../types';
import { ARCHETYPES } from './archetypes';
import { randomName } from './names';

const FLAW_POOL = [
  'Has a 47-page personal style guide. Will enforce.',
  'Refuses to use any tool with a UI.',
  'Will quit if asked to be on-call.',
  'Talks about their last job constantly.',
  'Sneaks rewrites into bug fix PRs.',
  'Hates standups. Will start a Slack debate about them on day 2.',
  'Has a podcast about microservices.',
  'Once tweeted critically about your largest customer.',
  'Considers TypeScript "training wheels."',
  'Will request a standing desk, a second monitor, and a corner.',
  'Believes test coverage is a vanity metric.',
  'Will ask about visa sponsorship in week 3.',
];

const RESUME_BLURBS = [
  'Ex–Big-Co. Listed "scale" 14 times on resume.',
  'Stanford MS. First job. Asking 2x market.',
  'Has shipped 3 startups. None still operating.',
  'Open-source maintainer. Famous on GitHub.',
  'YC alum. Pitch deck still in their email signature.',
  'Bootcamp grad. Cover letter is suspiciously good.',
  '15-year veteran of one specific framework.',
  'Self-described "platform whisperer."',
];

export function generateCandidatePool(rng: () => number, count = 5): Candidate[] {
  const pool: Archetype[] = [
    '10x',
    'reliable-mid',
    'junior',
    'difficult-architect',
    'rockstar-junior',
    'remote-only-savant',
    'security-curmudgeon',
    'data-mage',
    'product-eng',
    'devops-wizard',
    'qa-perfectionist',
  ];
  const out: Candidate[] = [];
  for (let i = 0; i < count; i++) {
    const arch = pool[Math.floor(rng() * pool.length)];
    const spec = ARCHETYPES[arch];
    const skill = Math.max(20, Math.min(99, Math.round(spec.base.skill + (rng() - 0.5) * 20)));
    const productivity = Math.max(20, Math.min(99, Math.round(spec.base.productivity + (rng() - 0.5) * 20)));
    const reliability = Math.max(20, Math.min(99, Math.round(spec.base.reliability + (rng() - 0.5) * 20)));
    const ego = Math.max(10, Math.min(99, Math.round(spec.base.ego + (rng() - 0.5) * 30)));
    const salary = Math.round(spec.baseSalary * (0.85 + rng() * 0.4));
    const asking = Math.round(salary * (0.5 + rng() * 1.5));
    out.push({
      id: `cand-${Math.floor(rng() * 1e6)}-${i}`,
      name: randomName(rng),
      archetype: arch,
      title: spec.title,
      skill,
      productivity,
      reliability,
      ego,
      specialization: spec.base.specialization,
      salary,
      asking,
      resumeBlurb: RESUME_BLURBS[Math.floor(rng() * RESUME_BLURBS.length)],
      hiddenFlaw: FLAW_POOL[Math.floor(rng() * FLAW_POOL.length)],
    });
  }
  return out;
}
