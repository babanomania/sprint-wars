import clsx from 'clsx';
import type { ReplyTone } from '../../types';
import { TONE_COLOR, TONE_LABELS } from '../../engine/tone';

const TONES: ReplyTone[] = ['apologetic', 'corporate', 'direct', 'aggressive'];

interface Props {
  value: ReplyTone;
  onChange: (t: ReplyTone) => void;
}

export default function ToneSlider({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-wider text-ink-muted">Tone:</span>
      <div className="flex bg-bg-subtle rounded-md border border-bg-border p-0.5">
        {TONES.map((t) => (
          <button
            key={t}
            onClick={() => onChange(t)}
            className={clsx(
              'px-2.5 py-1 rounded text-[11px] font-medium',
              value === t ? `bg-bg-hover ${TONE_COLOR[t]}` : 'text-ink-secondary hover:bg-bg-hover',
            )}
          >
            {TONE_LABELS[t]}
          </button>
        ))}
      </div>
    </div>
  );
}
