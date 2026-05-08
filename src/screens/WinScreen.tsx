import { motion } from 'framer-motion';
import { useGame } from '../store/gameStore';
import Icon from '../components/ui/Icon';

export default function WinScreen() {
  const { sprint, history, achievements, metrics, runConfig, resetEverything } = useGame();
  const unlocked = achievements.filter((a) => a.unlocked);
  const totalShipped = history.reduce((s, h) => s + h.shipped.length, 0);
  const totalIncidents = history.reduce((s, h) => s + h.incidents, 0);

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4 md:p-6">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="panel max-w-xl w-full p-6 md:p-8 glow-blue"
      >
        <div className="text-[10px] uppercase tracking-widest text-accent-green mb-1 flex items-center gap-1.5">
          <Icon name="check" size={12} /> GOAL REACHED
        </div>
        <div className="text-3xl font-extrabold mb-2">You survived.</div>
        <div className="text-sm text-ink-secondary mb-6">
          Run completed: {RUN_TITLE[runConfig.modifierId]}. The board sent a thank-you Slack and
          immediately moved on to the next thing.
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <Stat label="Sprints run" value={String(sprint - 1)} />
          <Stat label="Tasks shipped" value={String(totalShipped)} />
          <Stat label="Incidents survived" value={String(totalIncidents)} />
          <Stat label="Final tech debt" value={`${Math.round(metrics.techDebt)}%`} />
        </div>

        {unlocked.length > 0 && (
          <div className="mb-6">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-2">
              Achievements
            </div>
            <div className="flex flex-wrap gap-2">
              {unlocked.map((a) => (
                <span key={a.id} className="pill bg-accent-yellow/15 text-accent-yellow flex items-center gap-1">
                  <Icon name="star" size={11} /> {a.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <button onClick={resetEverything} className="btn-primary w-full">
          Start a new tour at a different startup
        </button>
      </motion.div>
    </div>
  );
}

const RUN_TITLE: Record<string, string> = {
  classic: 'Classic Tour of Duty',
  'recently-acquired': 'Recently Acquired',
  'post-incident': 'Post-Mortem Era',
  'fresh-funding': 'Series C Closed Last Friday',
  'pre-ipo': 'Pre-IPO Quiet Period',
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-bg-subtle rounded-md p-3">
      <div className="text-[10px] uppercase tracking-wider text-ink-muted">{label}</div>
      <div className="text-xl font-bold mt-0.5">{value}</div>
    </div>
  );
}
