// ============================================================================
// Sprint simulation
// ============================================================================
import type {
  Developer,
  Incident,
  Metrics,
  SystemNode,
  Task,
} from '../types';
import { clamp } from './rng';

export interface SimInput {
  metrics: Metrics;
  team: Developer[];
  tasks: Task[];
  systems: SystemNode[];
  incidents: Incident[];
  sprint: number;
  rng: () => number;
}

export interface SimOutput {
  metrics: Metrics;
  team: Developer[];
  tasks: Task[];
  systems: SystemNode[];
  incidents: Incident[];
  newBugs: Task[];
  notifications: string[];
  shippedTitles: string[];
}

export function tickDay(input: SimInput): SimOutput {
  const { rng, sprint } = input;
  const notifications: string[] = [];
  const newBugs: Task[] = [];
  const shippedTitles: string[] = [];

  const team = input.team.map((d) => ({ ...d }));
  const tasks = input.tasks.map((t) => ({ ...t }));
  const incidents = input.incidents.map((i) => ({ ...i }));

  for (const dev of team) {
    if (dev.status === 'resigned' || dev.status === 'vacation') continue;
    if (!dev.taskId) continue;
    const task = tasks.find((t) => t.id === dev.taskId);
    if (!task || task.status === 'done' || task.status === 'blocked') {
      dev.status = 'available';
      dev.taskId = undefined;
      continue;
    }

    const moraleFactor = 0.5 + dev.morale / 200;
    const burnoutFactor = clamp(1 - dev.burnout / 150, 0.4, 1);
    const skillFactor = 0.5 + dev.skill / 200;
    const debtFriction = clamp(1 - input.metrics.techDebt / 250, 0.5, 1);
    const baseProgress = (dev.productivity / 100) * 18 * moraleFactor * burnoutFactor * skillFactor * debtFriction;
    const noise = 0.7 + rng() * 0.6;
    let delta = baseProgress * noise;

    // Hidden complexity bites — and reveals itself when it does
    if (rng() < task.hiddenComplexity * 0.25) {
      delta *= 0.4;
      if (!task.complexityRevealed) {
        task.complexityRevealed = true;
        notifications.push(
          `${dev.name}: hidden complexity discovered in ${task.id} (${Math.round(task.hiddenComplexity * 100)}%)`,
        );
      }
    }

    // Adjust progress by truePoints — completion when accumulated work matches.
    const pointsPerProgress = task.truePoints / Math.max(1, task.storyPoints);
    task.progress = clamp(task.progress + delta / pointsPerProgress, 0, 100);
    if (task.progress >= 100) {
      const rushedMult = task.rushed ? 2.0 : 1.0;
      const skillMult = 1 - dev.skill / 200;
      const bugChance = task.bugProbability * rushedMult * skillMult;
      if (rng() < bugChance) {
        const bug: Task = {
          ...task,
          id: `BUG-${Math.floor(rng() * 1e6)}`,
          title: `Bug: regression in "${task.title}"`,
          type: 'bug',
          status: 'backlog',
          progress: 0,
          rushed: false,
          storyPoints: Math.max(1, Math.round(task.storyPoints / 2)),
          truePoints: Math.max(1, Math.round(task.storyPoints / 2)),
          priority: task.rushed ? 'high' : 'medium',
          createdSprint: sprint,
          assigneeId: undefined,
          source: 'product',
          hiddenComplexity: rng() * 0.6,
          complexityRevealed: false,
        };
        newBugs.push(bug);
        notifications.push(`Bug created: ${bug.title}`);
      }

      task.status = 'qa';
      task.progress = 100;
      task.assigneeId = undefined;
      dev.status = 'available';
      dev.taskId = undefined;
      shippedTitles.push(task.title);

      if (task.rushed) {
        dev.burnout = clamp(dev.burnout + 6);
        dev.morale = clamp(dev.morale - 3);
      }
    }
  }

  // QA throughput
  for (const t of tasks) {
    if (t.status === 'qa') {
      const qaDev = team.find((d) => d.specialization === 'qa' && d.status !== 'resigned');
      const qaSpeed = qaDev ? 0.45 + qaDev.reliability / 300 : 0.25;
      if (rng() < qaSpeed) {
        t.status = 'done';
      }
    }
  }

  // Incidents
  for (const inc of incidents) {
    if (inc.status === 'resolved' || inc.status === 'rolled-back') continue;
    inc.ageMinutes += 60 * 8;
    if (inc.status === 'mitigating') {
      if (rng() < 0.35) {
        inc.status = 'resolved';
        inc.resolution = 'resolved';
        notifications.push(`Incident ${inc.id} resolved.`);
      }
    } else if (inc.status === 'open') {
      inc.cost += 1500;
    }
  }

  // System drift
  const systems = input.systems.map((s) => ({ ...s }));
  for (const sys of systems) {
    if (rng() < sys.techDebt / 500) {
      sys.health = clamp(sys.health - 1, 0, 100);
    }
    if (sys.health < 100 && rng() < 0.05) sys.health = clamp(sys.health + 1, 0, 100);
  }

  // Metrics drift
  const metrics = { ...input.metrics };
  const openIncidents = incidents.filter((i) => i.status === 'open' || i.status === 'mitigating').length;
  metrics.stability = clamp(metrics.stability - openIncidents * 0.6);
  const rushed = tasks.filter((t) => t.rushed && t.status !== 'done').length;
  if (rushed > 0) {
    for (const dev of team) {
      if (dev.status === 'on-task') dev.burnout = clamp(dev.burnout + 0.4);
    }
  }
  const aliveTeam = team.filter((d) => d.status !== 'resigned');
  if (aliveTeam.length > 0) {
    const avgM = aliveTeam.reduce((s, d) => s + d.morale, 0) / aliveTeam.length;
    metrics.morale = clamp(metrics.morale * 0.7 + avgM * 0.3);
    const avgB = aliveTeam.reduce((s, d) => s + d.burnout, 0) / aliveTeam.length;
    metrics.burnout = clamp(metrics.burnout * 0.7 + avgB * 0.3);
  }
  metrics.techDebt = clamp(metrics.techDebt + rushed * 0.3);
  metrics.budget = Math.max(0, metrics.budget - 1500);

  return { metrics, team, tasks, systems, incidents, newBugs, notifications, shippedTitles };
}

export function endOfSprint(input: SimInput): {
  metrics: Metrics;
  team: Developer[];
  tasks: Task[];
  systems: SystemNode[];
  notifications: string[];
} {
  const notifications: string[] = [];
  const tasks = input.tasks.map((t) => ({ ...t }));
  const team = input.team.map((d) => ({ ...d }));
  const systems = input.systems.map((s) => ({ ...s }));
  const metrics = { ...input.metrics };

  const completed = tasks.filter((t) => t.status === 'done' && t.createdSprint <= input.sprint);
  const velocity = completed.reduce((s, t) => s + t.storyPoints, 0);
  metrics.velocity = velocity;

  if (velocity >= 14) metrics.trust = clamp(metrics.trust + 4);
  else if (velocity >= 8) metrics.trust = clamp(metrics.trust + 1);
  else metrics.trust = clamp(metrics.trust - 6);

  if (metrics.stability < 50 && velocity < 8) {
    metrics.patience = clamp(metrics.patience - 8);
  } else if (velocity >= 14) {
    metrics.patience = clamp(metrics.patience + 3);
  }

  const rushedDone = completed.filter((t) => t.rushed).length;
  metrics.techDebt = clamp(metrics.techDebt + rushedDone * 1.5);

  if (metrics.morale > 70 && rushedDone === 0) {
    for (const dev of team) {
      if (dev.status !== 'resigned') dev.burnout = clamp(dev.burnout - 4);
    }
  }

  // Salary burn
  const monthlyBurn = team.filter((d) => d.status !== 'resigned').reduce((s, d) => s + d.salary, 0);
  metrics.budget = Math.max(0, metrics.budget - Math.round(monthlyBurn / 4));

  notifications.push(`Sprint closed. Velocity: ${velocity} pts. Salary burn: $${Math.round(monthlyBurn / 4).toLocaleString()}.`);
  return { metrics, team, tasks, systems, notifications };
}
