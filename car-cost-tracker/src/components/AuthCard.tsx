import Link from "next/link";

/**
 * Centered card layout shared by all auth screens (login, signup, forgot).
 */
export default function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 text-slate-900"
        >
          <span className="text-2xl" aria-hidden>
            🚗
          </span>
          <span className="text-lg font-semibold tracking-tight">
            Car Cost Tracker
          </span>
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          ) : null}
          <div className="mt-6">{children}</div>
        </div>

        {footer ? (
          <div className="mt-6 text-center text-sm text-slate-500">
            {footer}
          </div>
        ) : null}
      </div>
    </main>
  );
}
