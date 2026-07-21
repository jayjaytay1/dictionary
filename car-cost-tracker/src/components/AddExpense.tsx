"use client";

import { useRef, useState, useTransition } from "react";
import { addExpense } from "@/app/actions";
import {
  CATEGORY_LABELS,
  EXPENSE_CATEGORIES,
  type ExpenseCategory,
} from "@/lib/types";
import { Button, FormError, Input, Label, Select } from "@/components/ui";

function today(): string {
  const now = new Date();
  const tz = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tz).toISOString().slice(0, 10);
}

export default function AddExpense({
  cars,
  defaultCarId,
}: {
  cars: { id: string; name: string }[];
  defaultCarId: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<ExpenseCategory>("fuel");
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
      setCategory("fuel");
    });
  }

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-surface/70 p-5 backdrop-blur-sm">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-fg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4 text-accent-bright"
        >
          <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
        </svg>
        Add an expense
      </h2>

      <form ref={formRef} action={handleSubmit} className="mt-4 space-y-4">
        {cars.length > 1 ? (
          <div>
            <Label htmlFor="car_id">Car</Label>
            <Select id="car_id" name="car_id" defaultValue={defaultCarId} required>
              {cars.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
        ) : (
          <input type="hidden" name="car_id" value={defaultCarId} />
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              id="category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              required
            >
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

        {category === "other" ? (
          <div>
            <Label htmlFor="custom_category">What kind of expense?</Label>
            <Input
              id="custom_category"
              name="custom_category"
              required
              maxLength={40}
              placeholder="e.g. Car wash, Parking, Tolls"
            />
          </div>
        ) : null}

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
