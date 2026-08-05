import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AIProvider } from "@/lib/ai/types";
import {
  createContentProviderFromAiProvider,
  parseStructuredContent,
} from "@/lib/ai-core/generation-engine/integration/content-provider";

describe("createContentProviderFromAiProvider", () => {
  it("maps Master Plan request fields to AIProvider TextGenerationRequest", async () => {
    let capturedPrompt: string | undefined;
    let capturedSystem: string | undefined;

    const provider: AIProvider = {
      name: "deepseek",
      async generateJson() {
        return {};
      },
      async generateText(request) {
        capturedPrompt = request.prompt;
        capturedSystem = request.system;
        return JSON.stringify({
          masterPlanId: "mp-1",
          content: [{ blockId: "hero-title", fields: { headline: "Welcome" } }],
        });
      },
      getModelName() {
        return "deepseek-v4-flash";
      },
    };

    const contentProvider = createContentProviderFromAiProvider(provider);
    const response = await contentProvider.executeContent({
      systemPrompt: "LOCKED Master Plan system",
      userPrompt: '{"copyTasks":[],"locked":true}',
      schema: {},
    });

    assert.equal(capturedPrompt, '{"copyTasks":[],"locked":true}');
    assert.equal(capturedSystem, "LOCKED Master Plan system");
    assert.equal(response.model, "deepseek-v4-flash");

    const structured = parseStructuredContent(response);
    assert.ok(structured);
    assert.equal(structured?.content.length, 1);
  });
});
