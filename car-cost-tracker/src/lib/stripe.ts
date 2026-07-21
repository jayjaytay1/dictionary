import Stripe from "stripe";

/** True when the server has Stripe credentials + a price configured. */
export function billingEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID);
}

export const PRICE_ID = process.env.STRIPE_PRICE_ID;

let cached: Stripe | null = null;

/** Lazily-created Stripe client. Throws if the secret key is missing. */
export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe is not configured (STRIPE_SECRET_KEY missing).");
  }
  if (!cached) {
    cached = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return cached;
}
