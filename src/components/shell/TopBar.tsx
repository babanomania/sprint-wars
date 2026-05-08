import { useGame } from '../../store/gameStore';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import SpeedControls from './SpeedControls';
import Icon from '../ui/Icon';

interface Props {
  onMenuClick: () => void;
}

function MoraleIndicator({ value, compact = false }: { value: number; compact?: boolean }) {
  let color = 'bg-accent-green';
  let label = 'High';
  if (value < 30) {
    color = 'bg-accent-red';
    label = 'Critical';
  } else if (value < 55) {
    color = 'bg-accent-yellow';
    label = 'Low';
  } else if (value < 75) {
    color = 'bg-accent-blue';
    label = 'OK';
  }
  if (compact) {
    return (
      <div className="flex items-center gap-1" title={`Morale ${Math.round(value)}`}>
        <span className={clsx('w-2 h-2 rounded-full', color)} />
        <span className="text-xs font-medium">{Math.round(value)}</span>
      </div>
    );
  }
  return (
    <div className="hidden lg:flex items-center gap-2">
      <span className="text-[11px] uppercase text-ink-muted tracking-wider">Morale</span>
      <div className="flex items-center gap-1.5">
        <span className={clsx('w-2 h-2 rounded-full', color)} />
        <span className="text-sm font-medium">
          {Math.round(value)} <span className="text-ink-muted text-xs">{label}</span>
        </span>
      </div>
    </div>
  );
}

export default function TopBar({ onMenuClick }: Props) {
  const {
    sprint,
    day,
    daysPerSprint,
    metrics,
    incidents,
    phase,
    goalSprints,
    streaks,
  } = useGame();

  const activeIncidents = incidents.filter(
    (i) => i.status === 'open' || i.status === 'mitigating',
  );
  const goalProgress = Math.min(100, ((sprint - 1) / Math.max(1, goalSprints)) * 100);

  return (
    <header className="h-14 bg-bg-panel border-b border-bg-border px-2 md:px-5 flex items-center gap-2 md:gap-5 shrink-0 min-w-0">
      {/* Hamburger (mobile only) */}
      <button
        onClick={onMenuClick}
        className="md:hidden w-9 h-9 rounded-md flex items-center justify-center text-ink-secondary hover:bg-bg-subtle hover:text-ink-primary shrink-0"
        aria-label="Open menu"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      <div className="flex items-baseline gap-1.5 md:gap-2 shrink-0">
        <span className="hidden sm:inline text-[10px] uppercase tracking-wider text-ink-muted">
          Sprint
        </span>
        <span className="text-base md:text-lg font-bold text-ink-primary">#{sprint}</span>
        <span className="text-xs text-ink-muted">
          D{day}/{daysPerSprint}
        </span>
        <span
          className={clsx(
            'pill hidden sm:inline-flex',
            phase === 'early' && 'bg-accent-blue/15 text-accent-blue',
            phase === 'mid' && 'bg-accent-yellow/15 text-accent-yellow',
            phase === 'late' && 'bg-accent-red/15 text-accent-red',
          )}
        >
          {phase}
        </span>
      </div>

      {/* Goal progress (md+) */}
      <div
        className="hidden md:flex items-center gap-1.5 shrink-0"
        title={`Goal: ${goalSprints} sprints`}
      >
        <span className="text-[10px] uppercase tracking-wider text-ink-muted">Goal</span>
        <div className="w-20 lg:w-24 h-1.5 bg-bg-subtle rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-blue transition-all"
            style={{ width: `${goalProgress}%` }}
          />
        </div>
        <span className="text-[11px] text-ink-secondary">
          {sprint - 1}/{goalSprints}
        </span>
      </div>

      <div className="hidden md:block h-6 w-px bg-bg-border" />

      {/* Budget */}
      <div className="hidden md:flex items-center gap-1.5 shrink-0">
        <span className="text-[10px] uppercase tracking-wider text-ink-muted">Budget</span>
        <span className="text-sm font-mono">${metrics.budget.toLocaleString()}</span>
      </div>

      {/* Patience */}
      <div className="hidden lg:flex items-center gap-1.5 shrink-0">
        <span className="text-[10px] uppercase tracking-wider text-ink-muted">Patience</span>
        <span
          className={clsx(
            'text-sm font-medium',
            metrics.patience < 25
              ? 'text-accent-red'
              : metrics.patience < 50
              ? 'text-accent-yellow'
              : 'text-ink-primary',
          )}
        >
          {Math.round(metrics.patience)}
        </span>
      </div>

      {activeIncidents.length > 0 && (
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex items-center gap-1 pill bg-accent-red/15 text-accent-red shrink-0"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent-red" />
          <span className="hidden sm:inline">{activeIncidents.length} active</span>
          <span className="sm:hidden">{activeIncidents.length}</span>
        </motion.div>
      )}

      {/* Mobile-compact morale */}
      <div className="md:hidden">
        <MoraleIndicator value={metrics.morale} compact />
      </div>
      <MoraleIndicator value={metrics.morale} />

      {streaks.cleanSprints > 1 && (
        <span
          className="hidden sm:flex pill bg-accent-green/15 text-accent-green items-center gap-1 shrink-0"
          title="Sprints in a row without a SEV1"
        >
          <Icon name="flame" size={11} /> {streaks.cleanSprints}
        </span>
      )}

      <div className="ml-auto flex items-center gap-3 shrink-0">
        <SpeedControls />
      </div>
    </header>
  );
}
