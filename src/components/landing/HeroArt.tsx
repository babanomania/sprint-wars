import { motion } from 'framer-motion';

// Self-contained SVG illustration — no external assets. Theme-aware via
// currentColor / Tailwind text utilities for the neutrals; the accent colors
// are read from CSS custom properties so they swap with light/dark.
//
// Composition: a primary "dashboard" panel, a panic email floating in from the
// right, a SEV1 incident toast tucked behind the dashboard, and a soft glow.

export default function HeroArt() {
  return (
    <div className="relative w-full aspect-[5/4] max-w-[560px]">
      {/* Glow */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-[40%] blur-3xl opacity-40 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgb(var(--accent-blue) / 0.5), rgb(var(--accent-purple) / 0.3) 40%, transparent 70%)',
        }}
      />

      {/* Subtle floating animation — once each, then settles */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="relative w-full h-full"
      >
        {/* Back-left: incident toast */}
        <motion.div
          initial={{ opacity: 0, x: -20, rotate: -8 }}
          animate={{ opacity: 1, x: 0, rotate: -6 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="absolute left-[2%] top-[18%] w-[44%]"
        >
          <IncidentToast />
        </motion.div>

        {/* Center: main dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="absolute left-[10%] top-[8%] w-[80%]"
        >
          <DashboardCard />
        </motion.div>

        {/* Front-right: panic email */}
        <motion.div
          initial={{ opacity: 0, x: 20, rotate: 8 }}
          animate={{ opacity: 1, x: 0, rotate: 6 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="absolute right-[0%] bottom-[6%] w-[50%]"
        >
          <EmailCard />
        </motion.div>

        {/* Floating chips */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.85 }}
          className="absolute right-[12%] top-[2%]"
        >
          <Chip color="green" label="Sprint #4" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.95 }}
          className="absolute left-[2%] bottom-[20%]"
        >
          <Chip color="red" label="SEV1" pulse />
        </motion.div>
      </motion.div>
    </div>
  );
}

// ============================================================================
function DashboardCard() {
  return (
    <div className="rounded-xl bg-bg-panel border border-bg-border shadow-2xl shadow-black/30 overflow-hidden">
      {/* Window chrome */}
      <div className="px-3 py-2 flex items-center gap-1.5 border-b border-bg-border bg-bg-subtle/60">
        <span className="w-2.5 h-2.5 rounded-full bg-accent-red/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-accent-yellow/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-accent-green/70" />
        <span className="ml-3 text-[9px] uppercase tracking-wider text-ink-muted">
          sprint-wars · em console
        </span>
      </div>
      <div className="p-3">
        {/* Top stats row */}
        <div className="flex items-center justify-between mb-2.5 text-[9px] uppercase tracking-wider text-ink-muted">
          <span>Sprint 4 · Day 3</span>
          <span className="text-accent-green">● connected</span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <Tile label="Velocity" value="12" tone="blue" />
          <Tile label="Morale" value="68" tone="green" />
          <Tile label="Tech Debt" value="42%" tone="yellow" />
        </div>

        {/* Velocity sparkline */}
        <div className="bg-bg-subtle rounded-md p-2 mb-3">
          <div className="text-[9px] uppercase tracking-wider text-ink-muted mb-1">
            Velocity trend
          </div>
          <svg viewBox="0 0 200 36" className="w-full h-9" preserveAspectRatio="none">
            <defs>
              <linearGradient id="velFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(var(--accent-blue))" stopOpacity="0.4" />
                <stop offset="100%" stopColor="rgb(var(--accent-blue))" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,28 L20,22 L40,26 L60,18 L80,20 L100,12 L120,16 L140,8 L160,14 L180,6 L200,10"
              fill="none"
              stroke="rgb(var(--accent-blue))"
              strokeWidth="1.5"
            />
            <path
              d="M0,28 L20,22 L40,26 L60,18 L80,20 L100,12 L120,16 L140,8 L160,14 L180,6 L200,10 L200,36 L0,36 Z"
              fill="url(#velFill)"
            />
          </svg>
        </div>

        {/* Mini kanban */}
        <div className="grid grid-cols-3 gap-1.5">
          <KanbanCol title="Backlog" count={6} tone="ink-secondary">
            <Ticket priority="med" title="OAuth flow" />
            <Ticket priority="low" title="CSV export" />
          </KanbanCol>
          <KanbanCol title="In Progress" count={3} tone="accent-blue">
            <Ticket priority="high" title="Billing bug" rushed />
            <Ticket priority="med" title="Audit log" />
          </KanbanCol>
          <KanbanCol title="QA" count={2} tone="accent-purple">
            <Ticket priority="med" title="SSO retest" />
          </KanbanCol>
        </div>
      </div>
    </div>
  );
}

function Tile({ label, value, tone }: { label: string; value: string; tone: 'blue' | 'green' | 'yellow' }) {
  const colorMap: Record<typeof tone, string> = {
    blue: 'text-accent-blue',
    green: 'text-accent-green',
    yellow: 'text-accent-yellow',
  };
  return (
    <div className="bg-bg-subtle rounded-md p-2">
      <div className="text-[9px] uppercase tracking-wider text-ink-muted">{label}</div>
      <div className={`text-base font-bold ${colorMap[tone]}`}>{value}</div>
    </div>
  );
}

function KanbanCol({
  title,
  count,
  tone,
  children,
}: {
  title: string;
  count: number;
  tone: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-bg-subtle rounded-md p-1.5">
      <div className={`flex items-center justify-between mb-1 text-[9px] uppercase tracking-wider text-${tone}`}>
        <span>{title}</span>
        <span className="text-ink-muted">{count}</span>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Ticket({
  title,
  priority,
  rushed,
}: {
  title: string;
  priority: 'low' | 'med' | 'high';
  rushed?: boolean;
}) {
  const priColor =
    priority === 'high' ? 'bg-accent-red' : priority === 'med' ? 'bg-accent-yellow' : 'bg-accent-blue';
  return (
    <div className="bg-bg-panel border border-bg-border rounded p-1.5 text-[9px]">
      <div className="flex items-center gap-1 mb-0.5">
        <span className={`w-1 h-1 rounded-full ${priColor}`} />
        <span className="text-ink-primary truncate">{title}</span>
      </div>
      {rushed && (
        <span className="inline-block text-[7px] px-1 py-px rounded bg-accent-red/20 text-accent-red">
          ⚡ rushed
        </span>
      )}
    </div>
  );
}

// ============================================================================
function EmailCard() {
  return (
    <div className="rounded-lg bg-bg-panel border border-bg-border shadow-xl shadow-black/30 p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center text-[10px] font-semibold text-white">
          DS
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold truncate">Diane Sterling (CEO)</div>
          <div className="text-[8px] text-ink-muted">just now · to: you</div>
        </div>
        <span className="text-[8px] uppercase tracking-wider px-1.5 py-px rounded bg-accent-yellow/20 text-accent-yellow">
          urgent
        </span>
      </div>
      <div className="text-[10px] font-medium text-ink-primary mb-1.5">
        Re: AI integration — must ship by Friday
      </div>
      <div className="text-[9px] text-ink-secondary leading-snug line-clamp-2">
        I was at a dinner last night and our top three competitors all have AI. We need it
        shipped by Friday…
      </div>
      <div className="flex gap-1 mt-2">
        <span className="text-[8px] px-1.5 py-px rounded bg-accent-red/15 text-accent-red">
          +12 debt
        </span>
        <span className="text-[8px] px-1.5 py-px rounded bg-accent-red/15 text-accent-red">
          +8 burnout
        </span>
        <span className="text-[8px] px-1.5 py-px rounded bg-accent-green/15 text-accent-green">
          +8 trust
        </span>
      </div>
    </div>
  );
}

// ============================================================================
function IncidentToast() {
  return (
    <div className="rounded-lg bg-bg-panel border border-bg-border border-l-4 border-l-accent-red shadow-xl shadow-black/30 p-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-[8px] uppercase tracking-wider px-1.5 py-px rounded bg-accent-red text-white">
          SEV1
        </span>
        <span className="text-[9px] font-mono text-ink-muted">INC-1042</span>
      </div>
      <div className="text-[10px] font-medium text-ink-primary mb-1">
        Checkout 5xx spike — global
      </div>
      <div className="text-[8px] text-ink-muted">
        7 min · 4 pages · est. $25,000
      </div>
    </div>
  );
}

// ============================================================================
function Chip({
  color,
  label,
  pulse,
}: {
  color: 'green' | 'red' | 'blue';
  label: string;
  pulse?: boolean;
}) {
  const map = {
    green: 'bg-accent-green/20 text-accent-green border-accent-green/30',
    red: 'bg-accent-red/25 text-accent-red border-accent-red/40',
    blue: 'bg-accent-blue/20 text-accent-blue border-accent-blue/30',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border backdrop-blur-sm text-[10px] font-medium ${map[color]}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          color === 'red' ? 'bg-accent-red' : color === 'green' ? 'bg-accent-green' : 'bg-accent-blue'
        } ${pulse ? 'animate-pulse' : ''}`}
      />
      {label}
    </span>
  );
}
