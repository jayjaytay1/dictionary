export const EXPENSE_CATEGORIES = [
  "fuel",
  "maintenance",
  "insurance",
  "registration",
  "repairs",
  "other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  fuel: "Fuel",
  maintenance: "Maintenance",
  insurance: "Insurance",
  registration: "Registration",
  repairs: "Repairs",
  other: "Other",
};

// Accent colour per category — tuned to be vivid on the dark UI.
export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  fuel: "#38bdf8",
  maintenance: "#a78bfa",
  insurance: "#34d399",
  registration: "#fbbf24",
  repairs: "#fb7185",
  other: "#94a3b8",
};

export interface Car {
  id: string;
  user_id: string;
  make: string;
  model: string;
  year: number;
  nickname: string | null;
  created_at: string;
}

export interface Expense {
  id: string;
  car_id: string;
  category: ExpenseCategory;
  custom_category: string | null;
  amount: number;
  description: string | null;
  date: string;
  created_at: string;
}

/**
 * Human label for an expense's category — the user's custom text when the
 * category is "other", otherwise the fixed category label.
 */
export function expenseCategoryLabel(expense: {
  category: ExpenseCategory;
  custom_category?: string | null;
}): string {
  if (expense.category === "other" && expense.custom_category?.trim()) {
    return expense.custom_category.trim();
  }
  return CATEGORY_LABELS[expense.category];
}
