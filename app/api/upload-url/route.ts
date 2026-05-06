import { NextRequest, NextResponse } from "next/server";
import { getServiceClient, PHOTOS_BUCKET } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { filename, contentType } = await req.json();
    if (typeof contentType !== "string" || !contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
    }
    const safeName = typeof filename === "string" ? filename : "photo.jpg";
    const ext = safeName.includes(".") ? safeName.split(".").pop() : "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;

    const supabase = getServiceClient();
    const { data, error } = await supabase.storage
      .from(PHOTOS_BUCKET)
      .createSignedUploadUrl(path);

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || "Failed to create upload URL" },
        { status: 500 }
      );
    }
    return NextResponse.json({ path: data.path, token: data.token });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
