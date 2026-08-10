import { supabase } from './supabase';
import { applyRemote, markSynced, pendingLogs } from '../db';
import { useStore } from '../store/useStore';

type Result = { ok: true; pushed: number; pulled: number } | { ok: false; error: string };

export async function currentUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function signUp(email: string, password: string) {
  if (!supabase) return { ok: false as const, error: 'Supabase is not configured. Add your keys to .env.' };
  const { error } = await supabase.auth.signUp({ email, password });
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}

export async function signIn(email: string, password: string) {
  if (!supabase) return { ok: false as const, error: 'Supabase is not configured. Add your keys to .env.' };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}

export async function signOut() {
  await supabase?.auth.signOut();
}

/**
 * Push then pull. Conflicts resolve by updated_at (last write wins) — on the
 * push side Postgres takes whatever we send for that (user_id, log_date); on
 * the pull side applyRemote() keeps the newer of the two.
 */
export async function syncNow(): Promise<Result> {
  if (!supabase) return { ok: false, error: 'Supabase is not configured.' };
  const user = await currentUser();
  if (!user) return { ok: false, error: 'Sign in to sync.' };

  try {
    // --- push ---
    const pending = await pendingLogs();
    if (pending.length) {
      const payload = pending.map((r) => ({
        id: r.id,
        user_id: user.id,
        log_date: r.log_date,
        status: r.status,
        note: r.note,
        deleted: r.deleted === 1,
        created_at: r.created_at,
        updated_at: r.updated_at,
      }));
      const { error } = await supabase
        .from('logs')
        .upsert(payload, { onConflict: 'user_id,log_date' });
      if (error) return { ok: false, error: error.message };
      await markSynced(pending.map((r) => r.id));
    }

    // --- pull ---
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .eq('user_id', user.id);
    if (error) return { ok: false, error: error.message };
    for (const row of data ?? []) await applyRemote(row as any);

    await useStore.getState().refresh();
    return { ok: true, pushed: pending.length, pulled: data?.length ?? 0 };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Sync failed.' };
  }
}
