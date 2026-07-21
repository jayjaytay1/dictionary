"use client";

import { useTransition } from "react";
import type { Expense } from "@/lib/types";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/types";
import { groupByMonth } from "@/lib/expenses";
import { formatCurrency, formatDate, formatMonthLabel } from "@/lib/format";
import { deleteExpense } from "@/app/actions";

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
      className={`group flex items-center gap-3 py-3 transition ${
        isPending ? "opacity-40" : ""
      }`}
    >
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold ring-1"
        style={{
          backgroundColor: `${CATEGORY_COLORS[expense.category]}1f`,
          color: CATEGORY_COLORS[expense.category],
          boxShadow: `inset 0 0 0 1px ${CATEGORY_COLORS[expense.category]}33`,
        }}
        aria-hidden
      >
        {CATEGORY_LABELS[expense.category].charAt(0)}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-fg">
          {expense.description || CATEGORY_LABELS[expense.category]}
        </p>
        <p className="text-xs text-faint">
          {CATEGORY_LABELS[expense.category]} · {formatDate(expense.date)}
        </p>
      </div>

      <span className="shrink-0 text-sm font-semibold text-fg tabular-nums">
        {formatCurrency(expense.amount)}
      </span>

      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        aria-label="Delete expense"
        className="shrink-0 rounded-md p-1.5 text-faint transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed sm:opacity-0 sm:group-hover:opacity-100"
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
      <section className="rounded-2xl border border-dashed border-white/10 bg-surface/40 p-8 text-center">
        <p className="text-3xl" aria-hidden>
          📋
        </p>
        <h2 className="mt-3 text-sm font-semibold text-fg">No expenses yet</h2>
        <p className="mt-1 text-sm text-faint">
          Add your first expense above to start tracking your car&apos;s costs.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="px-1 text-sm font-semibold text-fg">Recent expenses</h2>

      {groups.map((group) => (
        <div
          key={group.key}
          className="rounded-2xl border border-white/[0.08] bg-surface/70 px-5 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between border-b border-white/[0.06] py-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-faint">
              {formatMonthLabel(group.key)}
            </h3>
            <span className="text-xs font-semibold text-muted tabular-nums">
              {formatCurrency(group.total)}
            </span>
          </div>
          <ul className="divide-y divide-white/[0.05]">
            {group.items.map((expense) => (
              <ExpenseRow key={expense.id} expense={expense} />
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
