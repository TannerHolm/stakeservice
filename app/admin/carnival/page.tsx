import Link from "next/link";
import { getServiceClient, type ServiceEvent } from "@/lib/supabase";
import { BOOTHS, CARNIVAL_EVENT_ID, type CarnivalSignup } from "@/lib/carnival";
import { DeleteSignupButton } from "./delete-signup-button";

export const dynamic = "force-dynamic";

export default async function AdminCarnivalPage() {
  const supabase = getServiceClient();

  const { data: eventRow } = await supabase
    .from("events")
    .select("*")
    .eq("id", CARNIVAL_EVENT_ID)
    .maybeSingle();
  const event = eventRow as ServiceEvent | null;

  const { data, error } = await supabase
    .from("carnival_signups")
    .select("*")
    .order("created_at", { ascending: true });

  const signups: CarnivalSignup[] = data ?? [];
  const byBooth = new Map<string, CarnivalSignup[]>();
  for (const s of signups) {
    const list = byBooth.get(s.booth) ?? [];
    list.push(s);
    byBooth.set(s.booth, list);
  }

  return (
    <main className="px-6 py-8 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Carnival Sign-ups</h1>
        <Link
          href="/admin"
          className="px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm font-medium"
        >
          ← Dashboard
        </Link>
      </div>
      <p className="text-sm text-neutral-500 mb-8">
        {[
          event?.title ?? "Carnival",
          event?.unit,
          event ? new Date(event.starts_at).toLocaleString() : null,
        ]
          .filter(Boolean)
          .join(" · ")}{" "}
        — {signups.length}{" "}
        {signups.length === 1 ? "volunteer" : "volunteers"} signed up so far.
      </p>

      {error && <p className="text-red-600">Failed to load: {error.message}</p>}

      <div className="space-y-4">
        {BOOTHS.map((booth) => {
          const list = byBooth.get(booth.id) ?? [];
          return (
            <section
              key={booth.id}
              className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-lg font-semibold">{booth.label}</h2>
                <span className="text-sm text-neutral-500">
                  {list.length} signed up
                </span>
              </div>

              {list.length === 0 ? (
                <p className="text-sm text-neutral-400 mt-2">No volunteers yet.</p>
              ) : (
                <ul className="mt-3 divide-y divide-neutral-100 dark:divide-neutral-800">
                  {list.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-start justify-between gap-4 py-2.5"
                    >
                      <div className="text-sm">
                        <span className="font-medium">{s.name}</span>
                        <span className="text-neutral-500"> · {s.phone || "no phone"}</span>
                        {s.cookie_count != null && (
                          <span className="ml-2 inline-block rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 px-2 py-0.5 text-xs">
                            {s.cookie_count} cookies
                          </span>
                        )}
                        {s.own_prizes && (
                          <span className="ml-2 inline-block rounded-full bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-200 px-2 py-0.5 text-xs">
                            ♡ own prizes
                          </span>
                        )}
                        {s.notes && (
                          <div className="text-neutral-500 mt-0.5">{s.notes}</div>
                        )}
                      </div>
                      <DeleteSignupButton id={s.id} label={s.name} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}
