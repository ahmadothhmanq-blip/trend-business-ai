import { requireUser } from "@/lib/api/helpers";
import { databaseErrorResponse, serverErrorResponse } from "@/lib/api/errors";
import type { GenerationAttachmentMeta } from "@/types/database";
import { NextResponse } from "next/server";

const MAX_BYTES = 12 * 1024 * 1024;
const ALLOWED_IMAGE = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);
const ALLOWED_FILE = new Set([
  ...ALLOWED_IMAGE,
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/json",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file upload." }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File exceeds the 12MB upload limit." },
        { status: 400 },
      );
    }

    const mimeType = file.type || "application/octet-stream";
    if (!ALLOWED_FILE.has(mimeType)) {
      return NextResponse.json(
        { error: "Unsupported file type. Upload images, PDF, Markdown, or DOCX." },
        { status: 400 },
      );
    }

    const isImage = ALLOWED_IMAGE.has(mimeType);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${auth.user!.id}/${Date.now()}-${safeName}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await auth.supabase.storage
      .from("generation-uploads")
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      return databaseErrorResponse("uploads.storage", uploadError);
    }

    const { data: signed } = await auth.supabase.storage
      .from("generation-uploads")
      .createSignedUrl(storagePath, 60 * 60 * 24 * 7);

    const attachment: GenerationAttachmentMeta = {
      id: crypto.randomUUID(),
      fileName: file.name,
      fileType: isImage ? "image" : "file",
      mimeType,
      sizeBytes: file.size,
      storagePath,
      publicUrl: signed?.signedUrl ?? null,
    };

    const { data, error } = await auth.supabase
      .from("generation_attachments")
      .insert({
        id: attachment.id,
        user_id: auth.user!.id,
        file_name: attachment.fileName,
        file_type: attachment.fileType,
        mime_type: attachment.mimeType,
        size_bytes: attachment.sizeBytes,
        storage_path: attachment.storagePath,
        public_url: attachment.publicUrl,
        generation_kind: "workspace",
      })
      .select("*")
      .single();

    if (error) {
      return databaseErrorResponse("uploads.insert", error);
    }

    return NextResponse.json({
      attachment,
      record: data,
      message: isImage ? "Image uploaded." : "File uploaded.",
    });
  } catch (error) {
    return serverErrorResponse("uploads", error, "Unable to upload file.");
  }
}
