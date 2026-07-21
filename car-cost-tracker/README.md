# Car Cost Tracker — Phase 1 (Foundation)

Track the true cost of owning your car. Log every expense — fuel,
maintenance, insurance, registration, repairs — in one place and see what
your car actually costs you over time.

**Stack:** Next.js (App Router) · TypeScript · Supabase (Auth + Postgres) ·
Tailwind CSS · deploys to Vercel.

This is **Phase 1 of 6** (Foundation). It's a real, working skeleton:
sign up → add your car → log expenses → see your running total, end to end.

## What's in Phase 1

- **Auth** — Supabase email/password sign-up, log in, forgot/reset password.
- **Onboarding** — after sign-up, add your car (make, model, year, optional
  nickname). One car per user for now.
- **Dashboard**
  - Add-expense form (category, amount, description, date — manual entry).
  - Expense list, most-recent-first, grouped by month with monthly subtotals.
  - Running totals: **all-time** and **this month**.
  - Spending **breakdown by category** (list + simple bars).
- **Security** — Postgres Row Level Security scopes every row to its owner;
  Supabase keys come from environment variables and are never hardcoded.

**Not in this phase** (later): maintenance reminders, Stripe/payments, admin
dashboard, multi-car support, receipt scanning, email notifications.

## Getting started

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**.
2. Once it's ready, open **SQL Editor → New query**, paste the contents of
   [`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates
   the `cars` and `expenses` tables, the `expense_category` enum, and the RLS
   policies.
3. (Optional) Under **Authentication → Providers → Email**, you can turn
   "Confirm email" off for faster local testing. With it on, sign-up sends a
   confirmation link that returns to `/auth/callback`.

### 2. Configure environment variables

Copy the example file and fill in the two values from
**Supabase → Project Settings → API**:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

The anon key is safe to expose to the browser — RLS is what protects the data.
`.env.local` is gitignored; never commit real keys.

### 3. Run it

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Deploying to Vercel

1. Push this repo to GitHub (already done if you're reading this on GitHub).
2. In Vercel, **Add New → Project** and import the repo.
3. **Set the Root Directory to `car-cost-tracker`** (this app lives in a
   subdirectory). Vercel auto-detects Next.js from there.
4. Add the two environment variables (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in **Settings → Environment Variables**.
5. Deploy.
6. In Supabase → **Authentication → URL Configuration**, add your Vercel URL
   to the **Site URL** / redirect allow-list so email links resolve correctly.

## Tests

```bash
npm test        # logic: totals, month grouping, category breakdown
npm run test:db # applies schema.sql to Postgres and proves RLS user-isolation
```

The DB test simulates two Supabase users and verifies that Row Level Security
keeps one user's cars/expenses fully invisible to another, plus that totals and
the breakdown are correct. See [`tests/README.md`](./tests/README.md).

## Project structure

```
car-cost-tracker/
├─ supabase/schema.sql        # DB schema + RLS — run once in Supabase
├─ src/
│  ├─ middleware.ts           # refreshes session, guards routes
│  ├─ lib/supabase/           # browser / server / middleware clients
│  ├─ lib/types.ts            # categories, Car & Expense types
│  ├─ app/
│  │  ├─ page.tsx             # landing (redirects logged-in users)
│  │  ├─ login, signup, forgot-password, reset-password
│  │  ├─ auth/callback/       # email-link session exchange
│  │  ├─ onboarding/          # add your car
│  │  ├─ dashboard/           # totals, add expense, list, breakdown
│  │  └─ actions.ts           # server actions (add car/expense, delete, sign out)
│  └─ components/             # UI + feature components
```
