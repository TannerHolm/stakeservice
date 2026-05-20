"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UNITS } from "@/lib/units";

const fieldCls =
  "w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent outline-none focus:border-black dark:focus:border-white";

export function EventForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [unit, setUnit] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          location,
          unit,
          // datetime-local has no zone; new Date() reads it as local time.
          startsAt: startsAt ? new Date(startsAt).toISOString() : "",
          endsAt: endsAt ? new Date(endsAt).toISOString() : "",
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Save failed");
      }
      setTitle("");
      setDescription("");
      setLocation("");
      setUnit("");
      setStartsAt("");
      setEndsAt("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4"
    >
      <div>
        <label className="block text-sm font-medium mb-1.5">Title</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Community garden cleanup"
          className={fieldCls}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Starts</label>
          <input
            type="datetime-local"
            required
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className={fieldCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Ends <span className="text-neutral-400">(optional)</span>
          </label>
          <input
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            className={fieldCls}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">
          Location <span className="text-neutral-400">(optional)</span>
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="123 Main St, or a meeting point"
          className={fieldCls}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">
          Hosting unit <span className="text-neutral-400">(optional)</span>
        </label>
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className={fieldCls}
        >
          <option value="">— None —</option>
          {UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">
          Description <span className="text-neutral-400">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Details, what to bring, who to contact…"
          className={`${fieldCls} resize-none`}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-3 rounded-full bg-black text-white dark:bg-white dark:text-black font-medium disabled:opacity-50"
      >
        {submitting ? "Saving…" : "Add project"}
      </button>
    </form>
  );
}
