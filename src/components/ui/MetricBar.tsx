import clsx from 'clsx';

interface Props {
  label: string;
  value: number;
  max?: number;
  invert?: boolean; // if true, lower value = better
  suffix?: string;
  hint?: string;
}

export default function MetricBar({
  label,
  value,
  max = 100,
  invert = false,
  suffix,
  hint,
}: Props) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  let color = 'bg-accent-green';
  const score = invert ? 100 - pct : pct;
  if (score < 30) color = 'bg-accent-red';
  else if (score < 55) color = 'bg-accent-yellow';
  else if (score < 75) color = 'bg-accent-blue';

  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-ink-secondary">{label}</span>
        <span className="text-ink-primary font-medium">
          {Math.round(value)}
          {suffix ?? ''}
        </span>
      </div>
      <div className="meter">
        <div className={clsx(color)} style={{ width: `${pct}%` }} />
      </div>
      {hint && <div className="text-[10px] text-ink-muted">{hint}</div>}
    </div>
  );
}
