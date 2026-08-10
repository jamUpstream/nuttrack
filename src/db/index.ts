import * as SQLite from 'expo-sqlite';
import type { DateKey } from '../lib/date';

export type Status = 'clean' | 'relapse';

export interface LogRow {
  id: string;
  log_date: DateKey;
  status: Status;
  note: string | null;
  created_at: string;
  updated_at: string;
  deleted: number; // tombstone, so deletes propagate to Supabase
  synced: number;
}

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function uuid(): string {
  // RFC4122-ish v4. Good enough for client-generated ids that Postgres accepts.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('nuttrack.db');
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS logs (
          id TEXT PRIMARY KEY NOT NULL,
          log_date TEXT NOT NULL UNIQUE,
          status TEXT NOT NULL CHECK (status IN ('clean','relapse')),
          note TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          deleted INTEGER NOT NULL DEFAULT 0,
          synced INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_logs_date ON logs(log_date);
        CREATE INDEX IF NOT EXISTS idx_logs_synced ON logs(synced);
      `);
      return db;
    })();
  }
  return dbPromise;
}

/** All live (non-deleted) logs, oldest first. */
export async function listLogs(): Promise<LogRow[]> {
  const db = await getDb();
  return db.getAllAsync<LogRow>(
    'SELECT * FROM logs WHERE deleted = 0 ORDER BY log_date ASC'
  );
}

/** Insert or update the entry for a day. One entry per day, enforced by UNIQUE. */
export async function upsertLog(
  date: DateKey,
  status: Status,
  note?: string | null
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO logs (id, log_date, status, note, created_at, updated_at, deleted, synced)
     VALUES (?, ?, ?, ?, ?, ?, 0, 0)
     ON CONFLICT(log_date) DO UPDATE SET
       status = excluded.status,
       note = excluded.note,
       updated_at = excluded.updated_at,
       deleted = 0,
       synced = 0`,
    [uuid(), date, status, note ?? null, now, now]
  );
}

/** Soft delete so the removal can still be pushed to the server. */
export async function deleteLog(date: DateKey): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE logs SET deleted = 1, synced = 0, updated_at = ? WHERE log_date = ?',
    [new Date().toISOString(), date]
  );
}

export async function pendingLogs(): Promise<LogRow[]> {
  const db = await getDb();
  return db.getAllAsync<LogRow>('SELECT * FROM logs WHERE synced = 0');
}

export async function markSynced(ids: string[]): Promise<void> {
  if (!ids.length) return;
  const db = await getDb();
  const marks = ids.map(() => '?').join(',');
  await db.runAsync(`UPDATE logs SET synced = 1 WHERE id IN (${marks})`, ids);
}

/** Apply a server row locally, last-write-wins on updated_at. */
export async function applyRemote(row: {
  id: string;
  log_date: string;
  status: Status;
  note: string | null;
  created_at: string;
  updated_at: string;
  deleted?: boolean;
}): Promise<void> {
  const db = await getDb();
  const local = await db.getFirstAsync<LogRow>(
    'SELECT * FROM logs WHERE log_date = ?',
    [row.log_date]
  );
  if (local && new Date(local.updated_at) >= new Date(row.updated_at)) return;
  await db.runAsync(
    `INSERT INTO logs (id, log_date, status, note, created_at, updated_at, deleted, synced)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1)
     ON CONFLICT(log_date) DO UPDATE SET
       id = excluded.id,
       status = excluded.status,
       note = excluded.note,
       updated_at = excluded.updated_at,
       deleted = excluded.deleted,
       synced = 1`,
    [
      row.id, row.log_date, row.status, row.note,
      row.created_at, row.updated_at, row.deleted ? 1 : 0,
    ]
  );
}

export async function clearAll(): Promise<void> {
  const db = await getDb();
  await db.execAsync('DELETE FROM logs;');
}

export async function exportCsv(): Promise<string> {
  const rows = await listLogs();
  const head = 'date,status,note\n';
  const body = rows
    .map((r) => `${r.log_date},${r.status},"${(r.note ?? '').replace(/"/g, '""')}"`)
    .join('\n');
  return head + body + '\n';
}
