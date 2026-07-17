import type { AiSearchScoreGrade } from "@/types/ai-search";

export function gradeFromScore(score: number): AiSearchScoreGrade {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 55) return "D";
  return "F";
}

export function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export function extractQuestions(text: string): string[] {
  const fromLines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => /\?$/.test(line) || /^(what|why|how|when|where|who|which|can|does|is|are)\b/i.test(line));
  const fromInline = text.match(/[^.!?\n]{8,120}\?/g) ?? [];
  return Array.from(new Set([...fromLines, ...fromInline.map((q) => q.trim())])).slice(0, 40);
}

export function estimateReadability(text: string): number {
  const words = wordCount(text);
  if (!words) return 0;
  const sentences = Math.max(1, (text.match(/[.!?]+/g) ?? []).length);
  const avgWords = words / sentences;
  // Prefer 12–22 words/sentence for AI-answer readability
  if (avgWords >= 12 && avgWords <= 22) return 92;
  if (avgWords >= 8 && avgWords <= 28) return 75;
  if (avgWords < 8) return 58;
  return 45;
}

export function detectAnswerFirst(content: string): boolean {
  const first = content.trim().slice(0, 280);
  if (!first) return false;
  const hasDefinition =
    /^(trend business ai|this (page|guide|tool)|in short|the answer|yes[,.]|no[,.])/i.test(first) ||
    first.split(/[.!?]/)[0]?.split(/\s+/).length <= 28;
  return hasDefinition && first.length >= 40;
}

export const BRAND_ENTITIES = [
  "Trend Business AI",
  "AI website builder",
  "AI landing page builder",
  "AI logo maker",
  "brand studio",
  "content studio",
  "feasibility study",
  "business intelligence",
  "marketing AI",
  "AI agents",
] as const;

export const AI_SEARCH_ENGINES = [
  { id: "google", label: "Google Search" },
  { id: "google-ai", label: "Google AI Mode" },
  { id: "chatgpt", label: "ChatGPT" },
  { id: "gemini", label: "Gemini" },
  { id: "claude", label: "Claude" },
  { id: "perplexity", label: "Perplexity" },
  { id: "copilot", label: "Microsoft Copilot" },
  { id: "ai-search", label: "AI-powered search engines" },
] as const;
