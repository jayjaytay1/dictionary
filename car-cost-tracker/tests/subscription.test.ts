import { test } from "node:test";
import assert from "node:assert/strict";
import { computeAccess, type Profile } from "@/lib/subscription";

const NOW = Date.parse("2026-07-21T00:00:00Z");
const inDays = (d: number) => new Date(NOW + d * 86_400_000).toISOString();

function profile(p: Partial<Profile> = {}): Profile {
  return {
    user_id: "u",
    trial_ends_at: inDays(3),
    stripe_customer_id: null,
    stripe_subscription_id: null,
    subscription_status: null,
    current_period_end: null,
    ...p,
  };
}

test("billing disabled → always full access", () => {
  const a = computeAccess({ profile: profile({ trial_ends_at: inDays(-5) }), billingEnabled: false, now: NOW });
  assert.equal(a.hasAccess, true);
});

test("no profile row → fails open (full access) even with billing on", () => {
  const a = computeAccess({ profile: null, billingEnabled: true, now: NOW });
  assert.equal(a.hasAccess, true);
});

test("active trial → access, with days left", () => {
  const a = computeAccess({ profile: profile({ trial_ends_at: inDays(3) }), billingEnabled: true, now: NOW });
  assert.equal(a.hasAccess, true);
  assert.equal(a.trialActive, true);
  assert.equal(a.trialDaysLeft, 3);
  assert.equal(a.isSubscribed, false);
});

test("expired trial, no subscription → no access", () => {
  const a = computeAccess({ profile: profile({ trial_ends_at: inDays(-1) }), billingEnabled: true, now: NOW });
  assert.equal(a.hasAccess, false);
  assert.equal(a.trialActive, false);
  assert.equal(a.trialDaysLeft, 0);
});

test("active subscription → access even after trial ended", () => {
  const a = computeAccess({
    profile: profile({ trial_ends_at: inDays(-10), subscription_status: "active" }),
    billingEnabled: true,
    now: NOW,
  });
  assert.equal(a.hasAccess, true);
  assert.equal(a.isSubscribed, true);
});

test("canceled subscription after trial → no access", () => {
  const a = computeAccess({
    profile: profile({ trial_ends_at: inDays(-10), subscription_status: "canceled" }),
    billingEnabled: true,
    now: NOW,
  });
  assert.equal(a.hasAccess, false);
});
