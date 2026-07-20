import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  EXPENSE_CATEGORIES,
  type ExpenseCategory,
} from "@/lib/types";
import { formatCurrency } from "@/lib/format";

export default function CategoryBreakdown({
  total,
  byCategory,
}: {
  total: number;
  byCategory: Map<ExpenseCategory, number>;
}) {
  // Show categories that have any spend, largest first.
  const rows = EXPENSE_CATEGORIES.map((cat) => ({
    category: cat,
    amount: byCategory.get(cat) ?? 0,
  }))
    .filter((r) => r.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">
        Spending by category
      </h2>

      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">
          No expenses yet. Add your first one above.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((row) => {
            const pct = total > 0 ? (row.amount / total) * 100 : 0;
            const color = CATEGORY_COLORS[row.category];
            return (
              <li key={row.category}>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-700">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: color }}
                      aria-hidden
                    />
                    {CATEGORY_LABELS[row.category]}
                  </span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(row.amount)}
                    <span className="ml-1.5 text-xs font-normal text-slate-400">
                      {pct.toFixed(0)}%
                    </span>
                  </span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
