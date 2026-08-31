import {
  getSkinContent,
  premiumCardClasses,
  premiumSectionPadding,
} from "./shared.mjs";

/** Sector-appropriate nav anchor links (hash-based for single-page templates). */
/** @type {Record<string, Array<{ href: string; label: string }>>} */
const SECTOR_NAV_LINKS = {
  saas: [
    { href: "#features", label: "Platform" },
    { href: "#integrations", label: "Integrations" },
    { href: "#pricing", label: "Pricing" },
    { href: "#contact", label: "Contact" },
  ],
  finance: [
    { href: "#features", label: "Services" },
    { href: "#about", label: "Our approach" },
    { href: "#contact", label: "Advisors" },
  ],
  "creative-studio": [
    { href: "#portfolio", label: "Work" },
    { href: "#features", label: "Capabilities" },
    { href: "#contact", label: "Start a project" },
  ],
  "law-firm": [
    { href: "#features", label: "Practice areas" },
    { href: "#about", label: "The firm" },
    { href: "#portfolio", label: "Matters" },
    { href: "#contact", label: "Contact" },
  ],
  "real-estate": [
    { href: "#portfolio", label: "Properties" },
    { href: "#about", label: "Advisory" },
    { href: "#contact", label: "Inquire" },
  ],
  healthcare: [
    { href: "#features", label: "Specialties" },
    { href: "#about", label: "Our care" },
    { href: "#contact", label: "Book visit" },
  ],
  hospitality: [
    { href: "#features", label: "Experiences" },
    { href: "#about", label: "The resort" },
    { href: "#contact", label: "Reserve" },
  ],
  restaurant: [
    { href: "#features", label: "Menu" },
    { href: "#about", label: "Chef" },
    { href: "#contact", label: "Reserve" },
  ],
  education: [
    { href: "#features", label: "Programs" },
    { href: "#about", label: "Campus" },
    { href: "#contact", label: "Admissions" },
  ],
  logistics: [
    { href: "#features", label: "Capabilities" },
    { href: "#portfolio", label: "Case studies" },
    { href: "#contact", label: "Contact" },
  ],
  medical: [
    { href: "#features", label: "Treatments" },
    { href: "#about", label: "Philosophy" },
    { href: "#contact", label: "Book ritual" },
  ],
};

/**
 * @param {import("../visual-skin-catalog-manifest.mjs").FlagshipSkinManifest[number]} entry
 */
function resolveBrandNav(entry) {
  const content = getSkinContent(entry.skinId);
  const links = SECTOR_NAV_LINKS[content.sectorDnaId] ?? SECTOR_NAV_LINKS.saas;
  return { brandName: content.brandName, links, ctaLabel: entry.hero.primaryCta };
}

/** @type {Record<string, string>} */
const PART_DEFAULT_CONST = {
  features: "DEFAULT_FEATURES",
  testimonials: "DEFAULT_TESTIMONIALS",
  stats: "DEFAULT_STATS",
};

/** @type {Record<string, string>} */
const PART_CONTENT_KEY = {
  features: "features",
  testimonials: "testimonials",
  stats: "stats",
};

/**
 * @param {string} code
 * @param {import("../visual-skin-catalog-manifest.mjs").FlagshipSkinManifest[number]} entry
 * @param {string} [part]
 */
export function premiumizeComponent(code, entry, part) {
  let result = code;
  const p = entry.cssPrefix;

  result = result
    .replace(/("use client";\s*)+/g, '"use client";\n\n')
    .replace(/\bpy-12\b/g, premiumSectionPadding)
    .replace(/\bpy-14\b/g, premiumSectionPadding)
    .replace(/\bpy-16\b/g, premiumSectionPadding)
    .replace(/\bpy-20\b(?! sm:py-28)/g, premiumSectionPadding)
    .replace(/\blg:py-24\b/g, "lg:py-32")
    .replace(/\blg:py-28\b/g, "lg:py-32");

  const cardPremium = premiumCardClasses(p);
  result = result.replace(/\$\{p\}-card/g, cardPremium.replace(/\$\{p\}/g, "${p}"));

  if (part && PART_DEFAULT_CONST[part] && PART_CONTENT_KEY[part]) {
    const content = getSkinContent(entry.skinId);
    const items = content[PART_CONTENT_KEY[part]];
    if (items) {
      const constName = PART_DEFAULT_CONST[part];
      const regex = new RegExp(`const ${constName} = \\[[\\s\\S]*?\\];`, "m");
      result = result.replace(regex, `const ${constName} = ${JSON.stringify(items, null, 2)};`);
    }
  }

  if (part === "features") {
    const content = getSkinContent(entry.skinId);
    if (content.featuresEyebrow) {
      result = result.replace(
        /eyebrow = "Platform capabilities"/g,
        `eyebrow = ${JSON.stringify(content.featuresEyebrow)}`,
      );
      result = result.replace(
        /eyebrow = "Practice areas"/g,
        `eyebrow = ${JSON.stringify(content.featuresEyebrow)}`,
      );
    }
    if (content.featuresTitle) {
      result = result.replace(
        /title = "Built for modern teams"/g,
        `title = ${JSON.stringify(content.featuresTitle)}`,
      );
      result = result.replace(
        /title = "Built for modern product teams"/g,
        `title = ${JSON.stringify(content.featuresTitle)}`,
      );
      result = result.replace(
        /title = "Depth across disciplines that matter"/g,
        `title = ${JSON.stringify(content.featuresTitle)}`,
      );
    }
    if (content.featuresSubtitle) {
      result = result.replace(
        /subtitle = "Capabilities designed for clarity, scale, and measurable impact\."/g,
        `subtitle = ${JSON.stringify(content.featuresSubtitle)}`,
      );
      result = result.replace(
        /subtitle = "Cross-border litigation, regulatory strategy, and corporate advisory for global organizations\."/g,
        `subtitle = ${JSON.stringify(content.featuresSubtitle)}`,
      );
    }

    if (!result.includes(`${p}-eyebrow mb-3`)) {
      const headerBlock = `<header className="mb-10 max-w-2xl">
          <p className="${p}-eyebrow mb-3">{eyebrow}</p>
          <h2 id="${p}-features-title" className="${p}-headline-sm">{title}</h2>
          <p className="${p}-body mt-5 text-[var(--color-muted)]">{subtitle}</p>
        </header>`;
      result = result.replace(
        /<h2 className="[^"]+-headline-sm">\{title\}<\/h2>\s*\n\s*<p className="[^"]+-body mt-4[^"]*">\{subtitle\}<\/p>/,
        headerBlock,
      );
      if (!result.includes("aria-labelledby")) {
        result = result.replace(
          /(<section id="features" data-v2-component="[^"]+-features")/,
          `$1 aria-labelledby="${p}-features-title"`,
        );
      }
    }

    result = result.replace(
      /className="flex gap-6 py-8 first:pt-0"/g,
      'className="group -mx-2 flex gap-6 rounded-xl px-2 py-8 transition-colors first:pt-0 hover:bg-[color-mix(in_srgb,var(--color-accent)_5%,transparent)]"',
    );
  }

  if (part === "testimonials" && !result.includes(`${p}-eyebrow mb-3`)) {
    const headerBlock = `<header className="mb-10 max-w-2xl">
          <p className="${p}-eyebrow mb-3">Client voices</p>
          <h2 className="${p}-headline-sm">Trusted by leaders worldwide</h2>
        </header>`;
    result = result.replace(
      /(<div className="mx-auto max-w-\[82rem\][^>]*>)\s*\n\s*<blockquote/,
      `$1\n        ${headerBlock}\n        <blockquote`,
    );
  }

  if (part === "nav" || part === "footer") {
    const { brandName, links, ctaLabel } = resolveBrandNav(entry);
    result = result.replace(/brandName = "Your Company"/g, `brandName = ${JSON.stringify(brandName)}`);
  }

  if (part === "nav") {
    const { links, ctaLabel } = resolveBrandNav(entry);
    const linksJson = JSON.stringify(links, null, 2);
    result = result.replace(/const (?:DEFAULT_)?LINKS = \[[\s\S]*?\];/, `const DEFAULT_LINKS = ${linksJson};`);
    result = result.replace(/ctaLabel = "Get started"/g, `ctaLabel = ${JSON.stringify(ctaLabel)}`);
    result = result.replace(/ctaLabel = "Get Started"/g, `ctaLabel = ${JSON.stringify(ctaLabel)}`);
  }

  if (part === "footer") {
    const { brandName, links } = resolveBrandNav(entry);
    const footerLinks = [...links, { href: "/privacy", label: "Privacy" }, { href: "/terms", label: "Terms" }];
    result = result.replace(/const (?:DEFAULT_)?LINKS = \[[\s\S]*?\];/, `const DEFAULT_LINKS = ${JSON.stringify(footerLinks, null, 2)};`);
  }

  if (part === "stats") {
    const content = getSkinContent(entry.skinId);
    if (content.stats?.length) {
      result = result.replace(
        /const STATS = \[[\s\S]*?\];/,
        `const STATS = ${JSON.stringify(content.stats, null, 2)};`,
      );
    }
  }

  if (part === "testimonials") {
    const content = getSkinContent(entry.skinId);
    if (content.testimonials?.length) {
      result = result.replace(
        /const (QUOTES|TESTIMONIALS|ITEMS) = \[[\s\S]*?\];/,
        (match, name) => `const ${name} = ${JSON.stringify(content.testimonials, null, 2)};`,
      );
    }
  }

  return result;
}

/**
 * @param {Record<string, Function>} generators
 * @param {string} fallbackKey
 * @param {string} [contentPart]
 */
export function createPremiumGenerator(generators, fallbackKey, contentPart) {
  /**
   * @param {import("../visual-skin-catalog-manifest.mjs").FlagshipSkinManifest[number]} entry
   * @param {string} layoutKey
   */
  return function generatePremium(entry, layoutKey) {
    const fn = generators[layoutKey] ?? generators[fallbackKey];
    const raw = fn({ p: entry.cssPrefix, pkg: entry.packageId, Pascal: entry.pascal });
    return premiumizeComponent(raw, entry, contentPart);
  };
}
