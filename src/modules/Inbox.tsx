import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useGame } from '../store/gameStore';
import type { Email, EmailTone, ReplyTone } from '../types';
import EffectChips from '../components/ui/EffectChips';
import ToneSlider from '../components/ui/ToneSlider';
import Icon from '../components/ui/Icon';
import { applyToneToEffect, rewriteReply } from '../engine/tone';
import { useIsMobile } from '../hooks/useMediaQuery';

const TONE_BADGE: Record<EmailTone, string> = {
  neutral: 'bg-bg-subtle text-ink-muted',
  panic: 'bg-accent-red/20 text-accent-red',
  'passive-aggressive': 'bg-accent-purple/20 text-accent-purple',
  urgent: 'bg-accent-yellow/20 text-accent-yellow',
  'corporate-cheerful': 'bg-accent-green/20 text-accent-green',
};

function formatBody(body: string) {
  return body.split('\n').map((line, i) => (
    <p key={i} className="mb-2 last:mb-0">
      {line}
    </p>
  ));
}

export default function Inbox() {
  const {
    emails,
    selectedEmailId,
    selectEmail,
    pickEmailChoice,
    ignoreEmail,
    inboxReplyTone,
    setReplyTone,
    undo,
    undoBudget,
    undoLastDecision,
  } = useGame();

  const isMobile = useIsMobile();

  const sorted = [...emails].sort((a, b) => {
    if (a.resolved !== b.resolved) return a.resolved ? 1 : -1;
    return b.receivedSprint * 10 + b.receivedDay - (a.receivedSprint * 10 + a.receivedDay);
  });
  const selected = sorted.find((e) => e.id === selectedEmailId) ?? (isMobile ? undefined : sorted[0]);
  const unread = emails.filter((e) => !e.read).length;
  const canUndo = !!undo && undoBudget > 0 && selected?.id === undo.emailId;

  // On mobile: show list OR detail, not both.
  const showList = !isMobile || !selected;
  const showDetail = !isMobile || !!selected;

  return (
    <div className="flex h-full">
      {showList && (
        <div
          className={clsx(
            'flex flex-col bg-bg-panel',
            isMobile ? 'w-full' : 'w-80 border-r border-bg-border',
          )}
        >
          <div className="px-4 py-3 border-b border-bg-border flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Inbox</div>
              <div className="text-[11px] text-ink-muted">
                {unread} unread · {emails.length} total
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {undo && (
                <button
                  onClick={undoLastDecision}
                  disabled={!canUndo}
                  className="btn-ghost text-[11px] disabled:opacity-50 flex items-center gap-1"
                  title={`Undo last decision (${undoBudget} left this sprint)`}
                >
                  <Icon name="undo" size={12} /> Undo ({undoBudget})
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {sorted.length === 0 && (
              <div className="text-xs text-ink-muted text-center py-10 px-4">
                No emails yet. Quietly enjoy it.
              </div>
            )}
            {sorted.map((e) => (
              <button
                key={e.id}
                onClick={() => selectEmail(e.id)}
                className={clsx(
                  'w-full text-left px-4 py-3 border-b border-bg-border/50 transition-colors',
                  selected?.id === e.id ? 'bg-bg-hover' : 'hover:bg-bg-subtle',
                  !e.read && 'bg-bg-subtle/40',
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span
                    className={clsx(
                      'text-xs truncate flex-1',
                      !e.read ? 'text-ink-primary font-semibold' : 'text-ink-secondary',
                    )}
                  >
                    {e.senderName}
                  </span>
                  <span className="text-[10px] text-ink-muted shrink-0">
                    S{e.receivedSprint}·D{e.receivedDay}
                  </span>
                </div>
                <div
                  className={clsx(
                    'text-xs truncate',
                    !e.read ? 'text-ink-primary font-medium' : 'text-ink-secondary',
                  )}
                >
                  {e.subject}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={clsx('pill', TONE_BADGE[e.tone])}>{e.tone}</span>
                  {e.storylineId && (
                    <span className="pill bg-accent-purple/20 text-accent-purple">arc</span>
                  )}
                  {e.resolved && (
                    <span className="pill bg-bg-base text-ink-muted">resolved</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {showDetail && (
        <div className="flex-1 flex flex-col bg-bg-base overflow-hidden">
          {selected ? (
            <EmailDetail
              email={selected}
              tone={inboxReplyTone}
              onToneChange={setReplyTone}
              onPick={(cid) => pickEmailChoice(selected.id, cid)}
              onIgnore={() => ignoreEmail(selected.id)}
              onBack={isMobile ? () => selectEmail(undefined) : undefined}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-ink-muted text-sm">
              Select an email
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmailDetail({
  email,
  tone,
  onToneChange,
  onPick,
  onIgnore,
  onBack,
}: {
  email: Email;
  tone: ReplyTone;
  onToneChange: (t: ReplyTone) => void;
  onPick: (id: string) => void;
  onIgnore: () => void;
  onBack?: () => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto p-5 md:p-8 max-w-3xl mx-auto w-full">
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden mb-3 -ml-2 px-2 py-1 text-xs flex items-center gap-1 text-ink-secondary"
          >
            ← Back to inbox
          </button>
        )}
        <div className="text-xl md:text-2xl font-semibold mb-4 leading-snug">{email.subject}</div>
        <div className="flex items-center gap-3 pb-4 mb-5 border-b border-bg-border">
          <div className="w-9 h-9 rounded-full bg-accent-blue/30 flex items-center justify-center text-sm font-semibold shrink-0">
            {email.senderName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{email.senderName}</div>
            <div className="text-[11px] text-ink-muted">
              to: you · Sprint {email.receivedSprint} · Day {email.receivedDay}
            </div>
          </div>
          <span className={clsx('pill', TONE_BADGE[email.tone])}>{email.tone}</span>
        </div>

        <div className="text-sm leading-relaxed text-ink-primary whitespace-pre-line mb-8">
          {formatBody(email.body)}
        </div>

        {email.resolved ? (
          <div className="panel p-4 border-l-2 border-accent-green text-sm">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-1">
              Your decision
            </div>
            <div>{email.resolution}</div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <div className="text-[10px] uppercase tracking-wider text-ink-muted">
                How do you respond?
              </div>
              <ToneSlider value={tone} onChange={onToneChange} />
            </div>

            {email.choices.map((c) => {
              const tonedEffect = applyToneToEffect(c.effect, tone);
              const previewReply = rewriteReply(c.label, tone);
              return (
                <button
                  key={c.id}
                  onClick={() => onPick(c.id)}
                  className="w-full text-left panel p-4 hover:border-accent-blue hover:bg-bg-hover transition-colors group"
                >
                  <div className="text-sm font-medium text-ink-primary group-hover:text-accent-blue">
                    {c.label}
                  </div>
                  {tone !== 'direct' && (
                    <div className="text-[11px] italic text-ink-muted mt-1.5 line-clamp-2">
                      Your reply will read: "{previewReply}"
                    </div>
                  )}
                  <div className="mt-2">
                    <EffectChips effect={tonedEffect} />
                  </div>
                  {c.loyaltyDelta && (
                    <div className="text-[11px] text-ink-muted mt-1.5">
                      ↪ {c.loyaltyDelta.amount > 0 ? '+' : ''}
                      {c.loyaltyDelta.amount} loyalty for{' '}
                      {c.loyaltyDelta.specialization ?? c.loyaltyDelta.archetype ?? 'team'}
                    </div>
                  )}
                </button>
              );
            })}
            <button
              onClick={onIgnore}
              className="w-full text-left panel p-3 hover:border-bg-border text-ink-muted text-xs flex items-center gap-2"
            >
              <Icon name="x" size={12} /> Ignore (and feel guilty about it)
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
