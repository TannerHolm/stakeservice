"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BOOTHS, GAME_NOTE, type Booth } from "@/lib/carnival";

const inputCls =
  "w-full px-4 py-3 rounded-2xl border border-white/30 bg-white/10 text-base text-white placeholder-white/50 outline-none focus:border-white focus:bg-white/15";

export function SignupBoard({
  namesByBooth,
}: {
  namesByBooth: Record<string, string[]>;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <ul className="space-y-4">
      {BOOTHS.map((booth) => (
        <li
          key={booth.id}
          className="rounded-2xl border border-white/20 bg-white/10 p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">{booth.label}</h2>
              {booth.note && (
                <p className="mt-1 text-white/75 text-sm">{booth.note}</p>
              )}
              {booth.kind === "game" && (
                <p className="mt-1 text-white/75 text-sm">{GAME_NOTE}</p>
              )}
            </div>
            {booth.multi && (
              <span className="shrink-0 text-[11px] uppercase tracking-wide text-white/60 mt-1">
                Multiple welcome
              </span>
            )}
          </div>

          <Volunteers names={namesByBooth[booth.id] ?? []} />

          {openId === booth.id ? (
            <SignupForm
              booth={booth}
              onDone={() => setOpenId(null)}
              onCancel={() => setOpenId(null)}
            />
          ) : (
            <button
              onClick={() => setOpenId(booth.id)}
              className="mt-4 px-5 py-2.5 rounded-full bg-white text-[#2C6F8B] font-medium text-sm hover:bg-white/95"
            >
              Sign up
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

function Volunteers({ names }: { names: string[] }) {
  if (names.length === 0) {
    return <p className="mt-3 text-white/50 text-sm">No one yet — be the first!</p>;
  }
  return (
    <p className="mt-3 text-white/70 text-sm">
      <span className="text-white/50">Signed up: </span>
      {names.join(", ")}
    </p>
  );
}

function SignupForm({
  booth,
  onDone,
  onCancel,
}: {
  booth: Booth;
  onDone: () => void;
  onCancel: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [cookieCount, setCookieCount] = useState("");
  const [ownPrizes, setOwnPrizes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/carnival", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booth: booth.id,
          name,
          phone,
          cookieCount: booth.kind === "cookies" ? cookieCount : "",
          ownPrizes: booth.kind === "game" ? ownPrizes : false,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Sign-up failed");
      }
      onDone();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-up failed");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-3">
      <input
        type="text"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className={inputCls}
      />
      <input
        type="tel"
        required
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone number"
        className={inputCls}
      />

      {booth.kind === "cookies" && (
        <input
          type="number"
          inputMode="numeric"
          min="1"
          step="1"
          value={cookieCount}
          onChange={(e) => setCookieCount(e.target.value)}
          placeholder="How many cookies can you bring? (e.g. 24)"
          className={inputCls}
        />
      )}

      {booth.kind === "game" && (
        <label className="flex items-center gap-3 text-sm text-white/85 px-1">
          <input
            type="checkbox"
            checked={ownPrizes}
            onChange={(e) => setOwnPrizes(e.target.checked)}
            className="h-5 w-5 rounded accent-white"
          />
          I&apos;ll bring my own prizes ♡
        </label>
      )}

      {error && <p className="text-red-200 text-sm">{error}</p>}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 rounded-full bg-white text-[#2C6F8B] font-medium text-sm disabled:opacity-50 hover:bg-white/95"
        >
          {submitting ? "Signing up…" : "Add me"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-5 py-2.5 rounded-full border border-white/40 text-white font-medium text-sm disabled:opacity-50 hover:bg-white/10"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
