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
  const rows = EXPENSE_CATEGORIES.map((cat) => ({
    category: cat,
    amount: byCategory.get(cat) ?? 0,
  }))
    .filter((r) => r.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const hasData = rows.length > 0 && total > 0;

  // Donut geometry
  const R = 52;
  const STROKE = 16;
  const C = 2 * Math.PI * R;
  const GAP = rows.length > 1 ? 2 : 0; // small gap between segments (in %)

  let offsetPct = 0;
  const segments = rows.map((row) => {
    const pct = (row.amount / total) * 100;
    const seg = {
      color: CATEGORY_COLORS[row.category],
      dash: Math.max(0, (pct / 100) * C - GAP),
      offset: (offsetPct / 100) * C,
    };
    offsetPct += pct;
    return seg;
  });

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-surface/70 p-5 backdrop-blur-sm">
      <h2 className="text-sm font-semibold text-fg">Spending by category</h2>

      {!hasData ? (
        <p className="mt-3 text-sm text-faint">
          No expenses yet. Add your first one above.
        </p>
      ) : (
        <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          {/* Donut */}
          <div className="relative h-40 w-40 shrink-0">
            <svg
              viewBox="0 0 140 140"
              className="h-full w-full -rotate-90"
              aria-hidden
            >
              <circle
                cx="70"
                cy="70"
                r={R}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth={STROKE}
              />
              {segments.map((s, i) => (
                <circle
                  key={i}
                  cx="70"
                  cy="70"
                  r={R}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  strokeDasharray={`${s.dash} ${C - s.dash}`}
                  strokeDashoffset={-s.offset}
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold tracking-tight text-fg tabular-nums">
                {formatCurrency(total)}
              </span>
              <span className="text-[0.65rem] uppercase tracking-wider text-faint">
                total
              </span>
            </div>
          </div>

          {/* Legend */}
          <ul className="w-full flex-1 space-y-2.5">
            {rows.map((row) => {
              const pct = (row.amount / total) * 100;
              return (
                <li
                  key={row.category}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2.5 text-muted">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor: CATEGORY_COLORS[row.category],
                        boxShadow: `0 0 8px ${CATEGORY_COLORS[row.category]}66`,
                      }}
                    />
                    {CATEGORY_LABELS[row.category]}
                  </span>
                  <span className="tabular-nums font-medium text-fg">
                    {formatCurrency(row.amount)}
                    <span className="ml-1.5 text-xs font-normal text-faint">
                      {pct.toFixed(0)}%
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
