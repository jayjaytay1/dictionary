# Tests

Two suites cover the parts of Phase 1 where real bugs live: the money math
and the security model.

## Logic tests — `npm test`

Unit tests for the totals / month-grouping / category-breakdown logic in
[`src/lib/expenses.ts`](../src/lib/expenses.ts), run with Node's built-in test
runner via `tsx`.

```bash
npm test
```

Covers all-time and per-month totals (with float-drift protection),
month bucketing / ordering, per-category aggregation, and the sorted
breakdown with percentages — including empty-input edge cases.

## Database + RLS integration test — `npm run test:db`

Applies the **real** [`supabase/schema.sql`](../supabase/schema.sql) to a
Postgres database, then simulates two signed-in Supabase users (by setting the
role + `request.jwt.claim.sub` GUC exactly as PostgREST does) to prove:

- a user can read/write their own car and expenses;
- **Row Level Security isolates users** — one user sees zero of another
  user's rows and cannot write into another user's car;
- an anonymous (logged-out) role sees nothing;
- totals and the category breakdown compute correctly, and deleting an
  expense updates the total.

```bash
# Zero-config: spins up a throwaway local Postgres, runs, tears down.
npm run test:db

# …or against any throwaway database (e.g. a scratch Supabase project):
DATABASE_URL=postgres://user:pass@host:5432/dbname npm run test:db
```

Requires either local Postgres binaries (`initdb`/`pg_ctl`, e.g. the
`postgresql` package) or a `DATABASE_URL` to a database you don't mind
mutating.
