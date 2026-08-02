/**
 * Link validation for the visual editor.
 */

import { isValidExternalUrl } from "@/lib/ai-core/visual-editor/link-format";
import { linksEqual } from "@/lib/ai-core/visual-editor/link-persist";
import type {
  LinkValidation,
  VisualLink,
  VisualLinkType,
} from "@/lib/ai-core/visual-editor/link-types";

export type LinkValidationContext = {
  internalRoutes: string[];
  anchorIds: string[];
};

export function validateLink(
  link: Pick<VisualLink, "linkType" | "href" | "label">,
  ctx: LinkValidationContext,
): LinkValidation {
  const href = link.href.trim();
  const label = link.label.trim();

  if (!label) {
    return { status: "warning", message: "Link label is empty" };
  }

  if (!href) {
    return { status: "error", message: "Link URL is required" };
  }

  switch (link.linkType) {
    case "internal": {
      const path = href.startsWith("/") ? href : `/${href}`;
      if (!ctx.internalRoutes.includes(path)) {
        return {
          status: "error",
          message: `Page not found: ${path}`,
        };
      }
      return { status: "valid" };
    }
    case "anchor": {
      const id = href.replace(/^#/, "");
      if (!id) return { status: "error", message: "Anchor id is required" };
      if (ctx.anchorIds.length && !ctx.anchorIds.includes(id)) {
        return {
          status: "warning",
          message: `Section #${id} not detected on this page`,
        };
      }
      return { status: "valid" };
    }
    case "external":
    case "download":
      if (!isValidExternalUrl(href) && link.linkType === "external") {
        return { status: "error", message: "Invalid URL format" };
      }
      return { status: "valid" };
    case "email": {
      const email = href.replace(/^mailto:/i, "");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { status: "error", message: "Invalid email address" };
      }
      return { status: "valid" };
    }
    case "phone": {
      const digits = href.replace(/^tel:/i, "").replace(/\D/g, "");
      if (digits.length < 6) {
        return { status: "error", message: "Invalid phone number" };
      }
      return { status: "valid" };
    }
    case "whatsapp": {
      const digits = href.replace(/\D/g, "");
      if (digits.length < 8) {
        return { status: "error", message: "Invalid WhatsApp number" };
      }
      return { status: "valid" };
    }
    case "telegram": {
      const handle = href.replace(/^https?:\/\/(t\.me\/|telegram\.me\/)/i, "").replace(/^@/, "");
      if (!handle) return { status: "error", message: "Telegram username required" };
      return { status: "valid" };
    }
    default:
      return { status: "valid" };
  }
}

export function hasBlockingLinkErrors(links: VisualLink[], ctx: LinkValidationContext): boolean {
  return links.some((link) => validateLink(link, ctx).status === "error");
}

/**
 * Block save only when the user introduced or worsened a link validation error.
 * Pre-existing broken links in generated scaffolds must not prevent persisting other edits.
 */
export function hasBlockingLinkSaveErrors(
  baselineLinks: VisualLink[],
  currentLinks: VisualLink[],
  ctx: LinkValidationContext,
): boolean {
  for (const link of currentLinks) {
    if (link.kind === "button" || link.kind === "cta") continue;
    const base = baselineLinks.find((item) => item.id === link.id);
    const changed = !base || !linksEqual(link, base);
    if (changed && validateLink(link, ctx).status === "error") {
      return true;
    }
  }
  return false;
}

export function validateLinkTypeHref(linkType: VisualLinkType, href: string): LinkValidation {
  return validateLink({ linkType, href, label: "x" }, { internalRoutes: [], anchorIds: [] });
}
