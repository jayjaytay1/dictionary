import { formatCurrency } from "@/lib/format";

export default function SummaryCards({
  allTime,
  thisMonth,
}: {
  allTime: number;
  thisMonth: number;
}) {
  return (
    <section className="grid grid-cols-2 gap-4">
      <div className="rounded-2xl bg-brand-600 p-5 text-white shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-100">
          Total spent
        </p>
        <p className="mt-2 text-2xl font-bold tracking-tight">
          {formatCurrency(allTime)}
        </p>
        <p className="mt-1 text-xs text-brand-100">All time</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          This month
        </p>
        <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          {formatCurrency(thisMonth)}
        </p>
        <p className="mt-1 text-xs text-slate-400">Spent so far</p>
      </div>
    </section>
  );
}
