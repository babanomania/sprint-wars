import clsx from 'clsx';
import { useGame } from '../../store/gameStore';
import { sfx } from '../../engine/sound';
import Icon from '../ui/Icon';

export default function SpeedControls() {
  const { speed, setSpeed, soundEnabled, setSound, advanceDay, skipToEvent, gameOver } = useGame();

  const advance = () => {
    if (gameOver.active) return;
    if (soundEnabled) sfx.click();
    const ticks = speed;
    for (let i = 0; i < ticks; i++) {
      advanceDay();
      if (useGame.getState().appPhase !== 'playing') return;
    }
  };

  return (
    <div className="flex items-center gap-1 bg-bg-subtle rounded-md border border-bg-border p-0.5">
      {/* Speed presets — desktop only */}
      <div className="hidden md:flex items-center gap-1">
        {([1, 2, 4] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            className={clsx(
              'px-2 py-1 rounded text-[11px] font-mono',
              speed === s ? 'bg-accent-blue text-white' : 'text-ink-secondary hover:bg-bg-hover',
            )}
            title={`${s}× day advance`}
          >
            {s}×
          </button>
        ))}
        <div className="w-px h-5 bg-bg-border mx-1" />
      </div>

      {/* Advance day */}
      <button
        onClick={advance}
        className="px-2 py-1.5 md:py-1 rounded text-xs flex items-center gap-1 text-ink-primary hover:bg-bg-hover"
        disabled={gameOver.active}
        title="Advance one day"
        aria-label="Advance day"
      >
        <Icon name="play" size={13} />
        <span className="hidden md:inline">Day</span>
      </button>

      {/* Skip */}
      <button
        onClick={() => skipToEvent()}
        className="px-2 py-1.5 md:py-1 rounded text-xs flex items-center gap-1 text-ink-primary hover:bg-bg-hover"
        title="Fast-forward until something happens"
        aria-label="Skip to next event"
        disabled={gameOver.active}
      >
        <Icon name="forward" size={13} />
        <span className="hidden md:inline">Skip</span>
      </button>

      <div className="w-px h-5 bg-bg-border mx-1" />

      {/* Sound */}
      <button
        onClick={() => setSound(!soundEnabled)}
        className="w-7 h-7 rounded flex items-center justify-center text-ink-secondary hover:text-ink-primary hover:bg-bg-hover"
        title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
        aria-label={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
      >
        <Icon name={soundEnabled ? 'volume-on' : 'volume-off'} size={15} />
      </button>
    </div>
  );
}
