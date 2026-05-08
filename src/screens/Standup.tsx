import { useMemo } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useGame } from '../store/gameStore';
import { generateStandupLines } from '../data/standup';
import { mulberry32 } from '../engine/rng';
import Icon from '../components/ui/Icon';

export default function Standup() {
  const { team, tasks, metrics, sprint, finishStandup, seed } = useGame();
  const lines = useMemo(() => {
    const rng = mulberry32(seed + sprint * 11);
    return generateStandupLines(team, tasks, metrics.techDebt, rng);
  }, [team, tasks, metrics.techDebt, sprint, seed]);

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-[10px] uppercase tracking-widest text-ink-muted">DAILY STANDUP</div>
          <h1 className="text-2xl md:text-3xl font-bold">Sprint #{sprint} — Day 1</h1>
          <p className="text-ink-secondary text-sm mt-1">
            Quick round. What did you do yesterday, what are you doing today, blockers.
          </p>
        </motion.div>

        <div className="mt-8 space-y-2.5">
          {lines.map((l, i) => (
            <motion.div
              key={l.devId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="panel p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-blue/40 to-accent-purple/40 flex items-center justify-center text-xs font-semibold">
                  {l.devName[0]}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{l.devName}</div>
                </div>
                <span
                  className={clsx(
                    'w-2 h-2 rounded-full',
                    l.vibeColor === 'red' && 'bg-accent-red',
                    l.vibeColor === 'yellow' && 'bg-accent-yellow',
                    l.vibeColor === 'green' && 'bg-accent-green',
                  )}
                  title={`vibe: ${l.vibeColor}`}
                />
              </div>
              <div className="text-xs text-ink-secondary space-y-1.5 ml-11">
                <div>
                  <span className="text-ink-muted">Yesterday:</span> {l.yesterday}
                </div>
                <div>
                  <span className="text-ink-muted">Today:</span> {l.today}
                </div>
                <div>
                  <span className="text-ink-muted">Blockers:</span>{' '}
                  <span
                    className={clsx(
                      l.vibeColor === 'red' ? 'text-accent-red' : 'text-ink-secondary',
                    )}
                  >
                    {l.blockers}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button onClick={finishStandup} className="btn-primary px-5 py-2.5 flex items-center gap-2">
            <Icon name="check" size={14} /> Standup done — begin sprint
          </button>
        </div>
      </div>
    </div>
  );
}
