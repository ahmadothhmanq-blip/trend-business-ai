import { getAIProvider, resolveAvailableProvider } from "@/lib/ai/adapters";
import { generateJsonWithValidation } from "@/lib/ai/generator";
import type { AIProvider } from "@/lib/ai/types";
import { aiOutputLanguageDirective } from "@/lib/ai/prompts/shared";
import { getGcriContext } from "@/lib/language-platform/gcri/context";
import type { DirectorInput, DirectorVideoPlan } from "@/lib/ai-core/video-production-platform/director/contracts";
import { MAX_DIRECTOR_SCENES } from "@/lib/ai-core/video-production-platform/director/contracts";
import { DirectorError } from "@/lib/ai-core/video-production-platform/director/errors";
import type { DirectorLlmDraft } from "@/lib/ai-core/video-production-platform/director/normalize";
import { activeBeats, targetSceneCount, workflowStrategy } from "@/lib/ai-core/video-production-platform/director/workflows";

export type DirectorLlmClient = Pick<AIProvider, "generateJson">;

export const DIRECTOR_LLM_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["objective", "narrative", "visualStyle", "scenes"],
  properties: {
    title: { type: "string" },
    objective: { type: "string" },
    narrative: { type: "string" },
    visualStyle: { type: "string" },
    pacing: { type: "string", enum: ["slow", "measured", "dynamic", "fast"] },
    scenes: {
      type: "array",
      minItems: 1,
      maxItems: MAX_DIRECTOR_SCENES,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["purpose", "prompt", "cameraMove", "shotSize", "environment", "lighting"],
        properties: {
          purpose: { type: "string" },
          duration: { type: "number" },
          prompt: { type: "string" },
          cameraMove: { type: "string" },
          shotSize: { type: "string" },
          lens: { type: "string" },
          visualStyle: { type: "string" },
          environment: { type: "string" },
          lighting: { type: "string" },
          characterIds: { type: "array", items: { type: "string" } },
          productIds: { type: "array", items: { type: "string" } },
          dialogue: { type: "string" },
          musicCue: { type: "string" },
          sfx: { type: "array", items: { type: "string" } },
          transition: { type: "string" },
          voiceRequired: { type: "boolean" },
        },
      },
    },
    audio: {
      type: "object",
      additionalProperties: false,
      properties: {
        narrationRequired: { type: "boolean" },
        speaker: { type: "string" },
        tone: { type: "string" },
        musicRequired: { type: "boolean" },
        musicMood: { type: "string" },
        sfxRequired: { type: "boolean" },
      },
    },
  },
};

export function resolveDirectorLlmClient(client?: DirectorLlmClient): DirectorLlmClient {
  if (client) return client;
  if (!resolveAvailableProvider()) {
    throw new DirectorError(
      "No configured text LLM provider. Director cannot invent a VideoPlan.",
      "llm_unconfigured",
    );
  }
  return getAIProvider();
}

function isMalformedJsonError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /json|unexpected token|malformed|parse/i.test(message);
}

function draftUsable(draft: unknown): { valid: boolean; reason?: string } {
  if (!draft || typeof draft !== "object") {
    return { valid: false, reason: "Director LLM returned a non-object." };
  }
  const row = draft as DirectorLlmDraft;
  if (!row.objective?.trim() || !row.narrative?.trim() || !row.visualStyle?.trim()) {
    return { valid: false, reason: "Director LLM omitted objective, narrative, or visualStyle." };
  }
  if (!Array.isArray(row.scenes) || row.scenes.length < 1) {
    return { valid: false, reason: "Director LLM omitted scenes." };
  }
  return { valid: true };
}

function sourceStillDirective(
  input: DirectorInput & { duration: number; language: string; workflow: DirectorVideoPlan["workflow"] },
): string {
  const stills = (input.products || [])
    .map((row, index) => {
      const url = row.visualReference || row.referenceUri;
      if (!url || !/^https?:\/\//i.test(url)) return null;
      return `- ${row.id || `source-image-${index + 1}`}: ${url}`;
    })
    .filter(Boolean);
  if (!stills.length) return "";
  return [
    "Source stills — animate these images. Do not replace the subject, logo, or layout with a different product or person.",
    ...stills,
    "Assign each still to scenes via productIds. Prefer one still per scene when counts match; otherwise reuse stills rather than inventing new subjects.",
  ].join("\n");
}

export function buildDirectorPrompt(
  input: DirectorInput & { duration: number; language: string; workflow: DirectorVideoPlan["workflow"] },
): string {
  const strategy = workflowStrategy(input.workflow);
  const sceneCount = targetSceneCount(input.workflow, input.duration);
  const beats = activeBeats(input, input.workflow, sceneCount);
  return [
    "You are the AI Video Director for Trend Business AI Video.",
    "Return JSON only. Do not render video, audio, or images.",
    "Do not invent audience, budget, quality, brand, products, characters, CTA, language, duration, or aspect ratio.",
    "Scene characterIds and productIds may only use IDs listed below. Copy IDs, never copy identity blobs into scenes.",
    `Workflow: ${input.workflow}`,
    `Strategy beats in order: ${beats.map((beat) => `${beat.purpose} (${beat.description})`).join(" | ")}`,
    `Pacing hint: ${strategy.pacing}`,
    `Prompt: ${input.prompt.trim()}`,
    input.objective ? `Objective: ${input.objective}` : "Objective: derive from the prompt.",
    input.audience ? `Audience: ${input.audience}` : "Audience: omitted — leave it out of the JSON.",
    `Duration seconds: ${input.duration}`,
    `Aspect ratio: ${input.aspectRatio}`,
    `Language: ${input.language}`,
    aiOutputLanguageDirective(
      input.language,
      "video",
      input.country || getGcriContext()?.countryCode,
    ).trim(),
    sourceStillDirective(input),
    "Scene `prompt` is a visual generation prompt for video models. Describe motion, lighting, environment, wardrobe, and on-screen text for the selected GLS language and GCRI country. Keep source-image subject identity stable.",
    input.style ? `Style: ${input.style}` : "Style: omitted — invent visualStyle from the prompt only.",
    input.quality ? `Quality: ${input.quality}` : "Quality: omitted.",
    input.budget != null ? `Budget credits: ${input.budget}` : "Budget: omitted.",
    input.platform ? `Platform: ${input.platform}` : "Platform: omitted.",
    input.callToAction ? `Call to action: ${input.callToAction}` : "Call to action: omitted — do not invent a CTA string.",
    input.voicePreference ? `Voice preference: ${input.voicePreference}` : "Voice preference: omitted.",
    `Character IDs: ${(input.characterIds || input.characters?.map((row) => row.id) || []).join(", ") || "none"}`,
    `Product IDs: ${(input.productIds || input.products?.map((row) => row.id) || []).join(", ") || "none"}`,
    `Brand ID: ${input.brandId || input.brand?.id || "none"}`,
    `Target scene count: ${beats.length}. Scene durations must sum to ${input.duration}.`,
    input.workflow === "ad"
      ? "Ad workflow must include hook and cta purposes. Do not force this structure on other workflows."
      : `Do not force ad hook/product/CTA structure onto ${input.workflow}.`,
    strategy.voiceBias
      ? "Voice-led workflow: set voiceRequired true on spoken scenes and provide dialogue text in the scene language. Do not synthesize audio."
      : "Do not require voice unless the prompt clearly needs narration.",
    "Each scene needs purpose, prompt, cameraMove, shotSize, environment, lighting, optional lens, transition.",
    "Provider preference is a hint only. Do not claim a provider will execute.",
  ].join("\n");
}

export async function generateDirectorDraft(params: {
  input: DirectorInput & { duration: number; language: string; workflow: DirectorVideoPlan["workflow"] };
  client?: DirectorLlmClient;
  validationReason?: string;
}): Promise<DirectorLlmDraft> {
  const client = resolveDirectorLlmClient(params.client);
  const basePrompt = buildDirectorPrompt(params.input);
  try {
    return await generateJsonWithValidation<DirectorLlmDraft>({
      provider: client as AIProvider,
      prompt: basePrompt,
      schema: DIRECTOR_LLM_SCHEMA,
      maxAttempts: 3,
      validate: draftUsable,
      transformRetryPrompt: (prompt, reason) =>
        `${prompt}\n\nPrevious JSON failed: ${reason}\nReturn valid Director JSON only.`,
    });
  } catch (error) {
    if (error instanceof DirectorError) throw error;
    if (isMalformedJsonError(error) || /failed after \d+ attempts/i.test(error instanceof Error ? error.message : "")) {
      throw new DirectorError(
        error instanceof Error ? error.message : "Director LLM returned malformed JSON.",
        "malformed_json",
      );
    }
    throw new DirectorError(
      error instanceof Error ? error.message : "Director LLM failed.",
      "llm_failed",
    );
  }
}