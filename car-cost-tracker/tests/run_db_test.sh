#!/usr/bin/env bash
# Runs the RLS / schema integration test (tests/db_rls_test.sql).
#
# Usage:
#   1. Against your own database (e.g. a Supabase connection string):
#        DATABASE_URL=postgres://... bash tests/run_db_test.sh
#      (Uses an isolated schema-emulation; run against a throwaway DB.)
#
#   2. Zero-config: if no DATABASE_URL is set and local Postgres binaries are
#      available, this spins up a temporary throwaway cluster, runs the test,
#      and tears it down.
set -euo pipefail
cd "$(dirname "$0")/.."
SCHEMA="$(pwd)/supabase/schema.sql"

if [[ -n "${DATABASE_URL:-}" ]]; then
  echo "Running DB test against \$DATABASE_URL"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -v schema="$SCHEMA" -f tests/db_rls_test.sql
  exit $?
fi

# ---- Zero-config: ephemeral local cluster ----
PGBIN=""
for d in /usr/lib/postgresql/*/bin /usr/local/bin /opt/homebrew/bin; do
  [[ -x "$d/initdb" ]] && PGBIN="$d" && break
done
if [[ -z "$PGBIN" ]]; then
  echo "No DATABASE_URL and no local Postgres found. Set DATABASE_URL to a throwaway DB." >&2
  exit 1
fi

TMP="$(mktemp -d)"
trap '"$PGBIN/pg_ctl" -D "$TMP/data" stop -m immediate >/dev/null 2>&1 || true; rm -rf "$TMP"' EXIT
"$PGBIN/initdb" -D "$TMP/data" -U postgres --auth=trust >/dev/null
mkdir -p "$TMP/sock"
"$PGBIN/pg_ctl" -D "$TMP/data" -o "-k $TMP/sock -p 5433 -c listen_addresses=''" -w start >/dev/null
psql -h "$TMP/sock" -p 5433 -U postgres -c "create database cct_test;" >/dev/null
psql -h "$TMP/sock" -p 5433 -U postgres -d cct_test \
  -v ON_ERROR_STOP=1 -v schema="$SCHEMA" -f tests/db_rls_test.sql
