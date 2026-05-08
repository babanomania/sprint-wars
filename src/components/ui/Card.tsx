import type { ReactNode } from 'react';
import clsx from 'clsx';

interface Props {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function Card({ title, subtitle, action, children, className }: Props) {
  return (
    <div className={clsx('panel p-4', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-3">
          <div>
            {title && <div className="text-sm font-semibold">{title}</div>}
            {subtitle && (
              <div className="text-[11px] text-ink-muted mt-0.5">{subtitle}</div>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
