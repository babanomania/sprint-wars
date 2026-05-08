import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../store/gameStore';
import type { Incident, IncidentSeverity } from '../types';
import { useIsMobile } from '../hooks/useMediaQuery';

const SEV_TONE: Record<IncidentSeverity, string> = {
  SEV1: 'bg-accent-red text-white',
  SEV2: 'bg-accent-red/30 text-accent-red',
  SEV3: 'bg-accent-yellow/30 text-accent-yellow',
  SEV4: 'bg-bg-subtle text-ink-secondary',
};

export default function Incidents() {
  const { incidents, systems, resolveIncident, selectedIncidentId, selectIncident } = useGame();
  const isMobile = useIsMobile();
  const selected = incidents.find((i) => i.id === selectedIncidentId) ?? (isMobile ? undefined : incidents[0]);
  const open = incidents.filter((i) => i.status === 'open');
  const mitigating = incidents.filter((i) => i.status === 'mitigating');
  const resolved = incidents.filter((i) => i.status === 'resolved' || i.status === 'rolled-back');

  const showList = !isMobile || !selected;
  const showDetail = !isMobile || !!selected;

  return (
    <div className="p-4 md:p-6 space-y-4 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-ink-muted">INCIDENT COMMAND</div>
          <h1 className="text-xl md:text-2xl font-semibold">Incident Center</h1>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="pill bg-accent-red/15 text-accent-red">{open.length} open</span>
          <span className="pill bg-accent-yellow/15 text-accent-yellow">{mitigating.length} mitigating</span>
          <span className="pill bg-accent-green/15 text-accent-green">{resolved.length} resolved</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 flex-1 min-h-0">
        {showList && (
          <div className="md:col-span-7 panel p-3 overflow-y-auto">
            <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-2 px-1">All incidents</div>
            <AnimatePresence>
              {incidents.length === 0 ? (
                <div className="py-12 text-center text-sm text-ink-muted">
                  No incidents. Production is up. Don't speak its name.
                </div>
              ) : (
                incidents.map((inc) => {
                  const sys = systems.find((s) => s.id === inc.systemId);
                  return (
                    <motion.button
                      key={inc.id}
                      layout
                      onClick={() => selectIncident(inc.id)}
                      className={clsx(
                        'w-full text-left p-3 mb-2 rounded-md border transition-colors',
                        selected?.id === inc.id
                          ? 'border-accent-blue bg-bg-subtle'
                          : 'border-bg-border bg-bg-base hover:bg-bg-subtle',
                      )}
                    >
                      <div className="flex items-start justify-between mb-1 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={clsx('pill', SEV_TONE[inc.severity])}>{inc.severity}</span>
                          <span className="text-xs font-mono text-ink-muted truncate">{inc.id}</span>
                        </div>
                        <span
                          className={clsx(
                            'pill shrink-0',
                            inc.status === 'open' && 'bg-accent-red/15 text-accent-red',
                            inc.status === 'mitigating' && 'bg-accent-yellow/15 text-accent-yellow',
                            inc.status === 'resolved' && 'bg-accent-green/15 text-accent-green',
                            inc.status === 'rolled-back' && 'bg-accent-purple/15 text-accent-purple',
                          )}
                        >
                          {inc.status}
                          {inc.status === 'open' && (
                            <span className="ml-1 w-1.5 h-1.5 rounded-full bg-accent-red animate-blink inline-block" />
                          )}
                        </span>
                      </div>
                      <div className="text-sm text-ink-primary">{inc.title}</div>
                      <div className="text-[11px] text-ink-muted mt-1">
                        {sys?.name ?? '?'} · {Math.floor(inc.ageMinutes / 60)}h {inc.ageMinutes % 60}m · est. $
                        {inc.cost.toLocaleString()}
                      </div>
                    </motion.button>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        )}

        {showDetail && (
          <div className="md:col-span-5 panel p-5 overflow-y-auto">
            {selected ? (
              <IncidentDetail
                incident={selected}
                onResolve={(a) => resolveIncident(selected.id, a)}
                onBack={isMobile ? () => selectIncident(undefined) : undefined}
              />
            ) : (
              <div className="text-sm text-ink-muted text-center py-10">No incident selected.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function IncidentDetail({
  incident,
  onResolve,
  onBack,
}: {
  incident: Incident;
  onResolve: (action: 'rollback' | 'hotfix' | 'ignore' | 'rca') => void;
  onBack?: () => void;
}) {
  const { systems } = useGame();
  const sys = systems.find((s) => s.id === incident.systemId);
  return (
    <div>
      {onBack && (
        <button onClick={onBack} className="md:hidden mb-2 -ml-2 px-2 py-1 text-xs text-ink-secondary">
          ← Back
        </button>
      )}
      <div className="flex items-center gap-2 mb-1">
        <span className={clsx('pill', SEV_TONE[incident.severity])}>{incident.severity}</span>
        <span className="text-xs font-mono text-ink-muted">{incident.id}</span>
      </div>
      <h2 className="text-lg font-semibold mb-3">{incident.title}</h2>
      <div className="grid grid-cols-2 gap-3 text-xs mb-5">
        <Field label="Affected system" value={sys?.name ?? '?'} />
        <Field label="Age" value={`${Math.floor(incident.ageMinutes / 60)}h`} />
        <Field label="Pages" value={String(incident.pageOps)} />
        <Field label="Est. cost" value={`$${incident.cost.toLocaleString()}`} />
      </div>

      <div className="text-sm text-ink-secondary mb-5">{incident.description}</div>

      {incident.status !== 'resolved' && incident.status !== 'rolled-back' ? (
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-1">Response</div>
          <ActionRow
            label="Rollback last deploy"
            sub="Restores stability. Loses recent work. (-2 velocity)"
            onClick={() => onResolve('rollback')}
            tone="blue"
          />
          <ActionRow
            label="Hot-fix in production"
            sub="Mitigates fast. +6 tech debt, +4 burnout."
            onClick={() => onResolve('hotfix')}
            tone="yellow"
          />
          <ActionRow
            label="Declare RCA"
            sub="+6 trust. -2 morale. Generates a real RCA document."
            onClick={() => onResolve('rca')}
            tone="green"
          />
          <ActionRow
            label="Ignore"
            sub="-8 stability, -4 trust. The dashboards are red but nobody's paged in 12 minutes."
            onClick={() => onResolve('ignore')}
            tone="red"
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="panel p-3 text-xs border-l-2 border-accent-green">
            Resolution: <span className="text-ink-primary">{incident.resolution}</span>
            {incident.rcaPosted && (
              <span className="ml-2 pill bg-accent-blue/20 text-accent-blue">RCA posted</span>
            )}
          </div>
          {incident.rcaText && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="panel p-4 bg-bg-subtle"
            >
              <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-2">
                Generated RCA — confluence-ready
              </div>
              <pre className="text-xs text-ink-secondary leading-relaxed whitespace-pre-wrap font-sans">
{incident.rcaText}
              </pre>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

function ActionRow({
  label,
  sub,
  onClick,
  tone,
}: {
  label: string;
  sub: string;
  onClick: () => void;
  tone: 'blue' | 'yellow' | 'green' | 'red';
}) {
  const map: Record<typeof tone, string> = {
    blue: 'hover:border-accent-blue',
    yellow: 'hover:border-accent-yellow',
    green: 'hover:border-accent-green',
    red: 'hover:border-accent-red',
  };
  return (
    <button onClick={onClick} className={clsx('w-full text-left panel p-3 transition-colors', map[tone])}>
      <div className="text-sm font-medium">{label}</div>
      <div className="text-[11px] text-ink-muted">{sub}</div>
    </button>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-bg-subtle rounded-md p-2">
      <div className="text-[10px] uppercase tracking-wider text-ink-muted">{label}</div>
      <div className="text-ink-primary">{value}</div>
    </div>
  );
}
