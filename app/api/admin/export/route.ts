import { NextResponse } from "next/server";
import { getServiceClient, PHOTOS_BUCKET, type Submission } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const photoUrl = (path: string) =>
    `${supabaseUrl}/storage/v1/object/public/${PHOTOS_BUCKET}/${path}`;

  const headers = [
    "submitted_at",
    "unit",
    "name",
    "hours",
    "project",
    "story",
    "photo_count",
    "photo_urls",
  ];
  const lines = [headers.join(",")];
  for (const r of (data ?? []) as Submission[]) {
    const photoUrls = (r.photo_paths ?? []).map(photoUrl).join(" ");
    lines.push(
      [
        r.created_at,
        r.unit,
        r.name ?? "",
        r.hours,
        r.project,
        r.story ?? "",
        (r.photo_paths ?? []).length,
        photoUrls,
      ]
        .map(csvEscape)
        .join(",")
    );
  }

  const csv = lines.join("\n");
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="stake-service-${date}.csv"`,
    },
  });
}
