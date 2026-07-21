import { forwardRef } from "react";

const inputBase =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 text-fg " +
  "placeholder:text-faint transition outline-none " +
  "focus:border-accent/60 focus:bg-white/[0.05] focus:ring-2 focus:ring-accent/25";

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className = "", ...props }, ref) {
  return <input ref={ref} className={`${inputBase} ${className}`} {...props} />;
});

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className = "", children, ...props }, ref) {
  return (
    <select ref={ref} className={`${inputBase} ${className}`} {...props}>
      {children}
    </select>
  );
});

export function Label({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted"
    >
      {children}
    </label>
  );
}

export function Button({
  className = "",
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
}) {
  const styles =
    variant === "primary"
      ? "bg-gradient-to-b from-accent-bright to-accent text-[#04120c] font-semibold " +
        "shadow-[0_8px_24px_-8px_rgba(16,185,129,0.6)] hover:brightness-110 " +
        "active:brightness-95 disabled:opacity-50"
      : "bg-white/[0.04] text-fg border border-white/10 hover:bg-white/[0.08]";
  return (
    <button
      className={`inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm transition disabled:cursor-not-allowed ${styles} ${className}`}
      {...props}
    />
  );
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
      {message}
    </p>
  );
}

export function FormSuccess({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p className="rounded-lg border border-accent/20 bg-accent/10 px-3 py-2 text-sm text-accent-bright">
      {message}
    </p>
  );
}
