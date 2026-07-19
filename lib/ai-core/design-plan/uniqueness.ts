/**
 * Deterministic uniqueness — same brand/prompt → stable identity;
 * different brands → distinct hero/section compositions (not generic clones).
 * Uniqueness only picks within industry-allowed pools from Layout Selection Engine.
 */

const HERO_TREATMENTS = [
  "cinematic-hero",
  "full-image-hero",
  "split-hero",
  "product-showcase-hero",
  "interactive-hero",
  "full-bleed-cinematic",
  "editorial-split",
  "asymmetric-studio",
  "product-frame-cinematic",
  "flagship-manifesto",
  "immersive-overlay",
  "image-led-appetite",
  "luxury-vehicle-stage",
  "trust-split",
  "split-product",
] as const;

const SECTION_LAYOUTS = [
  "premium-storytelling",
  "interactive-product-story",
  "showroom-experience",
  "editorial-asymmetric",
  "bento-capabilities",
  "story-then-proof",
  "portfolio-mosaic",
  "commerce-feature-grid",
  "trust-then-offer",
  "showroom-grid",
  "destination-mosaic",
  "symmetric-metrics",
] as const;

const IDENTITY_ADJECTIVES = [
  "Signature",
  "Atelier",
  "Flagship",
  "Aether",
  "Lumen",
  "Vertex",
  "Noir",
  "Crest",
  "Prism",
  "Harbor",
];

export function hashSeed(parts: Array<string | undefined | null>): number {
  const raw = parts.filter(Boolean).join("|").toLowerCase();
  let h = 2166136261;
  for (let i = 0; i < raw.length; i += 1) {
    h ^= raw.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function pickUniqueHeroTreatment(
  seed: number,
  allowed?: string[] | null,
): string {
  const pool =
    allowed && allowed.length > 0 ? allowed : [...HERO_TREATMENTS];
  return pool[seed % pool.length]!;
}

export function pickUniqueSectionLayout(
  seed: number,
  allowed?: string[] | null,
): string {
  const pool =
    allowed && allowed.length > 0 ? allowed : [...SECTION_LAYOUTS];
  return pool[(seed >> 3) % pool.length]!;
}

export function buildVisualIdentityLabel(params: {
  brandName: string;
  premiumStyleId: string;
  seed: number;
}): string {
  const adj = IDENTITY_ADJECTIVES[params.seed % IDENTITY_ADJECTIVES.length]!;
  const brand = params.brandName.trim() || "Brand";
  return `${brand} · ${adj} ${params.premiumStyleId} identity`;
}

/**
 * Stable reorder of middle sections so sites don't all share the same template spine.
 * Hero stays first; CTA/contact stay toward the end.
 */
export function uniquifySectionOrder<T extends { kindHint: string; label: string }>(
  sections: T[],
  seed: number,
): T[] {
  if (sections.length <= 3) return sections;
  const hero = sections.filter((s) => /hero/i.test(s.kindHint) || /hero/i.test(s.label));
  const closing = sections.filter((s) =>
    /cta|contact|book|reserv|inquiry|map/i.test(`${s.kindHint} ${s.label}`),
  );
  const middle = sections.filter(
    (s) => !hero.includes(s) && !closing.includes(s),
  );

  const rotated = [...middle];
  if (rotated.length > 1) {
    const offset = seed % rotated.length;
    const head = rotated.splice(0, offset);
    rotated.push(...head);
  }

  // Occasional swap of first two middle bands for extra variety
  if (rotated.length >= 2 && seed % 2 === 1) {
    [rotated[0], rotated[1]] = [rotated[1]!, rotated[0]!];
  }

  return [...hero, ...rotated, ...closing];
}
