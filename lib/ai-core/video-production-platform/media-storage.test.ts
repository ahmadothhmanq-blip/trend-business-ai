import assert from "node:assert/strict";
import { test } from "node:test";
import {
  isSafePrivateMediaUrl,
  isUnsignedPublicStorageUrl,
  probeVideoStudioStorage,
  VIDEO_STUDIO_BUCKET,
} from "@/lib/ai-core/video-production-platform/media-storage";

test("unsigned public storage URLs are rejected for the private video-studio bucket", () => {
  assert.equal(
    isUnsignedPublicStorageUrl("https://proj.supabase.co/storage/v1/object/public/video-studio/u/a.mp4"),
    true,
  );
  assert.equal(
    isSafePrivateMediaUrl("https://proj.supabase.co/storage/v1/object/public/video-studio/u/a.mp4"),
    false,
  );
  assert.equal(
    isSafePrivateMediaUrl("https://proj.supabase.co/storage/v1/object/sign/video-studio/u/a.mp4?token=abc"),
    true,
  );
});

test("storage probe reports missing bucket and succeeds on private upload + signed URL", async () => {
  const missing = await probeVideoStudioStorage({
    storage: {
      listBuckets: async () => ({ data: [], error: null }),
    },
  });
  assert.equal(missing.bucketExists, false);
  assert.equal(missing.bucketId, VIDEO_STUDIO_BUCKET);

  let removed: string[] = [];
  const healthy = await probeVideoStudioStorage({
    storage: {
      listBuckets: async () => ({
        data: [{ id: VIDEO_STUDIO_BUCKET, public: false, file_size_limit: 268435456, allowed_mime_types: ["video/mp4"] }],
        error: null,
      }),
      getBucket: async () => ({
        data: { id: VIDEO_STUDIO_BUCKET, public: false, file_size_limit: 268435456, allowed_mime_types: ["video/mp4"] },
      }),
      from() {
        return {
          upload: async () => ({ error: null }),
          createSignedUrl: async () => ({
            data: { signedUrl: "https://proj.supabase.co/storage/v1/object/sign/video-studio/_health/probe.png?token=t" },
          }),
          remove: async (paths: string[]) => {
            removed = paths;
            return { error: null };
          },
        };
      },
    },
  });
  assert.equal(healthy.bucketExists, true);
  assert.equal(healthy.private, true);
  assert.equal(healthy.uploadOk, true);
  assert.equal(healthy.signedUrlOk, true);
  assert.equal(healthy.unsignedPublicRejected, true);
  assert.equal(healthy.fileSizeLimitBytes, 268435456);
  assert.equal(removed.length, 1);
});
