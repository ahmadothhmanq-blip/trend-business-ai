import { heroDefaults, premiumContainerWide } from "./shared.mjs";

/** @type {Record<string, (entry: import("../visual-skin-catalog-manifest.mjs").FlagshipSkinManifest[number]) => string>} */
const PREMIUM_HERO_GENERATORS = {
  "split-trust": splitTrustEditorial,
  "corporate-image": corporateImageEditorial,
  "fullbleed-overlay": fullbleedOverlayEditorial,
  "centered-clinical": centeredClinicalEditorial,
  "ocean-immersive": oceanImmersiveEditorial,
  "culinary-asymmetric": culinaryAsymmetricEditorial,
  "academy-crest": academyCrestEditorial,
  "commerce-editorial": commerceEditorialHero,
  "pipeline-flow": pipelineFlowEditorial,
  "portfolio-mega": portfolioMegaEditorial,
  "estate-search": estateSearchEditorial,
  "forest-frame": forestFrameEditorial,
  "aurora-orbit": auroraOrbitEditorial,
  "noir-terminal": noirTerminalEditorial,
  "fintech-terminal": fintechTerminalEditorial,
  "blueprint-grid": blueprintGridEditorial,
  "authority-triple": authorityTripleEditorial,
  "wellness-wave": wellnessWaveEditorial,
};

/**
 * @param {import("../visual-skin-catalog-manifest.mjs").FlagshipSkinManifest[number]} entry
 * @param {string} layoutKey
 */
export function generatePremiumHero(entry, layoutKey) {
  if (layoutKey === "glass-dashboard" || layoutKey === "kinetic-split") {
    throw new Error(`Hero layout "${layoutKey}" is handcrafted — skip regeneration for ${entry.skinId}`);
  }
  const fn = PREMIUM_HERO_GENERATORS[layoutKey];
  if (!fn) {
    throw new Error(`No premium hero generator for layout: ${layoutKey}`);
  }
  return fn(entry);
}

/**
 * @param {import("../visual-skin-catalog-manifest.mjs").FlagshipSkinManifest[number]} entry
 */
function splitTrustEditorial(entry) {
  const { packageId: pkg, pascal: Pascal, cssPrefix: p, hero: h } = entry;
  return `"use client";

const DEFAULT_TRUST_PILLARS = [
  { label: "Regulatory alignment", detail: "SEC, FCA, and cross-border compliance frameworks" },
  { label: "Fiduciary standard", detail: "Institutional-grade governance on every mandate" },
  { label: "Global coverage", detail: "Advisory desks across major financial centers" },
  { label: "Risk discipline", detail: "Scenario modeling and portfolio stress testing" },
];

const DEFAULT_CREDENTIALS = ["CFA", "CPA", "CIMA", "Series 65"];

${heroDefaults(Pascal, h)} {
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="relative overflow-hidden bg-[var(--color-background)]">
      <div className="pointer-events-none absolute inset-y-0 end-0 w-1/3 bg-[color-mix(in_srgb,var(--color-accent)_6%,transparent)]" aria-hidden />
      <div className="relative ${premiumContainerWide} py-20 sm:py-28">
        <div className="grid items-start gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6 motion-safe:animate-[fade-up_0.65s_ease_both]">
            <p className="${p}-eyebrow mb-5 text-[var(--color-accent)]">{eyebrow}</p>
            <h1 id="${p}-hero-title" className="${p}-font-display text-[clamp(2.5rem,4.5vw,3.75rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-[var(--color-foreground)] max-w-[12ch]">{title}</h1>
            <p className="${p}-font-body mt-7 max-w-xl text-lg leading-relaxed text-[var(--color-muted)]">{subtitle}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a href="#contact" className="${p}-btn-primary ${p}-focus-ring">{primaryCta}</a>
              <a href="#about" className="${p}-btn-secondary ${p}-focus-ring">{secondaryCta}</a>
            </div>
            <div className="mt-10 flex flex-wrap gap-2">
              {DEFAULT_CREDENTIALS.map((badge) => (
                <span key={badge} className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--color-surface)] px-3 py-1.5 ${p}-font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--color-muted)] transition-colors hover:border-[color-mix(in_srgb,var(--color-accent)_35%,transparent)]">{badge}</span>
              ))}
            </div>
          </div>
          <div className="lg:col-span-6 motion-safe:animate-[fade-up_0.7s_ease_0.1s_both]">
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--color-surface)] p-6 shadow-[0_24px_48px_-24px_color-mix(in_srgb,var(--color-primary)_25%,transparent)] transition-shadow duration-300 hover:shadow-[0_32px_64px_-24px_color-mix(in_srgb,var(--color-primary)_35%,transparent)] sm:p-8">
              <p className="${p}-font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-[var(--color-accent)]">Institutional trust</p>
              <ul className="mt-6 space-y-5">
                {DEFAULT_TRUST_PILLARS.map((pillar, index) => (
                  <li key={pillar.label} className="group border-b border-[var(--border-subtle)] pb-5 last:border-0 last:pb-0 transition-colors hover:border-[color-mix(in_srgb,var(--color-accent)_35%,transparent)]">
                    <div className="flex items-start gap-4">
                      <span className="${p}-font-mono mt-0.5 text-xs text-[var(--color-accent)]">{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <p className="${p}-font-display text-lg font-semibold text-[var(--color-foreground)]">{pillar.label}</p>
                        <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-muted)]">{pillar.detail}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
`;
}

function corporateImageEditorial(entry) {
  const { packageId: pkg, pascal: Pascal, cssPrefix: p, hero: h } = entry;
  return `"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

const DEFAULT_HIGHLIGHTS = ["Enterprise governance", "Global operations", "Stakeholder value", "Digital transformation"];

${heroDefaults(Pascal, h)} {
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="relative min-h-[min(92vh,52rem)] overflow-hidden bg-[var(--color-background)]">
      <div className="${p}-hero-atmosphere pointer-events-none absolute inset-0 opacity-50" aria-hidden />
      <div className="relative grid min-h-[min(92vh,52rem)] max-w-[88rem] items-center gap-16 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-12 lg:mx-auto">
        <div className="lg:col-span-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-accent)] bg-[color-mix(in_srgb,var(--color-surface)_90%,transparent)] px-3 py-1.5 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" aria-hidden />
            <span className="${p}-eyebrow !text-[0.6875rem]">{eyebrow}</span>
          </div>
          <h1 id="${p}-hero-title" className="${p}-headline mt-6 max-w-[11ch]">{title}</h1>
          <p className="${p}-body mt-8 max-w-xl text-lg leading-relaxed text-[var(--color-muted)]">{subtitle}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a href="#contact" className="${p}-btn-primary ${p}-focus-ring">{primaryCta}</a>
            <a href="#features" className="${p}-btn-secondary ${p}-focus-ring">{secondaryCta}</a>
          </div>
          <div className="mt-12 flex flex-wrap gap-2">
            {DEFAULT_HIGHLIGHTS.map((item) => (
              <span key={item} className="rounded-full border border-[var(--border-default)] px-4 py-2 text-sm text-[var(--color-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-foreground)]">{item}</span>
            ))}
          </div>
        </div>
        <div className="lg:col-span-6">
          <div className="${p}-hero-image-frame group relative aspect-[4/5] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] shadow-[0_32px_64px_-32px_color-mix(in_srgb,var(--color-primary)_30%,transparent)]">
            <SlotImage src={imageUrl} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[color-mix(in_srgb,var(--color-background)_60%,transparent)] to-transparent" aria-hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
`;
}

function fullbleedOverlayEditorial(entry) {
  const { packageId: pkg, pascal: Pascal, cssPrefix: p, hero: h } = entry;
  return `"use client";

const EDITORIAL_LINES = ["Landmark residences", "Private collections", "Global advisory", "Gallery presentation"];

${heroDefaults(Pascal, h)} {
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="relative flex min-h-[100svh] items-end overflow-hidden bg-[var(--color-primary)]">
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-[color-mix(in_srgb,var(--color-background)_45%,transparent)] to-transparent" aria-hidden />
      <div className="relative w-full px-5 pb-20 pt-32 sm:px-8 sm:pb-28">
        <div className="${premiumContainerWide}">
          <p className="${p}-eyebrow mb-5 text-[var(--color-accent)]">{eyebrow}</p>
          <h1 id="${p}-hero-title" className="${p}-display max-w-[14ch] text-[var(--color-foreground)]">{title}</h1>
          <p className="${p}-body mt-8 max-w-2xl text-lg text-[var(--color-muted)]">{subtitle}</p>
          <div className="mt-12 flex flex-wrap gap-4">
            <a href="#contact" className="${p}-btn-primary ${p}-focus-ring">{primaryCta}</a>
            <a href="#portfolio" className="${p}-btn-secondary ${p}-focus-ring">{secondaryCta}</a>
          </div>
          <div className="mt-16 flex flex-wrap gap-6 border-t border-[var(--border-subtle)] pt-10">
            {EDITORIAL_LINES.map((line, i) => (
              <span key={line} className="${p}-font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
                <span className="text-[var(--color-accent)]">{String(i + 1).padStart(2, "0")}</span> {line}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
`;
}

function centeredClinicalEditorial(entry) {
  const { packageId: pkg, pascal: Pascal, cssPrefix: p, hero: h } = entry;
  return `"use client";

const CERTIFICATIONS = ["Board certified", "HIPAA compliant", "Joint Commission", "Patient-first care"];

${heroDefaults(Pascal, h)} {
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="${p}-section relative overflow-hidden bg-[var(--color-background)] py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent opacity-40" aria-hidden />
      <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
        <p className="${p}-eyebrow mb-4">{eyebrow}</p>
        <div className="mx-auto mb-6 h-px w-12 bg-[var(--color-accent)]" aria-hidden />
        <h1 id="${p}-hero-title" className="${p}-headline">{title}</h1>
        <p className="${p}-body mx-auto mt-6 max-w-xl text-lg text-[var(--color-muted)]">{subtitle}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a href="#contact" className="${p}-btn-primary ${p}-focus-ring">{primaryCta}</a>
          <a href="#features" className="${p}-btn-secondary ${p}-focus-ring">{secondaryCta}</a>
        </div>
        <div className="mx-auto mt-14 flex max-w-2xl flex-wrap justify-center gap-3">
          {CERTIFICATIONS.map((cert) => (
            <span key={cert} className="rounded-full border border-[var(--border-default)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-muted)] transition-colors hover:border-[var(--color-accent)]">{cert}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

function oceanImmersiveEditorial(entry) {
  const { packageId: pkg, pascal: Pascal, cssPrefix: p, hero: h } = entry;
  return `"use client";

const AMENITY_WAVES = ["Oceanfront suites", "Private spa", "Chef's table", "Sunset terrace", "Concierge"];

${heroDefaults(Pascal, h)} {
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="relative flex min-h-[92svh] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-background)] text-center">
      <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(ellipse 80% 50% at 50% 0%, var(--color-accent), transparent)" }} aria-hidden />
      <div className="relative z-10 mx-auto max-w-4xl px-5 py-24 sm:px-8 sm:py-28">
        <p className="${p}-eyebrow mb-6">{eyebrow}</p>
        <h1 id="${p}-hero-title" className="${p}-display">{title}</h1>
        <p className="${p}-body mx-auto mt-8 max-w-2xl text-lg">{subtitle}</p>
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <a href="#contact" className="${p}-btn-primary ${p}-focus-ring">{primaryCta}</a>
          <a href="#features" className="${p}-btn-secondary ${p}-focus-ring">{secondaryCta}</a>
        </div>
        <div className="mt-16 flex flex-wrap justify-center gap-3">
          {AMENITY_WAVES.map((item) => (
            <span key={item} className="rounded-full border border-[var(--border-accent)] bg-[var(--color-surface)]/70 px-5 py-2.5 text-sm backdrop-blur transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-surface)]">{item}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

function culinaryAsymmetricEditorial(entry) {
  const { packageId: pkg, pascal: Pascal, cssPrefix: p, hero: h } = entry;
  return `"use client";

const MENU_HIGHLIGHTS = [
  { course: "Amuse", detail: "Foraged herbs & citrus" },
  { course: "Principal", detail: "Hearth-roasted seasonal catch" },
  { course: "Dessert", detail: "Dark chocolate & sea salt" },
  { course: "Pairing", detail: "Sommelier selection" },
];

${heroDefaults(Pascal, h)} {
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="${p}-section-glow overflow-hidden bg-[var(--color-background)]">
      <div className="mx-auto grid max-w-[88rem] lg:grid-cols-12">
        <div className="flex flex-col justify-center px-5 py-20 sm:px-8 sm:py-28 lg:col-span-5">
          <p className="${p}-eyebrow">{eyebrow}</p>
          <h1 id="${p}-hero-title" className="${p}-headline mt-6">{title}</h1>
          <p className="${p}-body mt-6 text-lg text-[var(--color-muted)]">{subtitle}</p>
          <div className="mt-10 flex gap-3">
            <a href="#contact" className="${p}-btn-primary ${p}-focus-ring">{primaryCta}</a>
            <a href="#features" className="${p}-btn-secondary ${p}-focus-ring">{secondaryCta}</a>
          </div>
        </div>
        <div className="relative lg:col-span-7">
          <div className="absolute inset-4 rounded-[2rem] border-2 border-[var(--color-accent)]/30 lg:inset-8" aria-hidden />
          <div className="relative m-8 min-h-[24rem] rounded-[1.5rem] border border-[var(--border-default)] bg-[var(--color-surface)] p-8 shadow-[0_24px_48px_-24px_color-mix(in_srgb,var(--color-primary)_25%,transparent)] lg:m-12 lg:min-h-[32rem] lg:p-10">
            <p className="${p}-font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-[var(--color-accent)]">Tonight's menu</p>
            <ul className="mt-8 space-y-6">
              {MENU_HIGHLIGHTS.map((item, i) => (
                <li key={item.course} className="group flex items-baseline justify-between border-b border-[var(--border-subtle)] pb-5 transition-colors hover:border-[color-mix(in_srgb,var(--color-accent)_35%,transparent)]">
                  <span className="${p}-font-mono text-xs text-[var(--color-accent)]">{String(i + 1).padStart(2, "0")}</span>
                  <span className="${p}-font-display flex-1 ps-4 text-lg font-semibold">{item.course}</span>
                  <span className="text-sm text-[var(--color-muted)]">{item.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
`;
}

function academyCrestEditorial(entry) {
  const { packageId: pkg, pascal: Pascal, cssPrefix: p, hero: h } = entry;
  return `"use client";

const HERITAGE_MARKERS = ["Founded 1846", "Global alumni network", "Research excellence", "Character education"];

${heroDefaults(Pascal, h)} {
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="${p}-section bg-[var(--color-background)] py-20 sm:py-28">
      <div className="${premiumContainerWide} text-center">
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--color-accent)] ${p}-font-display text-xl font-bold shadow-[0_0_0_8px_color-mix(in_srgb,var(--color-accent)_12%,transparent)]">§</div>
        <p className="${p}-eyebrow">{eyebrow}</p>
        <h1 id="${p}-hero-title" className="${p}-headline mx-auto mt-4 max-w-[16ch]">{title}</h1>
        <p className="${p}-body mx-auto mt-6 max-w-2xl text-lg text-[var(--color-muted)]">{subtitle}</p>
        <div className="mt-10 flex justify-center gap-3">
          <a href="#contact" className="${p}-btn-primary ${p}-focus-ring">{primaryCta}</a>
          <a href="#features" className="${p}-btn-secondary ${p}-focus-ring">{secondaryCta}</a>
        </div>
        <div className="mx-auto mt-16 grid max-w-3xl gap-4 sm:grid-cols-2">
          {HERITAGE_MARKERS.map((marker) => (
            <div key={marker} className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--color-surface)] px-6 py-4 text-sm font-medium transition-colors hover:border-[var(--color-accent)]">{marker}</div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

function commerceEditorialHero(entry) {
  const { packageId: pkg, pascal: Pascal, cssPrefix: p, hero: h } = entry;
  return `"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";

const BRAND_PILLARS = ["Artisan craft", "Limited editions", "White-glove delivery", "Global atelier"];

${heroDefaults(Pascal, h)} {
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="bg-[var(--color-background)]">
      <div className="mx-auto grid max-w-[88rem] lg:grid-cols-2">
        <div className="group relative min-h-[50vh] overflow-hidden lg:min-h-[85vh]">
          <SlotImage src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[var(--color-background)]/20" aria-hidden />
        </div>
        <div className="flex flex-col justify-center px-5 py-20 sm:px-12 sm:py-28">
          <p className="${p}-eyebrow">{eyebrow}</p>
          <h1 id="${p}-hero-title" className="${p}-headline mt-4">{title}</h1>
          <p className="${p}-body mt-6 text-lg text-[var(--color-muted)]">{subtitle}</p>
          <div className="mt-10 flex gap-3">
            <a href="#contact" className="${p}-btn-primary ${p}-focus-ring">{primaryCta}</a>
            <a href="#features" className="${p}-btn-secondary ${p}-focus-ring">{secondaryCta}</a>
          </div>
          <ul className="mt-12 space-y-4 border-t border-[var(--border-subtle)] pt-8">
            {BRAND_PILLARS.map((pillar, i) => (
              <li key={pillar} className="flex items-center gap-4 text-sm transition-colors hover:text-[var(--color-accent)]">
                <span className="${p}-font-mono text-[var(--color-accent)]">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-medium">{pillar}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
`;
}

function pipelineFlowEditorial(entry) {
  const { packageId: pkg, pascal: Pascal, cssPrefix: p, hero: h } = entry;
  return `"use client";

const PIPELINE_STEPS = [
  { step: "01", label: "Discover", detail: "Map revenue signals across accounts" },
  { step: "02", label: "Forecast", detail: "AI-weighted pipeline intelligence" },
  { step: "03", label: "Expand", detail: "Playbooks for net retention" },
  { step: "04", label: "Report", detail: "Board-ready GTM analytics" },
];

${heroDefaults(Pascal, h)} {
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="${p}-section relative overflow-hidden bg-[var(--color-background)] py-20 sm:py-28">
      <div className="${premiumContainerWide}">
        <div className="max-w-2xl">
          <p className="${p}-eyebrow">{eyebrow}</p>
          <h1 id="${p}-hero-title" className="${p}-headline mt-4">{title}</h1>
          <p className="${p}-body mt-6 text-lg text-[var(--color-muted)]">{subtitle}</p>
          <div className="mt-8 flex gap-3">
            <a href="#contact" className="${p}-btn-primary ${p}-focus-ring">{primaryCta}</a>
            <a href="#platform" className="${p}-btn-secondary ${p}-focus-ring">{secondaryCta}</a>
          </div>
        </div>
        <ol className="mt-16 flex flex-col gap-0 lg:flex-row lg:items-stretch">
          {PIPELINE_STEPS.map((s, i) => (
            <li key={s.label} className="group relative flex flex-1 flex-col border border-[var(--border-default)] bg-[var(--color-surface)] p-6 transition-colors hover:border-[color-mix(in_srgb,var(--color-accent)_35%,transparent)] lg:border-s-0 lg:first:rounded-s-xl lg:last:rounded-e-xl lg:[&:not(:last-child)]:border-e-0">
              <span className="${p}-font-mono text-xs text-[var(--color-accent)]">{s.step}</span>
              <span className="mt-3 text-lg font-semibold">{s.label}</span>
              <span className="mt-2 text-sm text-[var(--color-muted)]">{s.detail}</span>
              {i < PIPELINE_STEPS.length - 1 ? <span className="absolute -end-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 rounded-full bg-[var(--color-accent)] lg:block" aria-hidden /> : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
`;
}

function portfolioMegaEditorial(entry) {
  const { packageId: pkg, pascal: Pascal, cssPrefix: p, hero: h } = entry;
  return `"use client";

const DEFAULT_WORK_TAGS = ["Brand systems", "Product design", "Campaign", "Motion", "Digital platforms"];

${heroDefaults(Pascal, h)} {
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="flex min-h-[100svh] flex-col justify-between bg-[var(--color-background)] px-5 py-12 sm:px-8 sm:py-16">
      <p className="${p}-eyebrow ${p}-font-mono text-[0.6875rem] tracking-[0.25em]">{eyebrow}</p>
      <div>
        <h1 id="${p}-hero-title" className="${p}-font-display text-[clamp(2.5rem,12vw,8rem)] font-semibold leading-[0.9] tracking-[-0.03em] text-[var(--color-foreground)]">{title}</h1>
        <p className="${p}-font-body mt-8 max-w-xl text-lg text-[var(--color-muted)]">{subtitle}</p>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-8 border-t border-[var(--border-subtle)] pt-8">
        <div className="flex flex-wrap gap-3">
          <a href="#contact" className="${p}-btn-primary ${p}-focus-ring">{primaryCta}</a>
          <a href="#portfolio" className="${p}-btn-secondary ${p}-focus-ring">{secondaryCta}</a>
        </div>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_WORK_TAGS.map((tag) => (
            <span key={tag} className="rounded-full border border-[var(--border-default)] px-4 py-2 text-sm text-[var(--color-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-foreground)]">{tag}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

function estateSearchEditorial(entry) {
  const { packageId: pkg, pascal: Pascal, cssPrefix: p, hero: h } = entry;
  return `"use client";

const FEATURED_LOCATIONS = ["Waterfront", "Vineyard estate", "Urban penthouse", "Historic landmark"];

${heroDefaults(Pascal, h)} {
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="${p}-section bg-[var(--color-background)] py-20 sm:py-28">
      <div className="${premiumContainerWide}">
        <p className="${p}-eyebrow">{eyebrow}</p>
        <h1 id="${p}-hero-title" className="${p}-headline mt-4 max-w-[14ch]">{title}</h1>
        <p className="${p}-body mt-6 max-w-2xl text-lg text-[var(--color-muted)]">{subtitle}</p>
        <form className="mt-10 flex flex-col gap-3 rounded-2xl border border-[var(--border-default)] bg-[var(--color-surface)] p-4 shadow-[0_16px_32px_-16px_color-mix(in_srgb,var(--color-primary)_20%,transparent)] transition-shadow hover:shadow-[0_24px_48px_-20px_color-mix(in_srgb,var(--color-primary)_28%,transparent)] sm:flex-row sm:items-center" onSubmit={(e) => e.preventDefault()}>
          <input type="search" placeholder="Location, neighborhood, or ZIP" className="flex-1 bg-transparent px-3 py-2 text-sm outline-none" aria-label="Search properties" />
          <button type="submit" className="${p}-btn-primary ${p}-focus-ring shrink-0">{primaryCta}</button>
        </form>
        <div className="mt-12 flex flex-wrap gap-3">
          {FEATURED_LOCATIONS.map((loc) => (
            <button key={loc} type="button" className="rounded-full border border-[var(--border-default)] px-5 py-2.5 text-sm transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]">{loc}</button>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

function forestFrameEditorial(entry) {
  const { packageId: pkg, pascal: Pascal, cssPrefix: p, hero: h } = entry;
  return `"use client";

const NATURE_HIGHLIGHTS = ["Forest-to-table", "Biodynamic wine", "Hearth cooking", "Seasonal foraging"];

${heroDefaults(Pascal, h)} {
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="${p}-section-glow bg-[var(--color-background)] p-6 sm:p-10">
      <div className="mx-auto max-w-[88rem] rounded-[2.5rem] border-4 border-[color-mix(in_srgb,var(--color-accent)_35%,transparent)] bg-[var(--color-surface)] p-8 sm:p-12 lg:p-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="${p}-eyebrow">{eyebrow}</p>
            <h1 id="${p}-hero-title" className="${p}-headline mt-4">{title}</h1>
            <p className="${p}-body mt-6 text-lg text-[var(--color-muted)]">{subtitle}</p>
            <div className="mt-8 flex gap-3">
              <a href="#contact" className="${p}-btn-primary ${p}-focus-ring">{primaryCta}</a>
              <a href="#features" className="${p}-btn-secondary ${p}-focus-ring">{secondaryCta}</a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {NATURE_HIGHLIGHTS.map((item) => (
              <div key={item} className="group rounded-2xl border border-[var(--border-default)] bg-[var(--color-background)] p-5 text-center transition-all hover:border-[color-mix(in_srgb,var(--color-accent)_35%,transparent)] hover:shadow-lg">
                <p className="text-sm font-semibold">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
`;
}

function auroraOrbitEditorial(entry) {
  const { packageId: pkg, pascal: Pascal, cssPrefix: p, hero: h } = entry;
  return `"use client";

const ORBIT_FEATURES = ["Design systems", "Rapid prototyping", "Launch ops", "Scale engineering"];

${heroDefaults(Pascal, h)} {
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="relative flex min-h-[90svh] items-center overflow-hidden bg-[var(--color-background)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,var(--color-accent),transparent_50%),radial-gradient(circle_at_70%_80%,var(--color-primary),transparent_50%)] opacity-40 motion-safe:animate-pulse" aria-hidden />
      <div className="relative mx-auto grid max-w-[88rem] place-items-center px-5 py-20 text-center sm:px-8 sm:py-28">
        <div className="relative z-10 max-w-2xl">
          <p className="${p}-eyebrow">{eyebrow}</p>
          <h1 id="${p}-hero-title" className="${p}-headline mt-4">{title}</h1>
          <p className="${p}-body mt-6 text-lg text-[var(--color-muted)]">{subtitle}</p>
          <div className="mt-8 flex justify-center gap-3">
            <a href="#contact" className="${p}-btn-primary ${p}-focus-ring">{primaryCta}</a>
            <a href="#features" className="${p}-btn-secondary ${p}-focus-ring">{secondaryCta}</a>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {ORBIT_FEATURES.map((feat, i) => (
            <div key={feat} className="${p}-glass-card absolute rounded-xl border border-[var(--border-accent)] bg-[color-mix(in_srgb,var(--color-surface)_80%,transparent)] px-4 py-3 text-sm backdrop-blur-md" style={{ transform: \`rotate(\${i * 90}deg) translateY(-9rem) rotate(-\${i * 90}deg)\` }}>
              <p className="font-semibold text-[var(--color-accent)]">{feat}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

function noirTerminalEditorial(entry) {
  const { packageId: pkg, pascal: Pascal, cssPrefix: p, hero: h } = entry;
  return `"use client";

const TERMINAL_LINES = [
  "loading collection...",
  "atelier.status: active",
  "craft.heritage: preserved",
  "viewing.private: available",
];

${heroDefaults(Pascal, h)} {
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="min-h-[88svh] bg-[var(--color-background)] px-5 py-20 font-mono sm:px-8 sm:py-28">
      <div className="mx-auto max-w-3xl border border-[var(--border-default)] shadow-[0_24px_48px_-24px_rgba(0,0,0,0.5)]">
        <div className="border-b border-[var(--border-default)] px-4 py-2 text-xs text-[var(--color-muted)]">~/maison — zsh</div>
        <div className="space-y-4 p-6 sm:p-10">
          <p className="text-[var(--color-accent)]">&gt; {eyebrow}</p>
          <h1 id="${p}-hero-title" className="${p}-headline !font-mono text-3xl sm:text-4xl">{title}</h1>
          <p className="text-sm leading-relaxed text-[var(--color-muted)]">{subtitle}</p>
          <div className="flex flex-wrap gap-3 pt-4">
            <a href="#contact" className="${p}-btn-primary ${p}-focus-ring">{primaryCta}</a>
            <a href="#features" className="${p}-btn-secondary ${p}-focus-ring">{secondaryCta}</a>
          </div>
          <div className="mt-8 space-y-2 rounded border border-[var(--border-subtle)] bg-[var(--color-surface)] p-4 text-xs">
            {TERMINAL_LINES.map((line) => (
              <p key={line} className="text-[var(--color-muted)]"><span className="text-[var(--color-accent)]">$</span> {line}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
`;
}

function fintechTerminalEditorial(entry) {
  const { packageId: pkg, pascal: Pascal, cssPrefix: p, hero: h } = entry;
  return `"use client";

const COMPLIANCE_LINES = [
  "SOC 2 Type II · audit-ready infrastructure",
  "PCI DSS Level 1 · payment-grade security",
  "Multi-jurisdiction regulatory mapping",
  "Real-time fraud monitoring and alerting",
];

const CHART_BARS = [42, 58, 48, 72, 64, 88, 76, 94];

${heroDefaults(Pascal, h)} {
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="bg-[var(--color-background)] py-20 sm:py-28">
      <div className="${premiumContainerWide}">
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--color-surface)] p-1 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.4)]">
          <div className="flex gap-1.5 border-b border-[var(--border-subtle)] px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" aria-hidden />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" aria-hidden />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" aria-hidden />
          </div>
          <div className="grid gap-8 p-6 font-mono text-sm sm:p-10 lg:grid-cols-2">
            <div>
              <p className="text-[var(--color-accent)]">&gt; {eyebrow}</p>
              <h1 id="${p}-hero-title" className="${p}-font-display mt-4 text-2xl font-bold text-[var(--color-foreground)] sm:text-4xl">{title}</h1>
              <p className="mt-4 max-w-xl leading-relaxed text-[var(--color-muted)]">{subtitle}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#contact" className="${p}-btn-primary ${p}-focus-ring">{primaryCta}</a>
                <a href="#features" className="${p}-btn-secondary ${p}-focus-ring">{secondaryCta}</a>
              </div>
              <ul className="mt-8 space-y-2 border-t border-[var(--border-subtle)] pt-6">
                {COMPLIANCE_LINES.map((line) => (
                  <li key={line} className="flex items-center gap-2 text-[var(--color-muted)]">
                    <span className="text-[var(--color-accent)]" aria-hidden>$</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--color-background)_60%,transparent)] p-5">
              <p className="text-[0.6875rem] uppercase tracking-wider text-[var(--color-muted)]">Transaction volume — live</p>
              <div className="mt-5 flex h-28 items-end gap-1.5" aria-hidden>
                {CHART_BARS.map((height, index) => (
                  <div key={index} className="flex-1 origin-bottom rounded-t bg-[var(--color-accent)] opacity-80 transition-all hover:opacity-100" style={{ height: \`\${height}%\` }} />
                ))}
              </div>
              <p className="mt-4 text-xs text-[var(--color-accent)]">● All systems operational</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
`;
}

function blueprintGridEditorial(entry) {
  const { packageId: pkg, pascal: Pascal, cssPrefix: p, hero: h } = entry;
  return `"use client";

const SPEC_ANNOTATIONS = [
  { ref: "A-01", label: "Supply chain module" },
  { ref: "B-02", label: "Asset telemetry" },
  { ref: "C-03", label: "Field dispatch" },
  { ref: "D-04", label: "Compliance layer" },
];

${heroDefaults(Pascal, h)} {
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="relative bg-[var(--color-background)]" style={{ backgroundImage: "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
      <div className="${premiumContainerWide} py-20 sm:py-28">
        <div className="border-2 border-dashed border-[var(--color-accent)] p-8 transition-colors hover:border-[color-mix(in_srgb,var(--color-accent)_70%,transparent)] lg:p-12">
          <span className="${p}-font-mono text-xs text-[var(--color-accent)]">FIG. 01 — HERO ASSEMBLY</span>
          <p className="${p}-eyebrow mt-4">{eyebrow}</p>
          <h1 id="${p}-hero-title" className="${p}-headline mt-2 max-w-[14ch]">{title}</h1>
          <p className="${p}-body mt-6 max-w-xl text-lg text-[var(--color-muted)]">{subtitle}</p>
          <div className="mt-8 flex gap-3">
            <a href="#contact" className="${p}-btn-primary ${p}-focus-ring">{primaryCta}</a>
            <a href="#features" className="${p}-btn-secondary ${p}-focus-ring">{secondaryCta}</a>
          </div>
          <ul className="mt-12 grid gap-3 border-t border-dashed border-[var(--border-default)] pt-8 sm:grid-cols-2">
            {SPEC_ANNOTATIONS.map((spec) => (
              <li key={spec.ref} className="flex items-center gap-4 border border-[var(--border-default)] p-3 transition-colors hover:border-[var(--color-accent)]">
                <span className="${p}-font-mono text-xs text-[var(--color-accent)]">{spec.ref}</span>
                <span className="text-sm font-medium">{spec.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
`;
}

function authorityTripleEditorial(entry) {
  const { packageId: pkg, pascal: Pascal, cssPrefix: p, hero: h } = entry;
  return `"use client";

const PRACTICE_AREAS = [
  { title: "Litigation", detail: "High-stakes disputes across jurisdictions" },
  { title: "Regulatory", detail: "Policy navigation and compliance strategy" },
  { title: "Corporate", detail: "M&A, governance, and capital markets" },
];

${heroDefaults(Pascal, h)} {
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="${p}-section bg-[var(--color-background)] py-20 sm:py-28">
      <div className="${premiumContainerWide} text-center">
        <p className="${p}-eyebrow">{eyebrow}</p>
        <h1 id="${p}-hero-title" className="${p}-headline mx-auto mt-4 max-w-[16ch]">{title}</h1>
        <p className="${p}-body mx-auto mt-6 max-w-2xl text-lg text-[var(--color-muted)]">{subtitle}</p>
        <div className="mt-10 flex justify-center gap-3">
          <a href="#contact" className="${p}-btn-primary ${p}-focus-ring">{primaryCta}</a>
          <a href="#features" className="${p}-btn-secondary ${p}-focus-ring">{secondaryCta}</a>
        </div>
        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {PRACTICE_AREAS.map((area) => (
            <div key={area.title} className="group border-t-4 border-[var(--color-accent)] bg-[var(--color-surface)] px-6 py-10 text-start transition-shadow hover:shadow-[0_24px_48px_-24px_color-mix(in_srgb,var(--color-primary)_25%,transparent)]">
              <p className="text-xl font-semibold">{area.title}</p>
              <p className="mt-3 text-sm text-[var(--color-muted)]">{area.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}

function wellnessWaveEditorial(entry) {
  const { packageId: pkg, pascal: Pascal, cssPrefix: p, hero: h } = entry;
  return `"use client";

const RITUAL_HIGHLIGHTS = ["Clinical aesthetics", "Movement therapy", "Nutrition", "Mind-body"];

${heroDefaults(Pascal, h)} {
  return (
    <section id="top" data-v2-component="${pkg}-hero" aria-labelledby="${p}-hero-title" className="relative overflow-hidden bg-[var(--color-background)] py-20 sm:py-28">
      <div className="absolute -top-24 start-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[color-mix(in_srgb,var(--color-accent)_15%,transparent)] blur-3xl" aria-hidden />
      <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
        <p className="${p}-eyebrow">{eyebrow}</p>
        <h1 id="${p}-hero-title" className="${p}-headline mt-4">{title}</h1>
        <p className="${p}-body mx-auto mt-6 max-w-xl text-lg text-[var(--color-muted)]">{subtitle}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a href="#contact" className="${p}-btn-primary ${p}-focus-ring">{primaryCta}</a>
          <a href="#features" className="${p}-btn-secondary ${p}-focus-ring">{secondaryCta}</a>
        </div>
        <div className="mx-auto mt-16 flex flex-wrap justify-center gap-4">
          {RITUAL_HIGHLIGHTS.map((ritual) => (
            <div key={ritual} className="rounded-full border border-[var(--border-default)] bg-[var(--color-surface)] px-6 py-4 shadow-sm transition-all hover:border-[var(--color-accent)] hover:shadow-md">
              <p className="text-sm font-medium">{ritual}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
}
