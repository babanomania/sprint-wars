import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useGame } from '../store/gameStore';
import Icon from '../components/ui/Icon';

export default function Hire() {
  const { candidates, metrics, hireCandidate, refreshCandidates, team, fireDeveloper } = useGame();
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const reveal = (id: string) =>
    setRevealed((s) => {
      const n = new Set(s);
      n.add(id);
      return n;
    });

  const aliveTeam = team.filter((d) => d.status !== 'resigned');

  return (
    <div className="p-4 md:p-6 space-y-4 h-full overflow-y-auto">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-ink-muted">PEOPLE OPS</div>
          <h1 className="text-xl md:text-2xl font-semibold">Hire & Release</h1>
        </div>
        <div className="flex items-center gap-3 text-xs text-ink-muted">
          <span>Budget: ${metrics.budget.toLocaleString()}</span>
          <button onClick={refreshCandidates} className="btn-ghost flex items-center gap-1.5">
            <Icon name="refresh" size={13} /> Refresh pool ($2k)
          </button>
        </div>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-2">
          Active candidates ({candidates.length})
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {candidates.map((c) => {
            const isRevealed = revealed.has(c.id);
            const canAfford = metrics.budget >= c.asking;
            return (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="panel p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-blue/40 to-accent-purple/40 flex items-center justify-center text-sm font-semibold">
                      {c.name[0]}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{c.name}</div>
                      <div className="text-[11px] text-ink-muted">{c.title}</div>
                    </div>
                  </div>
                  <span className="pill bg-bg-subtle text-ink-secondary capitalize">
                    {c.specialization}
                  </span>
                </div>

                <div className="text-xs italic text-ink-secondary mb-3 line-clamp-2">
                  "{c.resumeBlurb}"
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] mb-3">
                  <span className="text-ink-muted">Skill</span>
                  <span className="text-right">{c.skill}</span>
                  <span className="text-ink-muted">Productivity</span>
                  <span className="text-right">{c.productivity}</span>
                  <span className="text-ink-muted">Reliability</span>
                  <span className="text-right">{c.reliability}</span>
                  <span className="text-ink-muted">Ego</span>
                  <span
                    className={clsx(
                      'text-right',
                      c.ego > 80 ? 'text-accent-red' : c.ego > 60 ? 'text-accent-yellow' : 'text-ink-primary',
                    )}
                  >
                    {c.ego}
                  </span>
                </div>

                <div className="text-[11px] mb-3">
                  <div>
                    <span className="text-ink-muted">Salary:</span>{' '}
                    <span className="font-mono">${c.salary.toLocaleString()}/mo</span>
                  </div>
                  <div>
                    <span className="text-ink-muted">Asking:</span>{' '}
                    <span
                      className={clsx(
                        'font-mono',
                        !canAfford && 'text-accent-red',
                      )}
                    >
                      ${c.asking.toLocaleString()}
                    </span>
                  </div>
                </div>

                {isRevealed ? (
                  <div className="text-[11px] bg-accent-yellow/10 border-l-2 border-accent-yellow rounded p-2 mb-3">
                    <span className="text-accent-yellow font-medium">⚠ Reference flag:</span>{' '}
                    <span className="text-ink-secondary">{c.hiddenFlaw}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => reveal(c.id)}
                    className="btn-ghost w-full text-[11px] mb-2 flex items-center justify-center gap-1.5"
                  >
                    <Icon name="search" size={12} /> Run reference check
                  </button>
                )}

                <button
                  onClick={() => hireCandidate(c.id)}
                  disabled={!canAfford}
                  className="btn-primary w-full"
                >
                  Hire — ${c.asking.toLocaleString()}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-2">
          Current team ({aliveTeam.length})
        </div>
        <div className="space-y-2">
          {aliveTeam.map((d) => (
            <div
              key={d.id}
              className="panel px-4 py-3 flex items-center gap-4"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-blue/40 to-accent-purple/40 flex items-center justify-center text-xs font-semibold">
                {d.name[0]}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{d.name}</div>
                <div className="text-[11px] text-ink-muted">
                  {d.title} · loyalty{' '}
                  <span
                    className={clsx(
                      d.loyalty > 70 ? 'text-accent-green' : d.loyalty < 40 ? 'text-accent-red' : 'text-ink-primary',
                    )}
                  >
                    {Math.round(d.loyalty)}
                  </span>
                </div>
              </div>
              <span className="text-xs text-ink-muted font-mono">
                ${d.salary.toLocaleString()}/mo
              </span>
              <button
                onClick={() => {
                  if (confirm(`Release ${d.name}? This affects morale.`)) fireDeveloper(d.id);
                }}
                className="btn-ghost text-xs hover:text-accent-red"
              >
                Release
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
