export const FIRST_NAMES = [
  'Alex', 'Priya', 'Jordan', 'Sam', 'Taylor', 'Morgan', 'Riley', 'Casey',
  'Devika', 'Marcus', 'Chen', 'Sofia', 'Kai', 'Nadia', 'Tomas', 'Ivy',
  'Dmitri', 'Lin', 'Reyna', 'Owen', 'Imani', 'Hassan', 'Yuki', 'Bea',
  'Rohan', 'Zara', 'Felix', 'Anika', 'Bjorn', 'Mira',
];

export const LAST_NAMES = [
  'Reyes', 'Patel', 'Nguyen', 'Park', 'Singh', 'Kovacs', 'Okafor', 'Liu',
  'Schmidt', 'Tanaka', 'Mehta', 'Diaz', 'Brown', 'Volkov', 'Adeyemi',
  'Petrov', 'Marchetti', 'Yamada', 'Hassan', 'Kowalski',
];

export function randomName(rng: () => number): string {
  const f = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
  const l = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
  return `${f} ${l}`;
}
