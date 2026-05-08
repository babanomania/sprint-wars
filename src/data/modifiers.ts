import type { RunModifier } from '../types';

export const RUN_MODIFIERS: RunModifier[] = [
  {
    id: 'classic',
    name: 'Classic Tour of Duty',
    blurb: 'A normal Tuesday in enterprise software. You start with a hand of average problems and a budget that mostly works.',
    metricDeltas: {},
    startingFlags: [],
  },
  {
    id: 'recently-acquired',
    name: 'Recently Acquired',
    blurb: 'Globex bought you 90 days ago. Half the team is checking LinkedIn during standup. Tech debt is whatever the new parent declares.',
    metricDeltas: { morale: -15, trust: -10, techDebt: 15, patience: -10 },
    startingFlags: ['acquired'],
  },
  {
    id: 'post-incident',
    name: 'Post-Mortem Era',
    blurb: 'You inherited the team after a SEV1. Stability is shaky, the board is watching, but morale is fired up to prove themselves.',
    metricDeltas: { stability: -20, trust: -20, morale: 10, security: 15 },
    startingFlags: ['post-incident'],
  },
  {
    id: 'fresh-funding',
    name: 'Series C Closed Last Friday',
    blurb: 'Money to spend. Hire button glows. Everyone wants to add a new initiative — by yesterday.',
    metricDeltas: { budget: 200000, patience: -15, techDebt: 5 },
    startingFlags: ['flush', 'aggressive-hiring'],
  },
  {
    id: 'pre-ipo',
    name: 'Pre-IPO Quiet Period',
    blurb: 'S-1 is filed. Bankers want zero surprises. Engineering has been told "no, not yet" to everything for 6 weeks.',
    metricDeltas: { trust: 5, patience: -25, morale: -10, techDebt: 10 },
    startingFlags: ['quiet-period'],
  },
];

export const RUN_GOAL_QUARTERS: Record<string, number> = {
  classic: 12,
  'recently-acquired': 12,
  'post-incident': 10,
  'fresh-funding': 14,
  'pre-ipo': 8,
};

export const RUN_GOAL_LABEL: Record<string, string> = {
  classic: 'Survive 12 sprints to your annual review.',
  'recently-acquired': 'Survive 12 sprints without losing the integration mandate.',
  'post-incident': 'Survive 10 sprints without another SEV1.',
  'fresh-funding': 'Ship 14 sprints toward Series D.',
  'pre-ipo': 'Survive 8 sprints to ring the bell.',
};
