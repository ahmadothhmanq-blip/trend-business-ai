const MAX_SEARCH_LENGTH = 200;

/**
 * Escape a user search term for SQL ILIKE patterns.
 * Backslashes, % and _ are escaped so the term is matched literally.
 */
function escapeIlikeSearchTerm(search: string): string {
  return search
    .trim()
    .slice(0, MAX_SEARCH_LENGTH)
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");
}

/** Wrap an escaped term in % for substring matching. Returns null when empty. */
export function ilikeContainsPattern(rawSearch: string | null | undefined): string | null {
  if (!rawSearch?.trim()) return null;
  return `%${escapeIlikeSearchTerm(rawSearch)}%`;
}

/** Double-quote a value for safe use inside PostgREST .or() filter strings. */
function quotePostgrestFilterValue(value: string): string {
  const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"${escaped}"`;
}

/**
 * Build a safe PostgREST `.or()` filter for ilike across multiple columns.
 * Column names must be trusted (hardcoded by the caller).
 */
export function buildMultiColumnIlikeOrFilter(
  columns: readonly string[],
  rawSearch: string | null | undefined,
): string | null {
  const pattern = ilikeContainsPattern(rawSearch);
  if (!pattern) return null;

  const quoted = quotePostgrestFilterValue(pattern);
  return columns.map((column) => `${column}.ilike.${quoted}`).join(",");
}
