-- Integration test for the Car Cost Tracker schema + Row Level Security.
--
-- This reproduces the parts of Supabase that our policies depend on
-- (the `auth` schema, `auth.uid()`, and the `anon` / `authenticated`
-- roles), applies the real supabase/schema.sql, then simulates two
-- signed-in users the same way PostgREST does — by setting the role and
-- the `request.jwt.claim.sub` GUC per transaction — to prove that:
--   1. a user can read/write their own car + expenses,
--   2. a user CANNOT see or modify another user's data (RLS isolation),
--   3. totals and the category breakdown compute correctly.
--
-- Any failed assertion raises an exception and aborts (psql -v ON_ERROR_STOP).

\set ON_ERROR_STOP on

-- ---------------------------------------------------------------------------
-- Emulate the Supabase auth layer that our policies reference.
-- ---------------------------------------------------------------------------
create schema if not exists auth;

create table if not exists auth.users (
  id    uuid primary key default gen_random_uuid(),
  email text
);

-- Supabase's auth.uid() reads the JWT `sub` claim exposed by PostgREST.
create or replace function auth.uid() returns uuid
  language sql stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

-- Roles PostgREST switches into, mirroring a Supabase project.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
end$$;

-- =====> Apply the REAL application schema (unchanged). <=====
\i :schema

-- Grant table privileges exactly as Supabase does; RLS then filters rows.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.cars, public.expenses
  to authenticated;
-- Supabase also grants anon; RLS (no matching policy for a null uid) is what
-- actually blocks anonymous reads, so grant select here to test that path.
grant select on public.cars, public.expenses to anon;

-- ---------------------------------------------------------------------------
-- Seed two auth users.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'alice@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'bob@example.com');

-- Helper to assert a boolean condition.
create or replace function test_assert(cond boolean, msg text)
  returns void language plpgsql as $$
begin
  if not cond then
    raise exception 'ASSERTION FAILED: %', msg;
  end if;
  raise notice 'PASS: %', msg;
end$$;

-- ---------------------------------------------------------------------------
-- ACT AS ALICE: add a car + expenses (mimics onboarding + dashboard).
-- ---------------------------------------------------------------------------
begin;
  set local role authenticated;
  set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

  insert into public.cars (id, user_id, make, model, year, nickname)
  values ('aaaaaaaa-0000-0000-0000-000000000001',
          '11111111-1111-1111-1111-111111111111',
          'Toyota', 'Corolla', 2020, 'Daily Driver');

  insert into public.expenses (car_id, category, amount, description, date) values
    ('aaaaaaaa-0000-0000-0000-000000000001', 'fuel',        58.40, 'Shell', '2026-07-18'),
    ('aaaaaaaa-0000-0000-0000-000000000001', 'maintenance', 89.99, 'Oil',   '2026-07-12'),
    ('aaaaaaaa-0000-0000-0000-000000000001', 'insurance',  142.00, 'Prem',  '2026-07-01'),
    ('aaaaaaaa-0000-0000-0000-000000000001', 'repairs',    430.00, 'Brakes','2026-06-22');

  -- Alice sees her own car + all four expenses.
  select test_assert((select count(*) from public.cars) = 1, 'Alice sees exactly her 1 car');
  select test_assert((select count(*) from public.expenses) = 4, 'Alice sees her 4 expenses');

  -- All-time total = 720.39 ; July-only total = 290.39 (matches app logic).
  select test_assert((select sum(amount) from public.expenses) = 720.39,
                     'Alice all-time total is 720.39');
  select test_assert(
    (select sum(amount) from public.expenses where to_char(date,'YYYY-MM') = '2026-07') = 290.39,
    'Alice this-month (2026-07) total is 290.39');

  -- Category breakdown: repairs is the largest bucket at 430.00.
  select test_assert(
    (select category::text from public.expenses
       group by category order by sum(amount) desc limit 1) = 'repairs',
    'Alice top category is repairs');
commit;

-- ---------------------------------------------------------------------------
-- ACT AS BOB: must NOT see Alice's data, and cannot write into her car.
-- ---------------------------------------------------------------------------
begin;
  set local role authenticated;
  set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';

  select test_assert((select count(*) from public.cars) = 0,
                     'RLS: Bob sees 0 cars (Alice''s car is hidden)');
  select test_assert((select count(*) from public.expenses) = 0,
                     'RLS: Bob sees 0 expenses (Alice''s are hidden)');

  -- Bob tries to attach an expense to Alice's car → RLS WITH CHECK blocks it.
  do $$
  begin
    insert into public.expenses (car_id, category, amount, date)
    values ('aaaaaaaa-0000-0000-0000-000000000001', 'fuel', 10, '2026-07-20');
    raise exception 'SECURITY HOLE: Bob inserted into Alice''s car';
  exception when insufficient_privilege or check_violation then
    raise notice 'PASS: RLS blocks Bob from writing into Alice''s car';
  end$$;
commit;

-- ---------------------------------------------------------------------------
-- ANONYMOUS (not logged in): sees nothing.
-- ---------------------------------------------------------------------------
begin;
  set local role anon;
  select test_assert((select count(*) from public.cars) = 0,
                     'RLS: anonymous role sees 0 cars');
commit;

-- Back as Alice: deleting her expense works and updates the total.
begin;
  set local role authenticated;
  set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
  delete from public.expenses where description = 'Brakes';
  select test_assert((select sum(amount) from public.expenses) = 290.39,
                     'After deleting the 430.00 repair, total is 290.39');
commit;

\echo '==================================================='
\echo 'ALL DATABASE / RLS INTEGRATION TESTS PASSED'
\echo '==================================================='
