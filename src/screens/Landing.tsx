import { motion } from 'framer-motion';
import { useGame } from '../store/gameStore';
import ThemeToggle from '../components/shell/ThemeToggle';
import { sfx } from '../engine/sound';
import Icon, { type IconName } from '../components/ui/Icon';
import HeroArt from '../components/landing/HeroArt';

export default function Landing() {
  const { goToSetup, setAppPhase, history, sprint, soundEnabled, runConfig } = useGame();

  const hasInProgressRun = sprint > 1 || history.length > 0;

  const start = () => {
    if (soundEnabled) sfx.click();
    goToSetup();
  };

  const resume = () => {
    if (soundEnabled) sfx.click();
    setAppPhase('playing');
  };

  return (
    <div className="min-h-screen w-full bg-bg-base relative overflow-hidden">
      <BackgroundGrid />
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 pt-10 md:pt-16 pb-12 md:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-12"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center font-extrabold text-white">
            SW
          </div>
          <div>
            <div className="text-sm font-semibold tracking-wide">Sprint Wars</div>
            <div className="text-[11px] uppercase tracking-widest text-ink-muted flex items-center gap-1.5">
              <span>v1.0</span>
              <span className="px-1.5 py-px rounded bg-accent-yellow/20 text-accent-yellow text-[9px] tracking-wider">
                BETA
              </span>
            </div>
          </div>
        </motion.div>

        {/* Hero section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-center mb-12 md:mb-20">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex items-center gap-2 mb-5 pill bg-accent-blue/15 text-accent-blue"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />
              A management sim · single-player · runs in your browser
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-extrabold leading-[1.05] tracking-tight"
            >
              The enterprise <span className="text-accent-blue">software delivery</span>{' '}
              simulator that <span className="text-accent-red">remembers everything</span>.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-5 text-base md:text-lg text-ink-secondary max-w-2xl leading-relaxed"
            >
              You are an Engineering Manager. You have six engineers, a backlog, a CEO who saw a
              competitor demo last night, and a Slack thread that will not stop.
              <br />
              <br />
              Ship the sprint. Survive the year. Don't get walked out by HR.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              {hasInProgressRun && (
                <button
                  onClick={resume}
                  className="px-6 py-3 rounded-lg bg-accent-blue text-white font-semibold text-base shadow-lg hover:opacity-90 transition-opacity glow-blue flex items-center gap-2"
                >
                  <Icon name="play" size={16} />
                  <span>Resume — Sprint #{sprint}</span>
                </button>
              )}
              <button
                onClick={start}
                className={
                  hasInProgressRun
                    ? 'btn-ghost px-5 py-3 flex items-center gap-2'
                    : 'px-6 py-3 rounded-lg bg-accent-blue text-white font-semibold text-base shadow-lg hover:opacity-90 transition-opacity glow-blue flex items-center gap-2'
                }
              >
                <Icon name="dice" size={16} />
                <span>Start a new tour</span>
              </button>
            </motion.div>

            {hasInProgressRun && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-3 text-[11px] text-ink-muted"
              >
                Saved run:{' '}
                <span className="capitalize">{runConfig.modifierId.replace(/-/g, ' ')}</span> ·{' '}
                {history.length} sprint{history.length !== 1 ? 's' : ''} closed.
              </motion.div>
            )}
          </div>

          {/* Hero illustration */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <HeroArt />
          </div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4"
        >
          {FEATURES.map((f) => (
            <div key={f.title} className="panel p-5">
              <Icon name={f.icon} size={22} className="text-accent-blue mb-2" />
              <div className="text-sm font-semibold mb-1">{f.title}</div>
              <div className="text-xs text-ink-secondary leading-relaxed">{f.body}</div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.95 }}
          className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 text-center"
        >
          {STATS.map((s) => (
            <div key={s.label} className="panel p-3">
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-[10px] uppercase tracking-wider text-ink-muted">{s.label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mt-16 text-center text-[11px] text-ink-muted"
        >
          Local saves only. No backend. No telemetry. No stand-up at 9:30.
        </motion.div>
      </div>
    </div>
  );
}

const FEATURES: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'inbox',
    title: 'Inbox-driven decisions',
    body:
      'Branching emails from execs, security, QA, and one client who keeps using the phrase "circle back."',
  },
  {
    icon: 'alert',
    title: 'Incident command',
    body:
      'SEV1 at 2am? Roll back, hot-fix, declare RCA, or pretend you didn\'t see it. All have consequences.',
  },
  {
    icon: 'users',
    title: 'A team that talks back',
    body:
      'Six engineers with their own morale, burnout, and ego. Push too hard and they update LinkedIn.',
  },
  {
    icon: 'network',
    title: 'Living architecture',
    body:
      'Tech debt rots services. Failures cascade. Decompose the monolith — over many sprints.',
  },
  {
    icon: 'sparkles',
    title: 'Long-arc storylines',
    body:
      'Project Helios, the Globex merger, a regulator who is "just curious" — choices stack across sprints.',
  },
  {
    icon: 'target',
    title: 'A win condition',
    body:
      'Survive your run\'s goal — annual review, IPO, or the integration mandate from your new owners.',
  },
];

const STATS = [
  { value: '9', label: 'Live metrics' },
  { value: '5', label: 'Story arcs' },
  { value: '12', label: 'Engineer archetypes' },
  { value: '1', label: 'Quiet retrospective' },
];

function BackgroundGrid() {
  return (
    <svg
      className="absolute inset-0 w-full h-full text-bg-border opacity-30"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}
