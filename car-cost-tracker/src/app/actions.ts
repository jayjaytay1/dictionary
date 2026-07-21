"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EXPENSE_CATEGORIES, type ExpenseCategory } from "@/lib/types";

export type ActionResult = { error: string } | { ok: true };

/** Create the user's car (Phase 1: one car per user) and go to the dashboard. */
export async function addCar(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const make = String(formData.get("make") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const yearRaw = String(formData.get("year") ?? "").trim();
  const nickname = String(formData.get("nickname") ?? "").trim();

  const year = Number(yearRaw);
  const currentYear = new Date().getFullYear();

  if (!make || !model) return { error: "Make and model are required." };
  if (!Number.isInteger(year) || year < 1900 || year > currentYear + 1) {
    return { error: "Please enter a valid year." };
  }

  // Guard against creating a second car for the same user in Phase 1.
  const { data: existing } = await supabase
    .from("cars")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing) {
    redirect("/dashboard");
  }

  const { error } = await supabase.from("cars").insert({
    user_id: user.id,
    make,
    model,
    year,
    nickname: nickname || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

/** Add an expense to the user's car. */
export async function addExpense(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const { data: car } = await supabase
    .from("cars")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!car) return { error: "Add a car before logging expenses." };

  const category = String(formData.get("category") ?? "") as ExpenseCategory;
  const amount = Number(formData.get("amount"));
  const description = String(formData.get("description") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const customCategory = String(formData.get("custom_category") ?? "")
    .trim()
    .slice(0, 40);

  if (!EXPENSE_CATEGORIES.includes(category)) {
    return { error: "Please choose a category." };
  }
  if (category === "other" && !customCategory) {
    return { error: "Tell us what kind of expense this is." };
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Enter an amount greater than 0." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { error: "Please choose a valid date." };
  }

  const { error } = await supabase.from("expenses").insert({
    car_id: car.id,
    category,
    custom_category: category === "other" ? customCategory : null,
    amount,
    description: description || null,
    date,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { ok: true };
}

/** Delete one of the user's expenses. RLS ensures ownership. */
export async function deleteExpense(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { ok: true };
}

/** Sign the user out and return to the landing page. */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
