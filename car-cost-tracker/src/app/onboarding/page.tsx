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
      <div className="mb-8">
        <span className="text-3xl" aria-hidden>
          🚗
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Add your car
        </h1>
        <p className="mt-1 text-slate-600">
          Tell us about your car so we can start tracking its costs.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <CarForm />
      </div>
    </main>
  );
}
