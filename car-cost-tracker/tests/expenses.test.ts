import { test } from "node:test";
import assert from "node:assert/strict";
import {
  allTimeTotal,
  monthTotal,
  monthKey,
  groupByMonth,
  categoryTotals,
  categoryBreakdown,
} from "@/lib/expenses";
import type { Expense } from "@/lib/types";

function exp(partial: Partial<Expense> & { amount: number; date: string }): Expense {
  return {
    id: Math.random().toString(36).slice(2),
    car_id: "car",
    category: "fuel",
    custom_category: null,
    description: null,
    created_at: "",
    ...partial,
  };
}

// Same fixture as the DB test, date-descending like the dashboard query.
const expenses: Expense[] = [
  exp({ category: "fuel", amount: 58.4, date: "2026-07-18" }),
  exp({ category: "maintenance", amount: 89.99, date: "2026-07-12" }),
  exp({ category: "insurance", amount: 142.0, date: "2026-07-01" }),
  exp({ category: "repairs", amount: 430.0, date: "2026-06-22" }),
];

test("allTimeTotal sums every expense without float drift", () => {
  assert.equal(allTimeTotal(expenses), 720.39);
  assert.equal(allTimeTotal([]), 0);
});

test("monthTotal filters to the given month bucket", () => {
  assert.equal(monthTotal(expenses, "2026-07"), 290.39);
  assert.equal(monthTotal(expenses, "2026-06"), 430.0);
  assert.equal(monthTotal(expenses, "2025-01"), 0);
});

test("monthKey extracts YYYY-MM", () => {
  assert.equal(monthKey("2026-07-18"), "2026-07");
});

test("groupByMonth buckets by month, preserving most-recent-first order", () => {
  const groups = groupByMonth(expenses);
  assert.equal(groups.length, 2);
  assert.equal(groups[0].key, "2026-07");
  assert.equal(groups[0].items.length, 3);
  assert.equal(groups[0].total, 290.39);
  assert.equal(groups[1].key, "2026-06");
  assert.equal(groups[1].total, 430.0);
});

test("categoryTotals aggregates per category", () => {
  const totals = categoryTotals([
    ...expenses,
    exp({ category: "fuel", amount: 41.6, date: "2026-05-01" }),
  ]);
  assert.equal(totals.get("fuel"), 100.0); // 58.40 + 41.60
  assert.equal(totals.get("repairs"), 430.0);
  assert.equal(totals.has("other"), false);
});

test("categoryBreakdown returns spend rows, largest first, with percentages", () => {
  const total = allTimeTotal(expenses);
  const rows = categoryBreakdown(expenses, total);
  assert.equal(rows[0].category, "repairs");
  assert.equal(rows[0].amount, 430.0);
  assert.equal(Math.round(rows[0].pct), 60); // 430/720.39 ≈ 59.7%
  // Only categories with spend appear, and they are strictly descending.
  assert.equal(rows.length, 4);
  for (let i = 1; i < rows.length; i++) {
    assert.ok(rows[i - 1].amount >= rows[i].amount);
  }
});

test("empty input is handled everywhere", () => {
  assert.deepEqual(groupByMonth([]), []);
  assert.deepEqual(categoryBreakdown([], 0), []);
  assert.equal(categoryTotals([]).size, 0);
});
