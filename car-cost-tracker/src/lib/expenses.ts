import type { Expense, ExpenseCategory } from "@/lib/types";
import { EXPENSE_CATEGORIES } from "@/lib/types";

/** Month bucket key "YYYY-MM" for an ISO date string ("YYYY-MM-DD"). */
export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

/** Sum of every expense amount. */
export function allTimeTotal(expenses: Expense[]): number {
  return round2(expenses.reduce((sum, e) => sum + e.amount, 0));
}

/** Sum of expenses falling in the given "YYYY-MM" month bucket. */
export function monthTotal(expenses: Expense[], key: string): number {
  return round2(
    expenses
      .filter((e) => monthKey(e.date) === key)
      .reduce((sum, e) => sum + e.amount, 0),
  );
}

export interface MonthGroup {
  key: string;
  total: number;
  items: Expense[];
}

/**
 * Group expenses into month buckets. Preserves the input order within each
 * bucket, so passing date-descending input yields most-recent-first groups.
 */
export function groupByMonth(expenses: Expense[]): MonthGroup[] {
  const groups = new Map<string, MonthGroup>();
  for (const e of expenses) {
    const key = monthKey(e.date);
    let group = groups.get(key);
    if (!group) {
      group = { key, total: 0, items: [] };
      groups.set(key, group);
    }
    group.items.push(e);
    group.total = round2(group.total + e.amount);
  }
  return Array.from(groups.values());
}

/** Total spent per category (only categories present are returned as a Map). */
export function categoryTotals(
  expenses: Expense[],
): Map<ExpenseCategory, number> {
  const totals = new Map<ExpenseCategory, number>();
  for (const e of expenses) {
    totals.set(e.category, round2((totals.get(e.category) ?? 0) + e.amount));
  }
  return totals;
}

export interface CategoryRow {
  category: ExpenseCategory;
  amount: number;
  pct: number;
}

/**
 * Category breakdown rows for categories with spend, largest first, each with
 * its percentage of the total.
 */
export function categoryBreakdown(
  expenses: Expense[],
  total: number,
): CategoryRow[] {
  const totals = categoryTotals(expenses);
  return EXPENSE_CATEGORIES.map((category) => {
    const amount = totals.get(category) ?? 0;
    return { category, amount, pct: total > 0 ? (amount / total) * 100 : 0 };
  })
    .filter((r) => r.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

/** Round to 2 decimals to avoid float drift in running sums. */
function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
