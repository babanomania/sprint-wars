import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useGame } from '../store/gameStore';
import type { ChatPersona } from '../types';

const PERSONA_TONE: Record<ChatPersona, string> = {
  ceo: 'from-accent-purple to-accent-blue',
  cto: 'from-accent-blue to-accent-green',
  cfo: 'from-accent-yellow to-accent-red',
  'vp-eng': 'from-accent-green to-accent-blue',
  cmo: 'from-accent-red to-accent-purple',
  board: 'from-accent-yellow to-accent-purple',
};

export default function ExecChat() {
  const { chat, pendingPrompt, answerChatPrompt } = useGame();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' });
  }, [chat.length, pendingPrompt]);

  return (
    <div className="flex h-full">
      {/* Channels sidebar — desktop only */}
      <div className="hidden md:block w-60 border-r border-bg-border bg-bg-panel p-3">
        <div className="text-[10px] uppercase tracking-widest text-ink-muted mb-2 px-2">
          Channels
        </div>
        <div className="space-y-1 text-sm">
          <Channel name="# leadership" active />
          <Channel name="# eng-leads" />
          <Channel name="# incidents" muted />
          <Channel name="# random" muted />
        </div>
        <div className="mt-6 text-[10px] uppercase tracking-widest text-ink-muted mb-2 px-2">
          Direct messages
        </div>
        <div className="space-y-1 text-sm">
          <Channel name="• Diane Sterling" />
          <Channel name="• Marcus Vale" />
          <Channel name="• Hank Webber" />
          <Channel name="• Jordan Liu" />
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-bg-base min-w-0">
        <div className="px-4 md:px-5 py-3 border-b border-bg-border">
          <div className="text-sm font-semibold"># leadership</div>
          <div className="text-[11px] text-ink-muted">
            Where good ideas get rounded down to KPIs.
          </div>
        </div>

        <div ref={ref} className="flex-1 overflow-y-auto px-4 md:px-5 py-4 space-y-3">
          <AnimatePresence>
            {chat.map((m) => (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={clsx(
                  'flex gap-3 max-w-2xl',
                  m.fromPlayer && 'flex-row-reverse ml-auto',
                )}
              >
                <div
                  className={clsx(
                    'w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-xs font-semibold shrink-0',
                    m.fromPlayer ? 'bg-bg-subtle' : `${PERSONA_TONE[m.persona]}`,
                  )}
                >
                  {m.fromPlayer ? 'YOU' : m.authorName[0]}
                </div>
                <div className={clsx('rounded-lg px-3 py-2 text-sm min-w-0', m.fromPlayer ? 'bg-accent-blue/20' : 'bg-bg-panel')}>
                  <div className="text-[10px] text-ink-muted mb-0.5">
                    {m.authorName} · S{Math.floor(m.ts / 1000)}·D{m.ts % 1000}
                  </div>
                  <div className="text-ink-primary break-words">{m.text}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {pendingPrompt && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="border-t border-bg-border bg-bg-panel p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={clsx(
                  'w-7 h-7 rounded-full bg-gradient-to-br flex items-center justify-center text-xs font-semibold shrink-0',
                  PERSONA_TONE[pendingPrompt.persona],
                )}
              >
                {pendingPrompt.authorName[0]}
              </div>
              <div className="text-sm">
                <span className="font-semibold">{pendingPrompt.authorName}</span>
                <span className="text-ink-muted ml-2">is asking:</span>
              </div>
            </div>
            <div className="text-sm text-ink-primary mb-3">"{pendingPrompt.question}"</div>
            <div className="grid grid-cols-1 gap-2 max-w-2xl">
              {pendingPrompt.options.map((o) => (
                <button
                  key={o.id}
                  onClick={() => answerChatPrompt(o.id)}
                  className="text-left panel p-3 hover:border-accent-blue text-sm"
                >
                  <div className="text-ink-primary">{o.label}</div>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {Object.entries(o.effect).map(([k, v]) => {
                      if (typeof v !== 'number') return null;
                      const positive =
                        k === 'morale' ||
                        k === 'trust' ||
                        k === 'patience' ||
                        k === 'stability' ||
                        k === 'budget' ||
                        k === 'velocity'
                          ? v > 0
                          : v < 0;
                      return (
                        <span
                          key={k}
                          className={clsx(
                            'pill',
                            positive
                              ? 'bg-accent-green/15 text-accent-green'
                              : 'bg-accent-red/15 text-accent-red',
                          )}
                        >
                          {v > 0 ? '+' : ''}
                          {v} {k}
                        </span>
                      );
                    })}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {!pendingPrompt && (
          <div className="border-t border-bg-border bg-bg-panel px-4 md:px-5 py-3 text-xs text-ink-muted">
            Quiet on this channel. They're typing somewhere else.
          </div>
        )}
      </div>
    </div>
  );
}

function Channel({ name, active, muted }: { name: string; active?: boolean; muted?: boolean }) {
  return (
    <div
      className={clsx(
        'px-2 py-1 rounded text-[13px]',
        active && 'bg-bg-hover text-ink-primary',
        !active && !muted && 'text-ink-secondary hover:bg-bg-subtle cursor-pointer',
        muted && 'text-ink-muted',
      )}
    >
      {name}
    </div>
  );
}
