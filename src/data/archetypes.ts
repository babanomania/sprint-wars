import type { Archetype, Developer } from '../types';

interface ArchetypeSpec {
  title: string;
  base: Omit<Developer, 'id' | 'name' | 'archetype' | 'title' | 'status' | 'notes' | 'loyalty' | 'salary'>;
  blurb: string;
  baseSalary: number;
}

export const ARCHETYPES: Record<Archetype, ArchetypeSpec> = {
  '10x': {
    title: 'Staff Engineer',
    blurb: 'Ships in their sleep. Refactors yours.',
    baseSalary: 22000,
    base: { skill: 92, morale: 70, burnout: 40, ego: 80, reliability: 75, productivity: 95, specialization: 'fullstack' },
  },
  'junior': {
    title: 'Junior Engineer',
    blurb: 'Confident. Wrong. Confidently wrong.',
    baseSalary: 8000,
    base: { skill: 35, morale: 85, burnout: 15, ego: 65, reliability: 50, productivity: 60, specialization: 'frontend' },
  },
  'burnout-senior': {
    title: 'Senior Engineer',
    blurb: 'Has seen things. Mostly outages.',
    baseSalary: 16000,
    base: { skill: 78, morale: 35, burnout: 78, ego: 55, reliability: 65, productivity: 50, specialization: 'backend' },
  },
  'difficult-architect': {
    title: 'Principal Architect',
    blurb: 'Will block your PR with a 3,000-word essay.',
    baseSalary: 24000,
    base: { skill: 88, morale: 60, burnout: 45, ego: 95, reliability: 60, productivity: 65, specialization: 'fullstack' },
  },
  'qa-perfectionist': {
    title: 'Senior QA Engineer',
    blurb: 'Found a bug in your standup notes.',
    baseSalary: 14000,
    base: { skill: 80, morale: 65, burnout: 50, ego: 60, reliability: 92, productivity: 70, specialization: 'qa' },
  },
  'devops-wizard': {
    title: 'Staff SRE',
    blurb: 'Speaks fluent YAML. Refuses to context-switch.',
    baseSalary: 20000,
    base: { skill: 87, morale: 55, burnout: 65, ego: 70, reliability: 88, productivity: 80, specialization: 'devops' },
  },
  'reliable-mid': {
    title: 'Software Engineer',
    blurb: 'Does the work. Says nothing. Hero.',
    baseSalary: 13000,
    base: { skill: 70, morale: 75, burnout: 30, ego: 30, reliability: 90, productivity: 78, specialization: 'fullstack' },
  },
  'product-eng': {
    title: 'Product Engineer',
    blurb: 'Will A/B test the meeting itself.',
    baseSalary: 14000,
    base: { skill: 68, morale: 72, burnout: 40, ego: 50, reliability: 70, productivity: 75, specialization: 'frontend' },
  },
  'rockstar-junior': {
    title: 'Junior Engineer (loud)',
    blurb: 'Has a podcast about the codebase.',
    baseSalary: 9000,
    base: { skill: 50, morale: 90, burnout: 25, ego: 90, reliability: 45, productivity: 65, specialization: 'fullstack' },
  },
  'remote-only-savant': {
    title: 'Senior Engineer (Lisbon)',
    blurb: 'Off camera. Always. Outputs gold.',
    baseSalary: 17000,
    base: { skill: 85, morale: 80, burnout: 35, ego: 25, reliability: 85, productivity: 88, specialization: 'backend' },
  },
  'security-curmudgeon': {
    title: 'Staff Security Engineer',
    blurb: 'Has been telling you about this for years.',
    baseSalary: 21000,
    base: { skill: 86, morale: 50, burnout: 60, ego: 70, reliability: 90, productivity: 65, specialization: 'security' },
  },
  'data-mage': {
    title: 'Data Engineer',
    blurb: 'Owns the warehouse. Will not document.',
    baseSalary: 18000,
    base: { skill: 82, morale: 60, burnout: 55, ego: 55, reliability: 75, productivity: 75, specialization: 'data' },
  },
};

export const STARTING_TEAM: Archetype[] = [
  '10x',
  'reliable-mid',
  'junior',
  'burnout-senior',
  'qa-perfectionist',
  'devops-wizard',
];

export const DRAFT_POOL: Archetype[] = [
  '10x',
  'reliable-mid',
  'junior',
  'burnout-senior',
  'qa-perfectionist',
  'devops-wizard',
  'difficult-architect',
  'product-eng',
  'rockstar-junior',
  'remote-only-savant',
  'security-curmudgeon',
  'data-mage',
];
