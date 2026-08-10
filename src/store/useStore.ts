import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as db from '../db';
import type { Status } from '../db';
import { computeStats, type Entry, type Stats } from '../logic/streaks';
import { todayKey, type DateKey } from '../lib/date';

export interface DayEntry { status: Status; note: string | null }

interface UndoSnapshot {
  date: DateKey;
  previous: DayEntry | null; // null means "there was no entry"
  label: string;
}

interface State {
  ready: boolean;
  logs: Record<DateKey, DayEntry>;
  stats: Stats;
  undo: UndoSnapshot | null;
  mode: 'guest' | 'account' | null;

  init: () => Promise<void>;
  refresh: () => Promise<void>;
  setLog: (date: DateKey, status: Status, note?: string | null) => Promise<void>;
  removeLog: (date: DateKey) => Promise<void>;
  applyUndo: () => Promise<void>;
  dismissUndo: () => void;
  setMode: (mode: 'guest' | 'account') => Promise<void>;
  wipe: () => Promise<void>;
}

const EMPTY: Stats = {
  current: 0, best: 0, totalClean: 0, totalRelapse: 0, lastRelapse: null,
};

export const useStore = create<State>((set, get) => ({
  ready: false,
  logs: {},
  stats: EMPTY,
  undo: null,
  mode: null,

  init: async () => {
    const mode = (await AsyncStorage.getItem('nuttrack.mode')) as 'guest' | 'account' | null;
    await get().refresh();
    set({ ready: true, mode });
  },

  refresh: async () => {
    const rows = await db.listLogs();
    const logs: Record<DateKey, DayEntry> = {};
    const entries: Entry[] = [];
    for (const r of rows) {
      logs[r.log_date] = { status: r.status, note: r.note };
      entries.push({ date: r.log_date, status: r.status });
    }
    set({ logs, stats: computeStats(entries) });
  },

  setLog: async (date, status, note) => {
    const previous = get().logs[date] ?? null;
    await db.upsertLog(date, status, note ?? previous?.note ?? null);
    await get().refresh();
    set({
      undo: {
        date,
        previous,
        label: date === todayKey()
          ? `Today marked ${status}`
          : `${date} marked ${status}`,
      },
    });
  },

  removeLog: async (date) => {
    const previous = get().logs[date] ?? null;
    await db.deleteLog(date);
    await get().refresh();
    set({ undo: { date, previous, label: 'Entry deleted' } });
  },

  applyUndo: async () => {
    const u = get().undo;
    if (!u) return;
    if (u.previous) await db.upsertLog(u.date, u.previous.status, u.previous.note);
    else await db.deleteLog(u.date);
    set({ undo: null });
    await get().refresh();
  },

  dismissUndo: () => set({ undo: null }),

  setMode: async (mode) => {
    await AsyncStorage.setItem('nuttrack.mode', mode);
    set({ mode });
  },

  wipe: async () => {
    await db.clearAll();
    await get().refresh();
  },
}));
