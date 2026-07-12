import Link from "next/link";
import {
  getServiceClient,
  type ServiceEvent,
  type ServiceOpportunity,
} from "@/lib/supabase";
import { CARNIVAL_EVENT_ID } from "@/lib/carnival";
import { GRADIENT_BG } from "@/lib/theme";
import { EventTime } from "./event-time";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true });

  const events: ServiceEvent[] = data ?? [];

  const { data: oppData } = await supabase
    .from("opportunities")
    .select("*")
    .order("created_at", { ascending: false });

  const opportunities: ServiceOpportunity[] = oppData ?? [];

  return (
    <main style={GRADIENT_BG} className="min-h-[100dvh] flex flex-col">
      <div className="px-6 pt-6">
        <Link href="/" className="text-sm text-white/70 hover:text-white">
          ← Home
        </Link>
      </div>

      <div className="flex-1 px-6 py-8">
        <div className="w-full max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
            Upcoming Projects
          </h1>
          <p className="text-white/70 mb-8">
            Service opportunities across the stake. Tap a project to add it to your
            calendar.
          </p>

          {error && (
            <p className="text-red-200 text-sm">
              Could not load projects: {error.message}
            </p>
          )}

          {!error && events.length === 0 && (
            <div className="rounded-2xl border border-white/20 bg-white/5 px-6 py-12 text-center text-white/70">
              No upcoming projects scheduled yet. Check back soon.
            </div>
          )}

          <ul className="space-y-4">
            {events.map((ev) => (
              <li
                key={ev.id}
                className="rounded-2xl border border-white/20 bg-white/10 p-6"
              >
                <h2 className="text-xl font-semibold">{ev.title}</h2>
                <p className="mt-1 text-white/80 text-sm">
                  <EventTime start={ev.starts_at} end={ev.ends_at} />
                </p>
                {ev.location && (
                  <p className="mt-1 text-white/70 text-sm">{ev.location}</p>
                )}
                {ev.unit && (
                  <p className="mt-1 text-white/60 text-xs uppercase tracking-wide">
                    {ev.unit}
                  </p>
                )}
                {ev.description && (
                  <p className="mt-3 text-white/80 whitespace-pre-line">
                    {ev.description}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-3">
                  {ev.id === CARNIVAL_EVENT_ID && (
                    <Link
                      href="/carnival"
                      className="inline-block px-5 py-2.5 rounded-full bg-white text-[#2C6F8B] font-medium text-sm hover:bg-white/95"
                    >
                      Sign up to volunteer →
                    </Link>
                  )}
                  <a
                    href={`/events/${ev.id}/ics`}
                    className={`inline-block px-5 py-2.5 rounded-full font-medium text-sm ${
                      ev.id === CARNIVAL_EVENT_ID
                        ? "border border-white/40 text-white hover:bg-white/10"
                        : "bg-white text-[#2C6F8B] hover:bg-white/95"
                    }`}
                  >
                    Add to calendar
                  </a>
                </div>
              </li>
            ))}
          </ul>

          {opportunities.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2">
                Other Service Opportunities
              </h2>
              <p className="text-white/70 mb-6">
                Ongoing ways to serve and be served — reach out directly.
              </p>
              <ul className="space-y-4">
                {opportunities.map((op) => (
                  <li
                    key={op.id}
                    className="rounded-2xl border border-white/20 bg-white/10 p-6"
                  >
                    <h3 className="text-xl font-semibold">{op.title}</h3>
                    {op.availability && (
                      <p className="mt-1 text-white/80 text-sm">
                        {op.availability}
                      </p>
                    )}
                    {op.location && (
                      <p className="mt-1 text-white/70 text-sm">{op.location}</p>
                    )}
                    {op.description && (
                      <p className="mt-3 text-white/80 whitespace-pre-line">
                        {op.description}
                      </p>
                    )}
                    {(op.contact_name || op.contact_info) && (
                      <p className="mt-4 text-white/90 text-sm">
                        <span className="text-white/60">Contact: </span>
                        {[op.contact_name, op.contact_info]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
