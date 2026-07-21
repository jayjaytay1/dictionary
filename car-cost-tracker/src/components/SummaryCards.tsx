import { formatCurrency } from "@/lib/format";

export default function SummaryCards({
  allTime,
  thisMonth,
}: {
  allTime: number;
  thisMonth: number;
}) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Hero: total spent all-time */}
      <div className="relative overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/[0.18] via-accent-2/[0.08] to-transparent p-5 shadow-2xl shadow-black/40 sm:col-span-2">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/25 blur-3xl" />
        <div className="relative">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-accent-bright">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-bright shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
            Total spent
          </p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-fg tabular-nums">
            {formatCurrency(allTime)}
          </p>
          <p className="mt-1 text-xs text-muted">All time · true cost of ownership</p>
        </div>
      </div>

      {/* This month */}
      <div className="rounded-2xl border border-white/[0.08] bg-surface/70 p-5 backdrop-blur-sm">
        <p className="text-xs font-medium uppercase tracking-wider text-faint">
          This month
        </p>
        <p className="mt-3 text-2xl font-bold tracking-tight text-fg tabular-nums">
          {formatCurrency(thisMonth)}
        </p>
        <p className="mt-1 text-xs text-faint">Spent so far</p>
      </div>
    </section>
  );
}
