import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Car, Expense } from "@/lib/types";
import {
  allTimeTotal,
  categoryTotals,
  monthKey,
  monthTotal,
} from "@/lib/expenses";
import { signOut } from "@/app/actions";
import AddExpense from "@/components/AddExpense";
import SummaryCards from "@/components/SummaryCards";
import CategoryBreakdown from "@/components/CategoryBreakdown";
import ExpenseList from "@/components/ExpenseList";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: car } = await supabase
    .from("cars")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<Car>();

  // No car yet → send them through onboarding first.
  if (!car) redirect("/onboarding");

  const { data: expensesData } = await supabase
    .from("expenses")
    .select("*")
    .eq("car_id", car.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  const expenses: Expense[] = (expensesData ?? []).map((e) => ({
    ...e,
    amount: Number(e.amount),
  }));

  // ----- Totals & breakdown (see src/lib/expenses.ts for the tested logic) -----
  const allTime = allTimeTotal(expenses);
  const thisMonth = monthTotal(expenses, monthKey(new Date().toISOString()));
  const byCategory = categoryTotals(expenses);

  const carName =
    car.nickname?.trim() ||
    `${car.year} ${car.make} ${car.model}`;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-white/[0.06] bg-bg/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3.5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-bright to-accent-2 text-lg shadow-[0_6px_20px_-8px_rgba(16,185,129,0.7)]">
              🚗
            </span>
            <div className="min-w-0">
              <p className="text-[0.65rem] font-medium uppercase tracking-wider text-faint">
                Tracking
              </p>
              <h1 className="truncate text-base font-semibold tracking-tight text-fg">
                {carName}
              </h1>
              {car.nickname ? (
                <p className="truncate text-xs text-faint">
                  {car.year} {car.make} {car.model}
                </p>
              ) : null}
            </div>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="shrink-0 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm font-medium text-muted transition hover:bg-white/[0.08] hover:text-fg"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-5 px-4 py-6">
        <SummaryCards allTime={allTime} thisMonth={thisMonth} />

        <AddExpense />

        <CategoryBreakdown total={allTime} byCategory={byCategory} />

        <ExpenseList expenses={expenses} />
      </main>
    </div>
  );
}
