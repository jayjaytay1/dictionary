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
      <div className="w-full max-w-sm animate-rise">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2.5 text-fg"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent-bright to-accent-2 text-lg shadow-[0_6px_20px_-6px_rgba(16,185,129,0.7)]">
            🚗
          </span>
          <span className="text-lg font-semibold tracking-tight">
            Car Cost Tracker
          </span>
        </Link>

        <div className="rounded-2xl border border-white/10 bg-surface/80 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <h1 className="text-xl font-semibold tracking-tight text-fg">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
          ) : null}
          <div className="mt-6">{children}</div>
        </div>

        {footer ? (
          <div className="mt-6 text-center text-sm text-muted">{footer}</div>
        ) : null}
      </div>
    </main>
  );
}
