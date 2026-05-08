import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useGame } from '../store/gameStore';
import Icon from '../components/ui/Icon';

export default function Retrospective() {
  const { history, acceptRetro, sprint, goalSprints, streaks, achievements } = useGame();
  const last = history[0];
  if (!last) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <button onClick={acceptRetro} className="btn-primary">Continue</button>
      </div>
    );
  }

  const recentlyUnlocked = achievements.filter((a) => a.unlocked).slice(-3);

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-[10px] uppercase tracking-widest text-ink-muted">RETROSPECTIVE</div>
          <h1 className="text-2xl md:text-3xl font-bold">Sprint {last.sprint} — closed</h1>
          <p className="text-ink-secondary mt-1">
            Sprint {sprint} of {goalSprints} begins next.
          </p>
        </motion.div>

        <div className="mt-6 md:mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat
            label="Velocity"
            value={`${last.velocity} / ${last.committed}`}
            tone={last.velocity >= last.committed ? 'good' : 'bad'}
          />
          <Stat label="Shipped" value={String(last.shipped.length)} />
          <Stat label="Bugs created" value={String(last.bugsCreated)} tone={last.bugsCreated > 3 ? 'bad' : 'good'} />
          <Stat label="Incidents" value={String(last.incidents)} tone={last.incidents > 0 ? 'bad' : 'good'} />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 panel p-5 border-l-2 border-accent-blue"
        >
          <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-1">
            Quote of the sprint
          </div>
          <div className="text-base italic text-ink-primary">{last.retroQuote}</div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-3 mt-4">
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="panel p-4"
          >
            <div className="text-[10px] uppercase tracking-wider text-accent-green mb-1">
              Highlight
            </div>
            <div className="text-sm">
              {last.highlight ?? 'A normal sprint. Nobody on fire.'}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45 }}
            className="panel p-4"
          >
            <div className="text-[10px] uppercase tracking-wider text-accent-red mb-1">
              Lowlight
            </div>
            <div className="text-sm">
              {last.lowlight ?? 'Nothing dramatic to report.'}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mt-4 panel p-4"
        >
          <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-2">
            Shipped this sprint
          </div>
          {last.shipped.length === 0 ? (
            <div className="text-xs text-ink-muted">Nothing shipped. Sales is uncomfortable.</div>
          ) : (
            <ul className="text-xs text-ink-secondary space-y-1">
              {last.shipped.slice(0, 8).map((title, i) => (
                <li key={i} className="border-l-2 border-accent-green/60 pl-2">{title}</li>
              ))}
              {last.shipped.length > 8 && (
                <li className="text-ink-muted">+{last.shipped.length - 8} more…</li>
              )}
            </ul>
          )}
        </motion.div>

        {(streaks.cleanSprints > 1 ||
          streaks.velocityHits > 1 ||
          streaks.noResignationStreak > 1) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="mt-4 panel p-4"
          >
            <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-2">
              Active streaks
            </div>
            <div className="flex flex-wrap gap-2">
              {streaks.cleanSprints > 1 && (
                <span className="pill bg-accent-green/20 text-accent-green flex items-center gap-1">
                  <Icon name="flame" size={11} /> {streaks.cleanSprints} clean sprints
                </span>
              )}
              {streaks.velocityHits > 1 && (
                <span className="pill bg-accent-blue/20 text-accent-blue flex items-center gap-1">
                  <Icon name="flame" size={11} /> {streaks.velocityHits} hit commits in a row
                </span>
              )}
              {streaks.noResignationStreak > 1 && (
                <span className="pill bg-accent-yellow/20 text-accent-yellow flex items-center gap-1">
                  <Icon name="flame" size={11} /> {streaks.noResignationStreak} sprints, no resignations
                </span>
              )}
            </div>
            {streaks.buffs.length > 0 && (
              <div className="text-[11px] text-ink-secondary mt-2">
                Next sprint buff: {streaks.buffs.map((b) => b.label).join(', ')}.
              </div>
            )}
          </motion.div>
        )}

        {recentlyUnlocked.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75 }}
            className="mt-4 panel p-4"
          >
            <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-2">
              Achievements unlocked so far
            </div>
            <div className="flex flex-wrap gap-2">
              {recentlyUnlocked.map((a) => (
                <span key={a.id} className="pill bg-accent-yellow/15 text-accent-yellow flex items-center gap-1">
                  <Icon name="star" size={11} /> {a.name}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        <div className="mt-8 flex justify-end">
          <button onClick={acceptRetro} className="btn-primary px-5 py-2.5 flex items-center gap-2">
            <Icon name="arrow-right" size={14} /> Plan next sprint
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'good' | 'bad';
}) {
  return (
    <div className="panel p-4">
      <div className="text-[10px] uppercase tracking-wider text-ink-muted">{label}</div>
      <div
        className={clsx(
          'text-2xl font-bold mt-1',
          tone === 'good' && 'text-accent-green',
          tone === 'bad' && 'text-accent-red',
        )}
      >
        {value}
      </div>
    </div>
  );
}
