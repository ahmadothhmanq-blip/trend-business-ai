/**
 * Document helpers — counts, autosave metadata.
 */

export function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
}

export function countCharacters(text: string): number {
  return text.length;
}

export function documentCounts(body: string) {
  return {
    word_count: countWords(body),
    char_count: countCharacters(body),
  };
}

export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}
