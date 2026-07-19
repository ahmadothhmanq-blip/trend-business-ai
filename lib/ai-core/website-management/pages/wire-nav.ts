/**
 * Wire Navbar / Footer to real routes from site structure.
 */

import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { SiteStructurePlan } from "@/lib/ai-core/website-management/types";

function linksLiteral(
  links: Array<{ href: string; label: string }>,
): string {
  return `[${links
    .map((l) => `{ href: ${JSON.stringify(l.href)}, label: ${JSON.stringify(l.label)} }`)
    .join(", ")}]`;
}

/**
 * Patch header/nav/footer scaffold files and home page props to use real routes.
 */
export function wireNavAndFooterToRoutes(
  files: GeneratedProjectFile[],
  structure: SiteStructurePlan,
): GeneratedProjectFile[] {
  const navLit = linksLiteral(structure.navLinks);
  const footLit = linksLiteral(structure.footerLinks);

  return files.map((file) => {
    let content = file.content;

    // Inject canonical link constants into sitemap helper already written
    if (file.path === "lib/site-sitemap.ts") {
      return file;
    }

    const isNav =
      /site-header|nav-modern|NavModern|SiteHeader/i.test(file.path) ||
      (/export function (SiteHeader|NavModern)/.test(content) &&
        file.path.includes("components"));
    const isFooter =
      /site-footer|SiteFooter/i.test(file.path) ||
      (/export function SiteFooter/.test(content) &&
        file.path.includes("components"));

    if (isNav || file.path.includes("site-header") || file.path.includes("nav-modern")) {
      content = content.replace(
        /const\s+(?:NAV|LINKS|DEFAULT_LINKS|navLinks)\s*=\s*\[[^\]]*\]/,
        `const NAV = ${navLit}`,
      );
      if (
        content.includes("href:") &&
        /#features|#services|#contact|#pricing|#gallery|#product/.test(content)
      ) {
        content = content
          .replace(/"#features"/g, '"/services"')
          .replace(/"#services"/g, '"/services"')
          .replace(/"#product"/g, '"/inventory"')
          .replace(/"#pricing"/g, '"/pricing"')
          .replace(/"#gallery"/g, '"/gallery"')
          .replace(/"#menu"/g, '"/menu"')
          .replace(/"#contact"/g, '"/contact"')
          .replace(/"#about"/g, '"/about"')
          .replace(/"#testimonials"/g, '"/about"')
          .replace(/"#booking"/g, '"/reservation"')
          .replace(/"#reservation"/g, '"/reservation"');
      }
    }

    if (isFooter || file.path.includes("site-footer")) {
      content = content.replace(
        /const\s+(?:FOOTER_LINKS|LINKS|links)\s*=\s*\[[^\]]*\]/,
        `const FOOTER_LINKS = ${footLit}`,
      );
      if (/#features|#services|#contact|#pricing|#gallery/.test(content)) {
        content = content
          .replace(/"#features"/g, '"/services"')
          .replace(/"#services"/g, '"/services"')
          .replace(/"#contact"/g, '"/contact"')
          .replace(/"#pricing"/g, '"/pricing"')
          .replace(/"#gallery"/g, '"/gallery"')
          .replace(/"#about"/g, '"/about"')
          .replace(/"#menu"/g, '"/menu"');
      }
    }

    if (file.path === "app/page.tsx" || file.path.endsWith("/app/page.tsx")) {
      content = content
        .replace(/href:\s*["']#menu["']/g, 'href: "/menu"')
        .replace(/href:\s*["']#inventory["']/g, 'href: "/inventory"')
        .replace(/href:\s*["']#product["']/g, 'href: "/inventory"')
        .replace(/href:\s*["']#listings["']/g, 'href: "/listings"')
        .replace(/href:\s*["']#contact["']/g, 'href: "/contact"')
        .replace(/href:\s*["']#about["']/g, 'href: "/about"')
        .replace(/href:\s*["']#services["']/g, 'href: "/services"')
        .replace(/href:\s*["']#gallery["']/g, 'href: "/gallery"')
        .replace(/href:\s*["']#pricing["']/g, 'href: "/pricing"')
        .replace(/href:\s*["']#reservation["']/g, 'href: "/reservation"')
        .replace(/href:\s*["']#booking["']/g, 'href: "/reservation"');
    }

    return content === file.content ? file : { ...file, content };
  });
}

/** Update production content nav links to real routes. */
export function structureNavToContentLinks(
  structure: SiteStructurePlan,
): Array<{ href: string; label: string }> {
  return structure.navLinks.map((l) => ({ ...l }));
}

export { linksLiteral };
