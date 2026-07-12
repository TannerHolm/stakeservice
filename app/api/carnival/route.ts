import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { getBooth } from "@/lib/carnival";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const boothId = String(body.booth ?? "").trim();
    const name = String(body.name ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const notes = String(body.notes ?? "").trim();

    const booth = getBooth(boothId);
    if (!booth) {
      return NextResponse.json({ error: "Invalid booth" }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!phone) {
      return NextResponse.json({ error: "Phone is required" }, { status: 400 });
    }

    let cookieCount: number | null = null;
    if (booth.kind === "cookies" && body.cookieCount != null && body.cookieCount !== "") {
      const n = Number(body.cookieCount);
      if (!Number.isInteger(n) || n <= 0 || n > 1000) {
        return NextResponse.json({ error: "Invalid cookie count" }, { status: 400 });
      }
      cookieCount = n;
    }

    const ownPrizes = booth.kind === "game" ? Boolean(body.ownPrizes) : false;

    const supabase = getServiceClient();
    const id = crypto.randomUUID();
    const { error: insertError } = await supabase.from("carnival_signups").insert({
      id,
      booth: booth.id,
      name,
      phone,
      cookie_count: cookieCount,
      own_prizes: ownPrizes,
      notes: notes || null,
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
