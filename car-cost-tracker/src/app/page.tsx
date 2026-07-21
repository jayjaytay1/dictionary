import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
      <header className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent-bright to-accent-2 text-lg shadow-[0_6px_20px_-6px_rgba(16,185,129,0.7)]">
          🚗
        </span>
        <span className="text-lg font-semibold tracking-tight text-fg">
          Car Cost Tracker
        </span>
      </header>

      <div className="flex flex-1 flex-col justify-center py-12">
        <div className="animate-rise">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-bright" />
            Track every dollar your car costs
          </span>

          <h1 className="mt-5 text-[2.75rem] font-bold leading-[1.05] tracking-tight text-fg">
            Know what your car{" "}
            <span className="bg-gradient-to-r from-accent-bright to-accent-2 bg-clip-text text-transparent">
              really costs
            </span>{" "}
            you.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Log every expense — fuel, insurance, repairs, and more — in one
            place. See your running total and where the money actually goes.
          </p>
        </div>

        <ul className="mt-9 space-y-3.5">
          {[
            "Track every cost of ownership",
            "Totals for all-time and this month",
            "See your spending by category",
          ].map((item, i) => (
            <li
              key={item}
              className="flex items-center gap-3 text-[0.95rem] text-fg/90 animate-rise"
              style={{ animationDelay: `${80 + i * 70}ms` }}
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent/15 text-xs text-accent-bright ring-1 ring-accent/25">
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-10 space-y-3">
          <Link
            href="/signup"
            className="flex w-full items-center justify-center rounded-xl bg-gradient-to-b from-accent-bright to-accent px-4 py-3.5 text-sm font-semibold text-[#04120c] shadow-[0_10px_30px_-10px_rgba(16,185,129,0.7)] transition hover:brightness-110 active:brightness-95"
          >
            Get started — it&apos;s free
          </Link>
          <Link
            href="/login"
            className="flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm font-semibold text-fg transition hover:bg-white/[0.08]"
          >
            Log in
          </Link>
        </div>
      </div>

      <footer className="flex items-center justify-center gap-2 pt-6 text-center text-xs text-faint">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-3.5 w-3.5"
        >
          <path
            fillRule="evenodd"
            d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z"
            clipRule="evenodd"
          />
        </svg>
        Your financial data stays private and secure.
      </footer>
    </main>
  );
}
