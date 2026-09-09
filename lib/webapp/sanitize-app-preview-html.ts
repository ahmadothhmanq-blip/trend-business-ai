/**
 * Allowlist HTML sanitizer for App Builder live/public preview sandboxes.
 * Uses a tag tokenizer (not document-wide regex) so forged/malformed markup
 * cannot smuggle scripts past a brittle strip.
 */

const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

const ALLOWED_TAGS = new Set([
  "html",
  "head",
  "body",
  "title",
  "meta",
  "style",
  "div",
  "span",
  "p",
  "a",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "form",
  "input",
  "button",
  "label",
  "select",
  "option",
  "textarea",
  "section",
  "header",
  "footer",
  "nav",
  "main",
  "article",
  "aside",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "small",
  "br",
  "hr",
  "img",
  "figure",
  "figcaption",
  "blockquote",
  "pre",
  "code",
  "dl",
  "dt",
  "dd",
]);

/** Tags whose entire contents are discarded until the matching close tag. */
const RAW_DISCARD_TAG_PATTERN =
  "script|iframe|object|embed|svg|math|link|base|template|noscript|frame|frameset|applet";

const TRUSTED_INTERACTIVE_EXTRA_TAGS = new Set(["script"]);

const GLOBAL_ATTRS = new Set([
  "id",
  "class",
  "title",
  "lang",
  "dir",
  "role",
  "tabindex",
]);

const TAG_ATTRS: Record<string, ReadonlySet<string>> = {
  a: new Set(["href", "name", "target", "rel"]),
  img: new Set(["src", "alt", "width", "height", "loading"]),
  input: new Set([
    "type",
    "name",
    "value",
    "placeholder",
    "disabled",
    "readonly",
    "checked",
    "min",
    "max",
    "step",
    "required",
  ]),
  button: new Set(["type", "disabled", "name", "value"]),
  form: new Set(["action", "method", "autocomplete"]),
  label: new Set(["for"]),
  meta: new Set(["charset", "name", "content", "viewport"]),
  select: new Set(["name", "disabled", "required", "multiple"]),
  option: new Set(["value", "selected", "disabled"]),
  textarea: new Set([
    "name",
    "placeholder",
    "disabled",
    "readonly",
    "required",
    "rows",
    "cols",
  ]),
  script: new Set(["type", "id"]),
  td: new Set(["colspan", "rowspan"]),
  th: new Set(["colspan", "rowspan", "scope"]),
};

const URL_ATTRS = new Set(["href", "src", "action", "formaction"]);

function isAllowedAttrName(tag: string, name: string): boolean {
  const lower = name.toLowerCase();
  if (lower.startsWith("on")) return false;
  if (lower === "srcdoc" || lower === "xlink:href") return false;
  if (GLOBAL_ATTRS.has(lower)) return true;
  if (lower.startsWith("aria-") || lower.startsWith("data-")) return true;
  const allowed = TAG_ATTRS[tag];
  return Boolean(allowed?.has(lower));
}

function isSafeUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("data:text/html") ||
    lower.startsWith("data:application/")
  ) {
    return false;
  }
  if (
    lower.startsWith("#") ||
    lower.startsWith("/") ||
    lower.startsWith("./") ||
    lower.startsWith("../") ||
    lower.startsWith("https:") ||
    lower.startsWith("http:") ||
    lower.startsWith("mailto:") ||
    lower.startsWith("tel:") ||
    lower.startsWith("data:image/")
  ) {
    return true;
  }
  // Relative paths without scheme (e.g. "assets/logo.png")
  if (!/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return true;
  return false;
}

function isSafeStyleValue(value: string): boolean {
  const lower = value.toLowerCase();
  if (lower.includes("expression(")) return false;
  if (/url\s*\(\s*['"]?\s*javascript:/i.test(value)) return false;
  if (/url\s*\(\s*['"]?\s*data\s*:\s*text\/html/i.test(value)) return false;
  if (/@import/i.test(value)) return false;
  if (/behavior\s*:/i.test(value)) return false;
  if (/-moz-binding\s*:/i.test(value)) return false;
  return true;
}

function sanitizeStyleBlock(css: string): string {
  return css
    .replace(/<\/style/gi, "<\\/style")
    .replace(/@import[\s\S]*?;/gi, "")
    .replace(/expression\s*\([^)]*\)/gi, "none")
    .replace(/url\s*\(\s*['"]?\s*javascript:[^)]*\)/gi, "none")
    .replace(/url\s*\(\s*['"]?\s*data\s*:\s*text\/html[^)]*\)/gi, "none");
}

function escapeAttr(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

type Attr = { name: string; value: string | null };

function parseAttrs(raw: string): Attr[] {
  const attrs: Attr[] = [];
  let i = 0;
  while (i < raw.length) {
    while (i < raw.length && /\s/.test(raw[i]!)) i += 1;
    if (i >= raw.length) break;
    if (raw[i] === "/" || raw[i] === ">") break;

    const nameStart = i;
    while (i < raw.length && /[^\s=>/]/.test(raw[i]!)) i += 1;
    const name = raw.slice(nameStart, i);
    if (!name) {
      i += 1;
      continue;
    }

    while (i < raw.length && /\s/.test(raw[i]!)) i += 1;
    if (raw[i] !== "=") {
      attrs.push({ name, value: null });
      continue;
    }
    i += 1;
    while (i < raw.length && /\s/.test(raw[i]!)) i += 1;

    let value = "";
    if (raw[i] === '"' || raw[i] === "'") {
      const quote = raw[i]!;
      i += 1;
      const valueStart = i;
      while (i < raw.length && raw[i] !== quote) i += 1;
      value = raw.slice(valueStart, i);
      if (i < raw.length) i += 1;
    } else {
      const valueStart = i;
      while (i < raw.length && /[^\s>]/.test(raw[i]!)) i += 1;
      value = raw.slice(valueStart, i);
    }
    attrs.push({ name, value });
  }
  return attrs;
}

function serializeOpenTag(
  tag: string,
  attrs: Attr[],
  selfClosing: boolean,
): string {
  const parts: string[] = [tag];
  for (const attr of attrs) {
    if (!isAllowedAttrName(tag, attr.name)) continue;
    const name = attr.name.toLowerCase();
    if (attr.value === null) {
      parts.push(name);
      continue;
    }
    if (name === "style") {
      if (!isSafeStyleValue(attr.value)) continue;
      parts.push(`style="${escapeAttr(attr.value)}"`);
      continue;
    }
    if (URL_ATTRS.has(name)) {
      if (!isSafeUrl(attr.value)) continue;
      parts.push(`${name}="${escapeAttr(attr.value)}"`);
      continue;
    }
    if (name === "target" && attr.value.trim() !== "_blank" && attr.value.trim() !== "_self") {
      continue;
    }
    parts.push(`${name}="${escapeAttr(attr.value)}"`);
  }
  if (selfClosing || VOID_TAGS.has(tag)) {
    return `<${parts.join(" ")} />`;
  }
  return `<${parts.join(" ")}>`;
}

function findRawClose(html: string, from: number, tag: string): number {
  const re = new RegExp(`</${tag}\\s*>`, "i");
  const slice = html.slice(from);
  const match = re.exec(slice);
  if (!match) return html.length;
  return from + match.index + match[0].length;
}

type SanitizeMode = "static" | "trusted-interactive";

function sanitizeHtmlDocument(html: string, mode: SanitizeMode): string {
  if (!html || typeof html !== "string") return "";

  const allowScript = mode === "trusted-interactive";
  let out = "";
  let i = 0;

  // Preserve leading doctype if present.
  const doctype = html.match(/^\s*<!DOCTYPE[^>]*>/i);
  if (doctype) {
    out += "<!DOCTYPE html>";
    i = doctype[0].length;
  }

  while (i < html.length) {
    const ch = html[i]!;
    if (ch !== "<") {
      const next = html.indexOf("<", i);
      const end = next === -1 ? html.length : next;
      out += html.slice(i, end);
      i = end;
      continue;
    }

    // Raw-discard tags (script/iframe/…) — locate the first `>` carefully so a
    // missing `>` on the opener cannot glue onto a later close tag and wipe the
    // remainder of the document when findRawClose runs again.
    const rawOpen = html
      .slice(i)
      .match(new RegExp(`^<\\s*(${RAW_DISCARD_TAG_PATTERN})\\b`, "i"));
    if (rawOpen) {
      const tag = rawOpen[1]!.toLowerCase();
      const gt = html.indexOf(">", i);
      if (gt === -1) {
        i = html.length;
        continue;
      }
      const startTag = html.slice(i, gt + 1);
      const selfClosing = /\/\s*>$/.test(startTag) || VOID_TAGS.has(tag);

      // Trusted interactive previews may keep inline scripts (no src).
      if (allowScript && tag === "script" && !selfClosing) {
        const attrs = parseAttrs(
          startTag.replace(/^<\s*script/i, "").replace(/\/?\s*>$/, ""),
        );
        const hasSrc = attrs.some((a) => a.name.toLowerCase() === "src");
        if (!hasSrc) {
          const closeAt = findRawClose(html, gt + 1, "script");
          const closeTag = html.slice(gt + 1, closeAt).match(/<\/script\s*>$/i);
          const bodyEnd = closeTag ? closeAt - closeTag[0].length : closeAt;
          const body = html.slice(gt + 1, bodyEnd);
          // Block nested closers / injection into following HTML.
          const safeBody = body.replace(/<\/script/gi, "<\\/script");
          out += `${serializeOpenTag("script", attrs, false)}${safeBody}</script>`;
          i = closeAt;
          continue;
        }
      }

      i = gt + 1;
      if (!selfClosing && !startTag.toLowerCase().includes(`</${tag}`)) {
        i = findRawClose(html, i, tag);
      }
      continue;
    }

    // Comments
    if (html.startsWith("<!--", i)) {
      const end = html.indexOf("-->", i + 4);
      i = end === -1 ? html.length : end + 3;
      continue;
    }

    // Closing tag
    const closeMatch = html.slice(i).match(/^<\/\s*([a-zA-Z][\w:-]*)\s*>/);
    if (closeMatch) {
      const tag = closeMatch[1]!.toLowerCase();
      const allowed =
        ALLOWED_TAGS.has(tag) ||
        (allowScript && TRUSTED_INTERACTIVE_EXTRA_TAGS.has(tag));
      if (allowed && !VOID_TAGS.has(tag)) {
        out += `</${tag}>`;
      }
      i += closeMatch[0].length;
      continue;
    }

    // Opening / void tag
    const openMatch = html.slice(i).match(/^<\s*([a-zA-Z][\w:-]*)([^>]*)>/);
    if (!openMatch) {
      // Malformed `<` — emit escaped and continue
      out += "&lt;";
      i += 1;
      continue;
    }

    const tag = openMatch[1]!.toLowerCase();
    const attrRaw = openMatch[2] ?? "";
    const full = openMatch[0];
    const selfClosing = /\/\s*$/.test(attrRaw) || VOID_TAGS.has(tag);
    const allowed =
      ALLOWED_TAGS.has(tag) ||
      (allowScript && TRUSTED_INTERACTIVE_EXTRA_TAGS.has(tag));

    if (!allowed) {
      i += full.length;
      if (!selfClosing && !VOID_TAGS.has(tag)) {
        i = findRawClose(html, i, tag);
      }
      continue;
    }

    if (tag === "style") {
      i += full.length;
      const closeAt = findRawClose(html, i, "style");
      // closeAt points after </style>
      const closeTag = html.slice(i, closeAt).match(/<\/style\s*>$/i);
      const cssEnd = closeTag ? closeAt - closeTag[0].length : closeAt;
      const css = sanitizeStyleBlock(html.slice(i, cssEnd));
      out += `<style>${css}</style>`;
      i = closeAt;
      continue;
    }

    const attrs = parseAttrs(attrRaw.replace(/\/\s*$/, ""));
    out += serializeOpenTag(tag, attrs, selfClosing);
    i += full.length;
  }

  return out;
}

/**
 * Sanitize preview/public HTML to a static, script-free document.
 * Keeps structure + safe inline CSS; strips executable vectors.
 */
export function sanitizeAppPreviewHtml(html: string): string {
  return sanitizeHtmlDocument(html, "static");
}

/**
 * Sanitize first-party interactive live-preview HTML.
 * Allows inline runtime scripts; still strips external scripts, handlers, and javascript: URLs.
 */
export function sanitizeTrustedInteractivePreviewHtml(html: string): string {
  return sanitizeHtmlDocument(html, "trusted-interactive");
}

/** True when HTML still carries common XSS vectors (pre-sanitization gate). */
export function previewHtmlHasUnsafeVectors(html: string): boolean {
  if (!html) return false;
  if (/<script\b/i.test(html)) return true;
  if (/<iframe\b/i.test(html)) return true;
  if (/<object\b/i.test(html)) return true;
  if (/<embed\b/i.test(html)) return true;
  if (/\son\w+\s*=/i.test(html)) return true;
  if (/javascript\s*:/i.test(html)) return true;
  if (/data\s*:\s*text\/html/i.test(html)) return true;
  if (/<svg\b/i.test(html)) return true;
  return false;
}

/** Defense-in-depth CSP for static/public App Builder preview HTML (no scripts). */
export const APP_PREVIEW_CONTENT_SECURITY_POLICY =
  "default-src 'none'; style-src 'unsafe-inline'; img-src data: https: blob:; base-uri 'none'; form-action 'none'; frame-ancestors 'self'";

/** CSP for interactive live preview (first-party inline runtime only). */
export const APP_LIVE_PREVIEW_CONTENT_SECURITY_POLICY =
  "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: https: blob:; base-uri 'none'; form-action 'self'; frame-ancestors 'self'";

export function appPreviewSecurityHeaders(options?: {
  cacheControl?: string;
  referrerPolicy?: string;
  frameOptions?: string;
  interactive?: boolean;
}): Record<string, string> {
  return {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": options?.cacheControl ?? "private, no-store",
    "Content-Security-Policy": options?.interactive
      ? APP_LIVE_PREVIEW_CONTENT_SECURITY_POLICY
      : APP_PREVIEW_CONTENT_SECURITY_POLICY,
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": options?.referrerPolicy ?? "same-origin",
    "X-Frame-Options": options?.frameOptions ?? "SAMEORIGIN",
  };
}
