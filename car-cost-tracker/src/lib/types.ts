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

// Accent colour per category — used for the breakdown bars and dots.
export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  fuel: "#0ea5e9",
  maintenance: "#8b5cf6",
  insurance: "#10b981",
  registration: "#f59e0b",
  repairs: "#ef4444",
  other: "#64748b",
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
  amount: number;
  description: string | null;
  date: string;
  created_at: string;
}
