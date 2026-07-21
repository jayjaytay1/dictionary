import { forwardRef } from "react";

const inputBase =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 " +
  "placeholder:text-slate-400 shadow-sm transition " +
  "focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30";

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
      className="mb-1.5 block text-sm font-medium text-slate-700"
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
      ? "bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-60"
      : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50";
  return (
    <button
      className={`inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed ${styles} ${className}`}
      {...props}
    />
  );
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </p>
  );
}

export function FormSuccess({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
      {message}
    </p>
  );
}
