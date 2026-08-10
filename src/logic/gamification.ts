import { MILESTONES, type Stats } from './streaks';

export interface Badge {
  days: number;
  name: string;
  icon: string;
  earned: boolean;
}

export const BADGE_NAMES: Record<number, { name: string; icon: string }> = {
  7: { name: 'One Week In', icon: 'looks_one' },
  30: { name: 'Full Moon', icon: 'dark_mode' },
  90: { name: 'Quarter Master', icon: 'workspace_premium' },
  365: { name: 'Year One', icon: 'military_tech' },
};

export function badges(stats: Stats): Badge[] {
  return MILESTONES.map((days) => ({
    days,
    ...BADGE_NAMES[days],
    earned: stats.best >= days,
  }));
}

/** 10 XP per clean day, plus a lump sum for each milestone you've ever hit. */
export function xp(stats: Stats): number {
  const milestoneXp = MILESTONES
    .filter((m) => stats.best >= m)
    .reduce((sum, m) => sum + m * 5, 0);
  return stats.totalClean * 10 + milestoneXp;
}

export const LEVELS = [
  { level: 1, title: 'Rookie', at: 0 },
  { level: 2, title: 'Trying', at: 100 },
  { level: 3, title: 'Consistent', at: 300 },
  { level: 4, title: 'Disciplined', at: 700 },
  { level: 5, title: 'Iron Will', at: 1200 },
  { level: 6, title: 'Monk Mode', at: 2000 },
  { level: 7, title: 'Untouchable', at: 3500 },
  { level: 8, title: 'Legend', at: 6000 },
];

export function levelFor(points: number) {
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) if (points >= LEVELS[i].at) idx = i;
  const cur = LEVELS[idx];
  const next = LEVELS[idx + 1] ?? null;
  const span = next ? next.at - cur.at : 1;
  const progress = next ? (points - cur.at) / span : 1;
  return { ...cur, next, progress: Math.min(1, Math.max(0, progress)) };
}

export const QUOTES = [
  'Discipline is choosing what you want most over what you want now.',
  'The streak is a side effect. The habit is the point.',
  'You have survived 100% of your worst days so far.',
  'Motivation gets you started. Boredom is where the work happens.',
  'One day is a decision. Thirty days is an identity.',
  'Relapsing is data, not a verdict. Log it and keep going.',
  'The urge peaks and passes. It always passes.',
  'Small and consistent beats big and occasional.',
];

/** Stable per-day pick so the quote doesn't reshuffle on every render. */
export function quoteOfTheDay(dateKey: string): string {
  let h = 0;
  for (let i = 0; i < dateKey.length; i++) h = (h * 31 + dateKey.charCodeAt(i)) >>> 0;
  return QUOTES[h % QUOTES.length];
}
