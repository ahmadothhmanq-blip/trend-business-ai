/**
 * Agency-grade premium section scaffolds — storytelling & experience layouts,
 * not repetitive card grids.
 */

import { heroImageImport } from "@/lib/ai-core/components/scaffolds/shared";

const img = heroImageImport();

export const PREMIUM_SCAFFOLDS: Record<string, string> = {
  HeroCinematic: `"use client";

${img}

type HeroCinematicProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
};

export function HeroCinematic({
  title = "Where atmosphere becomes brand",
  subtitle = "A cinematic opening framed like a film still — one idea, one emotion, one decisive action.",
  eyebrow = "Cinematic brand film",
  primaryCta = "Enter the experience",
  secondaryCta = "Watch the story",
  imageUrl,
}: HeroCinematicProps) {
  const src = resolveSiteImage(imageUrl || HERO_IMAGE || PRODUCT_IMAGE || GALLERY_IMAGES[0], 0);
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-black text-white">
      <div className="absolute inset-0">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="h-full w-full scale-105 object-cover animate-[slowReveal_1.4s_var(--ease-premium,ease)_both]" />
        ) : (
          <div className="h-full w-full bg-gradient-hero" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/20" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/50 to-transparent" />
      </div>
      <div className="relative mx-auto flex min-h-[100svh] max-w-[var(--container-max,72rem)] flex-col justify-end px-5 pb-24 pt-36 sm:px-6 lg:px-8">
        <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/65 animate-[fadeUp_0.7s_var(--ease-premium,ease)_both]">
          {eyebrow}
        </p>
        <h1 className="max-w-4xl font-[family-name:var(--font-display,var(--font-heading,inherit))] text-[clamp(2.75rem,7vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.035em] text-white animate-[fadeUp_0.9s_var(--ease-premium,ease)_both]">
          {title}
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-white/78 sm:text-lg animate-[fadeUp_1.05s_var(--ease-premium,ease)_both]">
          {subtitle}
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3 animate-[fadeUp_1.2s_var(--ease-premium,ease)_both]">
          <a href="#contact" className="inline-flex items-center rounded-[var(--radius-md,0.75rem)] bg-white px-6 py-3.5 text-sm font-semibold text-black transition duration-300 hover:opacity-90">
            {primaryCta}
          </a>
          <a href="#video" className="inline-flex items-center gap-2 rounded-[var(--radius-md,0.75rem)] border border-white/35 px-6 py-3.5 text-sm font-semibold text-white transition duration-300 hover:bg-white/10">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/50 text-[10px]">▶</span>
            {secondaryCta}
          </a>
        </div>
      </div>
    </section>
  );
}
`,

  HeroFullImage: `"use client";

${img}

type HeroFullImageProps = {
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  imageUrl?: string | null;
};

export function HeroFullImage({
  title = "Image as the headline",
  subtitle = "A full-frame visual that carries the brand before a single word is read.",
  primaryCta = "Discover more",
  imageUrl,
}: HeroFullImageProps) {
  const src = resolveSiteImage(imageUrl || HERO_IMAGE || GALLERY_IMAGES[0] || PRODUCT_IMAGE, 0);
  return (
    <section className="relative min-h-[92svh] overflow-hidden">
      <div className="absolute inset-0">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-hero" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
      </div>
      <div className="relative mx-auto flex min-h-[92svh] max-w-[var(--container-max,72rem)] items-end px-4 pb-20 pt-28 sm:items-center sm:px-6 lg:px-8">
        <div className="max-w-2xl text-white">
          <h1 className="font-[family-name:var(--font-display,var(--font-heading,inherit))] text-4xl font-semibold tracking-[-0.03em] sm:text-5xl lg:text-6xl animate-[fadeUp_0.8s_var(--ease-premium,ease)_both]">
            {title}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-white/80 sm:text-lg animate-[fadeUp_1s_var(--ease-premium,ease)_both]">
            {subtitle}
          </p>
          <a href="#contact" className="mt-8 inline-flex rounded-[var(--radius-md,0.75rem)] bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:opacity-90 animate-[fadeUp_1.15s_var(--ease-premium,ease)_both]">
            {primaryCta}
          </a>
        </div>
      </div>
    </section>
  );
}
`,

  HeroInteractive: `"use client";

import { useState } from "react";
${img}

const hotspots = [
  { id: "craft", label: "Craft", title: "Precision details", body: "Every surface is considered — materials, spacing, and micro-interactions." },
  { id: "speed", label: "Speed", title: "Instant clarity", body: "Visitors understand the offer in seconds with a guided product frame." },
  { id: "trust", label: "Trust", title: "Proof in motion", body: "Interactive highlights turn features into believable outcomes." },
];

type HeroInteractiveProps = {
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
};

export function HeroInteractive({
  title = "Explore the product, not a template",
  subtitle = "An interactive hero that invites visitors to discover value through guided hotspots.",
  primaryCta = "Start free trial",
  secondaryCta = "Book a demo",
  imageUrl,
}: HeroInteractiveProps) {
  const [active, setActive] = useState(hotspots[0]!.id);
  const current = hotspots.find((h) => h.id === active) || hotspots[0]!;
  const src = resolveSiteImage(imageUrl || PRODUCT_IMAGE || HERO_IMAGE || GALLERY_IMAGES[0], 0);
  return (
    <section className="bg-[var(--color-background)] py-16 lg:py-24">
      <div className="mx-auto grid max-w-[var(--container-max,72rem)] items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div>
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-accent,var(--color-primary))]">
            Interactive experience
          </p>
          <h1 className="font-[family-name:var(--font-display,var(--font-heading,inherit))] text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--color-foreground)]/70 sm:text-lg">
            {subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {hotspots.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => setActive(h.id)}
                className={[
                  "rounded-full px-4 py-2 text-sm font-semibold transition duration-300",
                  active === h.id
                    ? "bg-[var(--color-primary)] text-[var(--color-on-primary,white)]"
                    : "border border-[var(--color-foreground)]/15 text-[var(--color-foreground)]/80 hover:border-[var(--color-foreground)]/30",
                ].join(" ")}
              >
                {h.label}
              </button>
            ))}
          </div>
          <div className="mt-6 min-h-[5.5rem]">
            <h2 className="text-lg font-semibold tracking-tight">{current.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-foreground)]/65">{current.body}</p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#pricing" className="rounded-[var(--radius-md,0.75rem)] bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-[var(--color-on-primary,white)] transition hover:opacity-90">
              {primaryCta}
            </a>
            <a href="#contact" className="rounded-[var(--radius-md,0.75rem)] border border-[var(--color-foreground)]/15 px-5 py-3 text-sm font-semibold transition hover:bg-[var(--color-surface)]">
              {secondaryCta}
            </a>
          </div>
        </div>
        <div className="relative aspect-[16/11] overflow-hidden rounded-[var(--radius-xl,1.25rem)] border border-[var(--color-foreground)]/10 bg-[var(--color-surface)] shadow-[var(--shadow-lg,0_28px_70px_rgba(0,0,0,0.12))]">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={title} className="h-full w-full object-cover transition duration-700" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[var(--color-foreground)]/40">Product stage</div>
          )}
          <div className="absolute inset-x-4 bottom-4 rounded-[var(--radius-md,0.75rem)] border border-white/20 bg-black/55 px-4 py-3 text-white backdrop-blur-md">
            <p className="text-xs uppercase tracking-[0.16em] text-white/70">Live preview</p>
            <p className="mt-1 text-sm font-medium">{current.title}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
`,

  ProductInteractive: `"use client";

import { useState } from "react";
import { SectionShell } from "@/components/ui/section-shell";
import { Motion } from "@/components/ui/motion";
${img}

const DEFAULT_PANELS = [
  { id: "01", title: "Signature capability", body: "The hero capability shown in context — not buried in a feature grid." },
  { id: "02", title: "Experience detail", body: "Zoom into the moment that makes the product feel premium and inevitable." },
  { id: "03", title: "Outcome proof", body: "Translate features into the result your audience actually wants." },
];

type ProductInteractiveProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  bullets?: string[];
  items?: Array<{ title: string; tag?: string; body?: string }>;
  ctaLabel?: string;
};

export function ProductInteractive({
  eyebrow = "Interactive showcase",
  title = "Product, staged like a showroom",
  subtitle = "A guided experience that replaces static card grids with intentional product storytelling.",
  bullets,
  items,
}: ProductInteractiveProps) {
  const panels =
    items?.length
      ? items.slice(0, 3).map((item, i) => ({
          id: String(i + 1).padStart(2, "0"),
          title: item.title,
          body: item.body || bullets?.[i] || item.tag || "A premium product moment with clear benefits.",
        }))
      : bullets?.length
        ? bullets.slice(0, 3).map((body, i) => ({
            id: String(i + 1).padStart(2, "0"),
            title: DEFAULT_PANELS[i]?.title || \`Moment \${i + 1}\`,
            body,
          }))
        : DEFAULT_PANELS;
  const [active, setActive] = useState(0);
  const panel = panels[active]!;
  const src = resolveSiteImage(PRODUCT_IMAGE || HERO_IMAGE || GALLERY_IMAGES[active] || SECTION_IMAGES[active], active);
  return (
    <SectionShell id="product" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div className="grid items-stretch gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
        <div className="flex flex-col gap-3">
          {panels.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActive(i)}
              className={[
                "rounded-[var(--radius-lg,1rem)] border px-5 py-4 text-left transition duration-300",
                active === i
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/8 shadow-[var(--shadow-sm)]"
                  : "border-[var(--color-foreground)]/10 hover:border-[var(--color-foreground)]/20",
              ].join(" ")}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-foreground)]/45">{p.id}</p>
              <h3 className="mt-1 text-base font-semibold tracking-tight">{p.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-[var(--color-foreground)]/65">{p.body}</p>
            </button>
          ))}
        </div>
        <Motion variant="scale-in" className="relative min-h-[22rem] overflow-hidden rounded-[var(--radius-xl,1.25rem)] bg-[var(--color-surface)]">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={panel.title} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-hero opacity-60" />
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-6 text-white">
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">Now featuring</p>
            <p className="mt-2 text-xl font-semibold">{panel.title}</p>
          </div>
        </Motion>
      </div>
    </SectionShell>
  );
}
`,

  FeatureStorytelling: `import { SectionShell } from "@/components/ui/section-shell";
import { Motion } from "@/components/ui/motion";
${img}

const chapters = [
  {
    eyebrow: "Chapter 01",
    title: "The problem, felt",
    body: "Open with the tension your audience already knows — then make the stakes unmistakable.",
  },
  {
    eyebrow: "Chapter 02",
    title: "The turning point",
    body: "Introduce the approach as a narrative beat, not a bullet list of features.",
  },
  {
    eyebrow: "Chapter 03",
    title: "The outcome",
    body: "Close with the transformation — clear, visual, and emotionally earned.",
  },
];

export function FeatureStorytelling() {
  return (
    <SectionShell id="features" eyebrow="Feature storytelling" title="A narrative, not a feature dump" subtitle="Alternating story bands create editorial rhythm — premium composition without card fatigue." className="!py-0" tone="default">
      <div className="space-y-0">
        {chapters.map((c, i) => {
          const src = resolveSiteImage(SECTION_IMAGES[i] || GALLERY_IMAGES[i] || SERVICE_IMAGE || PRODUCT_IMAGE || HERO_IMAGE, i);
          const reverse = i % 2 === 1;
          return (
            <Motion key={c.title} delayMs={i * 90} variant="slow-reveal" className="border-t border-[var(--color-foreground)]/8 py-14 sm:py-20">
              <div className={["grid items-center gap-10 lg:grid-cols-2 lg:gap-16", reverse ? "lg:[&>*:first-child]:order-2" : ""].join(" ")}>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-accent,var(--color-primary))]">{c.eyebrow}</p>
                  <h3 className="mt-3 font-[family-name:var(--font-heading,inherit)] text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">{c.title}</h3>
                  <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--color-foreground)]/68">{c.body}</p>
                </div>
                <div className="relative aspect-[16/11] overflow-hidden rounded-[var(--radius-xl,1.25rem)] bg-[var(--color-surface)]">
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-[var(--color-primary)]/10" />
                  )}
                </div>
              </div>
            </Motion>
          );
        })}
      </div>
    </SectionShell>
  );
}
`,

  CaseStudies: `import { SectionShell } from "@/components/ui/section-shell";
import { Motion } from "@/components/ui/motion";
${img}

const studies = [
  { client: "Northline", result: "+48% qualified inquiries", summary: "Repositioned a premium brand with a cinematic site and sharper conversion path." },
  { client: "Aperture", result: "2.1× demo bookings", summary: "Rebuilt the product story around interactive proof and clearer pricing." },
  { client: "Harbor", result: "Launch in 21 days", summary: "Editorial case-led homepage that felt agency-made, not template-assembled." },
];

export function CaseStudies() {
  return (
    <SectionShell id="case-studies" eyebrow="Case studies" title="Proof with editorial weight" subtitle="Long-form case rows — outcomes first, imagery second — instead of tiny card tiles." tone="muted">
      <div className="divide-y divide-[var(--color-foreground)]/10 border-y border-[var(--color-foreground)]/10">
        {studies.map((s, i) => {
          const src = resolveSiteImage(GALLERY_IMAGES[i] || SECTION_IMAGES[i] || PRODUCT_IMAGE || HERO_IMAGE, i);
          return (
            <Motion key={s.client} delayMs={i * 80} className="grid gap-6 py-8 lg:grid-cols-[1fr_1.2fr_0.8fr] lg:items-center lg:gap-10">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-lg,1rem)] bg-[var(--color-background)] lg:aspect-[5/3]">
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-hero opacity-40" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-foreground)]/45">{s.client}</p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">{s.summary}</h3>
              </div>
              <div className="lg:text-right">
                <p className="text-2xl font-semibold tracking-tight text-[var(--color-primary)]">{s.result}</p>
                <a href="#contact" className="mt-3 inline-flex text-sm font-semibold text-[var(--color-foreground)]/70 transition hover:text-[var(--color-primary)]">
                  View engagement →
                </a>
              </div>
            </Motion>
          );
        })}
      </div>
    </SectionShell>
  );
}
`,

  BrandTrust: `import { SectionShell } from "@/components/ui/section-shell";
import { Motion } from "@/components/ui/motion";

const metrics = [
  { value: "98%", label: "Client retention" },
  { value: "4.9★", label: "Average rating" },
  { value: "120+", label: "Brands launched" },
];

const logos = ["ATLAS", "VERTEX", "LUMEN", "NORTH", "PRISM", "CREST"];

export function BrandTrust() {
  return (
    <SectionShell id="trust" eyebrow="Brand trust" title="Credibility without card clutter" subtitle="Logo rhythm, decisive metrics, and one quiet endorsement — trust as composition.">
      <Motion className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-y border-[var(--color-foreground)]/10 py-6">
        {logos.map((logo) => (
          <span key={logo} className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-foreground)]/35">
            {logo}
          </span>
        ))}
      </Motion>
      <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <Motion delayMs={80}>
          <blockquote className="font-[family-name:var(--font-display,var(--font-heading,inherit))] text-2xl font-medium leading-snug tracking-[-0.02em] sm:text-3xl">
            “It finally feels like a brand site — not another AI template with nicer fonts.”
          </blockquote>
          <p className="mt-5 text-sm text-[var(--color-foreground)]/60">Creative Director · Flagship partner</p>
        </Motion>
        <Motion delayMs={140} className="grid grid-cols-3 gap-4 border-t border-[var(--color-foreground)]/10 pt-6 lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0">
          {metrics.map((m) => (
            <div key={m.label}>
              <p className="text-2xl font-semibold tracking-tight sm:text-3xl">{m.value}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--color-foreground)]/50">{m.label}</p>
            </div>
          ))}
        </Motion>
      </div>
    </SectionShell>
  );
}
`,

  TimelineSection: `import { SectionShell } from "@/components/ui/section-shell";
import { Motion } from "@/components/ui/motion";

const steps = [
  { phase: "01", title: "Discover", body: "Audience, offer, and competitive edge — mapped before a pixel moves." },
  { phase: "02", title: "Compose", body: "Layout, type, and imagery locked into a singular visual identity." },
  { phase: "03", title: "Craft", body: "Sections built as experiences — storytelling, proof, and conversion." },
  { phase: "04", title: "Launch", body: "Ship a polished site ready for SEO, performance, and growth." },
];

export function TimelineSection() {
  return (
    <SectionShell id="timeline" eyebrow="Timeline" title="A clear path from brief to launch" subtitle="Vertical rhythm that reads as process — not another three-column card set." tone="muted">
      <ol className="relative space-y-0 border-l border-[var(--color-foreground)]/15 pl-8 sm:pl-10">
        {steps.map((s, i) => (
          <Motion key={s.phase} delayMs={i * 70} as="li" className="relative pb-10 last:pb-0">
            <span className="absolute -left-[2.15rem] top-1 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--color-foreground)]/20 bg-[var(--color-background)] text-[10px] font-bold sm:-left-[2.65rem]">
              {s.phase}
            </span>
            <h3 className="text-lg font-semibold tracking-tight sm:text-xl">{s.title}</h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--color-foreground)]/65 sm:text-base">{s.body}</p>
          </Motion>
        ))}
      </ol>
    </SectionShell>
  );
}
`,

  ComparisonSection: `import { SectionShell } from "@/components/ui/section-shell";
import { Motion } from "@/components/ui/motion";

const rows = [
  { label: "Visual identity", us: "Agency-composed system", them: "Generic template skins" },
  { label: "Section rhythm", us: "Storytelling & proof bands", them: "Endless card grids" },
  { label: "Hero treatment", us: "Cinematic / interactive", them: "Stock split hero" },
  { label: "Conversion path", us: "Goal-aware CTA hierarchy", them: "One vague button" },
];

export function ComparisonSection() {
  return (
    <SectionShell id="compare" eyebrow="Comparison" title="Why this feels different" subtitle="A clean comparison table — decisive, scannable, and free of decorative cards.">
      <Motion className="overflow-hidden rounded-[var(--radius-xl,1.25rem)] border border-[var(--color-foreground)]/10">
        <div className="grid grid-cols-[1.1fr_1fr_1fr] gap-0 bg-[var(--color-surface)] px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-foreground)]/45 sm:px-6">
          <span>Dimension</span>
          <span className="text-[var(--color-primary)]">Trend Business AI</span>
          <span>Typical builders</span>
        </div>
        {rows.map((r, i) => (
          <div
            key={r.label}
            className={[
              "grid grid-cols-[1.1fr_1fr_1fr] gap-3 border-t border-[var(--color-foreground)]/8 px-4 py-5 text-sm sm:gap-4 sm:px-6",
              i % 2 === 0 ? "bg-[var(--color-background)]" : "bg-[var(--color-surface)]/50",
            ].join(" ")}
          >
            <span className="font-semibold">{r.label}</span>
            <span className="text-[var(--color-foreground)]/80">{r.us}</span>
            <span className="text-[var(--color-foreground)]/45">{r.them}</span>
          </div>
        ))}
      </Motion>
    </SectionShell>
  );
}
`,

  VideoSection: `import { SectionShell } from "@/components/ui/section-shell";
import { Motion } from "@/components/ui/motion";
${img}

export function VideoSection() {
  const poster = resolveSiteImage(HERO_IMAGE || PRODUCT_IMAGE || GALLERY_IMAGES[0] || SECTION_IMAGES[0], 0);
  return (
    <SectionShell id="video" eyebrow="Video" title="Motion that earns attention" subtitle="A cinematic frame — poster-led, intentional — instead of autoplaying noise.">
      <Motion variant="slow-reveal" className="relative aspect-video overflow-hidden rounded-[var(--radius-xl,1.25rem)] bg-black shadow-[var(--shadow-lg)]">
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={poster} alt="" className="h-full w-full object-cover opacity-85" />
        ) : (
          <div className="h-full w-full bg-gradient-hero" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        <button
          type="button"
          className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/15 text-white backdrop-blur-md transition hover:scale-105 hover:bg-white/25"
          aria-label="Play brand film"
        >
          <span className="ml-1 text-lg">▶</span>
        </button>
        <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-white/70">Brand film</p>
          <p className="mt-2 max-w-lg text-lg font-semibold tracking-tight sm:text-xl">
            Watch the story behind the brand
          </p>
        </div>
      </Motion>
    </SectionShell>
  );
}
`,

  GalleryExperience: `import { SectionShell } from "@/components/ui/section-shell";
import { Motion } from "@/components/ui/motion";
${img}

type GalleryExperienceProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: Array<{ title: string; tag?: string }>;
};

export function GalleryExperience({
  eyebrow = "Gallery experience",
  title = "A visual sequence, not a tile dump",
  subtitle = "Asymmetric mosaic with intentional scale — gallery as atmosphere.",
  items,
}: GalleryExperienceProps) {
  const shots = [0, 1, 2, 3, 4].map((i) =>
    resolveSiteImage(GALLERY_IMAGES[i] || SECTION_IMAGES[i] || PRODUCT_IMAGE || HERO_IMAGE, i),
  );
  return (
    <SectionShell id="gallery" eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div className="grid auto-rows-[12rem] grid-cols-2 gap-3 sm:auto-rows-[14rem] sm:gap-4 lg:grid-cols-4 lg:auto-rows-[16rem]">
        {shots.map((src, i) => (
          <Motion
            key={i}
            delayMs={i * 60}
            variant="scale-in"
            className={[
              "group relative overflow-hidden rounded-[var(--radius-lg,1rem)] bg-[var(--color-surface)]",
              i === 0 ? "col-span-2 row-span-2" : "",
              i === 3 ? "lg:col-span-2" : "",
            ].join(" ")}
          >
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt={items?.[i]?.title || \`Gallery image \${i + 1}\`} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
            ) : (
              <div className="h-full w-full bg-[var(--color-primary)]/12" />
            )}
          </Motion>
        ))}
      </div>
    </SectionShell>
  );
}
`,
};
