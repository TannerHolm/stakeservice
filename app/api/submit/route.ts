import { NextRequest, NextResponse } from "next/server";
import { getServiceClient, PHOTOS_BUCKET } from "@/lib/supabase";
import { UNITS } from "@/lib/units";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_PHOTOS = 10;
const MAX_PHOTO_BYTES = 15 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const fd = await req.formData();
    const unit = String(fd.get("unit") ?? "").trim();
    const project = String(fd.get("project") ?? "").trim();
    const hoursRaw = String(fd.get("hours") ?? "").trim();
    const story = String(fd.get("story") ?? "").trim();
    const name = String(fd.get("name") ?? "").trim();

    if (!UNITS.includes(unit as (typeof UNITS)[number])) {
      return NextResponse.json({ error: "Invalid unit" }, { status: 400 });
    }
    if (!project) {
      return NextResponse.json({ error: "Project is required" }, { status: 400 });
    }
    const hours = parseFloat(hoursRaw);
    if (isNaN(hours) || hours <= 0 || hours > 1000) {
      return NextResponse.json({ error: "Invalid hours" }, { status: 400 });
    }

    const photos = fd.getAll("photos").filter((v): v is File => v instanceof File && v.size > 0);
    if (photos.length > MAX_PHOTOS) {
      return NextResponse.json({ error: `Max ${MAX_PHOTOS} photos` }, { status: 400 });
    }
    for (const p of photos) {
      if (p.size > MAX_PHOTO_BYTES) {
        return NextResponse.json({ error: `Photo too large: ${p.name}` }, { status: 400 });
      }
    }

    const supabase = getServiceClient();
    const submissionId = crypto.randomUUID();
    const photoPaths: string[] = [];

    for (let i = 0; i < photos.length; i++) {
      const file = photos[i];
      const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
      const path = `${submissionId}/${i}-${crypto.randomUUID()}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      const { error } = await supabase.storage
        .from(PHOTOS_BUCKET)
        .upload(path, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });
      if (error) {
        return NextResponse.json(
          { error: `Photo upload failed: ${error.message}` },
          { status: 500 }
        );
      }
      photoPaths.push(path);
    }

    const { error: insertError } = await supabase.from("submissions").insert({
      id: submissionId,
      unit,
      project,
      hours,
      story: story || null,
      name: name || null,
      photo_paths: photoPaths,
    });

    if (insertError) {
      return NextResponse.json(
        { error: `Save failed: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, id: submissionId });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
