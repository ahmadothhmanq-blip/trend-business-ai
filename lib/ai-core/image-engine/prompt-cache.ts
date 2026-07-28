/**
 * In-memory prompt cache — avoids duplicate LLM refinement for identical contexts.
 * Scoped per process; keyed by stable hash of industry + purpose + brief + style.
 */

const cache = new Map<string, { prompt: string; alt: string; at: number }>();
const MAX_ENTRIES = 500;
const TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

function hashKey(parts: string[]): string {
  return parts.join("|").toLowerCase().replace(/\s+/g, " ").trim();
}

export function getCachedPrompt(keyParts: string[]): {
  prompt: string;
  alt: string;
} | null {
  const key = hashKey(keyParts);
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > TTL_MS) {
    cache.delete(key);
    return null;
  }
  return { prompt: hit.prompt, alt: hit.alt };
}

export function setCachedPrompt(
  keyParts: string[],
  value: { prompt: string; alt: string },
): void {
  if (cache.size >= MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(hashKey(keyParts), { ...value, at: Date.now() });
}

export function clearPromptCache(): void {
  cache.clear();
}
