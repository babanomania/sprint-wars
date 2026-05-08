import { useMemo } from 'react';
import { useGame } from '../store/gameStore';
import Card from '../components/ui/Card';
import MetricBar from '../components/ui/MetricBar';
import Sparkline from '../components/ui/Sparkline';

export default function Metrics() {
  const { metrics, sprint, tasks, incidents, team } = useGame();

  const series = useMemo(() => {
    const fakeHistory = (current: number, swing = 12) =>
      Array.from({ length: 12 }, (_, i) =>
        Math.max(0, Math.min(100, current - swing + ((i * 7 + sprint * 3) % (swing * 2)))),
      );
    return {
      morale: fakeHistory(metrics.morale),
      trust: fakeHistory(metrics.trust),
      stability: fakeHistory(metrics.stability),
      techDebt: fakeHistory(metrics.techDebt),
      burnout: fakeHistory(metrics.burnout),
    };
  }, [metrics, sprint]);

  const completed = tasks.filter((t) => t.status === 'done').length;
  const open = incidents.filter((i) => i.status === 'open' || i.status === 'mitigating').length;
  const aliveTeam = team.filter((d) => d.status !== 'resigned').length;

  return (
    <div className="p-4 md:p-6 space-y-4 overflow-y-auto h-full">
      <div>
        <div className="text-[10px] uppercase tracking-widest text-ink-muted">
          PROGRAM METRICS
        </div>
        <h1 className="text-xl md:text-2xl font-semibold">Metrics</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <Card title="At a glance" className="md:col-span-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <Stat label="Sprint" value={String(sprint)} />
            <Stat label="Velocity" value={String(metrics.velocity || '—')} />
            <Stat label="Tasks done" value={String(completed)} />
            <Stat label="Open incidents" value={String(open)} />
            <Stat label="Engineers" value={String(aliveTeam)} />
            <Stat label="Budget" value={`$${(metrics.budget / 1000).toFixed(0)}k`} />
          </div>
        </Card>

        <Card title="Morale">
          <Sparkline values={series.morale} color="#3ddc97" height={50} />
          <MetricBar label="Current" value={metrics.morale} />
        </Card>
        <Card title="Trust">
          <Sparkline values={series.trust} color="#4f8df7" height={50} />
          <MetricBar label="Current" value={metrics.trust} />
        </Card>
        <Card title="Stability">
          <Sparkline values={series.stability} color="#a78bfa" height={50} />
          <MetricBar label="Current" value={metrics.stability} />
        </Card>
        <Card title="Tech Debt">
          <Sparkline values={series.techDebt} color="#ff5d6c" height={50} />
          <MetricBar label="Current" value={metrics.techDebt} invert />
        </Card>
        <Card title="Burnout">
          <Sparkline values={series.burnout} color="#ffc857" height={50} />
          <MetricBar label="Current" value={metrics.burnout} invert />
        </Card>
        <Card title="Security Risk">
          <MetricBar label="Risk score" value={metrics.security} invert />
          <div className="text-xs text-ink-muted mt-2">
            {metrics.security > 70
              ? 'You should not be sleeping at night.'
              : metrics.security > 40
              ? 'Manageable. Don\'t look too hard.'
              : 'In a good place — for now.'}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-bg-subtle rounded-md p-3">
      <div className="text-[10px] uppercase tracking-wider text-ink-muted">{label}</div>
      <div className="text-lg font-semibold mt-0.5">{value}</div>
    </div>
  );
}
