/** Stable-ish ids for structured app entities. */

export function slugId(prefix: string, raw: string, index = 0): string {
  const base = raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `${prefix}-${base || "item"}-${index}`;
}
