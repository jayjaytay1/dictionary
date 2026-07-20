import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Car, Expense, ExpenseCategory } from "@/lib/types";
import { signOut } from "@/app/actions";
import AddExpense from "@/components/AddExpense";
import SummaryCards from "@/components/SummaryCards";
import CategoryBreakdown from "@/components/CategoryBreakdown";
import ExpenseList from "@/components/ExpenseList";

export const dynamic = "force-dynamic";

function monthKey(iso: string): string {
  return iso.slice(0, 7); // "YYYY-MM"
}

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

  // ----- Totals -----
  const allTime = expenses.reduce((sum, e) => sum + e.amount, 0);

  const thisMonthKey = monthKey(new Date().toISOString());
  const thisMonth = expenses
    .filter((e) => monthKey(e.date) === thisMonthKey)
    .reduce((sum, e) => sum + e.amount, 0);

  // ----- Category breakdown -----
  const byCategory = new Map<ExpenseCategory, number>();
  for (const e of expenses) {
    byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amount);
  }

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
