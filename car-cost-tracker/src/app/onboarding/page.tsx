import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CarForm from "@/components/CarForm";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // If they already have a car, skip onboarding.
  const { data: car } = await supabase
    .from("cars")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (car) redirect("/dashboard");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="mb-8 animate-rise">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-accent-bright to-accent-2 text-2xl shadow-[0_10px_30px_-10px_rgba(16,185,129,0.7)]">
          🚗
        </span>
        <p className="mt-5 text-xs font-medium uppercase tracking-wide text-accent-bright">
          Step 1 of 1
        </p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-fg">
          Add your car
        </h1>
        <p className="mt-1.5 text-muted">
          Tell us about your car so we can start tracking its costs.
        </p>
      </div>

      <div className="animate-rise rounded-2xl border border-white/10 bg-surface/80 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <CarForm />
      </div>
    </main>
  );
}
