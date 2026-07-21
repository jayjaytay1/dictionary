import Link from "next/link";
import { formatCurrency } from "@/lib/format";

export interface CarOverviewItem {
  id: string;
  name: string;
  spec: string;
  total: number;
  thisMonth: number;
}

/** Grid of per-car cards with each car's totals; tap to focus that car. */
export default function CarsOverview({ items }: { items: CarOverviewItem[] }) {
  return (
    <section>
      <h2 className="mb-3 px-1 text-sm font-semibold text-fg">Your cars</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((car) => (
          <Link
            key={car.id}
            href={`/dashboard?car=${car.id}`}
            className="group rounded-2xl border border-white/[0.08] bg-surface/70 p-4 backdrop-blur-sm transition hover:border-accent/30 hover:bg-surface"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.05] text-accent-bright ring-1 ring-white/10">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M5 11l1.5-4A2 2 0 0 1 8.4 5.6h7.2A2 2 0 0 1 17.5 7L19 11h.5a1.5 1.5 0 0 1 1.5 1.5V16a1 1 0 0 1-1 1h-1a2 2 0 1 1-4 0h-4a2 2 0 1 1-4 0H5a1 1 0 0 1-1-1v-3.5A1.5 1.5 0 0 1 5.5 11H5zm2.2-.5h9.6l-1-2.8a.6.6 0 0 0-.55-.4H8.75a.6.6 0 0 0-.56.4l-1 2.8z" />
                </svg>
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-fg">
                  {car.name}
                </p>
                <p className="truncate text-xs text-faint">{car.spec}</p>
              </div>
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="ml-auto h-4 w-4 shrink-0 text-faint transition group-hover:translate-x-0.5 group-hover:text-accent-bright"
              >
                <path
                  fillRule="evenodd"
                  d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-[0.65rem] uppercase tracking-wider text-faint">
                  Total
                </p>
                <p className="text-xl font-bold tracking-tight text-fg tabular-nums">
                  {formatCurrency(car.total)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[0.65rem] uppercase tracking-wider text-faint">
                  This month
                </p>
                <p className="text-sm font-semibold text-muted tabular-nums">
                  {formatCurrency(car.thisMonth)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
