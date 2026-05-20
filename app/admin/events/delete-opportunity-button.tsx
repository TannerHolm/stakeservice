"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function DeleteOpportunityButton({
  id,
  label,
}: {
  id: string;
  label: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) return;
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/opportunities/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Delete failed");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div>
      <button
        onClick={onClick}
        disabled={pending}
        className="text-xs text-neutral-500 hover:text-red-600 disabled:opacity-50"
      >
        {pending ? "Deleting…" : "Delete"}
      </button>
      {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
    </div>
  );
}
