import type { Developer, Metrics, Task } from '../types';

// Approximate forecast for an action — used to show "+X% bug chance" tooltips.
export function previewRush(task: Task): {
  bugChance: number;
  techDebtAdd: number;
  burnoutAdd: number;
} {
  const next = Math.min(0.95, task.bugProbability * 1.6);
  return {
    bugChance: Math.round(next * 100) - Math.round(task.bugProbability * 100),
    techDebtAdd: 4,
    burnoutAdd: 6,
  };
}

export function previewAssign(dev: Developer | undefined, task: Task): {
  daysToShip: number;
  bugChance: number;
} {
  if (!dev) return { daysToShip: 99, bugChance: Math.round(task.bugProbability * 100) };
  const moraleFactor = 0.5 + dev.morale / 200;
  const burnoutFactor = Math.max(0.4, 1 - dev.burnout / 150);
  const skillFactor = 0.5 + dev.skill / 200;
  const baseProgress = (dev.productivity / 100) * 18 * moraleFactor * burnoutFactor * skillFactor;
  const remaining = 100 - task.progress;
  const days = Math.max(1, Math.ceil(remaining / Math.max(1, baseProgress)));
  const bugMult = task.rushed ? 2 : 1;
  const skillMult = 1 - dev.skill / 200;
  const bugChance = Math.round(task.bugProbability * bugMult * skillMult * 100);
  return { daysToShip: days, bugChance };
}

export function chanceOfHittingCommit(
  committedPoints: number,
  team: Developer[],
  metrics: Metrics,
  daysPerSprint: number,
): number {
  const aliveTeam = team.filter((d) => d.status !== 'resigned');
  const teamThroughput = aliveTeam.reduce((s, d) => {
    const factor = (d.productivity / 100) * (0.5 + d.morale / 200) * (1 - d.burnout / 200);
    return s + factor;
  }, 0);
  const debtFriction = Math.max(0.5, 1 - metrics.techDebt / 200);
  const expected = teamThroughput * daysPerSprint * 1.6 * debtFriction;
  if (committedPoints <= 0) return 95;
  const ratio = expected / committedPoints;
  return Math.round(Math.max(5, Math.min(95, 50 + (ratio - 1) * 80)));
}
