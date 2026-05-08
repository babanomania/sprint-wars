// ============================================================================
// Sprint Wars — Type definitions
// ============================================================================

export type ModuleId =
  | 'dashboard'
  | 'sprint'
  | 'inbox'
  | 'incidents'
  | 'team'
  | 'architecture'
  | 'metrics'
  | 'chat'
  | 'hire';

// Outer routing — what *screen* the player is on.
export type AppPhase =
  | 'landing'
  | 'setup'
  | 'standup'
  | 'planning'
  | 'playing'
  | 'retro'
  | 'won'
  | 'lost';

// ---------- Metrics ---------------------------------------------------------
export interface Metrics {
  morale: number;
  techDebt: number;
  trust: number;
  velocity: number;
  stability: number;
  burnout: number;
  security: number;
  budget: number;
  patience: number;
  // Politics axis: -100 (Engineering-aligned) ↔ +100 (Product-aligned)
  politics: number;
}

// ---------- Team -----------------------------------------------------------
export type Archetype =
  | '10x'
  | 'junior'
  | 'burnout-senior'
  | 'difficult-architect'
  | 'qa-perfectionist'
  | 'devops-wizard'
  | 'reliable-mid'
  | 'product-eng'
  | 'rockstar-junior'
  | 'remote-only-savant'
  | 'security-curmudgeon'
  | 'data-mage';

export interface Developer {
  id: string;
  name: string;
  archetype: Archetype;
  title: string;
  skill: number;
  morale: number;
  burnout: number;
  ego: number;
  reliability: number;
  productivity: number;
  loyalty: number;          // 0..100, drifts based on choices
  specialization: 'frontend' | 'backend' | 'fullstack' | 'qa' | 'devops' | 'data' | 'security';
  status: 'available' | 'on-task' | 'blocked' | 'vacation' | 'resigned';
  taskId?: string;
  resignedAt?: number;
  notes: string[];
  hiddenFlaw?: string;       // revealed after hire, only for procedurally hired devs
  salary: number;            // monthly cost
}

export interface Candidate {
  id: string;
  name: string;
  archetype: Archetype;
  title: string;
  skill: number;
  productivity: number;
  reliability: number;
  ego: number;
  specialization: Developer['specialization'];
  salary: number;
  resumeBlurb: string;
  hiddenFlaw: string;
  asking: number;        // signing bonus
}

// ---------- Sprint Board ----------------------------------------------------
export type TaskStatus = 'backlog' | 'in-progress' | 'qa' | 'done' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'feature' | 'bug' | 'tech-debt' | 'security' | 'incident-fix';
  storyPoints: number;       // displayed estimate (may be wrong)
  truePoints: number;        // actual cost — revealed as work progresses
  priority: TaskPriority;
  hiddenComplexity: number;  // 0..1 — not shown until uncovered
  complexityRevealed: boolean;
  bugProbability: number;
  dependencies: string[];
  assigneeId?: string;
  status: TaskStatus;
  rushed: boolean;
  progress: number;
  createdSprint: number;
  systemId?: string;
  source: 'product' | 'security' | 'incident' | 'exec' | 'tech-debt' | 'storyline';
  storylineId?: string;
}

// ---------- Tech Debt items (named) ----------------------------------------
export interface TechDebtItem {
  id: string;
  title: string;
  origin: string;           // e.g. "from migration in 2022"
  systemId: string;
  weight: number;           // contribution to global debt (0..30)
  cost: number;             // story points to pay down
  age: number;              // sprints
}

// ---------- Inbox / Email ---------------------------------------------------
export type EmailSender =
  | 'product-manager'
  | 'cto'
  | 'ceo'
  | 'cfo'
  | 'qa-lead'
  | 'security'
  | 'developer'
  | 'client'
  | 'vp-eng'
  | 'devops'
  | 'legal';

export type EmailTone =
  | 'neutral'
  | 'panic'
  | 'passive-aggressive'
  | 'urgent'
  | 'corporate-cheerful';

export type ReplyTone = 'direct' | 'corporate' | 'apologetic' | 'aggressive';

export interface EmailChoice {
  id: string;
  label: string;
  effect: Partial<Metrics>;
  loyaltyDelta?: { archetype?: Archetype; specialization?: Developer['specialization']; amount: number };
  followUp?: string;
  spawnTask?: Partial<Task>;
  spawnIncident?: boolean;
  message?: string;
}

export interface Email {
  id: string;
  sender: EmailSender;
  senderName: string;
  subject: string;
  body: string;
  tone: EmailTone;
  receivedSprint: number;
  receivedDay: number;
  read: boolean;
  resolved: boolean;
  choices: EmailChoice[];
  pickedChoiceId?: string;
  resolution?: string;
  templateId?: string;
  storylineId?: string;
}

// ---------- Incidents -------------------------------------------------------
export type IncidentSeverity = 'SEV1' | 'SEV2' | 'SEV3' | 'SEV4';
export type IncidentStatus = 'open' | 'mitigating' | 'resolved' | 'rolled-back';

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  systemId: string;
  startedSprint: number;
  startedDay: number;
  ageMinutes: number;
  pageOps: number;
  rcaPosted: boolean;
  rcaText?: string;
  resolution?: 'rollback' | 'hotfix' | 'ignored' | 'resolved';
  cost: number;
}

// ---------- Architecture ----------------------------------------------------
export interface SystemNode {
  id: string;
  name: string;
  kind: 'gateway' | 'service' | 'datastore' | 'queue' | 'legacy' | 'ai' | 'auth' | 'cdn';
  health: number;
  techDebt: number;
  dependencies: string[];
  load: number;
  critical: boolean;
}

// Decomposition project — split a legacy node into smaller services over time.
export interface ArchProject {
  id: string;
  title: string;
  sourceSystemId: string;
  targetSystems: string[];      // names of new services to create
  totalPoints: number;
  pointsApplied: number;
  startedSprint: number;
}

// ---------- Executive Chat --------------------------------------------------
export type ChatPersona = 'ceo' | 'cto' | 'cfo' | 'vp-eng' | 'cmo' | 'board';

export interface ChatMessage {
  id: string;
  persona: ChatPersona;
  authorName: string;
  text: string;
  ts: number;
  fromPlayer: boolean;
  reactionId?: string;
}

export interface ChatPrompt {
  id: string;
  persona: ChatPersona;
  authorName: string;
  question: string;
  options: { id: string; label: string; effect: Partial<Metrics>; replyText: string }[];
}

// ---------- Random Events ---------------------------------------------------
export type RandomEventKind =
  | 'outage'
  | 'security-breach'
  | 'resignation'
  | 'audit'
  | 'cloud-bill-spike'
  | 'vendor-outage'
  | 'ai-hallucination'
  | 'db-corruption'
  | 'accidental-deploy'
  | 'ransomware-scare'
  | 'exec-panic';

export interface RandomEvent {
  id: string;
  kind: RandomEventKind;
  title: string;
  body: string;
  sprint: number;
  day: number;
  effects: Partial<Metrics>;
  spawnedIncidentId?: string;
  spawnedEmailId?: string;
}

// ---------- Storylines (long arcs) ------------------------------------------
export type StorylineId =
  | 'helios'         // the AI rewrite
  | 'merger'         // acquisition by Globex
  | 'compliance'     // regulator on the way
  | 'platform-rift'  // monolith rewrite faction war
  | 'series-d';      // funding round

export interface ActiveStoryline {
  id: StorylineId;
  title: string;
  step: number;       // current step index
  totalSteps: number;
  startedSprint: number;
  state: Record<string, number | string | boolean>;
}

// ---------- Achievements / Run scoring --------------------------------------
export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface StreakState {
  cleanSprints: number;       // sprints without SEV1
  emailsAnsweredInRow: number;
  noResignationStreak: number;
  velocityHits: number;       // sprints hitting committed velocity
  // Active buffs derived from streaks (applied to next sprint).
  buffs: { id: string; label: string; sprintsLeft: number; effect: string }[];
}

export interface NewsItem {
  id: string;
  text: string;
  flavor: 'industry' | 'internal' | 'meme';
  sprint: number;
  day: number;
}

// ---------- Run config (modifiers + draft) ----------------------------------
export type RunModifierId =
  | 'recently-acquired'
  | 'post-incident'
  | 'fresh-funding'
  | 'pre-ipo'
  | 'classic';

export interface RunModifier {
  id: RunModifierId;
  name: string;
  blurb: string;
  metricDeltas: Partial<Metrics>;
  startingFlags: string[];
}

export interface RunConfig {
  modifierId: RunModifierId;
  pickedArchetypes: Archetype[];     // from draft
  goalQuarters: number;              // win condition
}

// ---------- Run summary (for retro) -----------------------------------------
export interface SprintSummary {
  sprint: number;
  velocity: number;
  committed: number;
  shipped: string[];        // task titles
  bugsCreated: number;
  incidents: number;
  resignations: number;
  metricsDelta: Partial<Metrics>;
  retroQuote: string;
  highlight?: string;       // optional highlight blurb
  lowlight?: string;
}

// ---------- Game phase ------------------------------------------------------
export type GamePhase = 'early' | 'mid' | 'late' | 'gameover';

export interface GameOverState {
  active: boolean;
  reason?: string;
}

// ---------- Reply tone effect modifiers --------------------------------------
export interface ToneModifier {
  trust: number;
  patience: number;
  morale: number;
}
