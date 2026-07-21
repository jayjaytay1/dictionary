import type { SupabaseClient } from "@supabase/supabase-js";

export interface Profile {
  user_id: string;
  trial_ends_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  current_period_end: string | null;
}

export interface AccessState {
  /** Whether the user may use the app right now. */
  hasAccess: boolean;
  isSubscribed: boolean;
  trialActive: boolean;
  trialDaysLeft: number;
  trialEndsAt: string | null;
  billingEnabled: boolean;
}

const ACTIVE_STATUSES = new Set(["active", "trialing"]);
const DAY_MS = 86_400_000;

/**
 * Pure access computation — easy to unit test.
 *
 * Rules:
 * - Billing off (no Stripe configured) → always full access.
 * - No profile row (e.g. schema not applied yet) → fail open (full access),
 *   so the app never hard-locks a user due to missing billing setup.
 * - Otherwise: access if subscribed OR still within the trial window.
 */
export function computeAccess(args: {
  profile: Profile | null;
  billingEnabled: boolean;
  now?: number;
}): AccessState {
  const { profile, billingEnabled } = args;
  const now = args.now ?? Date.now();

  const isSubscribed = ACTIVE_STATUSES.has(profile?.subscription_status ?? "");
  const trialEnd = profile?.trial_ends_at
    ? Date.parse(profile.trial_ends_at)
    : null;
  const trialActive = trialEnd !== null && now < trialEnd;
  const trialDaysLeft =
    trialEnd !== null ? Math.max(0, Math.ceil((trialEnd - now) / DAY_MS)) : 0;

  const hasAccess =
    !billingEnabled || profile === null || isSubscribed || trialActive;

  return {
    hasAccess,
    isSubscribed,
    trialActive,
    trialDaysLeft,
    trialEndsAt: profile?.trial_ends_at ?? null,
    billingEnabled,
  };
}

/** Read the user's profile row; returns null if missing or the table is absent. */
export async function getProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<Profile | null> {
  const { data } = await supabase
    .from("profiles")
    .select(
      "user_id, trial_ends_at, stripe_customer_id, stripe_subscription_id, subscription_status, current_period_end",
    )
    .eq("user_id", userId)
    .maybeSingle();
  return (data as Profile) ?? null;
}
