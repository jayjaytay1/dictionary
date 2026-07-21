"use client";

import { useState, useTransition } from "react";
import {
  createCheckoutSession,
  createPortalSession,
} from "@/app/billing/actions";
import { Button, FormError } from "@/components/ui";

export function SubscribeButton({ label = "Subscribe — $5/month" }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function go() {
    setError(null);
    startTransition(async () => {
      const res = await createCheckoutSession();
      if ("error" in res) {
        setError(res.error);
        return;
      }
      window.location.href = res.url;
    });
  }

  return (
    <div className="space-y-2">
      <Button type="button" onClick={go} disabled={isPending}>
        {isPending ? "Redirecting…" : label}
      </Button>
      <FormError message={error} />
    </div>
  );
}

export function ManageBillingButton() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function go() {
    setError(null);
    startTransition(async () => {
      const res = await createPortalSession();
      if ("error" in res) {
        setError(res.error);
        return;
      }
      window.location.href = res.url;
    });
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="ghost" onClick={go} disabled={isPending}>
        {isPending ? "Opening…" : "Manage billing"}
      </Button>
      <FormError message={error} />
    </div>
  );
}
