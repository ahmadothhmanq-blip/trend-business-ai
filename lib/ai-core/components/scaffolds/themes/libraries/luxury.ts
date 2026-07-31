/**
 * Luxury theme scaffolds — premium editorial real-estate identity.
 * Gold restraint, asymmetric layouts, serif display, ghost CTAs, mosaic gallery.
 */

export const LUXURY_SCAFFOLDS: Record<string, string> = {
  ThemeLuxuryNav: `"use client";

const DEFAULT_LINKS = [
  { href: "#residences", label: "Residences" },
  { href: "#gallery", label: "Gallery" },
  { href: "#story", label: "Heritage" },
  { href: "#contact", label: "Contact" },
];

type ThemeLuxuryNavProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
};

export function ThemeLuxuryNav({
  brandName = "Halcyon Estates",
  ctaLabel = "Private viewing",
  links = DEFAULT_LINKS,
}: ThemeLuxuryNavProps) {
  return (
    <header data-theme-scaffold="nav" className="sticky top-0 z-50 border-b border-[var(--color-foreground)]/[0.08] bg-[var(--color-background)]/80 shadow-[0_4px_24px_rgba(0,0,0,0.04)] backdrop-blur-2xl backdrop-saturate-[1.6]">
      <div className="mx-auto flex max-w-[80rem] flex-col gap-6 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-10 sm:px-10 lg:px-14 lg:py-6">
        <a
          href="/"
          className="group inline-flex items-center gap-4 border-l-[2px] border-[var(--color-primary)] pl-5 transition-opacity duration-500 hover:opacity-80"
        >
          <span className="font-[family-name:var(--font-display,var(--font-heading,inherit))] text-[11px] font-medium uppercase tracking-[0.38em] text-[var(--color-foreground)]">
            {brandName}
          </span>
        </a>
        <nav className="flex flex-wrap items-center gap-x-10 gap-y-3 lg:gap-x-14">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[10px] font-normal uppercase tracking-[0.28em] text-[var(--color-foreground)]/45 transition-colors duration-300 hover:text-[var(--color-foreground)]"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <a
          href="#contact"
          className="inline-flex shrink-0 items-center justify-center border border-[var(--color-primary)]/70 bg-[var(--color-background)]/40 px-8 py-3 text-[10px] font-medium uppercase tracking-[0.32em] text-[var(--color-foreground)] backdrop-blur-sm transition-all duration-500 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/[0.08] hover:shadow-[0_8px_32px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]"
        >
          {ctaLabel}
        </a>
      </div>
    </header>
  );
}
`,

  ThemeLuxuryHero: `"use client";

import { HERO_IMAGE, resolveSiteImage, GALLERY_IMAGES, SECTION_IMAGES } from "@/lib/site-images";

type ThemeLuxuryHeroProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
  layoutMode?: string;
};

export function ThemeLuxuryHero({
  title = "Residences defined by light, lineage, and location",
  subtitle = "An editorial collection of architecturally significant homes — curated for discerning buyers who value permanence over trend.",
  eyebrow = "Est. 1924 · Private brokerage",
  primaryCta = "View collection",
  secondaryCta = "Request dossier",
  imageUrl,
  layoutMode = "split",
}: ThemeLuxuryHeroProps) {
  const src = resolveSiteImage(imageUrl || HERO_IMAGE || GALLERY_IMAGES[0] || SECTION_IMAGES[0], 0);
  const cinematic = layoutMode === "cinematic" || layoutMode === "editorial";
  const dark = layoutMode === "dark-authority";

  if (cinematic) {
    return (
      <section data-theme-scaffold="hero" className="relative min-h-[100svh] overflow-hidden bg-[var(--color-background)]">
        {src ? (
          <img src={src} alt={title} className="absolute inset-0 h-full w-full object-cover object-center scale-105" />
        ) : (
          <div className="absolute inset-0 bg-[var(--color-surface)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)]/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-background)]/80 via-transparent to-transparent" />
        <div className="relative mx-auto flex min-h-[100svh] max-w-[80rem] flex-col justify-end px-6 pb-16 pt-32 sm:px-10 sm:pb-24 lg:px-14 lg:pb-28">
          <p className="mb-6 text-[10px] font-medium uppercase tracking-[0.4em] text-[var(--color-foreground)]/50">{eyebrow}</p>
          <h1 className="max-w-[16ch] font-[family-name:var(--font-display,var(--font-heading,inherit))] text-[clamp(2.75rem,6.5vw,5.25rem)] font-normal leading-[1.02] tracking-[-0.03em] text-[var(--color-foreground)]">
            {title}
          </h1>
          <p className="mt-8 max-w-xl text-base leading-[1.9] text-[var(--color-foreground)]/65 sm:text-lg">{subtitle}</p>
          <div className="mt-12 flex flex-wrap items-center gap-5">
            <a href="#gallery" className="inline-flex items-center border border-[var(--color-foreground)]/30 bg-[var(--color-background)]/40 px-9 py-4 text-[10px] font-medium uppercase tracking-[0.32em] text-[var(--color-foreground)] backdrop-blur-md transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/10">
              {primaryCta}
            </a>
            <a href="#contact" className="text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-foreground)]/55 transition hover:text-[var(--color-foreground)]">{secondaryCta}</a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section data-theme-scaffold="hero" className={["relative min-h-[96svh] overflow-hidden", dark ? "bg-[#08080a] text-[#f4f4f5]" : "bg-[var(--color-background)]"].join(" ")}>
      <div className="mx-auto grid min-h-[92svh] max-w-[80rem] lg:grid-cols-[0.44fr_0.56fr]">
        <div className="relative flex flex-col justify-center px-6 py-20 sm:px-10 sm:py-28 lg:px-14 lg:py-32">
          <div
            aria-hidden
            className="absolute bottom-12 left-6 top-12 w-px bg-gradient-to-b from-transparent via-[var(--color-primary)]/60 to-transparent sm:left-10 lg:left-14"
          />
          <div className="relative border-l-[2px] border-[var(--color-primary)] pl-8 sm:pl-10 lg:pl-12">
            <p className="mb-8 text-[10px] font-medium uppercase tracking-[0.36em] text-[var(--color-foreground)]/40">
              {eyebrow}
            </p>
            <h1 className="max-w-[14ch] font-[family-name:var(--font-display,var(--font-heading,inherit))] text-[clamp(2.35rem,4.8vw,4.5rem)] font-normal leading-[1.04] tracking-[-0.02em] text-[var(--color-foreground)]">
              {title}
            </h1>
            <p className="mt-10 max-w-md text-[15px] leading-[2] text-[var(--color-foreground)]/58">
              {subtitle}
            </p>
            <div className="mt-14 flex flex-wrap items-center gap-6 sm:gap-8">
              <a
                href="#gallery"
                className="inline-flex items-center border border-[var(--color-foreground)]/25 px-8 py-3.5 text-[10px] font-medium uppercase tracking-[0.3em] text-[var(--color-foreground)] transition-all duration-500 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                {primaryCta}
              </a>
              <a
                href="#contact"
                className="text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-foreground)]/42 transition-colors duration-300 hover:text-[var(--color-foreground)]"
              >
                {secondaryCta}
              </a>
            </div>
          </div>
        </div>
        <div className="relative min-h-[44svh] lg:min-h-[92svh]">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-[1.8s] ease-out hover:scale-[1.02]"
            />
          ) : (
            <div className="absolute inset-0 bg-[var(--color-surface)]" />
          )}
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-[var(--color-background)] to-transparent lg:block" />
          <div className="absolute bottom-8 right-8 hidden border-l-[2px] border-[var(--color-primary)] bg-[var(--color-background)]/90 px-5 py-4 backdrop-blur-sm lg:block">
            <p className="text-[9px] uppercase tracking-[0.32em] text-[var(--color-foreground)]/45">Featured</p>
            <p className="mt-1 font-[family-name:var(--font-display,var(--font-heading,inherit))] text-sm tracking-wide text-[var(--color-foreground)]">
              The Meridian Penthouse
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
`,

  ThemeLuxuryStory: `import { SectionShell } from "@/components/ui/section-shell";
import { HERO_IMAGE, resolveSiteImage, GALLERY_IMAGES, SECTION_IMAGES } from "@/lib/site-images";

const DEFAULT_ITEMS = [
  { title: "Provenance", body: "Each residence is sourced through private networks — off-market opportunities unavailable to the public record." },
  { title: "Curation", body: "We assess architecture, natural light, and neighborhood character with the rigor of a fine-art advisory." },
  { title: "Discretion", body: "White-glove viewings, sealed dossiers, and confidential negotiations as standard practice." },
];

type ThemeLuxuryStoryProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ title: string; body: string }>;
};

export function ThemeLuxuryStory({
  eyebrow = "Heritage",
  title = "A brokerage built on quiet excellence",
  subtitle = "Three generations of trust in exceptional property.",
  items = DEFAULT_ITEMS,
}: ThemeLuxuryStoryProps) {
  const portrait = resolveSiteImage(SECTION_IMAGES[0] || GALLERY_IMAGES[1] || HERO_IMAGE, 0);
  const detail = resolveSiteImage(GALLERY_IMAGES[2] || SECTION_IMAGES[1] || HERO_IMAGE, 1);
  return (
    <SectionShell id="story" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div className="grid gap-16 lg:grid-cols-[0.36fr_1fr] lg:gap-20 xl:gap-28">
        <div className="space-y-6">
          {portrait ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={portrait}
              alt=""
              className="aspect-[3/4] w-full object-cover"
            />
          ) : (
            <div className="aspect-[3/4] w-full bg-[var(--color-surface)]" />
          )}
          {detail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={detail}
              alt=""
              className="aspect-[16/10] w-full object-cover opacity-90"
            />
          ) : null}
          <p className="border-l-[2px] border-[var(--color-primary)] pl-5 text-[10px] uppercase tracking-[0.3em] text-[var(--color-foreground)]/40">
            Since 1924
          </p>
        </div>
        <div className="flex flex-col justify-center space-y-14 lg:py-8">
          {items.map((item, index) => (
            <article
              key={item.title}
              className="group border-l-[2px] border-[var(--color-primary)]/30 pl-8 transition-colors duration-500 hover:border-[var(--color-primary)] lg:pl-10"
            >
              <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-[var(--color-accent,var(--color-primary))]/80">
                0{index + 1}
              </p>
              <h3 className="mt-4 font-[family-name:var(--font-display,var(--font-heading,inherit))] text-[clamp(1.5rem,2.5vw,2rem)] font-normal tracking-[-0.01em] text-[var(--color-foreground)]">
                {item.title}
              </h3>
              <p className="mt-5 max-w-xl text-[15px] leading-[2] text-[var(--color-foreground)]/55">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
`,

  ThemeLuxuryGallery: `import { SectionShell } from "@/components/ui/section-shell";
import { HERO_IMAGE, resolveSiteImage, GALLERY_IMAGES, SECTION_IMAGES } from "@/lib/site-images";

const DEFAULT_ITEMS = [
  { title: "The Meridian", tag: "Penthouse · Bel Air" },
  { title: "Villa Aurelia", tag: "Estate · Amalfi" },
  { title: "The Townsend", tag: "Townhouse · Mayfair" },
  { title: "No. 14 Savile", tag: "Maison · Paris" },
  { title: "Casa Luminosa", tag: "Villa · Ibiza" },
];

const MOSAIC_SPANS = [
  "col-span-12 row-span-2 sm:col-span-7 lg:col-span-7",
  "col-span-12 row-span-1 sm:col-span-5 lg:col-span-5",
  "col-span-12 row-span-1 sm:col-span-5 lg:col-span-4",
  "col-span-12 row-span-2 sm:col-span-7 lg:col-span-5",
  "col-span-12 row-span-1 sm:col-span-12 lg:col-span-3",
];

type ThemeLuxuryGalleryProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ title: string; tag?: string }>;
};

export function ThemeLuxuryGallery({
  eyebrow = "Collection",
  title = "Curated impressions",
  subtitle = "An asymmetric mosaic of signature residences.",
  items = DEFAULT_ITEMS,
}: ThemeLuxuryGalleryProps) {
  return (
    <SectionShell id="gallery" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div className="grid auto-rows-[minmax(160px,auto)] grid-cols-12 gap-3 sm:gap-4 lg:gap-5">
        {items.map((item, index) => {
          const src = resolveSiteImage(
            GALLERY_IMAGES[index] || SECTION_IMAGES[index] || HERO_IMAGE,
            index,
          );
          const span = MOSAIC_SPANS[index % MOSAIC_SPANS.length];
          return (
            <figure
              key={item.title}
              className={["group relative overflow-hidden bg-[var(--color-surface)]", span].join(" ")}
            >
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt={item.title}
                  className="h-full min-h-[200px] w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04]"
                />
              ) : (
                <div className="h-full min-h-[200px] w-full bg-[var(--color-foreground)]/[0.04]" />
              )}
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--color-foreground)]/75 via-[var(--color-foreground)]/25 to-transparent px-5 pb-5 pt-16">
                {item.tag ? (
                  <p className="text-[9px] font-medium uppercase tracking-[0.32em] text-[var(--color-background)]/65">
                    {item.tag}
                  </p>
                ) : null}
                <p className="mt-1 font-[family-name:var(--font-display,var(--font-heading,inherit))] text-lg tracking-wide text-[var(--color-background)]">
                  {item.title}
                </p>
              </figcaption>
              <div className="pointer-events-none absolute left-0 top-8 h-12 w-[2px] bg-[var(--color-primary)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </figure>
          );
        })}
      </div>
    </SectionShell>
  );
}
`,

  ThemeLuxuryTestimonials: `import { SectionShell } from "@/components/ui/section-shell";

const DEFAULT_ITEMS = [
  { quote: "They understood what we meant by 'home' before we could articulate it — a rare intelligence in this market.", name: "Elena Whitmore", role: "Collector · New York" },
  { quote: "Every viewing felt like opening a private archive. Discreet, precise, and entirely without pressure.", name: "James Harrington", role: "Principal · Geneva" },
  { quote: "The dossier alone was worth the introduction. Architecture, provenance, neighborhood narrative — impeccably composed.", name: "Amélie Duval", role: "Patron · Paris" },
];

type ThemeLuxuryTestimonialsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ quote: string; name: string; role?: string }>;
};

export function ThemeLuxuryTestimonials({
  eyebrow = "Testimonials",
  title = "Voices of distinction",
  subtitle = "Quiet endorsements from patrons who value discretion.",
  items = DEFAULT_ITEMS,
}: ThemeLuxuryTestimonialsProps) {
  return (
    <SectionShell id="testimonials" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div data-theme-scaffold="testimonials" className="grid gap-16 lg:grid-cols-12 lg:gap-12">
        {items.map((item, index) => (
          <blockquote
            key={item.name}
            className={[
              "relative border-l-[2px] border-[var(--color-primary)] pl-8 lg:pl-10",
              index === 0 ? "lg:col-span-7 lg:row-span-2" : "lg:col-span-5",
            ].join(" ")}
          >
            <span
              aria-hidden
              className="font-[family-name:var(--font-display,var(--font-heading,inherit))] text-[4rem] leading-none text-[var(--color-primary)]/25"
            >
              &ldquo;
            </span>
            <p
              className={[
                "font-[family-name:var(--font-display,var(--font-heading,inherit))] font-light leading-[1.55] text-[var(--color-foreground)]",
                index === 0 ? "text-[clamp(1.35rem,2.2vw,1.85rem)]" : "text-[clamp(1.1rem,1.8vw,1.35rem)]",
              ].join(" ")}
            >
              {item.quote}
            </p>
            <footer className="mt-10 border-t border-[var(--color-foreground)]/[0.08] pt-6">
              <cite className="not-italic">
                <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-foreground)]">
                  {item.name}
                </p>
                {item.role ? (
                  <p className="mt-2 text-[10px] uppercase tracking-[0.24em] text-[var(--color-foreground)]/42">
                    {item.role}
                  </p>
                ) : null}
              </cite>
            </footer>
          </blockquote>
        ))}
      </div>
    </SectionShell>
  );
}
`,

  ThemeLuxuryCta: `import { SectionShell } from "@/components/ui/section-shell";

type ThemeLuxuryCtaProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
};

export function ThemeLuxuryCta({
  eyebrow = "Private access",
  title = "Begin your consultation",
  subtitle = "A discreet invitation to explore residences matched to your criteria — no public listings, no open houses.",
  primaryCta = "Reserve a viewing",
  secondaryCta = "Download portfolio",
}: ThemeLuxuryCtaProps) {
  return (
    <SectionShell id="cta" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div
        data-theme-scaffold="cta"
        className="relative overflow-hidden border border-[var(--color-foreground)]/[0.08] bg-gradient-to-br from-[var(--color-surface)] via-[var(--color-background)] to-[var(--color-surface)] px-8 py-20 sm:px-12 sm:py-24 lg:px-20 lg:py-28"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--color-primary)]/[0.06] blur-3xl"
        />
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-transparent via-[var(--color-primary)] to-transparent"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-primary)]/50 to-transparent"
        />
        <div className="relative grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-20">
          <div className="max-w-2xl border-l-[2px] border-[var(--color-primary)]/40 pl-8 sm:pl-12">
            <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-[var(--color-accent,var(--color-primary))]/80">
              {eyebrow}
            </p>
            <h3 className="mt-6 font-[family-name:var(--font-display,var(--font-heading,inherit))] text-[clamp(2rem,4vw,3rem)] font-normal leading-[1.06] tracking-[-0.02em] text-[var(--color-foreground)]">
              {title}
            </h3>
            <p className="mt-6 max-w-lg text-[15px] leading-[2] text-[var(--color-foreground)]/55">
              {subtitle}
            </p>
          </div>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center lg:flex-col lg:items-stretch">
            <a
              href="#contact"
              className="inline-flex items-center justify-center border border-[var(--color-primary)]/80 bg-[var(--color-primary)]/[0.08] px-10 py-4 text-[10px] font-medium uppercase tracking-[0.32em] text-[var(--color-foreground)] backdrop-blur-sm transition-all duration-500 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/[0.14] hover:shadow-[0_12px_40px_color-mix(in_srgb,var(--color-primary)_22%,transparent)]"
            >
              {primaryCta}
            </a>
            <a
              href="#gallery"
              className="inline-flex items-center justify-center px-10 py-4 text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--color-foreground)]/42 transition-colors duration-300 hover:text-[var(--color-foreground)]"
            >
              {secondaryCta}
            </a>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
`,

  ThemeLuxuryFooter: `import { HERO_IMAGE, resolveSiteImage, GALLERY_IMAGES, SECTION_IMAGES } from "@/lib/site-images";

type ThemeLuxuryFooterProps = {
  brandName?: string;
  tagline?: string;
  links?: Array<{ href: string; label: string }>;
};

export function ThemeLuxuryFooter({
  brandName = "Halcyon Estates",
  tagline = "Private brokerage for architecturally significant residences.",
  links = [
    { href: "#residences", label: "Residences" },
    { href: "#gallery", label: "Gallery" },
    { href: "#story", label: "Heritage" },
    { href: "#contact", label: "Contact" },
  ],
}: ThemeLuxuryFooterProps) {
  const mark = resolveSiteImage(SECTION_IMAGES[0] || GALLERY_IMAGES[0] || HERO_IMAGE, 0);
  return (
    <footer data-theme-scaffold="footer" className="border-t border-[var(--color-foreground)]/[0.08] bg-[var(--color-background)]">
      <div className="mx-auto grid max-w-[80rem] gap-16 px-6 py-20 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 lg:px-14 lg:py-28">
        <div className="border-l-[2px] border-[var(--color-primary)] pl-8 lg:pl-10">
          <p className="font-[family-name:var(--font-display,var(--font-heading,inherit))] text-[11px] font-medium uppercase tracking-[0.38em] text-[var(--color-foreground)]">
            {brandName}
          </p>
          <p className="mt-6 max-w-sm text-[15px] leading-[2] text-[var(--color-foreground)]/52">
            {tagline}
          </p>
          {mark ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mark}
              alt=""
              className="mt-10 aspect-[5/3] w-full max-w-xs object-cover opacity-80 grayscale transition-all duration-700 hover:opacity-100 hover:grayscale-0"
            />
          ) : null}
        </div>
        <div className="flex flex-col justify-between gap-12 lg:items-end lg:text-right">
          <nav className="flex flex-col gap-4 lg:items-end">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[10px] font-normal uppercase tracking-[0.28em] text-[var(--color-foreground)]/45 transition-colors duration-300 hover:text-[var(--color-foreground)]"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <p className="text-[10px] uppercase tracking-[0.26em] text-[var(--color-foreground)]/32">
            © {new Date().getFullYear()} {brandName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
`,
};
