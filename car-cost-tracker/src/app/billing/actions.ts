"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe, PRICE_ID } from "@/lib/stripe";

type UrlResult = { url: string } | { error: string };

async function siteOrigin(): Promise<string> {
  const h = await headers();
  return (
    h.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    (h.get("host") ? `https://${h.get("host")}` : "")
  );
}

/** Start a Stripe Checkout subscription session; returns the redirect URL. */
export async function createCheckoutSession(): Promise<UrlResult> {
  if (!process.env.STRIPE_SECRET_KEY || !PRICE_ID) {
    return { error: "Billing isn't configured yet." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const stripe = getStripe();
  const admin = createAdminClient();

  // Reuse the customer id if we've created one before.
  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  let customerId = profile?.stripe_customer_id ?? undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
    await admin
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("user_id", user.id);
  }

  const origin = await siteOrigin();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: PRICE_ID, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url: `${origin}/upgrade?checkout=cancelled`,
    subscription_data: { metadata: { user_id: user.id } },
  });

  if (!session.url) return { error: "Could not start checkout." };
  return { url: session.url };
}

/** Open the Stripe billing portal so the user can manage/cancel. */
export async function createPortalSession(): Promise<UrlResult> {
  if (!process.env.STRIPE_SECRET_KEY) {
    return { error: "Billing isn't configured yet." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.stripe_customer_id) {
    return { error: "No billing account yet." };
  }

  const origin = await siteOrigin();
  const session = await getStripe().billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${origin}/dashboard`,
  });
  return { url: session.url };
}
