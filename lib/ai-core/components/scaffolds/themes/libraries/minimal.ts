/**
 * Minimal theme component scaffolds — Swiss ultra-clean, extreme whitespace.
 */

export const MINIMAL_SCAFFOLDS: Record<string, string> = {
  ThemeMinimalNav: `"use client";

const DEFAULT_LINKS = [
  { href: "#highlights", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#testimonials", label: "Words" },
  { href: "#contact", label: "Contact" },
];

type ThemeMinimalNavProps = {
  brandName?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
};

export function ThemeMinimalNav({
  brandName = "Atelier",
  ctaLabel = "Inquire",
  links = DEFAULT_LINKS,
}: ThemeMinimalNavProps) {
  const midpoint = Math.ceil(links.length / 2);
  const leftLinks = links.slice(0, midpoint);
  const rightLinks = links.slice(midpoint);

  return (
    <header data-theme-scaffold="nav" className="sticky top-0 z-50 bg-[var(--color-background)]/95 backdrop-blur-[2px]">
      <div className="mx-auto max-w-[52rem] px-6 sm:px-8">
        <div className="hidden items-center py-14 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:gap-10">
          <nav className="flex justify-end gap-10" aria-label="Primary left">
            {leftLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-[9px] uppercase tracking-[0.38em] text-[var(--color-foreground)]/38 transition-colors hover:text-[var(--color-foreground)]/70"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <a
            href="/"
            className="text-[10px] uppercase tracking-[0.52em] text-[var(--color-foreground)]/72"
          >
            {brandName}
          </a>
          <nav className="flex items-center justify-start gap-10" aria-label="Primary right">
            {rightLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-[9px] uppercase tracking-[0.38em] text-[var(--color-foreground)]/38 transition-colors hover:text-[var(--color-foreground)]/70"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#contact"
              className="text-[9px] uppercase tracking-[0.42em] text-[var(--color-foreground)]/58"
            >
              {ctaLabel}
            </a>
          </nav>
        </div>
        <div className="flex flex-col items-center gap-10 py-12 sm:hidden">
          <a
            href="/"
            className="text-[10px] uppercase tracking-[0.52em] text-[var(--color-foreground)]/72"
          >
            {brandName}
          </a>
          <nav className="flex flex-wrap justify-center gap-x-10 gap-y-4" aria-label="Primary">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-[9px] uppercase tracking-[0.38em] text-[var(--color-foreground)]/38"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#contact"
              className="text-[9px] uppercase tracking-[0.42em] text-[var(--color-foreground)]/58"
            >
              {ctaLabel}
            </a>
          </nav>
        </div>
        <div className="h-px w-full bg-[var(--color-foreground)]/7" />
      </div>
    </header>
  );
}
`,

  ThemeMinimalHero: `"use client";

import { HERO_IMAGE, resolveSiteImage, GALLERY_IMAGES } from "@/lib/site-images";

type ThemeMinimalHeroProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
  layoutMode?: string;
};

export function ThemeMinimalHero({
  title = "Quiet precision",
  subtitle = "Swiss restraint for brands that speak softly and carry weight.",
  eyebrow = "Studio",
  primaryCta = "Begin",
  secondaryCta = "Archive",
  imageUrl,
  layoutMode = "split",
}: ThemeMinimalHeroProps) {
  const src = resolveSiteImage(imageUrl || HERO_IMAGE || GALLERY_IMAGES[0], 0);
  const fullBleed = layoutMode === "full-bleed" || layoutMode === "minimal";

  if (fullBleed) {
    return (
      <section data-theme-scaffold="hero" className="relative min-h-[100svh] overflow-hidden bg-[var(--color-background)]">
        {src ? (
          <img src={src} alt="" className="absolute inset-0 h-full w-full scale-105 object-cover object-center" />
        ) : (
          <div className="absolute inset-0 bg-[var(--color-surface)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)]/45 to-[var(--color-background)]/10" />
        <div className="relative mx-auto flex min-h-[100svh] max-w-[52rem] flex-col items-center justify-end px-6 pb-20 pt-36 text-center sm:px-8 sm:pb-28 sm:pt-44">
          <p className="text-[9px] uppercase tracking-[0.48em] text-[var(--color-foreground)]/40">
            {eyebrow}
          </p>
          <h1 className="mx-auto mt-10 max-w-[16ch] text-[clamp(2.5rem,5.5vw,4.25rem)] font-extralight leading-[1.04] tracking-[-0.04em] text-balance">
            {title}
          </h1>
          <p className="mx-auto mt-10 max-w-md text-[15px] font-light leading-[2.1] text-[var(--color-foreground)]/55">
            {subtitle}
          </p>
          <div className="mt-16 flex justify-center gap-14 text-[9px] uppercase tracking-[0.4em]">
            <a href="#contact" className="text-[var(--color-foreground)]/72 transition-colors hover:text-[var(--color-foreground)]">
              {primaryCta}
            </a>
            <a href="#highlights" className="text-[var(--color-foreground)]/32 transition-colors hover:text-[var(--color-foreground)]/58">
              {secondaryCta}
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section data-theme-scaffold="hero" className="relative min-h-[96svh] overflow-hidden bg-[var(--color-background)]">
      <div className="mx-auto flex min-h-[96svh] max-w-[52rem] flex-col items-center justify-center px-6 py-24 text-center sm:px-8 sm:py-32">
        <p className="text-[9px] uppercase tracking-[0.48em] text-[var(--color-foreground)]/26">
          {eyebrow}
        </p>
        <h1 className="mx-auto mt-16 max-w-[18ch] text-[clamp(2.35rem,4.5vw,3.75rem)] font-extralight leading-[1.04] tracking-[-0.04em] text-balance">
          {title}
        </h1>
        <p className="mx-auto mt-16 max-w-md text-[15px] font-light leading-[2.15] text-[var(--color-foreground)]/42">
          {subtitle}
        </p>
        <div className="mt-24 flex justify-center gap-14 text-[9px] uppercase tracking-[0.4em]">
          <a href="#contact" className="text-[var(--color-foreground)]/62 transition-colors hover:text-[var(--color-foreground)]">
            {primaryCta}
          </a>
          <a href="#highlights" className="text-[var(--color-foreground)]/28 transition-colors hover:text-[var(--color-foreground)]/58">
            {secondaryCta}
          </a>
        </div>
        {src ? (
          <figure className="mx-auto mt-32 max-w-[18rem] sm:mt-40 sm:max-w-[22rem]">
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src={src}
                alt={title}
                className="h-full w-full object-cover object-center transition-transform duration-[1.4s] ease-out hover:scale-[1.02]"
              />
            </div>
          </figure>
        ) : null}
      </div>
    </section>
  );
}
`,

  ThemeMinimalHighlights: `import { SectionShell } from "@/components/ui/section-shell";

const DEFAULT_ITEMS = [
  { title: "Clarity", body: "Every element earns its place. Nothing decorative, everything intentional." },
  { title: "Calm", body: "Whitespace is not empty — it is the frame that lets ideas breathe." },
  { title: "Precision", body: "Thin rules, light type, and measured rhythm define the whole." },
];

type ThemeMinimalHighlightsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ title: string; body: string }>;
};

export function ThemeMinimalHighlights({
  eyebrow = "Philosophy",
  title = "Essentials only",
  subtitle = "Three principles, no ornament.",
  items = DEFAULT_ITEMS,
}: ThemeMinimalHighlightsProps) {
  return (
    <SectionShell id="highlights" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div className="mx-auto max-w-md">
        {items.map((item, i) => (
          <article
            key={item.title}
            className={[
              "py-16 text-center",
              i > 0 ? "border-t border-[var(--color-foreground)]/7" : "",
            ].join(" ")}
          >
            <h3 className="text-lg font-extralight tracking-[-0.02em]">{item.title}</h3>
            <p className="mx-auto mt-6 max-w-xs text-[14px] font-light leading-[2.1] text-[var(--color-foreground)]/38">
              {item.body}
            </p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
`,

  ThemeMinimalServices: `import { SectionShell } from "@/components/ui/section-shell";

const DEFAULT_SERVICES = [
  { title: "Identity", summary: "Typographic systems with Swiss discipline." },
  { title: "Digital", summary: "Interfaces stripped to their essential function." },
  { title: "Print", summary: "Editorial layouts with generous margins." },
];

type ThemeMinimalServicesProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  services?: Array<{ title: string; summary: string }>;
};

export function ThemeMinimalServices({
  eyebrow = "Services",
  title = "What we do",
  subtitle = "Focused offerings, no packages.",
  services = DEFAULT_SERVICES,
}: ThemeMinimalServicesProps) {
  return (
    <SectionShell id="services" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <ul className="mx-auto max-w-md">
        {services.map((s, i) => (
          <li
            key={s.title}
            className={[
              "py-12 text-center",
              i === 0 ? "border-t border-[var(--color-foreground)]/7" : "",
              "border-b border-[var(--color-foreground)]/7",
            ].join(" ")}
          >
            <h3 className="text-base font-extralight tracking-[0.06em]">{s.title}</h3>
            <p className="mx-auto mt-5 max-w-xs text-[13px] font-light leading-[2] text-[var(--color-foreground)]/36">
              {s.summary}
            </p>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
`,

  ThemeMinimalTestimonials: `import { SectionShell } from "@/components/ui/section-shell";

const DEFAULT_ITEMS = [
  { quote: "They removed everything unnecessary until only the truth remained.", name: "Elena Weiss" },
  { quote: "The quietest redesign we have ever shipped — and the most effective.", name: "Marcus Lin" },
];

type ThemeMinimalTestimonialsProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ quote: string; name: string }>;
};

export function ThemeMinimalTestimonials({
  eyebrow = "Testimonials",
  title = "Kind words",
  subtitle = "Measured endorsements.",
  items = DEFAULT_ITEMS,
}: ThemeMinimalTestimonialsProps) {
  return (
    <SectionShell id="testimonials" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div data-theme-scaffold="testimonials" className="mx-auto max-w-lg">
        {items.map((t, i) => (
          <blockquote
            key={t.name}
            className={[
              "py-20 text-center transition-opacity duration-700",
              i > 0 ? "border-t border-[var(--color-foreground)]/7" : "",
            ].join(" ")}
          >
            <span aria-hidden className="font-[family-name:var(--font-display,var(--font-heading,inherit))] text-4xl leading-none text-[var(--color-foreground)]/10">
              &ldquo;
            </span>
            <p className="mx-auto mt-6 max-w-md text-[clamp(1.05rem,2vw,1.2rem)] font-extralight leading-[1.9] tracking-[-0.01em] text-[var(--color-foreground)]/72">
              {t.quote}
            </p>
            <footer className="mt-12 text-[9px] uppercase tracking-[0.42em] text-[var(--color-foreground)]/32">
              {t.name}
            </footer>
          </blockquote>
        ))}
      </div>
    </SectionShell>
  );
}
`,

  ThemeMinimalContact: `import { SectionShell } from "@/components/ui/section-shell";

const DEFAULT_FIELDS = [
  { label: "Name", type: "text" },
  { label: "Email", type: "email" },
  { label: "Message", type: "textarea" },
];

type ThemeMinimalContactProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  fields?: Array<{ label: string; type: string }>;
};

export function ThemeMinimalContact({
  eyebrow = "Contact",
  title = "Say hello",
  subtitle = "A single line between us.",
  fields = DEFAULT_FIELDS,
}: ThemeMinimalContactProps) {
  return (
    <SectionShell id="contact" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <form data-theme-scaffold="cta" className="mx-auto max-w-sm space-y-14">
        {fields.map((f) => (
          <label
            key={f.label}
            className="block text-center text-[9px] uppercase tracking-[0.4em] text-[var(--color-foreground)]/32"
          >
            {f.label}
            {f.type === "textarea" ? (
              <textarea
                rows={3}
                className="mt-5 w-full resize-none border-0 border-b border-[var(--color-foreground)]/12 bg-transparent py-3 text-center text-[14px] font-light text-[var(--color-foreground)]/68 outline-none focus:border-[var(--color-foreground)]/28"
              />
            ) : (
              <input
                type={f.type}
                className="mt-5 w-full border-0 border-b border-[var(--color-foreground)]/12 bg-transparent py-3 text-center text-[14px] font-light text-[var(--color-foreground)]/68 outline-none focus:border-[var(--color-foreground)]/28"
              />
            )}
          </label>
        ))}
        <button
          type="submit"
          className="w-full py-4 text-[9px] uppercase tracking-[0.44em] text-[var(--color-foreground)]/52 transition-colors hover:text-[var(--color-foreground)]/78"
        >
          Send
        </button>
      </form>
    </SectionShell>
  );
}
`,

  ThemeMinimalFooter: `type ThemeMinimalFooterProps = {
  brandName?: string;
  tagline?: string;
  links?: Array<{ href: string; label: string }>;
};

export function ThemeMinimalFooter({
  brandName = "Atelier",
  tagline = "Designed with restraint.",
  links = [
    { href: "#services", label: "Services" },
    { href: "#contact", label: "Contact" },
  ],
}: ThemeMinimalFooterProps) {
  return (
    <footer data-theme-scaffold="footer" className="bg-[var(--color-background)] pb-28 pt-20">
      <div className="mx-auto max-w-[52rem] px-6 sm:px-8">
        <div className="h-px w-full bg-[var(--color-foreground)]/7" />
        <div className="mt-20 text-center">
          <p className="text-[10px] uppercase tracking-[0.48em] text-[var(--color-foreground)]/52">
            {brandName}
          </p>
          <p className="mx-auto mt-8 max-w-xs text-[13px] font-light leading-[2] text-[var(--color-foreground)]/30">
            {tagline}
          </p>
          <nav className="mt-14 flex justify-center gap-12">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-[9px] uppercase tracking-[0.38em] text-[var(--color-foreground)]/32 transition-colors hover:text-[var(--color-foreground)]/58"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <p className="mt-20 text-[9px] uppercase tracking-[0.36em] text-[var(--color-foreground)]/18">
            &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
`,
};
