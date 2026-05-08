import type { SystemNode } from '../types';

export const STARTING_ARCHITECTURE: SystemNode[] = [
  { id: 'cdn', name: 'Edge CDN', kind: 'cdn', health: 95, techDebt: 10, dependencies: [], load: 30, critical: true },
  { id: 'gateway', name: 'API Gateway', kind: 'gateway', health: 90, techDebt: 25, dependencies: ['cdn'], load: 50, critical: true },
  { id: 'auth', name: 'Auth Service', kind: 'auth', health: 85, techDebt: 35, dependencies: ['gateway'], load: 40, critical: true },
  { id: 'monolith', name: 'Legacy Monolith', kind: 'legacy', health: 60, techDebt: 80, dependencies: ['gateway', 'auth'], load: 75, critical: true },
  { id: 'billing', name: 'Billing Service', kind: 'service', health: 80, techDebt: 40, dependencies: ['monolith', 'auth'], load: 35, critical: true },
  { id: 'kafka', name: 'Kafka Cluster', kind: 'queue', health: 88, techDebt: 30, dependencies: [], load: 60, critical: false },
  { id: 'analytics', name: 'Analytics Pipeline', kind: 'service', health: 75, techDebt: 45, dependencies: ['kafka'], load: 50, critical: false },
  { id: 'db-primary', name: 'Postgres Primary', kind: 'datastore', health: 82, techDebt: 50, dependencies: [], load: 70, critical: true },
  { id: 'db-replica', name: 'Postgres Replica', kind: 'datastore', health: 85, techDebt: 40, dependencies: ['db-primary'], load: 45, critical: false },
  { id: 'ai', name: 'AI Service', kind: 'ai', health: 70, techDebt: 60, dependencies: ['gateway'], load: 55, critical: false },
];
