import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CarForm from "@/components/CarForm";
import Logo from "@/components/Logo";
import { getProfile, computeAccess } from "@/lib/subscription";
import { billingEnabled } from "@/lib/stripe";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const access = computeAccess({
    profile: await getProfile(supabase, user.id),
    billingEnabled: billingEnabled(),
  });
  if (!access.hasAccess) redirect("/upgrade");

  // If they already have a car, skip onboarding.
  const { data: car } = await supabase
    .from("cars")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (car) redirect("/dashboard");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="mb-8 animate-rise">
        <Logo size={48} rounded="rounded-2xl" />
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
