import { useGame } from '../store/gameStore';
import type { Developer, Task, TaskStatus } from '../types';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { previewAssign, previewRush } from '../engine/probability';
import Icon from '../components/ui/Icon';

const COLUMNS: { id: TaskStatus; label: string; tone: string }[] = [
  { id: 'backlog', label: 'Backlog', tone: 'text-ink-secondary' },
  { id: 'in-progress', label: 'In Progress', tone: 'text-accent-blue' },
  { id: 'qa', label: 'QA', tone: 'text-accent-purple' },
  { id: 'done', label: 'Done', tone: 'text-accent-green' },
  { id: 'blocked', label: 'Blocked', tone: 'text-accent-red' },
];

const PRIORITY_TONE: Record<Task['priority'], string> = {
  low: 'bg-bg-subtle text-ink-muted',
  medium: 'bg-accent-blue/15 text-accent-blue',
  high: 'bg-accent-yellow/15 text-accent-yellow',
  critical: 'bg-accent-red/15 text-accent-red',
};

const TYPE_ICON: Record<Task['type'], string> = {
  feature: '✦',
  bug: '✕',
  'tech-debt': '⚙',
  security: '⚷',
  'incident-fix': '⚠',
};

export default function SprintBoard() {
  const {
    tasks,
    team,
    moveTask,
    rushTask,
    deferTask,
    assignTask,
    selectedTaskId,
    selectTask,
    planning,
  } = useGame();

  const [draggedId, setDraggedId] = useState<string | null>(null);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);
  const tasksByStatus = COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks.filter((t) => t.status === col.id);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  const committed = planning?.taskIds ?? [];

  return (
    <div className="p-4 md:p-6 flex flex-col h-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-3 md:mb-4">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-ink-muted">
            JIRA-COMPATIBLE BOARD
          </div>
          <h1 className="text-xl md:text-2xl font-semibold">Sprint Board</h1>
        </div>
        <div className="text-xs text-ink-muted flex flex-wrap gap-2 items-center">
          <span>
            {tasks.length} total · {tasks.filter((t) => t.rushed).length} rushed
          </span>
          {planning && (
            <span className="pill bg-accent-blue/15 text-accent-blue">
              committed: {planning.committedPoints} pts
            </span>
          )}
        </div>
      </div>

      {/* On mobile, columns are 80%-width and scroll horizontally with snap.
          On md+, the standard 5-column kanban grid. */}
      <div className="md:grid md:grid-cols-5 md:gap-3 flex md:flex-none gap-3 overflow-x-auto md:overflow-hidden snap-x snap-mandatory pb-2 md:pb-0 -mx-4 md:mx-0 px-4 md:px-0 flex-1 min-h-0">
        {COLUMNS.map((col) => {
          const items = tasksByStatus[col.id];
          return (
            <div
              key={col.id}
              className="flex flex-col min-h-0 panel shrink-0 w-[80%] md:w-auto snap-start"
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDrop={() => {
                if (draggedId) {
                  moveTask(draggedId, col.id);
                  setDraggedId(null);
                }
              }}
            >
              <div className="px-3 py-2 border-b border-bg-border flex items-center justify-between">
                <div className={clsx('text-xs font-semibold uppercase tracking-wider', col.tone)}>
                  {col.label}
                </div>
                <div className="text-xs text-ink-muted">{items.length}</div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                <AnimatePresence>
                  {items.map((t) => {
                    const assignee = team.find((d) => d.id === t.assigneeId);
                    const isCommitted = committed.includes(t.id);
                    return (
                      <motion.div
                        key={t.id}
                        layout
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        draggable
                        onDragStart={() => setDraggedId(t.id)}
                        onDragEnd={() => setDraggedId(null)}
                        onClick={() => selectTask(t.id)}
                        className={clsx(
                          'bg-bg-subtle rounded-md p-2.5 text-xs cursor-pointer hover:bg-bg-hover border',
                          selectedTaskId === t.id ? 'border-accent-blue' : 'border-transparent',
                          isCommitted && 'ring-1 ring-accent-blue/40',
                        )}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5 text-ink-muted text-[10px] font-mono">
                            <span>{TYPE_ICON[t.type]}</span>
                            <span>{t.id}</span>
                            {isCommitted && <span className="text-accent-blue">★</span>}
                          </div>
                          <span className={clsx('pill', PRIORITY_TONE[t.priority])}>
                            {t.priority[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="text-ink-primary leading-snug">{t.title}</div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1.5">
                            <span className="pill bg-bg-base text-ink-secondary border border-bg-border">
                              {t.storyPoints} pts
                            </span>
                            {t.rushed && (
                              <span className="pill bg-accent-red/20 text-accent-red flex items-center gap-0.5">
                                <Icon name="bolt" size={10} /> rushed
                              </span>
                            )}
                            {t.complexityRevealed && (
                              <span className="pill bg-accent-purple/20 text-accent-purple" title="Hidden complexity has been discovered">
                                🕳 {Math.round(t.hiddenComplexity * 100)}%
                              </span>
                            )}
                          </div>
                          {assignee && (
                            <div className="w-5 h-5 rounded-full bg-accent-blue/30 text-[10px] flex items-center justify-center">
                              {assignee.name[0]}
                            </div>
                          )}
                        </div>
                        {t.status === 'in-progress' && (
                          <div className="meter mt-2">
                            <div className="bg-accent-blue" style={{ width: `${t.progress}%` }} />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {items.length === 0 && (
                  <div className="text-[11px] text-ink-muted text-center py-6">Drop tasks here</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedTask && (
        <TaskDetailDrawer
          task={selectedTask}
          team={team}
          onClose={() => selectTask(undefined)}
          onAssign={(id, devId) => assignTask(id, devId)}
          onMove={(id, status) => moveTask(id, status)}
          onRush={(id) => rushTask(id)}
          onDefer={(id) => deferTask(id)}
        />
      )}
    </div>
  );
}

interface DrawerProps {
  task: Task;
  team: Developer[];
  onClose: () => void;
  onAssign: (id: string, devId: string | undefined) => void;
  onMove: (id: string, status: TaskStatus) => void;
  onRush: (id: string) => void;
  onDefer: (id: string) => void;
}

function TaskDetailDrawer({ task, team, onClose, onAssign, onMove, onRush, onDefer }: DrawerProps) {
  const assignedDev = team.find((d) => d.id === task.assigneeId);
  const rushPreview = previewRush(task);
  const assignPreview = previewAssign(assignedDev, task);

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28 }}
      className="fixed right-0 top-14 bottom-0 w-full sm:w-96 panel border-l border-bg-border z-30 p-5 overflow-y-auto"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-[10px] font-mono text-ink-muted">{task.id}</div>
          <div className="text-base font-semibold mt-1">{task.title}</div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="text-ink-muted hover:text-ink-primary"
        >
          <Icon name="x" size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5 text-xs">
        <Field label="Type" value={task.type} />
        <Field label="Priority" value={task.priority} />
        <Field label="Story Points" value={String(task.storyPoints)} />
        <Field label="Source" value={task.source} />
        <Field
          label="Hidden complexity"
          value={
            task.complexityRevealed
              ? `${Math.round(task.hiddenComplexity * 100)}%`
              : 'unknown'
          }
        />
        <Field label="Bug probability" value={`${Math.round(task.bugProbability * 100)}%`} />
      </div>

      {!task.complexityRevealed && (
        <div className="text-[11px] text-accent-yellow bg-accent-yellow/10 rounded p-2 mb-4">
          🕳 Hidden complexity is concealed until work begins. The estimate may be off by ±50%.
        </div>
      )}

      <div className="mb-5">
        <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-1.5">Assignee</div>
        <select
          value={task.assigneeId ?? ''}
          onChange={(e) => onAssign(task.id, e.target.value || undefined)}
          className="w-full bg-bg-subtle border border-bg-border rounded-md px-2 py-1.5 text-sm"
        >
          <option value="">— Unassigned —</option>
          {team
            .filter((d) => d.status !== 'resigned')
            .map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.title})
              </option>
            ))}
        </select>
        {assignedDev && task.status === 'in-progress' && (
          <div className="mt-2 text-[11px] text-ink-secondary">
            ETA <span className="text-ink-primary font-medium">~{assignPreview.daysToShip} day{assignPreview.daysToShip !== 1 ? 's' : ''}</span>
            {' · '}
            bug risk on completion <span className="text-ink-primary font-medium">{assignPreview.bugChance}%</span>
          </div>
        )}
      </div>

      <div className="mb-5">
        <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-1.5">Move to</div>
        <div className="grid grid-cols-3 gap-1.5">
          {(['backlog', 'in-progress', 'qa', 'done', 'blocked'] as TaskStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => onMove(task.id, s)}
              className={clsx(
                'btn-ghost text-[11px]',
                task.status === s && 'border-accent-blue text-accent-blue',
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <button
            onClick={() => onRush(task.id)}
            disabled={task.rushed}
            className="btn-danger w-full disabled:opacity-50 flex items-center justify-center gap-1.5"
            title={`Rushing increases bug chance by ${rushPreview.bugChance} pts and adds tech debt.`}
          >
            <Icon name="bolt" size={13} /> Rush
          </button>
          {!task.rushed && (
            <div className="text-[10px] text-ink-muted mt-1 leading-tight">
              <span className="text-accent-red">+{rushPreview.bugChance}%</span> bug chance ·{' '}
              <span className="text-accent-red">+{rushPreview.techDebtAdd}</span> debt
            </div>
          )}
        </div>
        <button onClick={() => onDefer(task.id)} className="btn-ghost flex items-center justify-center gap-1.5">
          <Icon name="arrow-down" size={13} /> Defer
        </button>
      </div>

      <div className="mt-5 text-[11px] text-ink-muted leading-relaxed">
        Rushing a task makes it ship faster but at higher bug probability. Hidden complexity may
        bite mid-sprint and reveal itself when it does.
      </div>
    </motion.div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-ink-muted">{label}</div>
      <div className="text-ink-primary capitalize">{value}</div>
    </div>
  );
}
