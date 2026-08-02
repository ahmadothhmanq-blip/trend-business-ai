/**
 * Deduplicated quality heuristics — shared normalization for issues and repairs.
 */

export function normalizeQualityMessage(message: string): string {
  return message
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s\u0600-\u06FF-]/g, "")
    .trim();
}

export function issueFingerprint(message: string): string {
  const normalized = normalizeQualityMessage(message);
  const tokens = normalized.split(" ").filter((t) => t.length > 3).slice(0, 8);
  return tokens.join("|") || normalized.slice(0, 48);
}

export function dedupeStrings(items: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of items) {
    const key = issueFingerprint(item);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

export function dedupeRepairInstructions(instructions: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const instruction of instructions) {
    const trimmed = instruction.trim();
    if (!trimmed) continue;
    const key = issueFingerprint(trimmed);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }
  return result;
}

/** Collapse overlapping CTA / heading / responsive findings across modules. */
const OVERLAP_GROUPS: RegExp[] = [
  /cta|call.to.action|button/i,
  /h1|heading hierarchy|visual hierarchy/i,
  /responsive|breakpoint|sm:|md:|lg:/i,
  /hero/i,
  /metadata|seo title|meta description/i,
  /design token|color-primary|font-heading/i,
];

export function collapseOverlappingMessages(messages: string[]): string[] {
  const deduped = dedupeStrings(messages);
  const kept: string[] = [];
  const coveredGroups = new Set<number>();

  for (const message of deduped) {
    let groupIndex = -1;
    for (let i = 0; i < OVERLAP_GROUPS.length; i += 1) {
      if (OVERLAP_GROUPS[i].test(message)) {
        groupIndex = i;
        break;
      }
    }
    if (groupIndex >= 0) {
      if (coveredGroups.has(groupIndex)) continue;
      coveredGroups.add(groupIndex);
    }
    kept.push(message);
  }

  return kept;
}
