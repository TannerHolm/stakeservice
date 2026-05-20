import Link from "next/link";
import {
  getServiceClient,
  type ServiceEvent,
  type ServiceOpportunity,
} from "@/lib/supabase";
import { EventForm } from "./event-form";
import { DeleteEventButton } from "./delete-event-button";
import { OpportunityForm } from "./opportunity-form";
import { DeleteOpportunityButton } from "./delete-opportunity-button";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("starts_at", { ascending: true });

  const events: ServiceEvent[] = data ?? [];
  const now = Date.now();

  const { data: oppData, error: oppError } = await supabase
    .from("opportunities")
    .select("*")
    .order("created_at", { ascending: false });

  const opportunities: ServiceOpportunity[] = oppData ?? [];

  return (
    <main className="px-6 py-8 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Upcoming Projects</h1>
        <Link
          href="/admin"
          className="px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm font-medium"
        >
          ← Dashboard
        </Link>
      </div>

      <h2 className="text-xl font-semibold mb-4">Add a project</h2>
      <EventForm />

      <h2 className="text-xl font-semibold mt-10 mb-4">All projects</h2>
      {error && <p className="text-red-600">Failed to load: {error.message}</p>}
      {!error && events.length === 0 && (
        <p className="text-neutral-500">No projects yet.</p>
      )}

      <ul className="space-y-3">
        {events.map((ev) => {
          const past = new Date(ev.starts_at).getTime() < now;
          return (
            <li
              key={ev.id}
              className={`rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 ${
                past ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold">
                    {ev.title}
                    {past && (
                      <span className="ml-2 text-xs font-normal text-neutral-400 uppercase">
                        past
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-neutral-500 mt-0.5">
                    {new Date(ev.starts_at).toLocaleString()}
                    {ev.ends_at && ` – ${new Date(ev.ends_at).toLocaleString()}`}
                  </div>
                  {ev.location && (
                    <div className="text-sm text-neutral-500 mt-0.5">
                      {ev.location}
                    </div>
                  )}
                  {ev.unit && (
                    <div className="text-xs text-neutral-400 mt-0.5 uppercase tracking-wide">
                      {ev.unit}
                    </div>
                  )}
                  {ev.description && (
                    <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 whitespace-pre-line">
                      {ev.description}
                    </div>
                  )}
                </div>
                <DeleteEventButton id={ev.id} label={ev.title} />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-14 mb-8 border-t border-neutral-200 dark:border-neutral-800" />

      <h2 className="text-xl font-semibold mb-1">Other Service Opportunities</h2>
      <p className="text-sm text-neutral-500 mb-4">
        Ongoing offers with no fixed date — shown on the public page without a
        calendar invite.
      </p>
      <OpportunityForm />

      <h2 className="text-xl font-semibold mt-10 mb-4">All opportunities</h2>
      {oppError && (
        <p className="text-red-600">Failed to load: {oppError.message}</p>
      )}
      {!oppError && opportunities.length === 0 && (
        <p className="text-neutral-500">No opportunities yet.</p>
      )}

      <ul className="space-y-3">
        {opportunities.map((op) => (
          <li
            key={op.id}
            className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold">{op.title}</div>
                {op.availability && (
                  <div className="text-sm text-neutral-500 mt-0.5">
                    Available: {op.availability}
                  </div>
                )}
                {op.location && (
                  <div className="text-sm text-neutral-500 mt-0.5">
                    {op.location}
                  </div>
                )}
                {(op.contact_name || op.contact_info) && (
                  <div className="text-sm text-neutral-500 mt-0.5">
                    Contact:{" "}
                    {[op.contact_name, op.contact_info]
                      .filter(Boolean)
                      .join(" — ")}
                  </div>
                )}
                {op.description && (
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 whitespace-pre-line">
                    {op.description}
                  </div>
                )}
              </div>
              <DeleteOpportunityButton id={op.id} label={op.title} />
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
