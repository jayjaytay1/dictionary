/** Format a number as USD currency. */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

/** Format an ISO date string (YYYY-MM-DD) as e.g. "Jul 20, 2026". */
export function formatDate(iso: string): string {
  // Parse as local date to avoid timezone shifting the day.
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Group key "YYYY-MM" → e.g. "July 2026". */
export function formatMonthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  const date = new Date(y, (m ?? 1) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
