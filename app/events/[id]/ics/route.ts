import { NextRequest, NextResponse } from "next/server";
import { getServiceClient, type ServiceEvent } from "@/lib/supabase";
import { buildICS } from "@/lib/ics";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const event = data as ServiceEvent;
  const ics = buildICS(event);
  const filename =
    event.title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() ||
    "event";

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}.ics"`,
    },
  });
}
