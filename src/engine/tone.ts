// Reply-tone slider — modulates the metric effect of an email choice.
import type { Metrics, ReplyTone } from '../types';

export const TONE_LABELS: Record<ReplyTone, string> = {
  direct: 'Direct',
  corporate: 'Corporate',
  apologetic: 'Apologetic',
  aggressive: 'Aggressive',
};

export const TONE_COLOR: Record<ReplyTone, string> = {
  direct: 'text-accent-blue',
  corporate: 'text-accent-yellow',
  apologetic: 'text-accent-green',
  aggressive: 'text-accent-red',
};

const TONE_DELTA: Record<ReplyTone, Partial<Metrics>> = {
  direct: { trust: 2 },
  corporate: { patience: 2, trust: -1, politics: 4 },
  apologetic: { trust: 4, patience: 2, morale: -2 },
  aggressive: { trust: -4, patience: -3, morale: 3, politics: -3 },
};

export function applyToneToEffect(
  base: Partial<Metrics>,
  tone: ReplyTone,
): Partial<Metrics> {
  const delta = TONE_DELTA[tone];
  const merged: Partial<Metrics> = { ...base };
  (Object.keys(delta) as (keyof Metrics)[]).forEach((k) => {
    merged[k] = (merged[k] ?? 0) + (delta[k] ?? 0);
  });
  return merged;
}

// Rewrite reply text to match tone.
export function rewriteReply(text: string, tone: ReplyTone): string {
  if (tone === 'direct') return text;
  if (tone === 'corporate')
    return `Thanks for flagging — circling back: ${text} Happy to align further if helpful. 🙂`;
  if (tone === 'apologetic')
    return `Sorry for any confusion here. ${text} I appreciate your patience.`;
  if (tone === 'aggressive')
    return `Look — ${text} Let's not relitigate this.`;
  return text;
}
