-- Car Cost Tracker — Phase 1 schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- for your project. It is idempotent-ish for a fresh project.
--
-- Users are handled by Supabase Auth (auth.users). We reference auth.uid()
-- in Row Level Security policies so every row is scoped to its owner.

-- ---------------------------------------------------------------------------
-- Enum: expense categories
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'expense_category') then
    create type expense_category as enum (
      'fuel',
      'maintenance',
      'insurance',
      'registration',
      'repairs',
      'other'
    );
  end if;
end$$;

-- ---------------------------------------------------------------------------
-- Table: cars  (one car per user for Phase 1)
-- ---------------------------------------------------------------------------
create table if not exists public.cars (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  make       text not null,
  model      text not null,
  year       integer not null,
  nickname   text,
  created_at timestamptz not null default now()
);

create index if not exists cars_user_id_idx on public.cars (user_id);

-- ---------------------------------------------------------------------------
-- Table: expenses
-- ---------------------------------------------------------------------------
create table if not exists public.expenses (
  id              uuid primary key default gen_random_uuid(),
  car_id          uuid not null references public.cars (id) on delete cascade,
  category        expense_category not null,
  custom_category text,
  amount          numeric(12, 2) not null check (amount >= 0),
  description     text,
  date            date not null,
  created_at      timestamptz not null default now()
);

-- Added after v1: label typed by the user when category = 'other'.
-- Safe to run on an existing table.
alter table public.expenses
  add column if not exists custom_category text;

create index if not exists expenses_car_id_idx on public.expenses (car_id);
create index if not exists expenses_date_idx on public.expenses (date);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.cars enable row level security;
alter table public.expenses enable row level security;

-- cars: owner-only access
drop policy if exists "cars_select_own" on public.cars;
create policy "cars_select_own" on public.cars
  for select using (auth.uid() = user_id);

drop policy if exists "cars_insert_own" on public.cars;
create policy "cars_insert_own" on public.cars
  for insert with check (auth.uid() = user_id);

drop policy if exists "cars_update_own" on public.cars;
create policy "cars_update_own" on public.cars
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "cars_delete_own" on public.cars;
create policy "cars_delete_own" on public.cars
  for delete using (auth.uid() = user_id);

-- expenses: access allowed only when the parent car belongs to the user
drop policy if exists "expenses_select_own" on public.expenses;
create policy "expenses_select_own" on public.expenses
  for select using (
    exists (
      select 1 from public.cars c
      where c.id = expenses.car_id and c.user_id = auth.uid()
    )
  );

drop policy if exists "expenses_insert_own" on public.expenses;
create policy "expenses_insert_own" on public.expenses
  for insert with check (
    exists (
      select 1 from public.cars c
      where c.id = expenses.car_id and c.user_id = auth.uid()
    )
  );

drop policy if exists "expenses_update_own" on public.expenses;
create policy "expenses_update_own" on public.expenses
  for update using (
    exists (
      select 1 from public.cars c
      where c.id = expenses.car_id and c.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.cars c
      where c.id = expenses.car_id and c.user_id = auth.uid()
    )
  );

drop policy if exists "expenses_delete_own" on public.expenses;
create policy "expenses_delete_own" on public.expenses
  for delete using (
    exists (
      select 1 from public.cars c
      where c.id = expenses.car_id and c.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Billing: profiles (one per user) — 3-day free trial, then a $5/mo sub.
-- Billing state is written ONLY by trusted server code (Stripe webhook via
-- the service role). Users can read their own row but cannot modify it, so a
-- user can't extend their own trial or mark themselves subscribed.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  user_id                uuid primary key references auth.users (id) on delete cascade,
  trial_ends_at          timestamptz not null default (now() + interval '3 days'),
  stripe_customer_id     text,
  stripe_subscription_id text,
  subscription_status    text,
  current_period_end     timestamptz,
  updated_at             timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Read-only for the owner; no insert/update/delete policies (service role only).
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = user_id);

grant select on public.profiles to authenticated;

-- Auto-create a profile (starting the 3-day trial) for every new signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, trial_ends_at)
  values (new.id, now() + interval '3 days')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for users who signed up before billing existed
-- (their trial is measured from when they originally signed up).
insert into public.profiles (user_id, trial_ends_at)
select id, created_at + interval '3 days' from auth.users
on conflict (user_id) do nothing;
