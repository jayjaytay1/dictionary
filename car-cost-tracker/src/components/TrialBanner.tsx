import Link from "next/link";

/** Slim banner on the dashboard while the free trial is running. */
export default function TrialBanner({ daysLeft }: { daysLeft: number }) {
  return (
    <Link
      href="/upgrade"
      className="flex items-center justify-between gap-3 rounded-xl border border-accent/25 bg-accent/[0.08] px-4 py-3 transition hover:bg-accent/[0.12]"
    >
      <span className="flex items-center gap-2 text-sm text-fg">
        <span className="text-base">✨</span>
        <span>
          <span className="font-semibold">
            {daysLeft} day{daysLeft === 1 ? "" : "s"} left
          </span>{" "}
          in your free trial
        </span>
      </span>
      <span className="shrink-0 text-sm font-semibold text-accent-bright">
        Upgrade →
      </span>
    </Link>
  );
}
