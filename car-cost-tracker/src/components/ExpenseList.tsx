"use client";

import { useTransition } from "react";
import type { Expense } from "@/lib/types";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/types";
import { formatCurrency, formatDate, formatMonthLabel } from "@/lib/format";
import { deleteExpense } from "@/app/actions";

interface MonthGroup {
  key: string;
  total: number;
  items: Expense[];
}

function groupByMonth(expenses: Expense[]): MonthGroup[] {
  const groups = new Map<string, MonthGroup>();
  for (const e of expenses) {
    const key = e.date.slice(0, 7); // YYYY-MM
    let group = groups.get(key);
    if (!group) {
      group = { key, total: 0, items: [] };
      groups.set(key, group);
    }
    group.items.push(e);
    group.total += e.amount;
  }
  // Expenses arrive already sorted date-desc, so insertion order is correct.
  return Array.from(groups.values());
}

function ExpenseRow({ expense }: { expense: Expense }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this expense?")) return;
    startTransition(async () => {
      await deleteExpense(expense.id);
    });
  }

  return (
    <li
      className={`flex items-center gap-3 py-3 ${
        isPending ? "opacity-50" : ""
      }`}
    >
      <span
        className="h-8 w-8 shrink-0 rounded-full"
        style={{ backgroundColor: `${CATEGORY_COLORS[expense.category]}22` }}
        aria-hidden
      >
        <span
          className="flex h-full w-full items-center justify-center text-xs font-bold"
          style={{ color: CATEGORY_COLORS[expense.category] }}
        >
          {CATEGORY_LABELS[expense.category].charAt(0)}
        </span>
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">
          {expense.description || CATEGORY_LABELS[expense.category]}
        </p>
        <p className="text-xs text-slate-500">
          {CATEGORY_LABELS[expense.category]} · {formatDate(expense.date)}
        </p>
      </div>

      <span className="shrink-0 text-sm font-semibold text-slate-900">
        {formatCurrency(expense.amount)}
      </span>

      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        aria-label="Delete expense"
        className="shrink-0 rounded-md p-1.5 text-slate-300 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
        >
          <path
            fillRule="evenodd"
            d="M8.75 1a1 1 0 0 0-.96.73L7.56 3H4a.75.75 0 0 0 0 1.5h.06l.86 11.17A2 2 0 0 0 6.91 17.5h6.18a2 2 0 0 0 1.99-1.83L15.94 4.5H16a.75.75 0 0 0 0-1.5h-3.56l-.23-1.27A1 1 0 0 0 11.25 1h-2.5ZM9 7.25a.75.75 0 0 1 .75.75v5a.75.75 0 0 1-1.5 0V8A.75.75 0 0 1 9 7.25Zm2.75.75a.75.75 0 0 0-1.5 0v5a.75.75 0 0 0 1.5 0V8Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </li>
  );
}

export default function ExpenseList({ expenses }: { expenses: Expense[] }) {
  const groups = groupByMonth(expenses);

  if (expenses.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
        <p className="text-3xl" aria-hidden>
          📋
        </p>
        <h2 className="mt-3 text-sm font-semibold text-slate-900">
          No expenses yet
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Add your first expense above to start tracking your car&apos;s costs.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <h2 className="text-sm font-semibold text-slate-900">Recent expenses</h2>

      {groups.map((group) => (
        <div
          key={group.key}
          className="rounded-2xl border border-slate-200 bg-white px-5 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-slate-100 py-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {formatMonthLabel(group.key)}
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              {formatCurrency(group.total)}
            </span>
          </div>
          <ul className="divide-y divide-slate-100">
            {group.items.map((expense) => (
              <ExpenseRow key={expense.id} expense={expense} />
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
