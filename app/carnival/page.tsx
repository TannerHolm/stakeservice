import Link from "next/link";
import { getServiceClient, type ServiceEvent } from "@/lib/supabase";
import {
  BOOTHS,
  CARNIVAL_EVENT_ID,
  EVENT,
  type CarnivalSignup,
} from "@/lib/carnival";
import { GRADIENT_BG } from "@/lib/theme";
import { EventTime } from "../events/event-time";
import { SignupBoard } from "./signup-board";

export const dynamic = "force-dynamic";

export default async function CarnivalPage() {
  const supabase = getServiceClient();

  // The carnival's title/time/location come from the events table (single source of truth).
  const { data: eventRow } = await supabase
    .from("events")
    .select("*")
    .eq("id", CARNIVAL_EVENT_ID)
    .maybeSingle();
  const event = eventRow as ServiceEvent | null;

  const { data } = await supabase
    .from("carnival_signups")
    .select("*")
    .order("created_at", { ascending: true });

  const signups: CarnivalSignup[] = data ?? [];

  // Group volunteer names per booth for display (name only — no phone numbers publicly).
  const namesByBooth: Record<string, string[]> = {};
  for (const b of BOOTHS) namesByBooth[b.id] = [];
  for (const s of signups) {
    if (namesByBooth[s.booth]) namesByBooth[s.booth].push(s.name);
  }

  return (
    <main style={GRADIENT_BG} className="min-h-[100dvh] flex flex-col">
      <div className="px-6 pt-6">
        <Link href="/" className="text-sm text-white/70 hover:text-white">
          ← Home
        </Link>
      </div>

      <div className="flex-1 px-6 py-8">
        <div className="w-full max-w-2xl mx-auto">
          <p className="text-white/70 text-sm uppercase tracking-wide mb-1">
            Summer of Service{event?.unit ? ` · Hosted by ${event.unit}` : ""}
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
            {event?.title ?? "Carnival"}
          </h1>
          {event && (
            <p className="text-white/80 mb-1">
              <EventTime start={event.starts_at} end={event.ends_at} />
            </p>
          )}
          {event?.location && (
            <p className="text-white/70 text-sm mb-4">{event.location}</p>
          )}
          <p className="text-white/80 mb-6 mt-3 whitespace-pre-line">{EVENT.blurb}</p>
          <p className="text-white/70 text-sm mb-5">
            Questions? Contact {EVENT.contactName},{" "}
            <a
              href={`tel:${EVENT.contactPhone.replace(/[^0-9]/g, "")}`}
              className="underline hover:text-white"
            >
              {EVENT.contactPhone}
            </a>
            . Pick a booth below and add your name — most booths welcome more than one
            volunteer.
          </p>

          {event && (
            <a
              href={`/events/${CARNIVAL_EVENT_ID}/ics`}
              className="inline-block mb-8 px-5 py-2.5 rounded-full border border-white/40 text-white font-medium text-sm hover:bg-white/10"
            >
              Add to calendar
            </a>
          )}

          <SignupBoard namesByBooth={namesByBooth} />
        </div>
      </div>
    </main>
  );
}
