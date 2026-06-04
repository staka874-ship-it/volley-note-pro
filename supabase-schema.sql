create table if not exists public.volley_note_team_states (
  team_slug text primary key,
  team_name text not null,
  password_hash text not null,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.volley_note_invites (
  token text primary key,
  team_slug text not null references public.volley_note_team_states(team_slug) on delete cascade,
  team_name text not null,
  role text not null check (role in ('player', 'coach')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists volley_note_invites_team_slug_idx
  on public.volley_note_invites(team_slug);

create index if not exists volley_note_invites_expires_at_idx
  on public.volley_note_invites(expires_at);

create table if not exists public.volley_note_subscriptions (
  team_slug text primary key references public.volley_note_team_states(team_slug) on delete cascade,
  team_name text not null,
  stripe_customer_id text not null,
  stripe_subscription_id text not null,
  status text not null,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.volley_note_team_states enable row level security;
alter table public.volley_note_invites enable row level security;
alter table public.volley_note_subscriptions enable row level security;

drop policy if exists "Volley Note app read teams" on public.volley_note_team_states;
drop policy if exists "Volley Note app insert teams" on public.volley_note_team_states;
drop policy if exists "Volley Note app update teams" on public.volley_note_team_states;
drop policy if exists "Volley Note prototype read" on public.volley_note_team_states;
drop policy if exists "Volley Note prototype insert" on public.volley_note_team_states;
drop policy if exists "Volley Note prototype update" on public.volley_note_team_states;
drop policy if exists "Volley Note app read invites" on public.volley_note_invites;
drop policy if exists "Volley Note app insert invites" on public.volley_note_invites;
drop policy if exists "Volley Note app read subscriptions" on public.volley_note_subscriptions;

create policy "Volley Note app read teams"
  on public.volley_note_team_states
  for select
  to anon
  using (true);

create policy "Volley Note app insert teams"
  on public.volley_note_team_states
  for insert
  to anon
  with check (true);

create policy "Volley Note app update teams"
  on public.volley_note_team_states
  for update
  to anon
  using (true)
  with check (true);

create policy "Volley Note app read invites"
  on public.volley_note_invites
  for select
  to anon
  using (expires_at > now());

create policy "Volley Note app insert invites"
  on public.volley_note_invites
  for insert
  to anon
  with check (expires_at > now());

create policy "Volley Note app read subscriptions"
  on public.volley_note_subscriptions
  for select
  to anon
  using (true);
