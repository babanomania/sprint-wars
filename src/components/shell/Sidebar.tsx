import { useGame } from '../../store/gameStore';
import type { ModuleId } from '../../types';
import clsx from 'clsx';
import { motion, useAnimationControls, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import ThemeToggle from './ThemeToggle';
import Icon, { type IconName } from '../ui/Icon';

interface NavItem {
  id: ModuleId;
  label: string;
  icon: IconName;
  alert?: boolean;
  trigger?: number;
  badge?: number | null;
  badgeTone?: 'red' | 'yellow' | 'blue';
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: Props) {
  const {
    module,
    setModule,
    emails,
    incidents,
    pendingPrompt,
    candidates,
    metrics,
    runConfig,
    setAppPhase,
  } = useGame();

  const unreadEmails = emails.filter((e) => !e.read).length;
  const panicEmails = emails.filter(
    (e) => !e.read && (e.tone === 'panic' || e.tone === 'urgent'),
  ).length;
  const activeIncidents = incidents.filter(
    (i) => i.status === 'open' || i.status === 'mitigating',
  ).length;
  const sev1 = incidents.filter((i) => i.severity === 'SEV1' && i.status !== 'resolved').length;

  const items: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'sprint', label: 'Sprint Board', icon: 'kanban' },
    {
      id: 'inbox',
      label: 'Inbox',
      icon: 'inbox',
      badge: unreadEmails || null,
      badgeTone: panicEmails > 0 ? 'red' : 'blue',
      alert: panicEmails > 0,
      trigger: unreadEmails,
    },
    {
      id: 'incidents',
      label: 'Incidents',
      icon: 'alert',
      badge: activeIncidents || null,
      badgeTone: sev1 > 0 ? 'red' : 'yellow',
      alert: sev1 > 0,
      trigger: activeIncidents,
    },
    { id: 'team', label: 'Team', icon: 'users' },
    { id: 'hire', label: 'Hire', icon: 'plus', badge: candidates.length || null, badgeTone: 'blue' },
    { id: 'architecture', label: 'Architecture', icon: 'network' },
    { id: 'metrics', label: 'Metrics', icon: 'chart' },
    {
      id: 'chat',
      label: 'Executive Chat',
      icon: 'chat',
      badge: pendingPrompt ? 1 : null,
      badgeTone: 'blue',
      alert: !!pendingPrompt,
      trigger: pendingPrompt ? 1 : 0,
    },
  ];

  const handlePick = (id: ModuleId) => {
    setModule(id);
    onClose(); // closes drawer on mobile; harmless on desktop
  };

  return (
    <>
      {/* Backdrop on mobile */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-30 bg-black/60 md:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={clsx(
          'shrink-0 bg-bg-panel border-r border-bg-border flex flex-col transition-transform duration-200 ease-out',
          // Mobile: fixed slide-in drawer
          'fixed md:static inset-y-0 left-0 z-40 w-64 md:w-56',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        <div className="px-4 py-4 border-b border-bg-border">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setAppPhase('landing');
                onClose();
              }}
              className="w-8 h-8 rounded-md bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center font-bold text-sm text-white hover:opacity-90"
              title="Back to title"
            >
              SW
            </button>
            <div className="flex-1">
              <div className="text-sm font-semibold leading-tight">Sprint Wars</div>
              <div className="text-[10px] uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                <span>v1.0</span>
                <span className="px-1 py-px rounded bg-accent-yellow/20 text-accent-yellow text-[8px]">
                  BETA
                </span>
              </div>
            </div>
            <ThemeToggle compact />
            <button
              onClick={onClose}
              className="md:hidden w-8 h-8 rounded-md flex items-center justify-center text-ink-secondary hover:bg-bg-subtle"
              aria-label="Close menu"
            >
              <Icon name="x" size={16} />
            </button>
          </div>
        </div>

        <nav className="flex-1 py-2 overflow-y-auto">
          {items.map((it) => (
            <SidebarItem
              key={it.id}
              item={it}
              active={module === it.id}
              onClick={() => handlePick(it.id)}
            />
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-bg-border">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-1.5">
            Politics axis
          </div>
          <div className="relative h-1.5 bg-bg-subtle rounded-full overflow-hidden">
            <div
              className="absolute top-0 bottom-0 w-px bg-bg-border"
              style={{ left: '50%' }}
            />
            <div
              className={clsx(
                'absolute top-0 bottom-0 transition-all',
                metrics.politics >= 0 ? 'bg-accent-blue' : 'bg-accent-red',
              )}
              style={
                metrics.politics >= 0
                  ? { left: '50%', width: `${Math.min(50, metrics.politics / 2)}%` }
                  : { right: '50%', width: `${Math.min(50, -metrics.politics / 2)}%` }
              }
            />
          </div>
          <div className="flex justify-between text-[9px] text-ink-muted mt-1">
            <span>Eng-aligned</span>
            <span>Product-aligned</span>
          </div>
        </div>

        <button
          onClick={() => {
            setAppPhase('landing');
            onClose();
          }}
          className="px-4 py-3 text-xs flex items-center gap-2 text-ink-muted hover:bg-bg-subtle hover:text-ink-primary border-t border-bg-border transition-colors"
          title="Run is auto-saved. You can resume from the title."
        >
          <Icon name="logout" size={14} />
          <span>Back to title</span>
        </button>

        <div className="px-4 py-3 text-[10px] text-ink-muted border-t border-bg-border space-y-0.5">
          <div className="capitalize">Run: {runConfig.modifierId.replace(/-/g, ' ')}</div>
          <div className="text-accent-green">● Connected to JiraSync™</div>
        </div>
      </aside>
    </>
  );
}

function SidebarItem({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
}) {
  const controls = useAnimationControls();
  const prevTrigger = useRef<number>(item.trigger ?? 0);

  useEffect(() => {
    const cur = item.trigger ?? 0;
    if (cur > prevTrigger.current) {
      controls.start({
        x: [0, -3, 3, -2, 2, 0],
        transition: { duration: 0.45, ease: 'easeInOut' },
      });
    }
    prevTrigger.current = cur;
  }, [item.trigger, controls]);

  return (
    <motion.button
      onClick={onClick}
      animate={controls}
      className={clsx(
        // Bigger touch target on mobile
        'w-full text-left px-4 py-3 md:py-2 flex items-center gap-3 text-sm transition-colors',
        active
          ? 'bg-bg-hover text-ink-primary border-l-2 border-accent-blue'
          : 'text-ink-secondary hover:bg-bg-subtle hover:text-ink-primary border-l-2 border-transparent',
      )}
    >
      <span className="relative">
        <Icon
          name={item.icon}
          size={16}
          className={clsx(
            active && 'text-accent-blue',
            !active && item.alert && 'text-accent-red',
          )}
        />
        {item.alert && (
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-accent-red animate-pulse" />
        )}
      </span>
      <span className="flex-1">{item.label}</span>
      {item.badge ? (
        <span
          className={clsx(
            'pill',
            item.badgeTone === 'red' && 'bg-accent-red text-white',
            item.badgeTone === 'yellow' && 'bg-accent-yellow/20 text-accent-yellow',
            item.badgeTone === 'blue' && 'bg-accent-blue/20 text-accent-blue',
          )}
        >
          {item.badge}
        </span>
      ) : null}
    </motion.button>
  );
}
