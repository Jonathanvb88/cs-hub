import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireAuth } from "@/lib/requireAuth";

export async function POST(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: "File storage isn't configured yet - BLOB_READ_WRITE_TOKEN is missing. Add Vercel Blob storage to this project." },
        { status: 503 }
      );
    }

    const blob = await put(`document-attachments/${Date.now()}-${file.name}`, file, { access: "public" });

    return NextResponse.json({ url: blob.url, name: file.name });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
