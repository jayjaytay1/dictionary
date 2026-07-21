import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { type Car, type Expense, carName, carSpec } from "@/lib/types";
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
import CarSwitcher from "@/components/CarSwitcher";
import CarsOverview, { type CarOverviewItem } from "@/components/CarsOverview";
import TrialBanner from "@/components/TrialBanner";
import DeleteCarButton from "@/components/DeleteCarButton";
import Logo from "@/components/Logo";
import { getProfile, computeAccess } from "@/lib/subscription";
import { billingEnabled } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ car?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Paywall: enforce access (3-day trial → subscription). No-ops until Stripe
  // is configured, and fails open if the profiles table isn't set up yet.
  const access = computeAccess({
    profile: await getProfile(supabase, user.id),
    billingEnabled: billingEnabled(),
  });
  if (!access.hasAccess) redirect("/upgrade");

  const { data: carsData } = await supabase
    .from("cars")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const cars: Car[] = carsData ?? [];
  if (cars.length === 0) redirect("/onboarding");

  const carIds = cars.map((c) => c.id);
  const { data: expensesData } = await supabase
    .from("expenses")
    .select("*")
    .in("car_id", carIds)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  const allExpenses: Expense[] = (expensesData ?? []).map((e) => ({
    ...e,
    amount: Number(e.amount),
  }));

  // ----- Which car is selected? -----
  const params = await searchParams;
  const validIds = new Set(carIds);
  const selected =
    params.car && validIds.has(params.car) ? params.car : "all";

  const shown =
    selected === "all"
      ? allExpenses
      : allExpenses.filter((e) => e.car_id === selected);

  // ----- Totals for the current view -----
  const allTime = allTimeTotal(shown);
  const thisKey = monthKey(new Date().toISOString());
  const thisMonth = monthTotal(shown, thisKey);
  const byCategory = categoryTotals(shown);

  const carNames: Record<string, string> = Object.fromEntries(
    cars.map((c) => [c.id, carName(c)]),
  );

  const isAll = selected === "all";
  const selectedCar = cars.find((c) => c.id === selected);

  const context = isAll
    ? `Across ${cars.length} ${cars.length === 1 ? "car" : "cars"} · all time`
    : selectedCar
      ? `${carSpec(selectedCar)} · all time`
      : "All time";

  // Per-car overview (all view, multiple cars)
  const overview: CarOverviewItem[] = cars.map((c) => {
    const carExp = allExpenses.filter((e) => e.car_id === c.id);
    return {
      id: c.id,
      name: carName(c),
      spec: carSpec(c),
      total: allTimeTotal(carExp),
      thisMonth: monthTotal(carExp, thisKey),
    };
  });

  const carTabs = cars.map((c) => ({ id: c.id, name: carName(c) }));
  const defaultCarId = isAll ? cars[0].id : selected;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-white/[0.06] bg-bg/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <Logo size={36} />
            <span className="text-base font-semibold tracking-tight text-fg">
              Car Cost Tracker
            </span>
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

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        {access.billingEnabled && !access.isSubscribed && access.trialActive ? (
          <TrialBanner daysLeft={access.trialDaysLeft} />
        ) : null}

        <CarSwitcher cars={carTabs} selected={selected} />

        <SummaryCards
          allTime={allTime}
          thisMonth={thisMonth}
          context={context}
          extraLabel={isAll ? "Cars" : "Entries"}
          extraValue={isAll ? String(cars.length) : String(shown.length)}
        />

        {isAll && cars.length > 1 ? <CarsOverview items={overview} /> : null}

        <AddExpense cars={carTabs} defaultCarId={defaultCarId} />

        <CategoryBreakdown total={allTime} byCategory={byCategory} />

        <ExpenseList
          expenses={shown}
          carNames={isAll ? carNames : undefined}
        />

        {!isAll && selectedCar ? (
          <DeleteCarButton carId={selectedCar.id} carName={carName(selectedCar)} />
        ) : null}
      </main>
    </div>
  );
}
