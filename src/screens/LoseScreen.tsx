import { motion } from 'framer-motion';
import { useGame } from '../store/gameStore';
import Icon from '../components/ui/Icon';

export default function LoseScreen() {
  const { gameOver, sprint, metrics, achievements, resetEverything } = useGame();
  const unlocked = achievements.filter((a) => a.unlocked);

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4 md:p-6">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="panel max-w-xl w-full p-6 md:p-8 border-l-4 border-accent-red"
      >
        <div className="text-[10px] uppercase tracking-widest text-accent-red mb-1">
          POST-MORTEM
        </div>
        <div className="text-3xl font-extrabold mb-2">It was a learning experience.</div>
        <div className="text-sm text-ink-secondary mb-6">{gameOver.reason}</div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <Stat label="Sprints survived" value={String(sprint - 1)} />
          <Stat label="Final velocity" value={String(metrics.velocity)} />
          <Stat label="Tech debt" value={`${Math.round(metrics.techDebt)}%`} />
          <Stat label="Stability" value={`${Math.round(metrics.stability)}%`} />
        </div>

        {unlocked.length > 0 && (
          <div className="mb-6">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-2">
              Achievements unlocked
            </div>
            <div className="flex flex-wrap gap-2">
              {unlocked.map((a) => (
                <span key={a.id} className="pill bg-accent-yellow/20 text-accent-yellow flex items-center gap-1">
                  <Icon name="star" size={11} /> {a.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <button onClick={resetEverything} className="btn-primary w-full">
          Start a new role at a different startup
        </button>
      </motion.div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-bg-subtle rounded-md p-3">
      <div className="text-[10px] uppercase tracking-wider text-ink-muted">{label}</div>
      <div className="text-xl font-bold mt-0.5">{value}</div>
    </div>
  );
}
