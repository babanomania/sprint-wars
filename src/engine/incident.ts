import type { Incident, IncidentSeverity, SystemNode } from '../types';

export function createIncident(
  systems: SystemNode[],
  sprint: number,
  day: number,
  rng: () => number,
  forcedSeverity?: IncidentSeverity,
): Incident {
  const candidates = systems.filter((s) => s.health < 90 || s.critical);
  const pool = candidates.length ? candidates : systems;
  const sys = pool[Math.floor(rng() * pool.length)];

  const sevRoll = rng();
  let severity: IncidentSeverity = 'SEV3';
  if (forcedSeverity) severity = forcedSeverity;
  else if (sevRoll < 0.08) severity = 'SEV1';
  else if (sevRoll < 0.3) severity = 'SEV2';
  else if (sevRoll < 0.7) severity = 'SEV3';
  else severity = 'SEV4';

  const titles: Record<IncidentSeverity, string[]> = {
    SEV1: [
      `${sys.name} hard down — global outage`,
      `${sys.name} returning 5xx for all requests`,
      `Total ${sys.name} failure — customer impact`,
    ],
    SEV2: [
      `${sys.name} elevated error rate`,
      `${sys.name} latency P99 > 12s`,
      `${sys.name} intermittent 5xx`,
    ],
    SEV3: [
      `${sys.name} degraded performance`,
      `${sys.name} memory pressure alerts`,
    ],
    SEV4: [`${sys.name} non-critical alarms firing`],
  };
  const t = titles[severity];
  const title = t[Math.floor(rng() * t.length)];

  return {
    id: `INC-${Date.now().toString().slice(-5)}-${Math.floor(rng() * 999)}`,
    title,
    description: `Severity ${severity} on ${sys.name}. Investigating.`,
    severity,
    status: 'open',
    systemId: sys.id,
    startedSprint: sprint,
    startedDay: day,
    ageMinutes: 0,
    pageOps: severity === 'SEV1' ? 4 : severity === 'SEV2' ? 2 : 1,
    rcaPosted: false,
    cost: severity === 'SEV1' ? 25000 : severity === 'SEV2' ? 8000 : 2500,
  };
}

// When a system fails it can drag dependents down with it.
export function propagateFailure(
  systems: SystemNode[],
  failedId: string,
  rng: () => number,
): SystemNode[] {
  const map = new Map(systems.map((s) => [s.id, s]));
  const failed = map.get(failedId);
  if (!failed) return systems;
  return systems.map((s) => {
    if (s.dependencies.includes(failedId) && rng() < 0.5) {
      return { ...s, health: Math.max(0, s.health - 15) };
    }
    return s;
  });
}
