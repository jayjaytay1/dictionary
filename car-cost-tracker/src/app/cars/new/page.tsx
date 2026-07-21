import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CarForm from "@/components/CarForm";

export default async function NewCarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <Link
        href="/dashboard"
        className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-fg"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path
            fillRule="evenodd"
            d="M12.79 5.23a.75.75 0 0 1-.02 1.06L8.832 10l3.938 3.71a.75.75 0 1 1-1.04 1.08l-4.5-4.25a.75.75 0 0 1 0-1.08l4.5-4.25a.75.75 0 0 1 1.06.02z"
            clipRule="evenodd"
          />
        </svg>
        Back to dashboard
      </Link>

      <div className="mb-8 animate-rise">
        <h1 className="text-2xl font-bold tracking-tight text-fg">Add a car</h1>
        <p className="mt-1.5 text-muted">
          Track another vehicle&apos;s costs alongside your others.
        </p>
      </div>

      <div className="animate-rise rounded-2xl border border-white/10 bg-surface/80 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <CarForm />
      </div>
    </main>
  );
}
