/**
 * Content Studio AI writing actions — rewrite, improve, expand, etc.
 */

import { getDefaultTextProvider } from "@/lib/ai/provider-config";
import { providerManager } from "@/lib/ai/provider-manager";
import type { ContentActionType, BrandVoiceContext } from "@/types/content";
import { brandVoiceToPromptContext } from "@/lib/content-studio/brand-voice";

export type ContentActionInput = {
  action: ContentActionType;
  text: string;
  tone?: string;
  style?: string;
  targetLanguage?: string;
  instruction?: string;
  brandVoice?: BrandVoiceContext | null;
};

export type ContentActionResult = {
  text: string;
  action: ContentActionType;
  provider: string;
};

const ACTION_INSTRUCTIONS: Record<ContentActionType, string> = {
  rewrite: "Rewrite the text for clarity and impact while preserving meaning.",
  improve: "Improve the writing quality, flow, grammar, and persuasiveness.",
  expand: "Expand the text with more detail, examples, and depth.",
  shorten: "Shorten the text while keeping the core message and key points.",
  summarize: "Summarize the text into a concise version.",
  translate: "Translate the text accurately.",
  change_tone: "Rewrite the text in the requested tone.",
  change_style: "Rewrite the text in the requested writing style.",
};

function buildActionPrompt(input: ContentActionInput): { system: string; prompt: string } {
  const brandBlock = input.brandVoice
    ? `\n\nBrand voice guidelines:\n${brandVoiceToPromptContext(input.brandVoice)}`
    : "";

  const extras: string[] = [];
  if (input.tone) extras.push(`Target tone: ${input.tone}`);
  if (input.style) extras.push(`Target style: ${input.style}`);
  if (input.targetLanguage) extras.push(`Target language: ${input.targetLanguage}`);
  if (input.instruction) extras.push(`Additional instruction: ${input.instruction}`);

  const system = [
    "You are a professional content editor for Trend Business AI Content Studio.",
    "Return only the edited content — no preamble, labels, or markdown fences unless the source uses markdown.",
    ACTION_INSTRUCTIONS[input.action],
    ...extras,
    brandBlock,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    system,
    prompt: `Edit the following content:\n\n${input.text}`,
  };
}

export async function runContentAction(
  input: ContentActionInput,
  onChunk?: (chunk: string) => void,
): Promise<ContentActionResult> {
  const providerName = getDefaultTextProvider();
  const resolved = providerManager.resolve(providerName);
  if (!resolved || !providerManager.isConfigured(resolved)) {
    throw new Error("No AI provider configured.");
  }

  const { system, prompt } = buildActionPrompt(input);

  let text: string;
  if (onChunk && providerManager.getProvider(resolved).streamText) {
    text = await providerManager.streamText(
      { prompt, system, temperature: 0.6, onChunk },
      resolved,
    );
  } else {
    text = await providerManager.generateText(
      { prompt, system, temperature: 0.6 },
      resolved,
    );
  }

  return {
    text: text.trim(),
    action: input.action,
    provider: resolved,
  };
}

export function actionToGenerationMode(
  action: ContentActionType,
): "rewrite" | "expand" | "shorten" | "translate" | "summarize" | "continue" {
  const map: Record<ContentActionType, "rewrite" | "expand" | "shorten" | "translate" | "summarize" | "continue"> = {
    rewrite: "rewrite",
    improve: "continue",
    expand: "expand",
    shorten: "shorten",
    summarize: "summarize",
    translate: "translate",
    change_tone: "rewrite",
    change_style: "rewrite",
  };
  return map[action];
}
