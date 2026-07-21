"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCar } from "@/app/actions";

/** Subtle "remove this car" control shown when a single car is in focus. */
export default function DeleteCarButton({
  carId,
  carName,
}: {
  carId: string;
  carName: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (
      !confirm(
        `Delete "${carName}" and all of its expenses? This can't be undone.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      await deleteCar(carId);
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <div className="pt-2 text-center">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="text-xs font-medium text-faint transition hover:text-red-400 disabled:opacity-50"
      >
        {isPending ? "Removing…" : `Remove ${carName}`}
      </button>
    </div>
  );
}
