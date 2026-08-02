import type { LinkRelFlag, VisualLinkType } from "@/lib/ai-core/visual-editor/link-types";

const URL_RE = /^https?:\/\//i;
const DOWNLOAD_EXT_RE = /\.(pdf|zip|docx?|xlsx?|pptx?|png|jpe?g|gif|webp|svg|mp4|mp3)$/i;

export function inferLinkType(href: string): VisualLinkType {
  const value = href.trim();
  if (!value) return "internal";
  if (value.startsWith("mailto:")) return "email";
  if (value.startsWith("tel:")) return "phone";
  if (/^https?:\/\/(wa\.me|api\.whatsapp\.com)/i.test(value)) return "whatsapp";
  if (/^https?:\/\/(t\.me|telegram\.me)/i.test(value)) return "telegram";
  if (value.startsWith("#")) return "anchor";
  if (URL_RE.test(value)) return "external";
  if (value.startsWith("/") && DOWNLOAD_EXT_RE.test(value)) return "download";
  if (DOWNLOAD_EXT_RE.test(value)) return "download";
  return "internal";
}

export function formatHref(linkType: VisualLinkType, raw: string): string {
  const value = raw.trim();
  if (!value) return "/";

  switch (linkType) {
    case "email":
      return value.startsWith("mailto:") ? value : `mailto:${value.replace(/^mailto:/i, "")}`;
    case "phone":
      return value.startsWith("tel:") ? value : `tel:${value.replace(/^tel:/i, "").replace(/\s/g, "")}`;
    case "whatsapp": {
      const digits = value.replace(/\D/g, "");
      if (/^https?:\/\//i.test(value)) return value;
      return digits ? `https://wa.me/${digits}` : value;
    }
    case "telegram": {
      if (/^https?:\/\//i.test(value)) return value;
      const handle = value.replace(/^@/, "").replace(/^https?:\/\/(t\.me|telegram\.me)\//i, "");
      return handle ? `https://t.me/${handle}` : value;
    }
    case "anchor":
      return value.startsWith("#") ? value : `#${value.replace(/^#/, "")}`;
    case "external":
      return URL_RE.test(value) ? value : `https://${value.replace(/^\/+/, "")}`;
    case "download":
      if (URL_RE.test(value)) return value;
      return value.startsWith("/") ? value : `/${value.replace(/^\//, "")}`;
    case "internal":
    default:
      return value.startsWith("/") ? value : `/${value.replace(/^\//, "")}`;
  }
}

export function stripHrefForEditor(linkType: VisualLinkType, href: string): string {
  const value = href.trim();
  switch (linkType) {
    case "email":
      return value.replace(/^mailto:/i, "");
    case "phone":
      return value.replace(/^tel:/i, "");
    case "whatsapp":
      return value.replace(/^https?:\/\/(wa\.me\/|api\.whatsapp\.com\/send\?phone=)/i, "");
    case "telegram":
      return value.replace(/^https?:\/\/(t\.me\/|telegram\.me\/)/i, "").replace(/^@/, "");
    case "anchor":
      return value.replace(/^#/, "");
    case "external":
      return value.replace(/^https?:\/\//i, "");
    default:
      return value;
  }
}

export function isValidExternalUrl(raw: string): boolean {
  const value = raw.trim();
  if (!value) return false;
  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    return Boolean(url.hostname && url.hostname.includes("."));
  } catch {
    return false;
  }
}

export function buildRelAttribute(rel: string[]): string {
  const unique = [...new Set(rel.filter(Boolean))];
  return unique.length ? unique.join(" ") : "";
}

export function parseRelAttribute(rel?: string): LinkRelFlag[] {
  if (!rel?.trim()) return [];
  return rel.trim().split(/\s+/).filter(Boolean) as LinkRelFlag[];
}
