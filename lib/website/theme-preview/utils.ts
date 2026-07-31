export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function pickContent(
  content: string[],
  slot: number,
  fallback: string,
): string {
  return content[slot]?.trim() || fallback;
}

export function pickColor(
  palette: string[] | undefined,
  index: number,
  fallback: string,
): string {
  const raw = palette?.[index]?.trim();
  if (!raw) return fallback;
  const match = raw.match(/#([0-9a-fA-F]{3,8})\b/);
  if (match) return `#${match[1]}`;
  if (/^[a-zA-Z]+$/.test(raw)) return raw;
  return fallback;
}
