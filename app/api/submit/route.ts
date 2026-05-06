import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { UNITS } from "@/lib/units";

export const runtime = "nodejs";

const MAX_PHOTOS = 10;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const unit = String(body.unit ?? "").trim();
    const project = String(body.project ?? "").trim();
    const story = String(body.story ?? "").trim();
    const name = String(body.name ?? "").trim();
    const hours = Number(body.hours);
    const photoPaths: unknown = body.photoPaths;

    if (!UNITS.includes(unit as (typeof UNITS)[number])) {
      return NextResponse.json({ error: "Invalid unit" }, { status: 400 });
    }
    if (!project) {
      return NextResponse.json({ error: "Project is required" }, { status: 400 });
    }
    if (!Number.isFinite(hours) || hours <= 0 || hours > 1000) {
      return NextResponse.json({ error: "Invalid hours" }, { status: 400 });
    }
    if (!Array.isArray(photoPaths) || photoPaths.length > MAX_PHOTOS) {
      return NextResponse.json({ error: "Invalid photos" }, { status: 400 });
    }
    const cleanPaths = photoPaths.filter((p): p is string => typeof p === "string");

    const supabase = getServiceClient();
    const id = crypto.randomUUID();
    const { error: insertError } = await supabase.from("submissions").insert({
      id,
      unit,
      project,
      hours,
      story: story || null,
      name: name || null,
      photo_paths: cleanPaths,
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
