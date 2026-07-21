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
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-12">
      <header className="flex items-center gap-2">
        <span className="text-2xl" aria-hidden>
          🚗
        </span>
        <span className="text-lg font-semibold tracking-tight text-slate-900">
          Car Cost Tracker
        </span>
      </header>

      <div className="flex flex-1 flex-col justify-center py-12">
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900">
          Know what your car{" "}
          <span className="text-brand-600">really costs</span> you.
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Log every expense — fuel, insurance, repairs, and more — in one
          place. See your running total and where the money actually goes.
        </p>

        <ul className="mt-8 space-y-3 text-slate-700">
          {[
            "Track every cost of ownership",
            "See totals for all-time and this month",
            "Understand your spending by category",
          ].map((item) => (
            <li key={item} className="flex items-center gap-3">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
                aria-hidden
              >
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-10 space-y-3">
          <Link
            href="/signup"
            className="flex w-full items-center justify-center rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            Get started — it&apos;s free
          </Link>
          <Link
            href="/login"
            className="flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Log in
          </Link>
        </div>
      </div>

      <footer className="pt-6 text-center text-xs text-slate-400">
        Your financial data stays private and secure.
      </footer>
    </main>
  );
}
