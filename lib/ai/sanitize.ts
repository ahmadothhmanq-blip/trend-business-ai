/**
 * Centralized prompt sanitization layer.
 * Prevents prompt injection by cleaning user inputs before
 * they are interpolated into AI prompts.
 */

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|rules?)/gi,
  /disregard\s+(all\s+)?(previous|above|prior)/gi,
  /you\s+are\s+now\s+(a|an|in)\s/gi,
  /new\s+instructions?:/gi,
  /system\s*:\s*/gi,
  /\[INST\]/gi,
  /\[\/INST\]/gi,
  /<\|im_start\|>/gi,
  /<\|im_end\|>/gi,
  /<<SYS>>/gi,
  /<<\/SYS>>/gi,
  /ASSISTANT:/gi,
  /HUMAN:/gi,
  /```system/gi,
];

const DANGEROUS_HTML_PATTERN = /<script[\s>]|<\/script>|javascript:|on\w+\s*=/gi;

/**
 * Remove known prompt injection patterns from user input.
 */
export function sanitizePromptInput(input: string): string {
  if (!input || typeof input !== "string") return "";

  let cleaned = input;

  for (const pattern of INJECTION_PATTERNS) {
    cleaned = cleaned.replace(pattern, "[filtered]");
  }

  cleaned = cleaned.replace(DANGEROUS_HTML_PATTERN, "[filtered]");

  if (cleaned.length > 15000) {
    cleaned = cleaned.slice(0, 15000);
  }

  return cleaned.trim();
}

/**
 * Sanitize an array of string inputs.
 */
export function sanitizePromptInputs(inputs: string[]): string[] {
  return inputs.map(sanitizePromptInput);
}

/**
 * Sanitize a key-value record of user inputs for prompt interpolation.
 */
export function sanitizePromptRecord(record: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(record)) {
    result[key] = sanitizePromptInput(value);
  }
  return result;
}

/**
 * Strip dangerous elements and attributes from SVG strings.
 * Removes <script>, event handlers, xlink:href with javascript:, etc.
 */
export function sanitizeSvgContent(svg: string): string {
  if (!svg || typeof svg !== "string") return "";

  let clean = svg;

  const svgStart = clean.indexOf("<svg");
  const svgEnd = clean.lastIndexOf("</svg>");
  if (svgStart === -1 || svgEnd === -1) return "";
  clean = clean.slice(svgStart, svgEnd + 6);

  clean = clean.replace(/<script[\s\S]*?<\/script>/gi, "");
  clean = clean.replace(/<iframe[\s\S]*?<\/iframe>/gi, "");
  clean = clean.replace(/<object[\s\S]*?<\/object>/gi, "");
  clean = clean.replace(/<embed[\s\S]*?\/?>/gi, "");
  clean = clean.replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, "");

  clean = clean.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, "");
  clean = clean.replace(/\s+on\w+\s*=\s*\S+/gi, "");

  clean = clean.replace(/javascript\s*:/gi, "");
  clean = clean.replace(/data\s*:\s*text\/html/gi, "");
  clean = clean.replace(/vbscript\s*:/gi, "");

  return clean;
}

/**
 * Safely convert simple markdown to HTML, stripping dangerous content.
 * Shared utility for all tool components.
 */
export function safeMarkdownToHtml(md: string): string {
  if (!md || typeof md !== "string") return "";

  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html
    .replace(/^#### (.+)$/gm, '<h5 class="font-bold text-white/60 mt-2 text-xs">$1</h5>')
    .replace(/^### (.+)$/gm, '<h4 class="font-bold text-white/70 mt-2">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="font-bold text-white/80 mt-3">$1</h3>')
    .replace(/^# (.+)$/gm, '<h2 class="font-bold text-white/90 mt-4 text-sm">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white/80">$1</strong>')
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, '<code class="rounded bg-white/5 px-1 py-0.5 text-[10px]">$1</code>')
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]*?<\/li>(\n|$))+/g, (m) => `<ul class="list-disc pl-4 space-y-0.5">${m}</ul>`)
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");

  return html;
}
