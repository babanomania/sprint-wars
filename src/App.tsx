import { useEffect, useState } from 'react';
import { useGame } from './store/gameStore';
import { useTheme } from './theme/useTheme';
import Sidebar from './components/shell/Sidebar';
import TopBar from './components/shell/TopBar';
import NewsTicker from './components/shell/NewsTicker';
import NotificationToasts from './components/shell/NotificationToasts';
import Dashboard from './modules/Dashboard';
import SprintBoard from './modules/SprintBoard';
import Inbox from './modules/Inbox';
import Incidents from './modules/Incidents';
import Team from './modules/Team';
import Architecture from './modules/Architecture';
import Metrics from './modules/Metrics';
import ExecChat from './modules/ExecChat';
import Hire from './modules/Hire';
import Landing from './screens/Landing';
import Setup from './screens/Setup';
import Standup from './screens/Standup';
import SprintPlanning from './screens/SprintPlanning';
import Retrospective from './screens/Retrospective';
import WinScreen from './screens/WinScreen';
import LoseScreen from './screens/LoseScreen';
import { sfx } from './engine/sound';

export default function App() {
  const { module, appPhase, soundEnabled } = useGame();
  // Initialize theme reactively so the toggle re-renders on change
  useTheme();

  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    sfx.setMuted(!soundEnabled);
  }, [soundEnabled]);

  // Close drawer when phase changes (e.g. user clicks "Back to title")
  useEffect(() => {
    if (appPhase !== 'playing') setNavOpen(false);
  }, [appPhase]);

  if (appPhase === 'landing') return <Landing />;
  if (appPhase === 'setup') return <Setup />;
  if (appPhase === 'standup') return <Standup />;
  if (appPhase === 'planning') return <SprintPlanning />;
  if (appPhase === 'retro') return <Retrospective />;
  if (appPhase === 'won') return <WinScreen />;
  if (appPhase === 'lost') return <LoseScreen />;

  return (
    <div className="h-[100dvh] w-screen flex bg-bg-base text-ink-primary overflow-hidden">
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onMenuClick={() => setNavOpen(true)} />
        <NewsTicker />
        <main className="flex-1 overflow-hidden bg-bg-base">
          {module === 'dashboard' && <Dashboard />}
          {module === 'sprint' && <SprintBoard />}
          {module === 'inbox' && <Inbox />}
          {module === 'incidents' && <Incidents />}
          {module === 'team' && <Team />}
          {module === 'hire' && <Hire />}
          {module === 'architecture' && <Architecture />}
          {module === 'metrics' && <Metrics />}
          {module === 'chat' && <ExecChat />}
        </main>
      </div>
      <NotificationToasts />
    </div>
  );
}
