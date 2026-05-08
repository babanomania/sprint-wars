import { useTheme } from '../../theme/useTheme';
import Icon from '../ui/Icon';

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className={
        compact
          ? 'w-8 h-8 rounded-md flex items-center justify-center text-ink-secondary hover:bg-bg-subtle hover:text-ink-primary transition-colors'
          : 'btn-ghost flex items-center gap-1.5'
      }
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Icon name={dark ? 'moon' : 'sun'} size={compact ? 16 : 14} />
      {!compact && <span>{dark ? 'Dark' : 'Light'}</span>}
    </button>
  );
}
