import assert from "node:assert/strict";
import { test } from "node:test";
import {
  VIDEO_STUDIO_STILL_MAX_BYTES,
  VIDEO_STUDIO_VIDEO_MAX_BYTES,
  validateVideoStudioUpload,
  VideoStudioUploadError,
} from "@/lib/ai-core/video-production-platform/upload-validation";
import {
  isSafePrivateMediaUrl,
  isUnsignedPublicStorageUrl,
} from "@/lib/ai-core/video-production-platform/media-storage";

function ftypMp4(size: number): Buffer {
  const bytes = Buffer.alloc(Math.max(size, 32), 0);
  bytes.writeUInt32BE(0x18, 0);
  bytes.write("ftypisom", 4, "ascii");
  return bytes;
}

const PNG = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
]);

test("rejects SVG by MIME", () => {
  assert.throws(
    () =>
      validateVideoStudioUpload({
        bytes: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'),
        declaredMime: "image/svg+xml",
        filename: "xss.svg",
      }),
    VideoStudioUploadError,
  );
});

test("rejects SVG payload disguised as PNG MIME", () => {
  assert.throws(
    () =>
      validateVideoStudioUpload({
        bytes: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'),
        declaredMime: "image/png",
        filename: "xss.png",
      }),
    VideoStudioUploadError,
  );
});

test("rejects HTML as JPEG", () => {
  assert.throws(
    () =>
      validateVideoStudioUpload({
        bytes: Buffer.from("<html><script>alert(1)</script></html>"),
        declaredMime: "image/jpeg",
        filename: "page.jpg",
      }),
    VideoStudioUploadError,
  );
});

test("accepts real PNG magic bytes", () => {
  const mime = validateVideoStudioUpload({
    bytes: PNG,
    declaredMime: "image/png",
    filename: "frame.png",
  });
  assert.equal(mime, "image/png");
});

test("rejects empty files", () => {
  assert.throws(
    () =>
      validateVideoStudioUpload({
        bytes: Buffer.alloc(0),
        declaredMime: "video/mp4",
        filename: "empty.mp4",
      }),
    /Empty file/,
  );
});

test("rejects oversized stills at the 8MB still limit", () => {
  assert.throws(
    () =>
      validateVideoStudioUpload({
        bytes: Buffer.alloc(VIDEO_STUDIO_STILL_MAX_BYTES + 1, 1),
        declaredMime: "image/png",
        filename: "huge.png",
      }),
    /8MB/,
  );
});

test("accepts a playable MP4 under the still 8MB cap", () => {
  const mime = validateVideoStudioUpload({
    bytes: ftypMp4(5000),
    declaredMime: "video/mp4",
    filename: "clip.mp4",
  });
  assert.equal(mime, "video/mp4");
});

test("accepts a real MP4 larger than 8MB within the video ingest limit", () => {
  const mime = validateVideoStudioUpload({
    bytes: ftypMp4(VIDEO_STUDIO_STILL_MAX_BYTES + 1024),
    declaredMime: "video/mp4",
    filename: "provider-clip.mp4",
  });
  assert.equal(mime, "video/mp4");
});

test("rejects a video that exceeds the production ingest limit", () => {
  assert.throws(
    () =>
      validateVideoStudioUpload({
        bytes: ftypMp4(VIDEO_STUDIO_VIDEO_MAX_BYTES + 1),
        declaredMime: "video/mp4",
        filename: "too-large.mp4",
      }),
    /256MB/,
  );
});

test("rejects invalid MIME or signature for video ingest", () => {
  assert.throws(
    () =>
      validateVideoStudioUpload({
        bytes: Buffer.from("not a video container"),
        declaredMime: "video/mp4",
        filename: "fake.mp4",
      }),
    /signature/,
  );
  assert.throws(
    () =>
      validateVideoStudioUpload({
        bytes: ftypMp4(2048),
        declaredMime: "text/html",
        filename: "clip.html",
      }),
    VideoStudioUploadError,
  );
});

test("rejects stub placeholder MP4", () => {
  const stub = Buffer.alloc(512, 0);
  stub.writeUInt32BE(0x18, 0);
  stub.write("ftypisom", 4, "ascii");
  stub.write("TB-AI-VIDEO:preview", 32, "ascii");
  assert.throws(
    () =>
      validateVideoStudioUpload({
        bytes: stub,
        declaredMime: "video/mp4",
        filename: "stub.mp4",
      }),
    /Stub or placeholder/,
  );
});

test("unsigned public storage URLs are rejected for the private video-studio bucket", () => {
  assert.equal(
    isUnsignedPublicStorageUrl("https://xyz.supabase.co/storage/v1/object/public/video-studio/a.mp4"),
    true,
  );
  assert.equal(isSafePrivateMediaUrl("https://xyz.supabase.co/storage/v1/object/public/video-studio/a.mp4"), false);
  assert.equal(
    isSafePrivateMediaUrl("https://xyz.supabase.co/storage/v1/object/sign/video-studio/a.mp4?token=abc"),
    true,
  );
  assert.equal(isSafePrivateMediaUrl("storage://user/project/a.mp4"), false);
  assert.equal(isSafePrivateMediaUrl("data:video/mp4;base64,AAAA"), true);
});
