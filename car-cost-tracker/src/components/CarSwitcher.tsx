"use client";

import Link from "next/link";

export interface CarTab {
  id: string;
  name: string;
}

/**
 * Horizontal, scrollable selector: "All cars" + one pill per car + Add.
 * Selection is driven by the `?car=` query param (server reads it).
 */
export default function CarSwitcher({
  cars,
  selected,
}: {
  cars: CarTab[];
  selected: string; // car id or "all"
}) {
  const pill = (active: boolean) =>
    `inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition ${
      active
        ? "border-accent/40 bg-accent/15 text-accent-bright"
        : "border-white/10 bg-white/[0.03] text-muted hover:bg-white/[0.07] hover:text-fg"
    }`;

  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {cars.length > 1 ? (
        <Link href="/dashboard" className={pill(selected === "all")}>
          <span>All cars</span>
        </Link>
      ) : null}

      {cars.map((c) => (
        <Link
          key={c.id}
          href={`/dashboard?car=${c.id}`}
          className={pill(selected === c.id)}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path d="M5 11l1.5-4A2 2 0 0 1 8.4 5.6h7.2A2 2 0 0 1 17.5 7L19 11h.5a1.5 1.5 0 0 1 1.5 1.5V16a1 1 0 0 1-1 1h-1a2 2 0 1 1-4 0h-4a2 2 0 1 1-4 0H5a1 1 0 0 1-1-1v-3.5A1.5 1.5 0 0 1 5.5 11H5zm2.2-.5h9.6l-1-2.8a.6.6 0 0 0-.55-.4H8.75a.6.6 0 0 0-.56.4l-1 2.8z" />
          </svg>
          <span className="max-w-[9rem] truncate">{c.name}</span>
        </Link>
      ))}

      <Link
        href="/cars/new"
        className="inline-flex shrink-0 items-center gap-1 rounded-full border border-dashed border-white/15 px-3.5 py-2 text-sm font-medium text-faint transition hover:border-accent/40 hover:text-accent-bright"
      >
        <span className="text-base leading-none">+</span> Add car
      </Link>
    </div>
  );
}
