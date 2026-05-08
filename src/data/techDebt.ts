import type { TechDebtItem } from '../types';

export const STARTING_TECH_DEBT_ITEMS: TechDebtItem[] = [
  {
    id: 'debt-1',
    title: 'Auth shim from 2022 migration',
    origin: 'A 14-line "temporary" middleware. Still here.',
    systemId: 'auth',
    weight: 12,
    cost: 5,
    age: 0,
  },
  {
    id: 'debt-2',
    title: 'Monolith billing\'s "TaxCalculator2.java"',
    origin: 'There was no TaxCalculator1. Nobody knows.',
    systemId: 'monolith',
    weight: 18,
    cost: 13,
    age: 0,
  },
  {
    id: 'debt-3',
    title: 'Hardcoded customer-X discount',
    origin: 'Sales promised it in 2021. Still in prod.',
    systemId: 'billing',
    weight: 6,
    cost: 2,
    age: 0,
  },
  {
    id: 'debt-4',
    title: 'Kafka consumer that retries forever',
    origin: 'Eats CPU. Producer is gone.',
    systemId: 'kafka',
    weight: 8,
    cost: 3,
    age: 0,
  },
  {
    id: 'debt-5',
    title: '47 unused feature flags',
    origin: 'Some are checked in code. Some aren\'t. Roll the dice.',
    systemId: 'monolith',
    weight: 4,
    cost: 2,
    age: 0,
  },
];
