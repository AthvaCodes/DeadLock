-- Run once in the Supabase SQL Editor before deploying the app.
create table if not exists public.deadlock_state (
  id text primary key check (id = 'main'),
  state jsonb not null default '{"users": {}, "rooms": {}}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Only the server's Supabase secret key can read or write this app state.
alter table public.deadlock_state enable row level security;
revoke all on table public.deadlock_state from anon, authenticated;
