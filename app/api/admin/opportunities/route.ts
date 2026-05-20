import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const title = String(body.title ?? "").trim();
    const description = String(body.description ?? "").trim();
    const contactName = String(body.contactName ?? "").trim();
    const contactInfo = String(body.contactInfo ?? "").trim();
    const availability = String(body.availability ?? "").trim();
    const location = String(body.location ?? "").trim();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const supabase = getServiceClient();
    const id = crypto.randomUUID();
    const { error: insertError } = await supabase.from("opportunities").insert({
      id,
      title,
      description: description || null,
      contact_name: contactName || null,
      contact_info: contactInfo || null,
      availability: availability || null,
      location: location || null,
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
