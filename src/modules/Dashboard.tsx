import { useGame } from '../store/gameStore';
import Card from '../components/ui/Card';
import MetricBar from '../components/ui/MetricBar';
import Sparkline from '../components/ui/Sparkline';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import Icon from '../components/ui/Icon';

export default function Dashboard() {
  const {
    metrics,
    sprint,
    tasks,
    incidents,
    team,
    events,
    achievements,
    storylines,
    history,
    streaks,
    goalSprints,
  } = useGame();

  const velocityHistory = useMemo(() => {
    const fromHistory = history.map((h) => h.velocity).reverse();
    if (fromHistory.length >= 3) return fromHistory.slice(-12);
    const seed = metrics.velocity || 8;
    return Array.from({ length: 8 }, (_, i) =>
      Math.max(2, Math.round(seed * (0.6 + (i / 8) * 0.6) + ((i * 7) % 5))),
    );
  }, [history, metrics.velocity]);

  const moraleHistory = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => Math.max(20, metrics.morale - 12 + (i % 4) * 4 + (i / 8) * 6));
  }, [metrics.morale]);

  const blockers = tasks.filter((t) => t.status === 'blocked');
  const inProgress = tasks.filter((t) => t.status === 'in-progress');
  const releaseConfidence = Math.round(
    metrics.stability * 0.4 + (100 - metrics.techDebt) * 0.3 + metrics.morale * 0.3,
  );
  const deploySuccess = Math.max(40, Math.min(99, Math.round(metrics.stability * 0.95)));

  const aliveTeam = team.filter((d) => d.status !== 'resigned').length;
  const onTask = team.filter((d) => d.status === 'on-task').length;

  return (
    <div className="p-4 md:p-6 space-y-4 overflow-y-auto h-full">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-ink-muted">
            ENGINEERING DASHBOARD
          </div>
          <h1 className="text-xl md:text-2xl font-semibold">
            Sprint {sprint} of {goalSprints}
          </h1>
        </div>
        <div className="text-xs text-ink-muted">
          {aliveTeam} engineers · {onTask} active ·{' '}
          {incidents.filter((i) => i.status !== 'resolved').length} open incidents
        </div>
      </div>

      {storylines.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-widest text-ink-muted mb-2">
            Active storylines
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {storylines.map((sl) => (
              <Card key={sl.id} title={sl.title} subtitle={`Step ${sl.step} of ${sl.totalSteps}`}>
                <div className="meter">
                  <div
                    className="bg-accent-purple"
                    style={{ width: `${(sl.step / sl.totalSteps) * 100}%` }}
                  />
                </div>
                <div className="text-[11px] text-ink-muted mt-1">
                  Started sprint {sl.startedSprint}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-12 gap-3 md:gap-4">
        <Card title="Velocity Trend" subtitle="story points / sprint" className="col-span-2 md:col-span-6">
          <Sparkline values={velocityHistory} color="#4f8df7" height={60} />
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold">{metrics.velocity || '—'}</span>
            <span className="text-xs text-ink-muted">last sprint</span>
          </div>
        </Card>

        <Card title="Morale" subtitle="rolling team average" className="col-span-2 md:col-span-6">
          <Sparkline values={moraleHistory} color="#3ddc97" height={60} />
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold">{Math.round(metrics.morale)}</span>
            <span className="text-xs text-ink-muted">/100</span>
          </div>
        </Card>

        <Card title="Tech Debt" className="col-span-1 md:col-span-3">
          <motion.div
            key={metrics.techDebt}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            className="text-3xl font-bold"
          >
            {Math.round(metrics.techDebt)}%
          </motion.div>
          <div className="text-[11px] text-ink-muted">
            {metrics.techDebt > 60 ? 'Compounding fast.' : metrics.techDebt > 40 ? 'Manageable.' : 'Healthy.'}
          </div>
        </Card>

        <Card title="Release Confidence" className="col-span-1 md:col-span-3">
          <div className="text-3xl font-bold text-accent-green">{releaseConfidence}%</div>
          <div className="text-[11px] text-ink-muted">prob. clean ship</div>
        </Card>

        <Card title="Deploy Success Rate" className="col-span-1 md:col-span-3">
          <div className="text-3xl font-bold">{deploySuccess}%</div>
          <div className="text-[11px] text-ink-muted">last 30 deploys</div>
        </Card>

        <Card title="Active Blockers" className="col-span-1 md:col-span-3">
          <div className="text-3xl font-bold text-accent-yellow">{blockers.length}</div>
          <div className="text-[11px] text-ink-muted">{inProgress.length} in progress</div>
        </Card>

        <Card title="Health Metrics" className="col-span-2 md:col-span-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <MetricBar label="Production Stability" value={metrics.stability} />
            <MetricBar label="Stakeholder Trust" value={metrics.trust} />
            <MetricBar label="Team Burnout" value={metrics.burnout} invert />
            <MetricBar label="Security Risk" value={metrics.security} invert />
            <MetricBar label="Exec Patience" value={metrics.patience} />
            <MetricBar label="Tech Debt" value={metrics.techDebt} invert />
          </div>
        </Card>

        <Card title="Recent Events" className="col-span-2 md:col-span-6">
          {events.length === 0 ? (
            <div className="text-xs text-ink-muted py-4 text-center">
              All quiet. Suspiciously quiet.
            </div>
          ) : (
            <ul className="space-y-2 max-h-56 overflow-y-auto">
              {events.slice(0, 8).map((e) => (
                <li key={e.id} className="text-xs border-l-2 border-accent-yellow/60 pl-3 py-1">
                  <div className="text-ink-primary">{e.title}</div>
                  <div className="text-[10px] text-ink-muted mt-0.5">
                    Sprint {e.sprint}, day {e.day} — {e.kind}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {(streaks.cleanSprints > 1 || streaks.velocityHits > 1) && (
          <Card title="Active streaks" className="col-span-2 md:col-span-12">
            <div className="flex flex-wrap gap-2">
              {streaks.cleanSprints > 1 && (
                <span className="pill bg-accent-green/15 text-accent-green flex items-center gap-1">
                  <Icon name="flame" size={11} /> {streaks.cleanSprints} sprints since last SEV1
                </span>
              )}
              {streaks.velocityHits > 1 && (
                <span className="pill bg-accent-blue/15 text-accent-blue flex items-center gap-1">
                  <Icon name="flame" size={11} /> {streaks.velocityHits} commits hit in a row
                </span>
              )}
              {streaks.noResignationStreak > 1 && (
                <span className="pill bg-accent-yellow/15 text-accent-yellow flex items-center gap-1">
                  <Icon name="flame" size={11} /> {streaks.noResignationStreak} sprints, no resignations
                </span>
              )}
              {streaks.buffs.map((b) => (
                <span key={b.id} className="pill bg-accent-purple/15 text-accent-purple flex items-center gap-1">
                  <Icon name="star" size={11} /> {b.label}: {b.effect}
                </span>
              ))}
            </div>
          </Card>
        )}

        <Card title="Achievements" className="col-span-2 md:col-span-12">
          <div className="flex flex-wrap gap-2">
            {achievements.map((a) => (
              <div
                key={a.id}
                className={`pill px-3 py-1 flex items-center gap-1 ${
                  a.unlocked ? 'bg-accent-yellow/15 text-accent-yellow' : 'bg-bg-subtle text-ink-muted'
                }`}
                title={a.description}
              >
                <Icon
                  name="star"
                  size={11}
                  className={a.unlocked ? '' : 'opacity-40'}
                />{' '}
                {a.name}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
