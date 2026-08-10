-- Run this in the Supabase SQL editor.

create table if not exists public.logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  log_date date not null,
  status text not null check (status in ('clean','relapse')),
  note text,
  deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create index if not exists logs_user_date_idx on public.logs (user_id, log_date);

-- Row level security: a user only ever sees their own rows.
alter table public.logs enable row level security;

drop policy if exists "own rows select" on public.logs;
create policy "own rows select" on public.logs
  for select using (auth.uid() = user_id);

drop policy if exists "own rows insert" on public.logs;
create policy "own rows insert" on public.logs
  for insert with check (auth.uid() = user_id);

drop policy if exists "own rows update" on public.logs;
create policy "own rows update" on public.logs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own rows delete" on public.logs;
create policy "own rows delete" on public.logs
  for delete using (auth.uid() = user_id);

-- Optional: let users wipe their account from Settings.
-- create or replace function public.delete_own_account() returns void
--   language sql security definer as $$
--   delete from auth.users where id = auth.uid();
-- $$;
