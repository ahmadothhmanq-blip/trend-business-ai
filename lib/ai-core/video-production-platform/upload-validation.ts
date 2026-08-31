import { isStubVideoBytes } from "@/lib/ai-core/video-production-platform/providers/types";

export class VideoStudioUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VideoStudioUploadError";
  }
}

/** Stills, captions, and user audio attached to Video Studio remain 8 MiB. */
export const VIDEO_STUDIO_STILL_MAX_BYTES = 8 * 1024 * 1024;

/**
 * Provider clip / composite ingest cap.
 * Veo 8s 1080p is typically 10–40 MiB, Kling 15s 20–80 MiB, Runway 10s 15–50 MiB,
 * HeyGen avatar up to 60s can exceed 100 MiB. 256 MiB covers 1080p ~60s at high bitrate
 * without accepting unbounded objects.
 */
export const VIDEO_STUDIO_VIDEO_MAX_BYTES = 256 * 1024 * 1024;

/** @deprecated Use VIDEO_STUDIO_STILL_MAX_BYTES or VIDEO_STUDIO_VIDEO_MAX_BYTES. */
export const VIDEO_STUDIO_UPLOAD_MAX_BYTES = VIDEO_STUDIO_STILL_MAX_BYTES;

const VIDEO_MIME = new Set(["video/mp4", "video/webm"]);

const ALLOWED_EXTENSIONS = new Set([
  "png",
  "jpg",
  "jpeg",
  "webp",
  "mp4",
  "webm",
  "mp3",
  "mpeg",
  "wav",
  "ogg",
  "vtt",
]);

const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "video/mp4",
  "video/webm",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "text/vtt",
]);

function extOf(filename: string): string {
  const base = filename.split(/[/\\]/).pop() ?? filename;
  const i = base.lastIndexOf(".");
  return i >= 0 ? base.slice(i + 1).toLowerCase() : "";
}

function looksLikeSvg(bytes: Buffer): boolean {
  const head = bytes.subarray(0, 256).toString("utf8").replace(/^\uFEFF/, "").trimStart();
  if (head.startsWith("<svg") || head.includes("<svg")) return true;
  if (/<script[\s>]/i.test(head)) return true;
  return head.startsWith("<?xml") && /<svg[\s>]/i.test(bytes.subarray(0, 2048).toString("utf8"));
}

function sniffMime(bytes: Buffer): string | null {
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "image/png";
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 12 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  if (bytes.length >= 12 && bytes.toString("ascii", 4, 8) === "ftyp") {
    return "video/mp4";
  }
  if (bytes.length >= 4 && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) {
    return "video/webm";
  }
  if (
    bytes.length >= 12 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WAVE"
  ) {
    return "audio/wav";
  }
  if (bytes.length >= 3 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
    return "audio/mpeg";
  }
  if (bytes.length >= 2 && bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0) {
    return "audio/mpeg";
  }
  if (bytes.length >= 4 && bytes[0] === 0x4f && bytes[1] === 0x67 && bytes[2] === 0x67 && bytes[3] === 0x53) {
    return "audio/ogg";
  }
  const text = bytes.subarray(0, 64).toString("utf8").replace(/^\uFEFF/, "").trimStart();
  if (text.startsWith("WEBVTT")) return "text/vtt";
  return null;
}

export function maxBytesForVideoStudioMime(mime: string): number {
  const normalized = mime.split(";")[0].trim().toLowerCase();
  return VIDEO_MIME.has(normalized) ? VIDEO_STUDIO_VIDEO_MAX_BYTES : VIDEO_STUDIO_STILL_MAX_BYTES;
}

function formatLimit(bytes: number): string {
  return `${Math.round(bytes / (1024 * 1024))}MB`;
}

export function validateVideoStudioUpload(input: {
  bytes: Buffer;
  declaredMime: string;
  filename: string;
}): string {
  if (input.bytes.length === 0) {
    throw new VideoStudioUploadError("Empty file is not allowed.");
  }

  const declared = input.declaredMime.split(";")[0].trim().toLowerCase();
  const limit = maxBytesForVideoStudioMime(declared);
  if (input.bytes.length > limit) {
    throw new VideoStudioUploadError(`File exceeds the ${formatLimit(limit)} upload limit.`);
  }

  const ext = extOf(input.filename);
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new VideoStudioUploadError(`File extension .${ext || "unknown"} is not allowed.`);
  }

  if (declared === "image/svg+xml" || declared === "text/html" || declared === "application/xml") {
    throw new VideoStudioUploadError("SVG and HTML uploads are not allowed.");
  }
  if (!ALLOWED_MIME.has(declared)) {
    throw new VideoStudioUploadError(`MIME type ${declared || "unknown"} is not allowed.`);
  }

  if (looksLikeSvg(input.bytes)) {
    throw new VideoStudioUploadError("SVG content is not allowed.");
  }

  const sniffed = sniffMime(input.bytes);
  if (declared === "text/vtt") {
    if (sniffed !== "text/vtt") {
      throw new VideoStudioUploadError("Caption files must start with WEBVTT.");
    }
    return "text/vtt";
  }

  if (!sniffed || sniffed !== declared) {
    throw new VideoStudioUploadError("File signature does not match the declared MIME type.");
  }

  if (VIDEO_MIME.has(sniffed) && isStubVideoBytes(input.bytes)) {
    throw new VideoStudioUploadError("Stub or placeholder MP4 is not allowed.");
  }

  return sniffed;
}
