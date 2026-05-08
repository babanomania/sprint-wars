import clsx from 'clsx';
import type { Metrics } from '../../types';

const POSITIVE_HIGHER = new Set<keyof Metrics>([
  'morale',
  'trust',
  'patience',
  'stability',
  'budget',
  'velocity',
]);

interface Props {
  effect: Partial<Metrics>;
  size?: 'sm' | 'xs';
}

export default function EffectChips({ effect, size = 'xs' }: Props) {
  const entries = Object.entries(effect).filter(([_, v]) => typeof v === 'number' && v !== 0);
  if (entries.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {entries.map(([k, v]) => {
        const num = v as number;
        const isPositiveHigher = POSITIVE_HIGHER.has(k as keyof Metrics);
        const positive = isPositiveHigher ? num > 0 : num < 0;
        return (
          <span
            key={k}
            className={clsx(
              'pill',
              size === 'sm' && 'text-xs',
              positive ? 'bg-accent-green/15 text-accent-green' : 'bg-accent-red/15 text-accent-red',
            )}
          >
            {num > 0 ? '+' : ''}
            {num} {k}
          </span>
        );
      })}
    </div>
  );
}
