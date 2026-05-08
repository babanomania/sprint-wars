import clsx from 'clsx';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../store/gameStore';
import type { ArchProject, SystemNode, TechDebtItem } from '../types';
import Icon from '../components/ui/Icon';

const KIND_COLOR: Record<SystemNode['kind'], string> = {
  gateway: '#4f8df7',
  service: '#3ddc97',
  datastore: '#a78bfa',
  queue: '#ffc857',
  legacy: '#ff5d6c',
  ai: '#a78bfa',
  auth: '#4f8df7',
  cdn: '#3ddc97',
};

interface Pos { x: number; y: number }

function layout(systems: SystemNode[]): Map<string, Pos> {
  const depth = new Map<string, number>();
  const compute = (id: string, seen: Set<string>): number => {
    if (seen.has(id)) return 0;
    seen.add(id);
    const sys = systems.find((s) => s.id === id);
    if (!sys || sys.dependencies.length === 0) {
      depth.set(id, 0);
      return 0;
    }
    const d = 1 + Math.max(...sys.dependencies.map((d) => compute(d, seen)));
    depth.set(id, d);
    return d;
  };
  systems.forEach((s) => compute(s.id, new Set()));

  const buckets = new Map<number, SystemNode[]>();
  systems.forEach((s) => {
    const d = depth.get(s.id) ?? 0;
    if (!buckets.has(d)) buckets.set(d, []);
    buckets.get(d)!.push(s);
  });

  const positions = new Map<string, Pos>();
  const layerW = 200;
  Array.from(buckets.entries())
    .sort((a, b) => a[0] - b[0])
    .forEach(([d, group]) => {
      const x = 80 + d * layerW;
      group.forEach((s, i) => {
        const y = 70 + i * 90 + (d % 2) * 30;
        positions.set(s.id, { x, y });
      });
    });
  return positions;
}

export default function Architecture() {
  const {
    systems,
    selectedSystemId,
    selectSystem,
    incidents,
    archProjects,
    techDebtItems,
    startDecomposition,
    applyDecompositionPoints,
    payDownTechDebt,
  } = useGame();
  const positions = useMemo(() => layout(systems), [systems]);
  const selected = systems.find((s) => s.id === selectedSystemId) ?? systems[0];
  const incidentSystems = new Set(
    incidents
      .filter((i) => i.status !== 'resolved' && i.status !== 'rolled-back')
      .map((i) => i.systemId),
  );
  const projectFor = (sysId: string) => archProjects.find((p) => p.sourceSystemId === sysId);
  const debtFor = (sysId: string) => techDebtItems.filter((d) => d.systemId === sysId);

  const w = 1100;
  const h = 700;

  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-3 md:mb-4">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-ink-muted">
            SYSTEM TOPOLOGY
          </div>
          <h1 className="text-xl md:text-2xl font-semibold">Architecture</h1>
        </div>
        <div className="hidden sm:flex flex-wrap gap-3 text-[11px] text-ink-muted">
          <span>● Gateway</span>
          <span className="text-accent-green">● Service</span>
          <span className="text-accent-purple">● Datastore</span>
          <span className="text-accent-yellow">● Queue</span>
          <span className="text-accent-red">● Legacy</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 min-h-0">
        <div className="md:col-span-8 panel overflow-auto relative h-[40vh] md:h-auto">
          <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" style={{ minWidth: '700px' }}>
            {systems.map((s) =>
              s.dependencies.map((dep) => {
                const a = positions.get(dep);
                const b = positions.get(s.id);
                if (!a || !b) return null;
                return (
                  <line
                    key={`${dep}-${s.id}`}
                    x1={a.x + 60}
                    y1={a.y + 24}
                    x2={b.x}
                    y2={b.y + 24}
                    stroke="#252b38"
                    strokeWidth="1.5"
                  />
                );
              }),
            )}
            {systems.map((s) => {
              const p = positions.get(s.id);
              if (!p) return null;
              const broken = incidentSystems.has(s.id);
              const active = selected?.id === s.id;
              const proj = projectFor(s.id);
              return (
                <g
                  key={s.id}
                  transform={`translate(${p.x}, ${p.y})`}
                  onClick={() => selectSystem(s.id)}
                  className="cursor-pointer"
                >
                  <rect
                    width="160"
                    height="48"
                    rx="6"
                    fill="#161a23"
                    stroke={active ? '#4f8df7' : broken ? '#ff5d6c' : '#252b38'}
                    strokeWidth={active ? '2' : '1.5'}
                  />
                  <circle cx="14" cy="24" r="4" fill={KIND_COLOR[s.kind]} />
                  <text x="26" y="22" fill="#e5e9f0" fontSize="12" fontWeight="500">
                    {s.name}
                  </text>
                  <text x="26" y="38" fill="#6b7280" fontSize="10">
                    h {Math.round(s.health)} · debt {Math.round(s.techDebt)}
                  </text>
                  <rect x="26" y="42" width="120" height="3" rx="1.5" fill="#0b0d12" />
                  <rect
                    x="26"
                    y="42"
                    width={(120 * s.health) / 100}
                    height="3"
                    rx="1.5"
                    fill={s.health > 70 ? '#3ddc97' : s.health > 40 ? '#ffc857' : '#ff5d6c'}
                  />
                  {broken && (
                    <circle cx="150" cy="14" r="4" fill="#ff5d6c">
                      <animate attributeName="opacity" from="1" to="0.2" dur="1s" repeatCount="indefinite" />
                    </circle>
                  )}
                  {proj && (
                    <g transform="translate(0, 54)">
                      <rect width="160" height="14" rx="3" fill="#161a23" stroke="#a78bfa" strokeWidth="1" />
                      <rect
                        width={(160 * proj.pointsApplied) / proj.totalPoints}
                        height="14"
                        rx="3"
                        fill="#a78bfa"
                        opacity="0.6"
                      />
                      <text x="80" y="11" textAnchor="middle" fontSize="9" fill="#e5e9f0">
                        decomposing {proj.pointsApplied}/{proj.totalPoints}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="md:col-span-4 panel p-4 overflow-y-auto">
          {selected ? (
            <SystemDetail
              sys={selected}
              project={projectFor(selected.id)}
              debtItems={debtFor(selected.id)}
              onDecompose={() => startDecomposition(selected.id)}
              onApplyPoints={(pid, p) => applyDecompositionPoints(pid, p)}
              onPayDebt={(id) => payDownTechDebt(id)}
            />
          ) : (
            <div className="text-sm text-ink-muted">Select a system.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function SystemDetail({
  sys,
  project,
  debtItems,
  onDecompose,
  onApplyPoints,
  onPayDebt,
}: {
  sys: SystemNode;
  project: ArchProject | undefined;
  debtItems: TechDebtItem[];
  onDecompose: () => void;
  onApplyPoints: (pid: string, p: number) => void;
  onPayDebt: (id: string) => void;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-ink-muted">
        {sys.kind}
        {sys.critical && <span className="ml-2 text-accent-red">CRITICAL</span>}
      </div>
      <div className="text-base font-semibold mb-3">{sys.name}</div>

      <div className="space-y-3 mb-5">
        <Stat label="Health" value={sys.health} good={sys.health > 60} />
        <Stat label="Tech debt" value={sys.techDebt} good={sys.techDebt < 40} />
        <Stat label="Load" value={sys.load} good={sys.load < 70} />
      </div>

      <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-1">Depends on</div>
      <div className="text-xs text-ink-primary mb-5">
        {sys.dependencies.length ? sys.dependencies.join(', ') : '— none —'}
      </div>

      {/* Architecture editing */}
      {project ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="panel p-3 mb-5 border-l-2 border-accent-purple"
        >
          <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-1">
            In-flight: Decomposition
          </div>
          <div className="text-sm font-medium mb-1">{project.title}</div>
          <div className="meter mb-2">
            <div
              className="bg-accent-purple"
              style={{ width: `${(project.pointsApplied / project.totalPoints) * 100}%` }}
            />
          </div>
          <div className="text-[11px] text-ink-muted mb-2">
            {project.pointsApplied}/{project.totalPoints} pts applied
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onApplyPoints(project.id, 5)}
              className="btn-ghost text-xs"
            >
              + 5 pts
            </button>
            <button
              onClick={() => onApplyPoints(project.id, 10)}
              className="btn-ghost text-xs"
            >
              + 10 pts
            </button>
          </div>
          <div className="text-[10px] text-ink-muted mt-2">
            Targets: {project.targetSystems.join(', ')}
          </div>
        </motion.div>
      ) : (
        sys.kind === 'legacy' || sys.techDebt > 60 ? (
          <button
            onClick={onDecompose}
            className="btn-ghost w-full mb-5 border-accent-purple text-accent-purple flex items-center justify-center gap-1.5"
          >
            <Icon name="network" size={13} /> Propose decomposition
          </button>
        ) : null
      )}

      {/* Tech debt items */}
      {debtItems.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-2">
            Named tech debt items
          </div>
          <div className="space-y-1.5">
            {debtItems.map((d) => (
              <div key={d.id} className="bg-bg-subtle rounded p-2.5 text-xs">
                <div className="font-medium mb-0.5">{d.title}</div>
                <div className="text-[11px] text-ink-muted italic mb-2">{d.origin}</div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="pill bg-accent-red/15 text-accent-red">−{d.weight} debt</span>
                  <span className="pill bg-bg-base border border-bg-border text-ink-secondary">
                    {d.cost} pts to fix
                  </span>
                </div>
                <button onClick={() => onPayDebt(d.id)} className="btn-ghost w-full text-[11px]">
                  Pay down ({d.cost} pts of velocity)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, good }: { label: string; value: number; good: boolean }) {
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="text-ink-muted">{label}</span>
        <span className={clsx('font-medium', good ? 'text-accent-green' : 'text-accent-yellow')}>
          {Math.round(value)}
        </span>
      </div>
      <div className="meter mt-1">
        <div className={good ? 'bg-accent-green' : 'bg-accent-yellow'} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
