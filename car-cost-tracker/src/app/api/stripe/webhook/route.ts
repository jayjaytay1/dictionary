import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Extract the subscription's current period end (handles Stripe API shapes). */
function periodEnd(sub: Stripe.Subscription): string | null {
  const top = (sub as unknown as { current_period_end?: number })
    .current_period_end;
  if (typeof top === "number") return new Date(top * 1000).toISOString();
  const item = sub.items?.data?.[0] as unknown as {
    current_period_end?: number;
  };
  if (item?.current_period_end) {
    return new Date(item.current_period_end * 1000).toISOString();
  }
  return null;
}

/**
 * Stripe webhook — keeps our profiles.subscription_status in sync with
 * Stripe. Verifies the signature, then upserts by customer id using the
 * service role (RLS-bypassing) client.
 */
export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "not configured" }, { status: 400 });
  }

  const stripe = getStripe();
  const signature = req.headers.get("stripe-signature") ?? "";
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  async function sync(customerId: string, sub: Stripe.Subscription) {
    await admin
      .from("profiles")
      .update({
        stripe_subscription_id: sub.id,
        subscription_status: sub.status,
        current_period_end: periodEnd(sub),
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_customer_id", customerId);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.subscription && session.customer) {
        const sub = await stripe.subscriptions.retrieve(
          session.subscription as string,
        );
        await sync(session.customer as string, sub);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await sync(sub.customer as string, sub);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
