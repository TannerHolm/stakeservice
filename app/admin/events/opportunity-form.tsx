"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const fieldCls =
  "w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent outline-none focus:border-black dark:focus:border-white";

export function OpportunityForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [availability, setAvailability] = useState("");
  const [location, setLocation] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          contactName,
          contactInfo,
          availability,
          location,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Save failed");
      }
      setTitle("");
      setDescription("");
      setContactName("");
      setContactInfo("");
      setAvailability("");
      setLocation("");
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
          placeholder="Free tennis lessons"
          className={fieldCls}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Contact name <span className="text-neutral-400">(optional)</span>
          </label>
          <input
            type="text"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Brother Smith"
            className={fieldCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Contact info <span className="text-neutral-400">(optional)</span>
          </label>
          <input
            type="text"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            placeholder="Phone or email"
            className={fieldCls}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Availability <span className="text-neutral-400">(optional)</span>
          </label>
          <input
            type="text"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            placeholder="Saturday mornings"
            className={fieldCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Location <span className="text-neutral-400">(optional)</span>
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Neighborhood courts"
            className={fieldCls}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">
          Description <span className="text-neutral-400">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="What is being offered, who it is for, anything to know…"
          className={`${fieldCls} resize-none`}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-3 rounded-full bg-black text-white dark:bg-white dark:text-black font-medium disabled:opacity-50"
      >
        {submitting ? "Saving…" : "Add opportunity"}
      </button>
    </form>
  );
}
