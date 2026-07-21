"use client";

import { useState, useTransition } from "react";
import { addCar } from "@/app/actions";
import { Button, FormError, Input, Label } from "@/components/ui";

export default function CarForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addCar(formData);
      // addCar redirects on success; only an error result returns here.
      if (result && "error" in result) setError(result.error);
    });
  }

  const currentYear = new Date().getFullYear();

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="make">Make</Label>
          <Input id="make" name="make" required placeholder="Toyota" />
        </div>
        <div>
          <Label htmlFor="model">Model</Label>
          <Input id="model" name="model" required placeholder="Corolla" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            name="year"
            type="number"
            inputMode="numeric"
            min={1900}
            max={currentYear + 1}
            required
            placeholder={String(currentYear)}
          />
        </div>
        <div>
          <Label htmlFor="nickname">Nickname</Label>
          <Input
            id="nickname"
            name="nickname"
            placeholder="Optional"
          />
        </div>
      </div>

      <FormError message={error} />

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Start tracking"}
      </Button>
    </form>
  );
}
