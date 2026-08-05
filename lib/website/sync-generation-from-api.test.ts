import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fetchCompletedWebsiteGeneration } from "@/lib/website/sync-generation-from-api";

describe("fetchCompletedWebsiteGeneration", () => {
  it("returns completed generation with blueprint files", async () => {
    const generation = {
      id: "gen-sync-1",
      status: "completed",
      blueprint: {
        files: [{ path: "app/page.tsx", content: "export default function P(){}", language: "tsx" }],
      },
    };

    globalThis.fetch = async () =>
      ({
        ok: true,
        json: async () => ({ generation }),
      }) as Response;

    const result = await fetchCompletedWebsiteGeneration("gen-sync-1");
    assert.equal(result?.id, "gen-sync-1");
  });

  it("returns null when status is running", async () => {
    globalThis.fetch = async () =>
      ({
        ok: true,
        json: async () => ({
          generation: { id: "gen-sync-2", status: "running", blueprint: { files: [] } },
        }),
      }) as Response;

    const result = await fetchCompletedWebsiteGeneration("gen-sync-2");
    assert.equal(result, null);
  });
});
