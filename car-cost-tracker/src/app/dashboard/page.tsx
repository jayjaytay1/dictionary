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
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Tracking
            </p>
            <h1 className="truncate text-lg font-semibold tracking-tight text-slate-900">
              {carName}
            </h1>
            {car.nickname ? (
              <p className="truncate text-xs text-slate-500">
                {car.year} {car.make} {car.model}
              </p>
            ) : null}
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        <SummaryCards allTime={allTime} thisMonth={thisMonth} />

        <AddExpense />

        <CategoryBreakdown total={allTime} byCategory={byCategory} />

        <ExpenseList expenses={expenses} />
      </main>
    </div>
  );
}
