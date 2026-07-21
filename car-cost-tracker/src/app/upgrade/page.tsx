import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, computeAccess } from "@/lib/subscription";
import { billingEnabled } from "@/lib/stripe";
import { SubscribeButton, ManageBillingButton } from "@/components/BillingButtons";
import Logo from "@/components/Logo";

export const dynamic = "force-dynamic";

const FEATURES = [
  "Track unlimited cars",
  "Unlimited expenses & full history",
  "Combined + per-car totals",
  "Spending breakdown by category",
];

export default async function UpgradePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(supabase, user.id);
  const access = computeAccess({ profile, billingEnabled: billingEnabled() });

  const status = access.isSubscribed
    ? "subscribed"
    : access.trialActive
      ? "trial"
      : "expired";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="mb-8 flex items-center gap-2.5 animate-rise">
        <Logo size={36} />
        <span className="text-lg font-semibold tracking-tight text-fg">
          Car Cost Tracker
        </span>
      </div>

      {status === "subscribed" ? (
        <div className="animate-rise rounded-2xl border border-white/10 bg-surface/80 p-6 text-center shadow-2xl shadow-black/40 backdrop-blur-xl">
          <p className="text-3xl">✅</p>
          <h1 className="mt-3 text-xl font-semibold text-fg">
            You&apos;re on Premium
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Thanks for subscribing. Manage or cancel anytime.
          </p>
          <div className="mt-6 space-y-3">
            <ManageBillingButton />
            <Link
              href="/dashboard"
              className="block text-sm font-medium text-muted hover:text-fg"
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6 animate-rise">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-muted">
              {status === "trial"
                ? `${access.trialDaysLeft} day${access.trialDaysLeft === 1 ? "" : "s"} left in your free trial`
                : "Your free trial has ended"}
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-fg">
              Keep tracking every dollar
            </h1>
            <p className="mt-2 text-muted">
              {status === "trial"
                ? "Subscribe now so nothing pauses when your trial ends."
                : "Subscribe to pick up right where you left off."}
            </p>
          </div>

          <div className="animate-rise rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/[0.12] to-transparent p-6 shadow-2xl shadow-black/40">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tight text-fg">
                $5
              </span>
              <span className="text-muted">/ month</span>
            </div>

            <ul className="mt-5 space-y-2.5">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-fg/90">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/15 text-xs text-accent-bright ring-1 ring-accent/25">
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <SubscribeButton />
            </div>

            {!access.billingEnabled ? (
              <p className="mt-3 text-center text-xs text-faint">
                Billing isn&apos;t connected yet — add your Stripe keys to
                enable checkout.
              </p>
            ) : null}
          </div>

          {status === "trial" ? (
            <Link
              href="/dashboard"
              className="mt-6 text-center text-sm font-medium text-muted hover:text-fg"
            >
              Continue on trial
            </Link>
          ) : null}
        </>
      )}
    </main>
  );
}
