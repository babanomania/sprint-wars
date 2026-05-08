import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { useGame } from '../../store/gameStore';
import clsx from 'clsx';

export default function NotificationToasts() {
  const { notifications, clearNotification } = useGame();
  const visible = notifications.slice(0, 4);

  useEffect(() => {
    const timers = visible.map((n) =>
      setTimeout(() => clearNotification(n.id), 5000),
    );
    return () => timers.forEach(clearTimeout);
  }, [visible, clearNotification]);

  return (
    <div className="fixed top-16 right-2 md:right-4 left-2 md:left-auto z-50 flex flex-col gap-2 md:w-80 pointer-events-none">
      <AnimatePresence>
        {visible.map((n) => (
          <motion.div
            key={n.id}
            layout
            initial={{ opacity: 0, x: 20, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className={clsx(
              'panel px-3 py-2 text-xs border-l-2 shadow-lg pointer-events-auto cursor-pointer',
              n.level === 'error' && 'border-l-accent-red',
              n.level === 'warn' && 'border-l-accent-yellow',
              n.level === 'success' && 'border-l-accent-green',
              n.level === 'info' && 'border-l-accent-blue',
            )}
            onClick={() => clearNotification(n.id)}
          >
            <div className="text-[10px] uppercase tracking-wider text-ink-muted">
              {n.level}
            </div>
            <div className="text-ink-primary">{n.text}</div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
