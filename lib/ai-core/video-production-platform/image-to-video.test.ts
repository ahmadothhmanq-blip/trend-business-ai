import assert from "node:assert/strict";
import { test } from "node:test";
import { directorInputFromGenerateRequest } from "@/lib/ai-core/video-production-platform/director/from-generate";
import { buildDirectorPrompt } from "@/lib/ai-core/video-production-platform/director/llm";
import {
  collectDirectorSourceImageUrls,
  ingestDirectorSourceImages,
} from "@/lib/ai-core/video-production-platform/image-to-video";

const PNG_1X1 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

test("collectDirectorSourceImageUrls de-dupes and preserves first-seen order", () => {
  const urls = collectDirectorSourceImageUrls({
    productImageUrl: "https://cdn.example/a.png",
    sourceImageUrls: ["https://cdn.example/a.png", "https://cdn.example/b.png"],
  });
  assert.deepEqual(urls, ["https://cdn.example/a.png", "https://cdn.example/b.png"]);
});

test("director input maps multiple source stills onto product visual references", () => {
  const input = directorInputFromGenerateRequest({
    prompt: "Orbit the bottle",
    videoType: "image-to-video",
    language: "ar",
    country: "SA",
    projectId: "11111111-1111-4111-8111-111111111111",
    productImageUrls: ["https://cdn.example/a.png", "https://cdn.example/b.png"],
  });
  assert.equal(input.workflow, "product");
  assert.equal(input.country, "SA");
  assert.equal(input.products?.length, 2);
  assert.equal(input.products?.[0]?.visualReference, "https://cdn.example/a.png");
  assert.equal(input.products?.[1]?.visualReference, "https://cdn.example/b.png");
});

test("Director prompt includes GLS visual-prompt rules, GCRI country, and source stills", () => {
  const prompt = buildDirectorPrompt({
    prompt: "Animate the uploaded product still",
    duration: 8,
    language: "Arabic",
    country: "SA",
    workflow: "product",
    aspectRatio: "9:16",
    products: [
      {
        id: "source-image-1",
        projectId: "p",
        name: "source-image-1",
        visualReference: "https://cdn.example/product.png",
      },
    ],
  });
  assert.match(prompt, /CRITICAL — Generation Language/);
  assert.match(prompt, /visual generation prompt/i);
  assert.match(prompt, /CRITICAL — Country & Regional Intelligence/);
  assert.match(prompt, /Saudi Arabia|SA/);
  assert.match(prompt, /https:\/\/cdn\.example\/product\.png/);
  assert.match(prompt, /Source stills/);
});

test("ingestDirectorSourceImages uploads source stills into private storage", async () => {
  const uploaded: string[] = [];
  const urls = await ingestDirectorSourceImages({
    supabase: {
      storage: {
        from() {
          return {
            upload: async (path: string) => {
              uploaded.push(path);
              return { error: null };
            },
            createSignedUrl: async (path: string) => ({
              data: { signedUrl: `https://cdn.example/sign/${path}?token=t` },
            }),
          };
        },
      },
      from() {
        return {
          insert() {
            return {
              select() {
                return {
                  single: async () => ({ data: { id: "media-1" }, error: null }),
                };
              },
            };
          },
        };
      },
    },
    userId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    generationId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    uploads: [{ filename: "still.png", mimeType: "image/png", base64: PNG_1X1 }],
  });
  assert.equal(uploaded.length, 1);
  assert.equal(urls.length, 1);
  assert.match(urls[0] || "", /^https:\/\/cdn\.example\/sign\//);
});
