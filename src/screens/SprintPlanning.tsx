import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { useGame } from '../store/gameStore';
import { chanceOfHittingCommit } from '../engine/probability';
import Icon from '../components/ui/Icon';

export default function SprintPlanning() {
  const { tasks, team, sprint, daysPerSprint, metrics, commitPlanning, history, streaks } = useGame();
  const [picks, setPicks] = useState<Set<string>>(new Set());

  const backlog = useMemo(
    () =>
      [...tasks]
        .filter((t) => t.status === 'backlog' || t.status === 'in-progress')
        .sort((a, b) => priorityRank(b.priority) - priorityRank(a.priority)),
    [tasks],
  );

  const committedPoints = useMemo(
    () =>
      backlog.filter((t) => picks.has(t.id)).reduce((s, t) => s + t.storyPoints, 0),
    [picks, backlog],
  );

  const chance = chanceOfHittingCommit(committedPoints, team, metrics, daysPerSprint);
  const last = history[0];
  const aliveTeam = team.filter((d) => d.status !== 'resigned');

  const toggle = (id: string) =>
    setPicks((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3 mb-6">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-ink-muted">SPRINT PLANNING</div>
            <h1 className="text-2xl md:text-3xl font-bold">Sprint #{sprint} commitment</h1>
            <p className="text-ink-secondary text-sm mt-1">
              Pick what you're committing to. Missing the commitment hurts trust harder than just low velocity.
            </p>
          </div>
          {streaks.buffs.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {streaks.buffs.map((b) => (
                <span key={b.id} className="pill bg-accent-yellow/20 text-accent-yellow flex items-center gap-1">
                  <Icon name="star" size={10} /> {b.label}: {b.effect}
                </span>
              ))}
            </div>
          )}
        </div>

        {last && (
          <div className="panel p-3 mb-6 text-xs flex flex-wrap gap-4 items-center">
            <span className="text-ink-muted">Last sprint:</span>
            <span>velocity {last.velocity}</span>
            <span className={last.velocity >= last.committed ? 'text-accent-green' : 'text-accent-red'}>
              {last.velocity >= last.committed ? '✓ hit' : '✕ missed'} commit ({last.committed})
            </span>
            <span>{last.bugsCreated} bugs</span>
            <span>{last.incidents} incidents</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 panel p-4 max-h-[60vh] overflow-y-auto order-2 lg:order-1">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-3">
              Backlog — pick what makes the sprint
            </div>
            {backlog.length === 0 && (
              <div className="text-sm text-ink-muted py-12 text-center">
                Backlog is empty. Product is "doing discovery."
              </div>
            )}
            <div className="space-y-1.5">
              {backlog.map((t) => {
                const active = picks.has(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => toggle(t.id)}
                    className={clsx(
                      'w-full text-left px-3 py-2 rounded-md flex items-center gap-3 transition-colors border',
                      active
                        ? 'bg-accent-blue/10 border-accent-blue'
                        : 'bg-bg-subtle border-bg-border hover:bg-bg-hover',
                    )}
                  >
                    <span
                      className={clsx(
                        'w-4 h-4 rounded border flex items-center justify-center',
                        active ? 'bg-accent-blue border-accent-blue text-white text-[10px]' : 'border-bg-border',
                      )}
                    >
                      {active ? '✓' : ''}
                    </span>
                    <span className="text-xs font-mono text-ink-muted w-14">{t.id}</span>
                    <span className="flex-1 text-sm">{t.title}</span>
                    <span className="pill bg-bg-base border border-bg-border text-ink-secondary">{t.storyPoints} pts</span>
                    <span
                      className={clsx(
                        'pill',
                        t.priority === 'critical' && 'bg-accent-red/20 text-accent-red',
                        t.priority === 'high' && 'bg-accent-yellow/20 text-accent-yellow',
                        t.priority === 'medium' && 'bg-accent-blue/20 text-accent-blue',
                        t.priority === 'low' && 'bg-bg-subtle text-ink-muted',
                      )}
                    >
                      {t.priority}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-3 order-1 lg:order-2">
            <div className="panel p-4">
              <div className="text-[10px] uppercase tracking-wider text-ink-muted">Commitment</div>
              <div className="text-3xl font-bold mt-1">{committedPoints} pts</div>
              <div className="text-[11px] text-ink-muted">{picks.size} tasks selected</div>
            </div>

            <div className="panel p-4">
              <div className="text-[10px] uppercase tracking-wider text-ink-muted">Predicted ship rate</div>
              <div
                className={clsx(
                  'text-3xl font-bold mt-1',
                  chance > 70 ? 'text-accent-green' : chance > 45 ? 'text-accent-yellow' : 'text-accent-red',
                )}
              >
                {chance}%
              </div>
              <div className="text-[11px] text-ink-muted leading-relaxed mt-1">
                Based on {aliveTeam.length} engineers, current morale, and {Math.round(metrics.techDebt)}% tech debt drag.
              </div>
            </div>

            <div className="panel p-4 text-xs leading-relaxed">
              <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-2">
                Coach
              </div>
              <ul className="space-y-1.5 text-ink-secondary">
                {committedPoints > 22 && (
                  <li className="text-accent-yellow">⚠ Aggressive commit. Burnout risk if you also rush mid-sprint.</li>
                )}
                {committedPoints < 8 && (
                  <li className="text-accent-yellow">⚠ Soft commit. Stakeholder trust may erode.</li>
                )}
                {committedPoints >= 12 && committedPoints <= 18 && (
                  <li className="text-accent-green">✓ Balanced commit.</li>
                )}
                <li>Engineers without an assigned task will pick from the rest of the backlog ad hoc.</li>
              </ul>
            </div>

            <button
              onClick={() => commitPlanning(Array.from(picks))}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
              disabled={picks.size === 0}
            >
              <Icon name="play" size={14} /> Commit and start standup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function priorityRank(p: 'low' | 'medium' | 'high' | 'critical') {
  return p === 'critical' ? 4 : p === 'high' ? 3 : p === 'medium' ? 2 : 1;
}
