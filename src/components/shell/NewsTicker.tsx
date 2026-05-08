import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useGame } from '../../store/gameStore';

export default function NewsTicker() {
  const news = useGame((s) => s.news);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (news.length === 0) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % news.length), 4000);
    return () => clearInterval(t);
  }, [news.length]);

  if (news.length === 0) return null;
  const item = news[idx % news.length];

  return (
    <div className="border-b border-bg-border bg-bg-subtle/50 px-4 py-1.5 flex items-center gap-3 overflow-hidden">
      <span className="pill bg-accent-red/20 text-accent-red text-[10px] uppercase font-mono shrink-0">
        ● live
      </span>
      <span className="text-[10px] uppercase tracking-wider text-ink-muted shrink-0">{item.flavor}</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={item.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="text-xs text-ink-secondary truncate"
        >
          {item.text}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
