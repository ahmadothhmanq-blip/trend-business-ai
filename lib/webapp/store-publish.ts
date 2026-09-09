/**
 * Store packaging helpers for App Builder publish UX.
 * Platform /w/app/… is interactive HTML preview — not a full Next.js host.
 */

export function isStoreSuitableProductionUrl(url: string | null | undefined): boolean {
  if (!url || !url.trim()) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    if (/\/w\/app\//i.test(parsed.pathname)) return false;
    return true;
  } catch {
    return false;
  }
}
