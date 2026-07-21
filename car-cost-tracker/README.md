# Car Cost Tracker

Track the true cost of owning your cars. Log every expense — fuel,
maintenance, insurance, registration, repairs, and anything else — and see
what each car (and your whole fleet) actually costs you over time.

**Stack:** Next.js (App Router) · TypeScript · Supabase (Auth + Postgres) ·
Stripe (billing) · Tailwind CSS · deploys to Vercel.

## Features

- **Auth** — Supabase email/password sign-up, log in, forgot/reset password.
- **Multiple cars** — add unlimited cars, switch between them, or view an
  **All cars** roll-up with combined and per-car totals.
- **Expenses** — category (incl. a free-text label for **Other**), amount,
  description, date. Grouped by month, with all-time and this-month totals and
  a **donut breakdown** by category.
- **Billing** — a **3-day free trial**, then a **$5/month** subscription via
  Stripe-hosted Checkout, with a billing portal to manage/cancel. The paywall
  stays dormant (app is free) until Stripe env vars are configured.
- **Security** — Postgres Row Level Security scopes every row to its owner;
  subscription state is server-managed and read-only to users. All keys come
  from environment variables and are never hardcoded.

## Getting started

### 1. Create a Supabase project

1. [supabase.com](https://supabase.com) → **New project**.
2. **SQL Editor → New query** → paste [`supabase/schema.sql`](./supabase/schema.sql)
   and run it. Creates `cars`, `expenses`, `profiles`, the enum, RLS policies,
   and the signup trigger that starts each user's 3-day trial. Safe to re-run.
3. (Optional) **Authentication → Providers → Email** → turn off "Confirm email"
   for faster testing.

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Required (Supabase → **Project Settings → API**):

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

Optional — only needed to turn the **paywall on** (leave blank to keep the app
free):

```
SUPABASE_SERVICE_ROLE_KEY=   # Supabase → API → service_role (SERVER ONLY)
STRIPE_SECRET_KEY=           # Stripe → Developers → API keys
STRIPE_PRICE_ID=             # a recurring $5/mo Price id (price_...)
STRIPE_WEBHOOK_SECRET=       # Stripe → Developers → Webhooks (whsec_...)
```

The anon key is safe in the browser (RLS protects the data). The service role
and Stripe secret keys are server-only — never expose them. `.env.local` is
gitignored.

### 3. Run it

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Enabling billing (Stripe)

1. Stripe → **Products** → add a product with a **recurring $5/month** price;
   copy its **Price id** (`price_...`) into `STRIPE_PRICE_ID`.
2. Copy your **Secret key** into `STRIPE_SECRET_KEY`, and the Supabase
   **service_role** secret into `SUPABASE_SERVICE_ROLE_KEY`.
3. Stripe → **Webhooks** → add endpoint `https://YOUR-APP/api/stripe/webhook`,
   subscribe to `checkout.session.completed` and
   `customer.subscription.{created,updated,deleted}`, and copy the signing
   secret into `STRIPE_WEBHOOK_SECRET`.
4. Redeploy. Enforcement (trial → paywall) activates automatically once the
   keys + price are present.

## Deploying to Vercel

1. Import the repo in Vercel.
2. **Set Root Directory to `car-cost-tracker`** (this app is a subdirectory).
3. Add the environment variables above in **Settings → Environment Variables**.
4. Deploy, then in Supabase → **Authentication → URL Configuration** add your
   Vercel URL to the Site URL / redirect allow-list.

## Tests

```bash
npm test        # logic: totals, month grouping, breakdown, trial/access rules
npm run test:db # applies schema.sql to Postgres and proves RLS user-isolation
```

See [`tests/README.md`](./tests/README.md).

## Project structure

```
car-cost-tracker/
├─ supabase/schema.sql        # DB schema + RLS + billing trigger — run in Supabase
├─ src/
│  ├─ middleware.ts           # refreshes session, guards routes
│  ├─ lib/
│  │  ├─ supabase/            # browser / server / middleware / admin clients
│  │  ├─ types.ts             # categories, Car & Expense types + helpers
│  │  ├─ expenses.ts          # totals / grouping / breakdown (tested)
│  │  ├─ subscription.ts      # trial + access logic (tested)
│  │  └─ stripe.ts            # Stripe client + billingEnabled()
│  ├─ app/
│  │  ├─ page.tsx             # landing
│  │  ├─ login, signup, forgot-password, reset-password, auth/callback
│  │  ├─ onboarding, cars/new # add cars
│  │  ├─ dashboard/           # multi-car totals, add expense, list, breakdown
│  │  ├─ upgrade/             # paywall / pricing
│  │  ├─ billing/actions.ts   # Stripe checkout + portal
│  │  ├─ api/stripe/webhook/  # subscription sync
│  │  └─ actions.ts           # server actions (cars, expenses, sign out)
│  └─ components/             # UI + feature components
```
