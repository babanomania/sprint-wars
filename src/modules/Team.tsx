import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useGame } from '../store/gameStore';
import type { Developer } from '../types';
import MetricBar from '../components/ui/MetricBar';
import { ARCHETYPES } from '../data/archetypes';
import { useIsMobile } from '../hooks/useMediaQuery';

const STATUS_TONE: Record<Developer['status'], string> = {
  available: 'bg-accent-green/15 text-accent-green',
  'on-task': 'bg-accent-blue/15 text-accent-blue',
  blocked: 'bg-accent-red/15 text-accent-red',
  vacation: 'bg-accent-purple/15 text-accent-purple',
  resigned: 'bg-bg-subtle text-ink-muted line-through',
};

export default function Team() {
  const { team, tasks, selectedDevId, selectDev } = useGame();
  const isMobile = useIsMobile();
  const selected = team.find((d) => d.id === selectedDevId) ?? (isMobile ? undefined : team[0]);
  const showList = !isMobile || !selected;
  const showDetail = !isMobile || !!selected;

  return (
    <div className="p-4 md:p-6 space-y-4 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-ink-muted">PEOPLE OPS</div>
          <h1 className="text-xl md:text-2xl font-semibold">Team</h1>
        </div>
        <div className="text-xs text-ink-muted">
          {team.filter((d) => d.status !== 'resigned').length} active ·{' '}
          {team.filter((d) => d.status === 'resigned').length} departed
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 flex-1 min-h-0">
        {showList && (
        <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 content-start overflow-y-auto pr-1">
          {team.map((d) => {
            const archetype = ARCHETYPES[d.archetype];
            const task = tasks.find((t) => t.id === d.taskId);
            return (
              <motion.button
                key={d.id}
                layout
                onClick={() => selectDev(d.id)}
                className={clsx(
                  'panel p-3 text-left transition-colors',
                  selected?.id === d.id ? 'border-accent-blue' : 'hover:border-bg-hover',
                  d.status === 'resigned' && 'opacity-60',
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-blue/40 to-accent-purple/40 flex items-center justify-center text-sm font-semibold">
                    {d.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{d.name}</div>
                    <div className="text-[11px] text-ink-muted truncate">{d.title}</div>
                  </div>
                  <span className={clsx('pill text-[10px]', STATUS_TONE[d.status])}>{d.status}</span>
                </div>
                <div className="text-[10px] text-ink-muted italic line-clamp-1 mb-2">
                  "{archetype.blurb}"
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                  <span className="text-ink-muted">Skill</span>
                  <span className="text-right text-ink-primary">{d.skill}</span>
                  <span className="text-ink-muted">Morale</span>
                  <span
                    className={clsx(
                      'text-right',
                      d.morale < 35 && 'text-accent-red',
                      d.morale > 70 && 'text-accent-green',
                    )}
                  >
                    {Math.round(d.morale)}
                  </span>
                  <span className="text-ink-muted">Burnout</span>
                  <span
                    className={clsx(
                      'text-right',
                      d.burnout > 70 && 'text-accent-red',
                      d.burnout > 50 && 'text-accent-yellow',
                    )}
                  >
                    {Math.round(d.burnout)}
                  </span>
                  <span className="text-ink-muted">Loyalty</span>
                  <span
                    className={clsx(
                      'text-right',
                      d.loyalty < 35 && 'text-accent-red',
                      d.loyalty > 70 && 'text-accent-green',
                    )}
                  >
                    {Math.round(d.loyalty)}
                  </span>
                </div>
                {task && (
                  <div className="mt-2 text-[11px] text-ink-secondary truncate">
                    → {task.id} {task.title}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
        )}

        {showDetail && (
          <div className="md:col-span-5 panel p-5 overflow-y-auto">
            {selected ? (
              <DevDetail
                dev={selected}
                onBack={isMobile ? () => selectDev(undefined) : undefined}
              />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

function DevDetail({ dev, onBack }: { dev: Developer; onBack?: () => void }) {
  const archetype = ARCHETYPES[dev.archetype];
  return (
    <div>
      {onBack && (
        <button onClick={onBack} className="md:hidden mb-2 -ml-2 px-2 py-1 text-xs text-ink-secondary">
          ← Back
        </button>
      )}
      <div className="flex items-center gap-3 mb-1">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-blue/40 to-accent-purple/40 flex items-center justify-center text-lg font-semibold">
          {dev.name[0]}
        </div>
        <div>
          <div className="text-base font-semibold">{dev.name}</div>
          <div className="text-xs text-ink-muted">{dev.title}</div>
        </div>
      </div>

      <div className="my-4 panel p-3 bg-bg-subtle text-xs italic text-ink-secondary">
        "{archetype.blurb}"
      </div>

      <div className="space-y-3 mb-5">
        <MetricBar label="Skill" value={dev.skill} />
        <MetricBar label="Productivity" value={dev.productivity} />
        <MetricBar label="Reliability" value={dev.reliability} />
        <MetricBar label="Morale" value={dev.morale} />
        <MetricBar label="Burnout" value={dev.burnout} invert />
        <MetricBar label="Loyalty to you" value={dev.loyalty} hint="Low loyalty + high burnout = LinkedIn updates." />
        <MetricBar label="Ego" value={dev.ego} hint="High ego = code review delays + design debates" />
      </div>

      <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-1">Specialization</div>
      <div className="pill bg-accent-blue/20 text-accent-blue mb-1 capitalize">{dev.specialization}</div>

      <div className="text-[10px] uppercase tracking-wider text-ink-muted mt-3 mb-1">Salary</div>
      <div className="text-sm font-mono mb-4">${dev.salary.toLocaleString()}/mo</div>

      {dev.hiddenFlaw && (
        <div className="text-[11px] bg-accent-yellow/10 border-l-2 border-accent-yellow rounded p-2 mb-3">
          <span className="text-accent-yellow font-medium">Discovered flaw:</span>{' '}
          <span className="text-ink-secondary">{dev.hiddenFlaw}</span>
        </div>
      )}

      {dev.notes.length > 0 && (
        <>
          <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-1">HR file</div>
          <ul className="text-xs text-ink-secondary space-y-1">
            {dev.notes.map((n, i) => (
              <li key={i} className="border-l-2 border-bg-border pl-2">
                {n}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
