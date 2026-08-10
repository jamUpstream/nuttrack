import { addDays, daysBetween, todayKey, type DateKey } from '../lib/date';
import type { Status } from '../db';

export interface Entry { date: DateKey; status: Status }

export interface Stats {
  current: number;
  best: number;
  totalClean: number;
  totalRelapse: number;
  lastRelapse: DateKey | null;
}

/**
 * Streaks are always derived from the full log set, never incremented in place.
 * That's what makes backdated edits and deletes correct for free: change any
 * day, recompute, done.
 *
 * Definition: a streak is a run of consecutive calendar days containing no
 * relapse, bounded by the first day you ever logged and today. Days with no
 * entry don't break a streak — only a logged relapse does. (Matches "days
 * since last relapse" from the spec.)
 */
export function computeStats(entries: Entry[]): Stats {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const today = todayKey();

  const totalClean = sorted.filter((e) => e.status === 'clean').length;
  const relapses = sorted.filter((e) => e.status === 'relapse').map((e) => e.date);

  if (sorted.length === 0) {
    return { current: 0, best: 0, totalClean: 0, totalRelapse: 0, lastRelapse: null };
  }

  const first = sorted[0].date;
  const lastRelapse = relapses.length ? relapses[relapses.length - 1] : null;

  // Current streak: from the day after the last relapse (or from your first
  // log if you've never relapsed) through today, inclusive.
  const currentStart = lastRelapse ? addDays(lastRelapse, 1) : first;
  const current = Math.max(0, daysBetween(currentStart, today) + 1);

  // Best streak: longest clean run. Segments are [first .. r1-1],
  // [r1+1 .. r2-1], ..., [rN+1 .. today].
  let best = current;
  let segStart = first;
  for (const r of relapses) {
    const len = daysBetween(segStart, addDays(r, -1)) + 1;
    if (len > best) best = len;
    segStart = addDays(r, 1);
  }

  return {
    current,
    best: Math.max(0, best),
    totalClean,
    totalRelapse: relapses.length,
    lastRelapse,
  };
}

/** Days left until the next badge milestone, for the Stats progress bar. */
export const MILESTONES = [7, 30, 90, 365];

export function nextMilestone(current: number): { target: number; remaining: number } | null {
  const target = MILESTONES.find((m) => m > current);
  return target ? { target, remaining: target - current } : null;
}
