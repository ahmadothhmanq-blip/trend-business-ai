/** Shared AI cliché filter — EDS-003 SSOT for anti-cliché rules. */
export const AI_CONTENT_CLICHES = [
  "cutting-edge",
  "game-changer",
  "revolutionize",
  "synergy",
  "leverage",
  "world-class",
  "best-in-class",
  "unlock the power",
  "take your business to the next level",
  "in today's fast-paced",
  "look no further",
  "seamless experience",
  "holistic approach",
  "paradigm shift",
  "thought leader",
] as const;

export function stripContentCliches(text: string): string {
  let out = text;
  for (const cliche of AI_CONTENT_CLICHES) {
    out = out.replace(new RegExp(cliche, "gi"), "");
  }
  return out.replace(/\s{2,}/g, " ").trim();
}

export function findContentCliches(text: string): string[] {
  const blob = text.toLowerCase();
  return AI_CONTENT_CLICHES.filter((c) => blob.includes(c.toLowerCase()));
}
