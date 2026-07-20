/** Stable ids for video production entities. */

export function vid(prefix: string, raw: string, index = 0): string {
  const base = raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `${prefix}-${base || "item"}-${index}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}
