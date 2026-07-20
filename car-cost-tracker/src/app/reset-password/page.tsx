"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthCard from "@/components/AuthCard";
import { Button, FormError, Input, Label } from "@/components/ui";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    // The recovery link establishes a temporary session; updateUser sets the
    // new password against it.
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthCard
      title="Choose a new password"
      subtitle="Enter a new password for your account."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
        </div>

        <FormError message={error} />

        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : "Update password"}
        </Button>
      </form>
    </AuthCard>
  );
}
