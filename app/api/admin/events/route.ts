import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { UNITS } from "@/lib/units";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const title = String(body.title ?? "").trim();
    const description = String(body.description ?? "").trim();
    const location = String(body.location ?? "").trim();
    const unit = String(body.unit ?? "").trim();
    const startsAt = String(body.startsAt ?? "");
    const endsAt = String(body.endsAt ?? "");

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const start = new Date(startsAt);
    if (isNaN(start.getTime())) {
      return NextResponse.json({ error: "Invalid start date" }, { status: 400 });
    }

    let end: string | null = null;
    if (endsAt) {
      const parsedEnd = new Date(endsAt);
      if (isNaN(parsedEnd.getTime())) {
        return NextResponse.json({ error: "Invalid end date" }, { status: 400 });
      }
      if (parsedEnd.getTime() < start.getTime()) {
        return NextResponse.json(
          { error: "End must be after start" },
          { status: 400 }
        );
      }
      end = parsedEnd.toISOString();
    }

    if (unit && !UNITS.includes(unit as (typeof UNITS)[number])) {
      return NextResponse.json({ error: "Invalid unit" }, { status: 400 });
    }

    const supabase = getServiceClient();
    const id = crypto.randomUUID();
    const { error: insertError } = await supabase.from("events").insert({
      id,
      title,
      description: description || null,
      location: location || null,
      starts_at: start.toISOString(),
      ends_at: end,
      unit: unit || null,
    });

    if (insertError) {
      return NextResponse.json(
        { error: `Save failed: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, id });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
