import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Achievement,
  ActiveStoryline,
  AppPhase,
  ArchProject,
  Candidate,
  ChatMessage,
  ChatPrompt,
  Developer,
  Email,
  GameOverState,
  GamePhase,
  Incident,
  Metrics,
  ModuleId,
  NewsItem,
  RandomEvent,
  ReplyTone,
  RunConfig,
  SprintSummary,
  StreakState,
  SystemNode,
  Task,
  TaskStatus,
  TechDebtItem,
} from '../types';
import { ARCHETYPES, STARTING_TEAM } from '../data/archetypes';
import { STARTING_ARCHITECTURE } from '../data/architecture';
import { generateInitialBacklog, generateBacklogTask, nextTaskId } from '../data/tasks';
import { emailFromTemplate, pickEmailTemplate } from '../data/emails';
import { makePrompt } from '../data/chat';
import { makeRandomEvent, pickEvent } from '../data/events';
import { createIncident, propagateFailure } from '../engine/incident';
import { mulberry32, clamp } from '../engine/rng';
import { endOfSprint, tickDay } from '../engine/simulate';
import { randomName } from '../data/names';
import { RUN_MODIFIERS, RUN_GOAL_QUARTERS } from '../data/modifiers';
import { activateStoryline, emailForStep, pickStorylineForStart } from '../data/storylines';
import { generateCandidatePool } from '../data/candidates';
import { STARTING_TECH_DEBT_ITEMS } from '../data/techDebt';
import { pickNews } from '../data/news';
import { generateRetroQuote, generateHighlight, generateLowlight, generateRCA } from '../data/retroQuotes';
import { applyToneToEffect, rewriteReply } from '../engine/tone';
import { sfx } from '../engine/sound';

const DAYS_PER_SPRINT = 5;

// ============================================================================
const startingMetrics = (): Metrics => ({
  morale: 72,
  techDebt: 35,
  trust: 65,
  velocity: 0,
  stability: 85,
  burnout: 30,
  security: 30,
  budget: 250000,
  patience: 70,
  politics: 0,
});

const startingTeam = (): Developer[] => {
  const rng = Math.random;
  return STARTING_TEAM.map((archetype, i) => {
    const spec = ARCHETYPES[archetype];
    return {
      id: `dev-${i + 1}`,
      name: randomName(rng),
      archetype,
      title: spec.title,
      ...spec.base,
      loyalty: 60,
      salary: spec.baseSalary,
      status: 'available' as const,
      notes: [spec.blurb],
    };
  });
};

const teamFromArchetypes = (picks: typeof STARTING_TEAM): Developer[] => {
  const rng = Math.random;
  return picks.map((archetype, i) => {
    const spec = ARCHETYPES[archetype];
    return {
      id: `dev-${i + 1}`,
      name: randomName(rng),
      archetype,
      title: spec.title,
      ...spec.base,
      loyalty: 60,
      salary: spec.baseSalary,
      status: 'available' as const,
      notes: [spec.blurb],
    };
  });
};

// ============================================================================
interface NotificationItem {
  id: string;
  text: string;
  level: 'info' | 'warn' | 'error' | 'success';
  ts: number;
}

interface PlanningCommit {
  taskIds: string[];
  committedPoints: number;
}

// Snapshot for undo (just the metric & email-resolution layer).
interface UndoSnapshot {
  emailId: string;
  metricsBefore: Metrics;
  resolvedAt: number;
  // task ids spawned by this email (so we can clean them up on undo)
  spawnedTaskIds: string[];
  spawnedIncidentIds: string[];
  loyaltyBefore: { devId: string; loyalty: number }[];
}

// ============================================================================
interface GameState {
  // Outer screen routing
  appPhase: AppPhase;
  module: ModuleId;

  // Run config (set during setup)
  runConfig: RunConfig;

  // Meta
  seed: number;
  sprint: number;
  day: number;
  daysPerSprint: number;
  phase: GamePhase;
  gameOver: GameOverState;
  speed: 1 | 2 | 4;
  soundEnabled: boolean;
  goalSprints: number; // win condition

  // Live data
  metrics: Metrics;
  team: Developer[];
  tasks: Task[];
  emails: Email[];
  incidents: Incident[];
  systems: SystemNode[];
  events: RandomEvent[];
  chat: ChatMessage[];
  pendingPrompt?: ChatPrompt;
  achievements: Achievement[];
  notifications: NotificationItem[];
  storylines: ActiveStoryline[];
  techDebtItems: TechDebtItem[];
  archProjects: ArchProject[];
  news: NewsItem[];
  candidates: Candidate[];
  streaks: StreakState;
  history: SprintSummary[];
  planning?: PlanningCommit;
  undo?: UndoSnapshot;
  undoBudget: number;            // undos available this sprint

  // Selection / UI
  selectedEmailId?: string;
  selectedTaskId?: string;
  selectedIncidentId?: string;
  selectedDevId?: string;
  selectedSystemId?: string;
  selectedStorylineId?: string;
  inboxReplyTone: ReplyTone;

  // ----- Actions -------------------------------------------------------
  setAppPhase: (p: AppPhase) => void;
  setModule: (m: ModuleId) => void;
  setSpeed: (s: 1 | 2 | 4) => void;
  setSound: (b: boolean) => void;
  setReplyTone: (t: ReplyTone) => void;

  // Setup flow
  startNewRun: (cfg: RunConfig) => void;
  goToSetup: () => void;
  resetEverything: () => void;

  // Sprint flow
  beginPlanning: () => void;            // open planning screen at sprint start
  commitPlanning: (taskIds: string[]) => void; // submit and enter standup
  finishStandup: () => void;            // dismiss standup, enter playing
  advanceDay: () => void;
  endCurrentSprint: () => void;
  acceptRetro: () => void;              // close retro screen, go to next sprint
  skipToEvent: () => void;              // fast-forward until interrupt

  // Sprint board
  assignTask: (taskId: string, devId: string | undefined) => void;
  moveTask: (taskId: string, status: TaskStatus) => void;
  rushTask: (taskId: string) => void;
  deferTask: (taskId: string) => void;
  selectTask: (id?: string) => void;

  // Inbox
  selectEmail: (id?: string) => void;
  pickEmailChoice: (emailId: string, choiceId: string) => void;
  ignoreEmail: (emailId: string) => void;
  undoLastDecision: () => void;
  composeReply: (emailId: string, choiceId: string) => string;

  // Incidents
  selectIncident: (id?: string) => void;
  resolveIncident: (id: string, action: 'rollback' | 'hotfix' | 'ignore' | 'rca') => void;

  // Team
  selectDev: (id?: string) => void;
  fireDeveloper: (id: string) => void;
  hireCandidate: (candidateId: string) => void;
  refreshCandidates: () => void;

  // Architecture
  selectSystem: (id?: string) => void;
  startDecomposition: (sourceId: string) => void;
  applyDecompositionPoints: (projectId: string, points: number) => void;
  payDownTechDebt: (debtId: string) => void;

  // Exec chat
  answerChatPrompt: (optionId: string) => void;
  pushChatPrompt: () => void;

  // Notifications
  pushNotification: (n: Omit<NotificationItem, 'id' | 'ts'>) => void;
  clearNotification: (id: string) => void;
}

// ============================================================================
const applyEffect = (m: Metrics, eff: Partial<Metrics>): Metrics => {
  const next = { ...m };
  (Object.keys(eff) as (keyof Metrics)[]).forEach((k) => {
    const v = eff[k];
    if (v === undefined) return;
    if (k === 'budget') next.budget = next.budget + v;
    else if (k === 'velocity') next.velocity = next.velocity + v;
    else if (k === 'politics') next.politics = clamp(next.politics + v, -100, 100);
    else next[k] = clamp((next[k] as number) + v, 0, 100);
  });
  return next;
};

const evaluatePhase = (sprint: number): GamePhase => {
  if (sprint <= 4) return 'early';
  if (sprint <= 12) return 'mid';
  return 'late';
};

const gameOverCheck = (m: Metrics, team: Developer[]): string | null => {
  const alive = team.filter((d) => d.status !== 'resigned').length;
  if (alive <= 1) return 'Your team has resigned. The Slack is empty.';
  if (m.patience <= 0) return 'Executives have lost patience. You are walked out by HR.';
  if (m.budget <= 0) return 'Budget exhausted. Finance has frozen all spend.';
  if (m.trust <= 0) return 'Stakeholder trust collapsed. The board has installed a new EM.';
  if (m.stability <= 0) return 'Production has been down for 72h. Leadership has called Accenture.';
  return null;
};

const initialState = (cfg: Partial<RunConfig> = {}) => {
  const config: RunConfig = {
    modifierId: cfg.modifierId ?? 'classic',
    pickedArchetypes: cfg.pickedArchetypes ?? STARTING_TEAM,
    goalQuarters: cfg.goalQuarters ?? RUN_GOAL_QUARTERS[cfg.modifierId ?? 'classic'] ?? 12,
  };
  const modifier = RUN_MODIFIERS.find((m) => m.id === config.modifierId)!;
  const metrics = applyEffect(startingMetrics(), modifier.metricDeltas);
  const team = teamFromArchetypes(config.pickedArchetypes);
  return { config, metrics, team };
};

// ============================================================================
export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      appPhase: 'landing',
      module: 'dashboard',
      runConfig: {
        modifierId: 'classic',
        pickedArchetypes: STARTING_TEAM,
        goalQuarters: 12,
      },

      seed: Date.now() & 0xffffffff,
      sprint: 1,
      day: 1,
      daysPerSprint: DAYS_PER_SPRINT,
      phase: 'early',
      gameOver: { active: false },
      speed: 1,
      soundEnabled: true,
      goalSprints: 12,

      metrics: startingMetrics(),
      team: startingTeam(),
      tasks: generateInitialBacklog(),
      emails: [],
      incidents: [],
      systems: STARTING_ARCHITECTURE.map((s) => ({ ...s })),
      events: [],
      chat: [
        {
          id: 'msg-welcome',
          persona: 'ceo',
          authorName: 'Diane Sterling',
          fromPlayer: false,
          ts: 1001,
          text: 'Welcome aboard. We have big things planned this quarter. Don\'t mess it up. 🙂',
        },
      ],
      pendingPrompt: makePrompt(0),
      achievements: [
        { id: 'first-ship', name: 'First Ship', description: 'Complete your first sprint.', unlocked: false },
        { id: 'firefighter', name: 'Firefighter', description: 'Resolve 5 incidents.', unlocked: false },
        { id: 'debt-collector', name: 'Debt Collector', description: 'Reduce tech debt below 25.', unlocked: false },
        { id: 'survivor', name: 'Survivor', description: 'Reach Sprint 12.', unlocked: false },
        { id: 'no-burnout', name: 'Healthy Team', description: 'Keep avg burnout below 30 for a sprint.', unlocked: false },
        { id: 'win-ipo', name: 'Rang the Bell', description: 'Reach the run\'s goal sprint.', unlocked: false },
        { id: 'streaker', name: 'Hot Streak', description: 'Hit committed velocity 3 sprints in a row.', unlocked: false },
      ],
      notifications: [],
      storylines: [],
      techDebtItems: STARTING_TECH_DEBT_ITEMS,
      archProjects: [],
      news: [],
      candidates: [],
      streaks: { cleanSprints: 0, emailsAnsweredInRow: 0, noResignationStreak: 0, velocityHits: 0, buffs: [] },
      history: [],
      undoBudget: 3,
      inboxReplyTone: 'direct',

      // ============================================================
      setAppPhase: (p) => set({ appPhase: p }),
      setModule: (m) => set({ module: m }),
      setSpeed: (s) => set({ speed: s }),
      setSound: (b) => {
        sfx.setMuted(!b);
        set({ soundEnabled: b });
      },
      setReplyTone: (t) => set({ inboxReplyTone: t }),

      goToSetup: () => set({ appPhase: 'setup' }),

      // ============================================================
      startNewRun: (cfg) => {
        const { config, metrics, team } = initialState(cfg);
        const goalSprints = config.goalQuarters;
        const seed = Date.now() & 0xffffffff;
        const rng = mulberry32(seed);
        const storylineId = pickStorylineForStart(config.modifierId);
        const storylines = storylineId ? [activateStoryline(storylineId, 1)] : [];
        // first storyline email
        let emails: Email[] = [];
        if (storylineId) {
          const tmpl = emailForStep(storylineId, 1);
          if (tmpl) {
            emails = [
              {
                ...tmpl,
                id: `email-${Date.now()}-sl`,
                receivedSprint: 1,
                receivedDay: 1,
                read: false,
                resolved: false,
                storylineId,
              },
            ];
          }
        }
        sfx.setMuted(!get().soundEnabled);
        set({
          appPhase: 'planning',
          module: 'dashboard',
          runConfig: config,
          seed,
          sprint: 1,
          day: 1,
          phase: 'early',
          gameOver: { active: false },
          goalSprints,
          metrics,
          team,
          tasks: generateInitialBacklog(),
          emails,
          incidents: [],
          systems: STARTING_ARCHITECTURE.map((s) => ({ ...s })),
          events: [],
          chat: [
            {
              id: `msg-${Date.now()}`,
              persona: 'ceo',
              authorName: 'Diane Sterling',
              fromPlayer: false,
              ts: 1001,
              text: 'New EM, new luck. Let\'s ship.',
            },
          ],
          pendingPrompt: makePrompt(0),
          notifications: [],
          storylines,
          techDebtItems: STARTING_TECH_DEBT_ITEMS,
          archProjects: [],
          news: [],
          candidates: generateCandidatePool(rng, 5),
          streaks: { cleanSprints: 0, emailsAnsweredInRow: 0, noResignationStreak: 0, velocityHits: 0, buffs: [] },
          history: [],
          planning: undefined,
          undo: undefined,
          undoBudget: 3,
        });
      },

      resetEverything: () => set({ appPhase: 'landing' }),

      // ============================================================
      pushNotification: (n) =>
        set((s) => ({
          notifications: [
            { ...n, id: `n-${Date.now()}-${Math.random()}`, ts: Date.now() },
            ...s.notifications,
          ].slice(0, 30),
        })),
      clearNotification: (id) =>
        set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),

      // ============================================================
      beginPlanning: () => set({ appPhase: 'planning' }),

      commitPlanning: (taskIds) => {
        const s = get();
        const committedPoints = taskIds.reduce((sum, id) => {
          const t = s.tasks.find((tt) => tt.id === id);
          return sum + (t?.storyPoints ?? 0);
        }, 0);
        // mark these tasks as in-progress if not already, and prioritize
        const tasks = s.tasks.map((t) =>
          taskIds.includes(t.id) && t.status === 'backlog' ? { ...t, status: 'in-progress' as const } : t,
        );
        set({
          planning: { taskIds, committedPoints },
          tasks,
          appPhase: 'standup',
          undoBudget: 3, // refresh per sprint
        });
      },

      finishStandup: () => set({ appPhase: 'playing' }),

      // ============================================================
      advanceDay: () => {
        const s = get();
        if (s.gameOver.active) return;
        const rng = mulberry32(s.seed + s.sprint * 31 + s.day * 7);

        const sim = tickDay({
          metrics: s.metrics,
          team: s.team,
          tasks: s.tasks,
          systems: s.systems,
          incidents: s.incidents,
          sprint: s.sprint,
          rng,
        });

        let metrics = sim.metrics;
        let tasks = [...sim.tasks, ...sim.newBugs];
        let team = sim.team;
        let systems = sim.systems;
        let incidents = sim.incidents;
        const events = [...s.events];
        const newNotifs: NotificationItem[] = sim.notifications.map((t) => ({
          id: `n-${Date.now()}-${Math.random()}`,
          ts: Date.now(),
          level: 'info',
          text: t,
        }));
        let news = s.news;

        // Daily news
        if (rng() < 0.7) {
          const nt = pickNews(s.sprint, rng);
          const item: NewsItem = {
            id: `news-${Date.now()}`,
            text: nt.text(),
            flavor: nt.flavor,
            sprint: s.sprint,
            day: s.day,
          };
          news = [item, ...news].slice(0, 25);
          if (nt.effect) metrics = applyEffect(metrics, nt.effect);
        }

        // Random event
        const eventChance = 0.18 + Math.min(s.sprint, 12) * 0.025;
        if (rng() < eventChance) {
          const tmpl = pickEvent(s.sprint, rng);
          const evt = makeRandomEvent(tmpl, s.sprint, s.day);
          events.unshift(evt);
          metrics = applyEffect(metrics, evt.effects);
          if (s.soundEnabled) sfx.alert();
          newNotifs.unshift({
            id: `n-${Date.now()}-${Math.random()}`,
            ts: Date.now(),
            level: 'warn',
            text: evt.title,
          });
          if (tmpl.spawnIncident) {
            const inc = createIncident(systems, s.sprint, s.day, rng);
            incidents = [inc, ...incidents];
            systems = propagateFailure(systems, inc.systemId, rng);
            evt.spawnedIncidentId = inc.id;
            if (s.soundEnabled) sfx.alert();
          }
          if (tmpl.spawnEmail) {
            const t = pickEmailTemplate(s.sprint, rng);
            const email = emailFromTemplate(t, s.sprint, s.day);
            evt.spawnedEmailId = email.id;
            s.emails.unshift(email);
            if (s.soundEnabled) sfx.emailDing();
          }
        }

        // Email arrival
        let emails = [...s.emails];
        const emailChance = 0.55;
        if (rng() < emailChance) {
          const t = pickEmailTemplate(s.sprint, rng);
          const email = emailFromTemplate(t, s.sprint, s.day);
          emails = [email, ...emails];
          if (s.soundEnabled) sfx.emailDing();
          newNotifs.unshift({
            id: `n-${Date.now()}-${Math.random()}`,
            ts: Date.now(),
            level: 'info',
            text: `New email: ${email.subject}`,
          });
        }

        // Exec chat prompt
        let pendingPrompt = s.pendingPrompt;
        if (!pendingPrompt && rng() < 0.35) {
          pendingPrompt = makePrompt();
          if (s.soundEnabled) sfx.chatPop();
        }

        // Resignation rolls — loyalty matters too
        let resignations = 0;
        for (const dev of team) {
          if (dev.status === 'resigned') continue;
          const resignThreshold = 85 - (60 - dev.loyalty) * 0.3; // lower loyalty = easier to resign
          if (dev.burnout > resignThreshold && rng() < 0.06) {
            dev.status = 'resigned';
            dev.resignedAt = s.sprint * 100 + s.day;
            const t = tasks.find((t) => t.id === dev.taskId);
            if (t) {
              t.assigneeId = undefined;
              t.status = 'blocked';
            }
            newNotifs.unshift({
              id: `n-${Date.now()}-${Math.random()}`,
              ts: Date.now(),
              level: 'error',
              text: `${dev.name} has resigned. Citing burnout.`,
            });
            metrics = applyEffect(metrics, { morale: -12, trust: -3 });
            resignations += 1;
          }
        }

        let sprint = s.sprint;
        let day = s.day + 1;
        let appPhase: AppPhase = s.appPhase;
        let achievements = s.achievements;
        let history = s.history;
        let streaks = s.streaks;

        if (day > s.daysPerSprint) {
          // close sprint
          const eos = endOfSprint({
            metrics,
            team,
            tasks,
            systems,
            incidents,
            sprint,
            rng,
          });
          metrics = eos.metrics;
          team = eos.team;
          tasks = eos.tasks;
          systems = eos.systems;
          newNotifs.unshift({
            id: `n-${Date.now()}-${Math.random()}`,
            ts: Date.now(),
            level: 'success',
            text: eos.notifications[0],
          });

          // Build sprint summary
          const shipped = tasks.filter((t) => t.status === 'done' && t.createdSprint <= sprint).map((t) => t.title);
          const bugsCreated = tasks.filter((t) => t.type === 'bug' && t.createdSprint === sprint).length;
          const sprintIncidents = incidents.filter((i) => i.startedSprint === sprint).length;

          // streak updates
          const committed = s.planning?.committedPoints ?? 0;
          const hitCommit = metrics.velocity >= committed && committed > 0;
          const cleanSprintNoSev1 = !incidents.some((i) => i.startedSprint === sprint && i.severity === 'SEV1');
          streaks = {
            cleanSprints: cleanSprintNoSev1 ? streaks.cleanSprints + 1 : 0,
            emailsAnsweredInRow: streaks.emailsAnsweredInRow,
            noResignationStreak: resignations === 0 ? streaks.noResignationStreak + 1 : 0,
            velocityHits: hitCommit ? streaks.velocityHits + 1 : 0,
            buffs: [],
          };
          if (streaks.velocityHits >= 3) {
            streaks.buffs.push({ id: 'flow-state', label: 'Flow State', sprintsLeft: 1, effect: '+10% productivity next sprint' });
          }
          if (streaks.cleanSprints >= 3) {
            streaks.buffs.push({ id: 'rock-solid', label: 'Rock Solid', sprintsLeft: 1, effect: '+5 stability next sprint' });
          }
          if (streaks.noResignationStreak >= 3) {
            streaks.buffs.push({ id: 'tight-knit', label: 'Tight-Knit Team', sprintsLeft: 1, effect: '+3 morale per sprint' });
          }

          const summary: SprintSummary = {
            sprint,
            velocity: metrics.velocity,
            committed,
            shipped,
            bugsCreated,
            incidents: sprintIncidents,
            resignations,
            metricsDelta: {},
            retroQuote: '',
          };
          summary.retroQuote = generateRetroQuote(summary, metrics);
          summary.highlight = generateHighlight(summary);
          summary.lowlight = generateLowlight(summary);
          history = [summary, ...s.history].slice(0, 30);

          // Ach unlocks
          const ach = achievements.map((a) => ({ ...a }));
          if (sprint > 1 && !ach.find((a) => a.id === 'first-ship')!.unlocked) {
            ach.find((a) => a.id === 'first-ship')!.unlocked = true;
          }
          if (metrics.techDebt < 25 && !ach.find((a) => a.id === 'debt-collector')!.unlocked) {
            ach.find((a) => a.id === 'debt-collector')!.unlocked = true;
          }
          if (metrics.burnout < 30 && !ach.find((a) => a.id === 'no-burnout')!.unlocked) {
            ach.find((a) => a.id === 'no-burnout')!.unlocked = true;
          }
          if (streaks.velocityHits >= 3 && !ach.find((a) => a.id === 'streaker')!.unlocked) {
            ach.find((a) => a.id === 'streaker')!.unlocked = true;
          }
          achievements = ach;

          // Progress to retrospective screen
          appPhase = 'retro';
          sprint = sprint + 1;
          day = 1;

          // Generate new backlog tasks for upcoming sprint
          for (let i = 0; i < 4; i++) {
            tasks.push(generateBacklogTask(sprint, rng));
          }

          // Refresh hire candidates between sprints
          const newCandidates = generateCandidatePool(rng, 5);

          // Win condition
          if (sprint > s.goalSprints) {
            const winAch = achievements.map((a) =>
              a.id === 'win-ipo' ? { ...a, unlocked: true } : a,
            );
            if (s.soundEnabled) sfx.win();
            set({
              metrics, team, tasks, systems, incidents, events, emails,
              pendingPrompt, sprint, day, phase: evaluatePhase(sprint),
              gameOver: { active: false },
              streaks, history, achievements: winAch, candidates: newCandidates,
              appPhase: 'won',
              notifications: [...newNotifs, ...s.notifications].slice(0, 30),
              news,
            });
            return;
          }

          set({
            metrics, team, tasks, systems, incidents, events, emails,
            pendingPrompt, sprint, day, phase: evaluatePhase(sprint),
            gameOver: { active: false },
            streaks, history, achievements,
            candidates: newCandidates,
            news,
            appPhase,
            planning: undefined,
            undo: undefined,
            undoBudget: 3,
            notifications: [...newNotifs, ...s.notifications].slice(0, 30),
          });
          if (s.soundEnabled) sfx.deploySuccess();
          return;
        }

        // Game-over check (mid-sprint)
        const reason = gameOverCheck(metrics, team);
        const newPhase = evaluatePhase(sprint);
        if (reason) {
          if (s.soundEnabled) sfx.lose();
          set({
            metrics, team, tasks, systems, incidents, events, emails,
            pendingPrompt, sprint, day, phase: newPhase,
            gameOver: { active: true, reason },
            appPhase: 'lost',
            notifications: [...newNotifs, ...s.notifications].slice(0, 30),
            news,
          });
          return;
        }

        set({
          metrics, team, tasks, systems, incidents, events, emails,
          pendingPrompt, sprint, day, phase: newPhase,
          gameOver: { active: false },
          notifications: [...newNotifs, ...s.notifications].slice(0, 30),
          news,
        });
      },

      endCurrentSprint: () => {
        const s = get();
        const remaining = s.daysPerSprint - s.day + 1;
        for (let i = 0; i < remaining; i++) {
          get().advanceDay();
          if (get().gameOver.active || get().appPhase === 'retro' || get().appPhase === 'won' || get().appPhase === 'lost') return;
        }
      },

      acceptRetro: () => set({ appPhase: 'planning' }),

      skipToEvent: () => {
        const s = get();
        const startUnreadEmails = s.emails.filter((e) => !e.read).length;
        const startIncidents = s.incidents.filter((i) => i.status === 'open').length;
        const startPrompt = s.pendingPrompt;
        for (let i = 0; i < 20; i++) {
          get().advanceDay();
          const cur = get();
          if (cur.appPhase !== 'playing') return;
          if (cur.emails.filter((e) => !e.read).length > startUnreadEmails) return;
          if (cur.incidents.filter((x) => x.status === 'open').length > startIncidents) return;
          if (!startPrompt && cur.pendingPrompt) return;
        }
      },

      // ============================================================
      assignTask: (taskId, devId) =>
        set((s) => {
          const tasks = s.tasks.map((t) => ({ ...t }));
          const team = s.team.map((d) => ({ ...d }));
          if (devId) {
            for (const t of tasks) {
              if (t.assigneeId === devId) t.assigneeId = undefined;
            }
            for (const d of team) {
              if (d.id === devId) {
                d.taskId = taskId;
                d.status = 'on-task';
              }
            }
          } else {
            const t = tasks.find((t) => t.id === taskId);
            if (t?.assigneeId) {
              const d = team.find((d) => d.id === t.assigneeId);
              if (d) {
                d.taskId = undefined;
                d.status = 'available';
              }
            }
          }
          const target = tasks.find((t) => t.id === taskId);
          if (target) {
            target.assigneeId = devId;
            if (devId && target.status === 'backlog') target.status = 'in-progress';
          }
          return { tasks, team };
        }),

      moveTask: (taskId, status) =>
        set((s) => {
          const tasks = s.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status,
                  ...(status === 'done' ? { progress: 100 } : {}),
                  ...(status === 'backlog' ? { progress: 0, assigneeId: undefined } : {}),
                }
              : t,
          );
          let team = s.team;
          if (status === 'backlog' || status === 'done') {
            const t = s.tasks.find((t) => t.id === taskId);
            if (t?.assigneeId) {
              team = s.team.map((d) =>
                d.id === t.assigneeId ? { ...d, status: 'available', taskId: undefined } : d,
              );
            }
          }
          return { tasks, team };
        }),

      rushTask: (taskId) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId ? { ...t, rushed: true, bugProbability: Math.min(0.95, t.bugProbability * 1.6) } : t,
          ),
        })),

      deferTask: (taskId) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId ? { ...t, priority: 'low', status: 'backlog', assigneeId: undefined } : t,
          ),
        })),

      selectTask: (id) => set({ selectedTaskId: id }),
      selectEmail: (id) => set({ selectedEmailId: id, inboxReplyTone: 'direct' }),
      selectIncident: (id) => set({ selectedIncidentId: id }),
      selectDev: (id) => set({ selectedDevId: id }),
      selectSystem: (id) => set({ selectedSystemId: id }),

      // ============================================================
      // Inbox — choices + tone modulation + undo snapshot
      composeReply: (emailId, choiceId) => {
        const s = get();
        const email = s.emails.find((e) => e.id === emailId);
        const choice = email?.choices.find((c) => c.id === choiceId);
        if (!choice) return '';
        return rewriteReply(choice.label, s.inboxReplyTone);
      },

      pickEmailChoice: (emailId, choiceId) => {
        const s = get();
        const email = s.emails.find((e) => e.id === emailId);
        if (!email) return;
        const choice = email.choices.find((c) => c.id === choiceId);
        if (!choice) return;
        const rng = mulberry32(s.seed + s.day);

        const metricsBefore = { ...s.metrics };
        const loyaltyBefore = s.team.map((d) => ({ devId: d.id, loyalty: d.loyalty }));
        const spawnedTaskIds: string[] = [];
        const spawnedIncidentIds: string[] = [];

        const tonedEffect = applyToneToEffect(choice.effect, s.inboxReplyTone);
        let metrics = applyEffect(s.metrics, tonedEffect);
        let tasks = s.tasks;
        let incidents = s.incidents;
        let team = s.team;
        const newNotifs: NotificationItem[] = [];

        // Loyalty deltas
        if (choice.loyaltyDelta) {
          team = s.team.map((d) => {
            const matchesArch = !choice.loyaltyDelta!.archetype || d.archetype === choice.loyaltyDelta!.archetype;
            const matchesSpec = !choice.loyaltyDelta!.specialization || d.specialization === choice.loyaltyDelta!.specialization;
            if (matchesArch && matchesSpec) {
              return { ...d, loyalty: clamp(d.loyalty + choice.loyaltyDelta!.amount, 0, 100) };
            }
            return d;
          });
        }

        if (choice.spawnTask) {
          const newTask: Task = {
            id: nextTaskId(),
            title: choice.spawnTask.title ?? 'Unnamed task',
            description: '',
            type: choice.spawnTask.type ?? 'feature',
            storyPoints: choice.spawnTask.storyPoints ?? 5,
            truePoints: choice.spawnTask.storyPoints ?? 5,
            priority: choice.spawnTask.priority ?? 'high',
            hiddenComplexity: 0.4 + rng() * 0.4,
            complexityRevealed: false,
            bugProbability: 0.2,
            dependencies: [],
            status: 'backlog',
            rushed: false,
            progress: 0,
            createdSprint: s.sprint,
            source: choice.spawnTask.source ?? 'exec',
            storylineId: email.storylineId,
          };
          tasks = [newTask, ...tasks];
          spawnedTaskIds.push(newTask.id);
          newNotifs.push({ id: `n-${Date.now()}`, ts: Date.now(), level: 'info', text: `Backlog +1: ${newTask.title}` });
        }
        if (choice.spawnIncident) {
          const inc = createIncident(s.systems, s.sprint, s.day, rng);
          incidents = [inc, ...incidents];
          spawnedIncidentIds.push(inc.id);
          newNotifs.push({ id: `n-${Date.now()}-i`, ts: Date.now(), level: 'error', text: `Incident: ${inc.title}` });
          if (s.soundEnabled) sfx.alert();
        }

        const emails = s.emails.map((e) =>
          e.id === emailId
            ? {
                ...e,
                read: true,
                resolved: true,
                pickedChoiceId: choiceId,
                resolution: choice.message ?? choice.label,
              }
            : e,
        );

        // Storyline progression
        let storylines = s.storylines;
        if (email.storylineId) {
          const slIndex = storylines.findIndex((sl) => sl.id === email.storylineId);
          if (slIndex >= 0) {
            const sl = storylines[slIndex];
            const nextStep = sl.step + 1;
            if (nextStep <= sl.totalSteps) {
              const tmpl = emailForStep(sl.id, nextStep);
              if (tmpl) {
                const nextEmail: Email = {
                  ...tmpl,
                  id: `email-${Date.now()}-sl-${nextStep}`,
                  receivedSprint: s.sprint,
                  receivedDay: s.day + 1,
                  read: false,
                  resolved: false,
                  storylineId: sl.id,
                };
                // queue it next sprint-day
                emails.unshift(nextEmail);
              }
              storylines = storylines.map((x) =>
                x.id === sl.id ? { ...x, step: nextStep } : x,
              );
            } else {
              storylines = storylines.filter((x) => x.id !== sl.id);
            }
          }
        }

        const undo: UndoSnapshot = {
          emailId,
          metricsBefore,
          resolvedAt: Date.now(),
          spawnedTaskIds,
          spawnedIncidentIds,
          loyaltyBefore,
        };

        if (s.soundEnabled) sfx.click();

        set({
          metrics,
          tasks,
          incidents,
          emails,
          team,
          storylines,
          undo,
          undoBudget: s.undoBudget,
          notifications: [...newNotifs, ...s.notifications].slice(0, 30),
          streaks: { ...s.streaks, emailsAnsweredInRow: s.streaks.emailsAnsweredInRow + 1 },
        });
      },

      undoLastDecision: () => {
        const s = get();
        if (!s.undo) return;
        if (s.undoBudget <= 0) return;
        // Mark email as unresolved
        const emails = s.emails.map((e) =>
          e.id === s.undo!.emailId
            ? { ...e, read: false, resolved: false, pickedChoiceId: undefined, resolution: undefined }
            : e,
        );
        // Remove spawned tasks and incidents
        const tasks = s.tasks.filter((t) => !s.undo!.spawnedTaskIds.includes(t.id));
        const incidents = s.incidents.filter((i) => !s.undo!.spawnedIncidentIds.includes(i.id));
        // Restore loyalties
        const team = s.team.map((d) => {
          const before = s.undo!.loyaltyBefore.find((l) => l.devId === d.id);
          return before ? { ...d, loyalty: before.loyalty } : d;
        });
        set({
          emails,
          tasks,
          incidents,
          team,
          metrics: s.undo.metricsBefore,
          undo: undefined,
          undoBudget: s.undoBudget - 1,
        });
      },

      ignoreEmail: (emailId) =>
        set((s) => ({
          emails: s.emails.map((e) =>
            e.id === emailId
              ? { ...e, read: true, resolved: true, resolution: 'Ignored.' }
              : e,
          ),
          metrics: applyEffect(s.metrics, { trust: -2, patience: -2 }),
        })),

      // ============================================================
      resolveIncident: (id, action) => {
        const s = get();
        const inc = s.incidents.find((i) => i.id === id);
        if (!inc) return;
        const rng = mulberry32(s.seed + s.day + 13);
        let metrics = s.metrics;
        let incidents = s.incidents.map((i) => ({ ...i }));
        let systems = s.systems.map((sy) => ({ ...sy }));
        const target = incidents.find((i) => i.id === id)!;

        if (action === 'rollback') {
          target.status = 'rolled-back';
          target.resolution = 'rollback';
          metrics = applyEffect(metrics, { stability: 12, trust: -2, velocity: -2 });
          if (s.soundEnabled) sfx.deployFail();
        } else if (action === 'hotfix') {
          target.status = 'mitigating';
          target.resolution = 'hotfix';
          metrics = applyEffect(metrics, { stability: 6, techDebt: 6, burnout: 4 });
          systems = systems.map((sys) =>
            sys.id === target.systemId ? { ...sys, health: clamp(sys.health + 8) } : sys,
          );
          if (s.soundEnabled) sfx.deploySuccess();
        } else if (action === 'ignore') {
          target.status = 'open';
          target.resolution = 'ignored';
          metrics = applyEffect(metrics, { stability: -8, trust: -4 });
        } else if (action === 'rca') {
          target.status = 'resolved';
          target.rcaPosted = true;
          target.rcaText = generateRCA(rng);
          metrics = applyEffect(metrics, { trust: 6, morale: -2 });
          if (s.soundEnabled) sfx.deploySuccess();
        }
        set({ metrics, incidents, systems });
      },

      // ============================================================
      // Hire / Fire
      fireDeveloper: (id) =>
        set((s) => {
          const team = s.team.map((d) =>
            d.id === id ? { ...d, status: 'resigned' as const, resignedAt: s.sprint * 100 + s.day } : d,
          );
          return {
            team,
            metrics: applyEffect(s.metrics, { morale: -8, trust: -2 }),
          };
        }),

      hireCandidate: (candidateId) => {
        const s = get();
        const c = s.candidates.find((x) => x.id === candidateId);
        if (!c) return;
        if (s.metrics.budget < c.asking) return;
        const newDev: Developer = {
          id: `dev-${Date.now()}`,
          name: c.name,
          archetype: c.archetype,
          title: c.title,
          skill: c.skill,
          morale: 75,
          burnout: 20,
          ego: c.ego,
          reliability: c.reliability,
          productivity: c.productivity,
          loyalty: 50,
          specialization: c.specialization,
          salary: c.salary,
          hiddenFlaw: c.hiddenFlaw,
          status: 'available',
          notes: [c.resumeBlurb, `Hidden flaw: ${c.hiddenFlaw}`],
        };
        set({
          team: [...s.team, newDev],
          metrics: { ...s.metrics, budget: s.metrics.budget - c.asking },
          candidates: s.candidates.filter((x) => x.id !== candidateId),
        });
      },

      refreshCandidates: () => {
        const s = get();
        const rng = mulberry32(s.seed + s.sprint * 17);
        set({
          candidates: generateCandidatePool(rng, 5),
          metrics: { ...s.metrics, budget: Math.max(0, s.metrics.budget - 2000) },
        });
      },

      // ============================================================
      // Architecture editing
      startDecomposition: (sourceId) =>
        set((s) => {
          const sys = s.systems.find((x) => x.id === sourceId);
          if (!sys) return {};
          const proj: ArchProject = {
            id: `proj-${Date.now()}`,
            title: `Decompose ${sys.name}`,
            sourceSystemId: sourceId,
            targetSystems: [`${sys.name} — service A`, `${sys.name} — service B`, `${sys.name} — gateway`],
            totalPoints: 30,
            pointsApplied: 0,
            startedSprint: s.sprint,
          };
          return {
            archProjects: [...s.archProjects, proj],
            metrics: applyEffect(s.metrics, { trust: 4, patience: -4 }),
          };
        }),

      applyDecompositionPoints: (projectId, points) =>
        set((s) => {
          const projects = s.archProjects.map((p) => ({ ...p }));
          const proj = projects.find((p) => p.id === projectId);
          if (!proj) return {};
          proj.pointsApplied += points;
          let systems = s.systems;
          let techDebt = s.metrics.techDebt;
          if (proj.pointsApplied >= proj.totalPoints) {
            // complete decomposition: lower source debt + spawn target services
            const newServices: SystemNode[] = proj.targetSystems.map((name, i) => ({
              id: `${proj.sourceSystemId}-d-${i}`,
              name,
              kind: 'service',
              health: 90,
              techDebt: 10,
              dependencies: [proj.sourceSystemId],
              load: 30,
              critical: false,
            }));
            systems = [...systems, ...newServices].map((sys) =>
              sys.id === proj.sourceSystemId ? { ...sys, techDebt: Math.max(0, sys.techDebt - 30), critical: false } : sys,
            );
            techDebt = clamp(techDebt - 12);
            return {
              archProjects: projects.filter((p) => p.id !== projectId),
              systems,
              metrics: { ...s.metrics, techDebt },
            };
          }
          return { archProjects: projects };
        }),

      payDownTechDebt: (debtId) =>
        set((s) => {
          const item = s.techDebtItems.find((d) => d.id === debtId);
          if (!item) return {};
          // Cost a portion of velocity this sprint, in exchange for debt reduction.
          const debtItems = s.techDebtItems.filter((d) => d.id !== debtId);
          const techDebt = clamp(s.metrics.techDebt - item.weight, 0, 100);
          return {
            techDebtItems: debtItems,
            metrics: { ...s.metrics, techDebt, velocity: s.metrics.velocity - Math.round(item.cost / 2) },
          };
        }),

      // ============================================================
      answerChatPrompt: (optionId) => {
        const s = get();
        if (!s.pendingPrompt) return;
        const opt = s.pendingPrompt.options.find((o) => o.id === optionId);
        if (!opt) return;
        const ts = s.sprint * 1000 + s.day;
        const newMessages: ChatMessage[] = [
          {
            id: `msg-${Date.now()}-q`,
            persona: s.pendingPrompt.persona,
            authorName: s.pendingPrompt.authorName,
            text: s.pendingPrompt.question,
            ts,
            fromPlayer: false,
          },
          {
            id: `msg-${Date.now()}-a`,
            persona: s.pendingPrompt.persona,
            authorName: 'You',
            text: opt.replyText,
            ts: ts + 1,
            fromPlayer: true,
          },
        ];
        if (s.soundEnabled) sfx.chatPop();
        set({
          chat: [...s.chat, ...newMessages].slice(-100),
          metrics: applyEffect(s.metrics, opt.effect),
          pendingPrompt: undefined,
        });
      },

      pushChatPrompt: () =>
        set((s) => ({ pendingPrompt: s.pendingPrompt ?? makePrompt() })),
    }),
    {
      name: 'sprint-wars-save-v2',
      partialize: (state) => ({
        appPhase: state.appPhase,
        runConfig: state.runConfig,
        seed: state.seed,
        module: state.module,
        sprint: state.sprint,
        day: state.day,
        phase: state.phase,
        gameOver: state.gameOver,
        speed: state.speed,
        soundEnabled: state.soundEnabled,
        goalSprints: state.goalSprints,
        metrics: state.metrics,
        team: state.team,
        tasks: state.tasks,
        emails: state.emails,
        incidents: state.incidents,
        systems: state.systems,
        events: state.events,
        chat: state.chat,
        pendingPrompt: state.pendingPrompt,
        achievements: state.achievements,
        storylines: state.storylines,
        techDebtItems: state.techDebtItems,
        archProjects: state.archProjects,
        news: state.news,
        candidates: state.candidates,
        streaks: state.streaks,
        history: state.history,
        planning: state.planning,
        undoBudget: state.undoBudget,
      }),
    },
  ),
);
