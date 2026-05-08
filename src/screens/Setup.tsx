import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../store/gameStore';
import { RUN_MODIFIERS, RUN_GOAL_LABEL, RUN_GOAL_QUARTERS } from '../data/modifiers';
import { ARCHETYPES, DRAFT_POOL } from '../data/archetypes';
import type { Archetype, RunModifierId } from '../types';
import clsx from 'clsx';
import ThemeToggle from '../components/shell/ThemeToggle';
import Icon from '../components/ui/Icon';

const TEAM_SIZE = 6;

export default function Setup() {
  const { startNewRun, resetEverything } = useGame();
  const [modifierId, setModifierId] = useState<RunModifierId>('classic');
  const [picks, setPicks] = useState<Archetype[]>([]);
  const [step, setStep] = useState<'modifier' | 'draft'>('modifier');

  const togglePick = (a: Archetype) => {
    setPicks((p) => (p.includes(a) ? p.filter((x) => x !== a) : p.length < TEAM_SIZE ? [...p, a] : p));
  };

  const canStart = picks.length === TEAM_SIZE;

  const begin = () => {
    startNewRun({
      modifierId,
      pickedArchetypes: picks,
      goalQuarters: RUN_GOAL_QUARTERS[modifierId] ?? 12,
    });
  };

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="flex items-center justify-between mb-6 md:mb-8 gap-3">
          <button onClick={() => resetEverything()} className="text-xs text-ink-muted hover:text-ink-primary shrink-0">
            ← Back to title
          </button>
          <div className="flex items-center gap-2 md:gap-3 flex-wrap justify-end">
            <Step active={step === 'modifier'} done={step !== 'modifier'} label="1. Run setup" />
            <span className="text-ink-muted">→</span>
            <Step active={step === 'draft'} done={false} label="2. Team draft" />
            <ThemeToggle compact />
          </div>
        </div>

        {step === 'modifier' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold mb-1">Pick your starting conditions</h1>
            <p className="text-ink-secondary mb-8">
              Each modifier tilts your starting metrics, win condition, and which storyline kicks off in sprint 1.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {RUN_MODIFIERS.map((m) => {
                const active = m.id === modifierId;
                return (
                  <button
                    key={m.id}
                    onClick={() => setModifierId(m.id)}
                    className={clsx(
                      'panel p-4 text-left transition-all',
                      active && 'border-accent-blue glow-blue',
                    )}
                  >
                    <div className="font-semibold mb-1">{m.name}</div>
                    <div className="text-xs text-ink-secondary leading-relaxed mb-3">{m.blurb}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(m.metricDeltas).map(([k, v]) => (
                        <span
                          key={k}
                          className={clsx(
                            'pill',
                            (v as number) > 0
                              ? 'bg-accent-green/20 text-accent-green'
                              : 'bg-accent-red/20 text-accent-red',
                          )}
                        >
                          {(v as number) > 0 ? '+' : ''}
                          {v} {k}
                        </span>
                      ))}
                    </div>
                    <div className="text-[11px] text-ink-muted mt-3 flex items-start gap-1.5">
                      <Icon name="target" size={12} className="mt-0.5 text-accent-yellow" />
                      <span>{RUN_GOAL_LABEL[m.id]}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end mt-8">
              <button onClick={() => setStep('draft')} className="btn-primary px-5 py-2.5">
                Next: Draft your team →
              </button>
            </div>
          </motion.div>
        )}

        {step === 'draft' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold mb-1">Draft your team</h1>
            <p className="text-ink-secondary mb-2">
              Pick {TEAM_SIZE} archetypes from the pool. Pick wisely — chemistry matters.
            </p>
            <p className="text-xs text-ink-muted mb-6">
              Selected: {picks.length}/{TEAM_SIZE}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {DRAFT_POOL.map((a) => {
                const spec = ARCHETYPES[a];
                const active = picks.includes(a);
                return (
                  <button
                    key={a}
                    onClick={() => togglePick(a)}
                    className={clsx(
                      'panel p-4 text-left transition-all',
                      active ? 'border-accent-blue glow-blue' : 'hover:border-bg-hover',
                    )}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <div className="font-semibold">{spec.title}</div>
                        <div className="text-[11px] text-ink-muted capitalize">
                          {spec.base.specialization}
                        </div>
                      </div>
                      {active && (
                        <span className="pill bg-accent-blue text-white">picked</span>
                      )}
                    </div>
                    <div className="text-xs text-ink-secondary italic mb-3">"{spec.blurb}"</div>
                    <div className="grid grid-cols-3 gap-1 text-[10px]">
                      <Stat l="skill" v={spec.base.skill} />
                      <Stat l="prod" v={spec.base.productivity} />
                      <Stat l="ego" v={spec.base.ego} />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between mt-8">
              <button onClick={() => setStep('modifier')} className="btn-ghost">
                ← Back
              </button>
              <button onClick={begin} className="btn-primary px-5 py-2.5 flex items-center gap-2" disabled={!canStart}>
                <Icon name="play" size={14} /> Start Sprint 1
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Step({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <span
      className={clsx(
        'text-xs',
        active && 'text-accent-blue font-semibold',
        done && 'text-ink-secondary',
        !active && !done && 'text-ink-muted',
      )}
    >
      {label}
    </span>
  );
}

function Stat({ l, v }: { l: string; v: number }) {
  return (
    <div className="bg-bg-subtle rounded px-1.5 py-1">
      <div className="text-ink-muted">{l}</div>
      <div className="text-ink-primary font-medium">{v}</div>
    </div>
  );
}
