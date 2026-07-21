"use client";

import { useRef, useState, useTransition } from "react";
import { addExpense } from "@/app/actions";
import {
  CATEGORY_LABELS,
  EXPENSE_CATEGORIES,
} from "@/lib/types";
import { Button, FormError, Input, Label, Select } from "@/components/ui";

function today(): string {
  const now = new Date();
  const tz = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tz).toISOString().slice(0, 10);
}

export default function AddExpense() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addExpense(formData);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      // Reset the form but keep the date field usable by resetting to today.
      formRef.current?.reset();
    });
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">Add an expense</h2>

      <form ref={formRef} action={handleSubmit} className="mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select id="category" name="category" defaultValue="fuel" required>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={today()}
            max={today()}
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            name="description"
            placeholder="Optional — e.g. Shell station, oil change"
          />
        </div>

        <FormError message={error} />

        <Button type="submit" disabled={isPending}>
          {isPending ? "Adding…" : "Add expense"}
        </Button>
      </form>
    </section>
  );
}
