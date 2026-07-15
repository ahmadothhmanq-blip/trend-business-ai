import { requireUser } from "@/lib/api/helpers";
import { databaseErrorResponse, serverErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
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

function detectMimeFromMagic(buffer: Buffer): string | null {
  if (buffer.length >= 8) {
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
      return "image/png";
    }
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return "image/jpeg";
    }
    if (
      buffer[0] === 0x47 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x38
    ) {
      return "image/gif";
    }
    if (
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP"
    ) {
      return "image/webp";
    }
    if (buffer.toString("ascii", 0, 5) === "%PDF-") {
      return "application/pdf";
    }
    if (buffer[0] === 0x50 && buffer[1] === 0x4b) {
      // ZIP container — DOCX/OOXML
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    }
  }
  return null;
}

function sanitizeFileName(name: string) {
  const base = name.split(/[/\\]/).pop() ?? "upload";
  return base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 180) || "upload.bin";
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const limited = enforceMutationRateLimit(auth.user!.id);
  if (limited) return limited;

  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file upload." }, { status: 400 });
    }

    if (file.size <= 0 || file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File exceeds the 12MB upload limit." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const declared = file.type || "application/octet-stream";
    const sniffed = detectMimeFromMagic(buffer);

    // Prefer magic bytes for binary types; allow declared text types when sniff fails.
    let mimeType = sniffed ?? declared;
    if (sniffed && declared.startsWith("image/") && sniffed !== declared) {
      mimeType = sniffed;
    }
    if (!sniffed && !declared.startsWith("text/") && declared !== "application/json" && declared !== "application/msword") {
      return NextResponse.json(
        { error: "Unable to verify file type." },
        { status: 400 },
      );
    }

    if (!ALLOWED_FILE.has(mimeType)) {
      return NextResponse.json(
        { error: "Unsupported file type. Upload images, PDF, Markdown, or DOCX." },
        { status: 400 },
      );
    }

    const isImage = ALLOWED_IMAGE.has(mimeType);
    const safeName = sanitizeFileName(file.name);
    const storagePath = `${auth.user!.id}/${Date.now()}-${safeName}`;

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
      fileName: safeName,
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
