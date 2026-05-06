import { NextRequest, NextResponse } from "next/server";
import { getServiceClient, PHOTOS_BUCKET } from "@/lib/supabase";

export const runtime = "nodejs";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getServiceClient();

  const { data, error: fetchError } = await supabase
    .from("submissions")
    .select("photo_paths")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const paths = (data.photo_paths ?? []) as string[];
  if (paths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from(PHOTOS_BUCKET)
      .remove(paths);
    if (storageError) {
      return NextResponse.json(
        { error: `Photo delete failed: ${storageError.message}` },
        { status: 500 }
      );
    }
  }

  const { error: deleteError } = await supabase.from("submissions").delete().eq("id", id);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
