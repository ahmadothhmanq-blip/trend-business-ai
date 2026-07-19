import { heroImageImport } from "@/lib/ai-core/components/scaffolds/shared";

const img = heroImageImport();

export const HERO_SCAFFOLDS: Record<string, string> = {
  HeroLuxury: `"use client";

${img}

type HeroLuxuryProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
};

export function HeroLuxury({
  title = "Crafted for those who expect more",
  subtitle = "A refined experience designed with precision, atmosphere, and lasting impression.",
  eyebrow = "Luxury experience",
  primaryCta = "Explore collection",
  secondaryCta = "Book a consultation",
  imageUrl,
}: HeroLuxuryProps) {
  const src = resolveSiteImage(imageUrl || HERO_IMAGE || PRODUCT_IMAGE || GALLERY_IMAGES[0] || SECTION_IMAGES[0], 0);
  return (
    <section className="relative min-h-[88vh] overflow-hidden bg-[var(--color-background)] text-[var(--color-foreground)]">
      <div className="absolute inset-0">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-hero" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/20" />
      </div>
      <div className="relative mx-auto flex min-h-[88vh] max-w-[var(--container-max,72rem)] flex-col justify-end px-5 pb-24 pt-36 sm:px-6 lg:px-8">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-white/70 animate-[fadeUp_0.6s_var(--ease-premium,ease)_both]">
          {eyebrow}
        </p>
        <h1 className="max-w-3xl font-[family-name:var(--font-display,var(--font-heading,inherit))] text-[clamp(2.5rem,6vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-white animate-[fadeUp_0.75s_var(--ease-premium,ease)_both]">
          {title}
        </h1>
        <p className="mt-6 max-w-xl text-base leading-[1.7] text-white/80 sm:text-lg animate-[fadeUp_0.9s_var(--ease-premium,ease)_both]">
          {subtitle}
        </p>
        <div className="mt-10 flex flex-wrap gap-3 animate-[fadeUp_1s_var(--ease-premium,ease)_both]">
          <a href="#contact" className="inline-flex items-center rounded-[var(--radius-md,0.75rem)] bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:opacity-90">
            {primaryCta}
          </a>
          <a href="#services" className="inline-flex items-center rounded-[var(--radius-md,0.75rem)] border border-white/40 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">
            {secondaryCta}
          </a>
        </div>
      </div>
    </section>
  );
}
`,

  HeroVideo: `"use client";

${img}

type HeroVideoProps = {
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  posterUrl?: string | null;
  videoUrl?: string;
};

export function HeroVideo({
  title = "Experience the story in motion",
  subtitle = "Cinematic storytelling that puts your brand at the center of the frame.",
  primaryCta = "Watch & explore",
  posterUrl,
  videoUrl,
}: HeroVideoProps) {
  const poster = resolveSiteImage(posterUrl || HERO_IMAGE || PRODUCT_IMAGE || GALLERY_IMAGES[0], 0);
  return (
    <section className="relative min-h-[85vh] overflow-hidden bg-black text-white">
      <div className="absolute inset-0">
        {videoUrl ? (
          <video className="h-full w-full object-cover" autoPlay muted loop playsInline poster={poster || undefined}>
            <source src={videoUrl} />
          </video>
        ) : poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={poster} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-hero" />
        )}
        <div className="absolute inset-0 bg-black/50" />
      </div>
      <div className="relative mx-auto flex min-h-[85vh] max-w-[var(--container-max,72rem)] flex-col items-start justify-center px-4 py-24 sm:px-6 lg:px-8">
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl animate-[fadeUp_0.7s_ease_both]">
          {title}
        </h1>
        <p className="mt-5 max-w-xl text-lg text-white/80 animate-[fadeUp_0.85s_ease_both]">{subtitle}</p>
        <a href="#gallery" className="mt-8 inline-flex rounded-[var(--radius-md,0.75rem)] bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-[var(--color-on-primary,white)] transition hover:opacity-90 animate-[fadeUp_1s_ease_both]">
          {primaryCta}
        </a>
      </div>
    </section>
  );
}
`,

  HeroSplit: `"use client";

${img}

type HeroSplitProps = {
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
};

export function HeroSplit({
  title = "Built for modern professionals",
  subtitle = "Clear value, premium craft, and a conversion path that feels effortless.",
  primaryCta = "Get started",
  secondaryCta = "See how it works",
  imageUrl,
}: HeroSplitProps) {
  const src = resolveSiteImage(imageUrl || HERO_IMAGE || PRODUCT_IMAGE || GALLERY_IMAGES[0], 0);
  return (
    <section className="bg-[var(--color-background)] text-[var(--color-foreground)]">
      <div className="mx-auto grid min-h-[80vh] max-w-[var(--container-max,72rem)] items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
        <div className="animate-[fadeUp_0.7s_var(--ease-premium,ease)_both]">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent,var(--color-primary))]">
            Professional
          </p>
          <h1 className="text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">{title}</h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-[var(--color-foreground)]/70">{subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#contact" className="rounded-[var(--radius-md,0.75rem)] bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-[var(--color-on-primary,white)]">
              {primaryCta}
            </a>
            <a href="#features" className="rounded-[var(--radius-md,0.75rem)] border border-[var(--color-foreground)]/15 px-5 py-3 text-sm font-semibold">
              {secondaryCta}
            </a>
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-xl,1.25rem)] shadow-[var(--shadow-lg,0_20px_50px_rgba(0,0,0,0.15))] animate-[fadeUp_0.9s_var(--ease-premium,ease)_both]">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={title} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-hero" />
          )}
        </div>
      </div>
    </section>
  );
}
`,

  HeroImage: `"use client";

${img}

type HeroImageProps = {
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  imageUrl?: string | null;
};

export function HeroImage({
  title = "Make the first impression unforgettable",
  subtitle = "Image-led storytelling with crisp hierarchy and a clear next step.",
  primaryCta = "Discover more",
  imageUrl,
}: HeroImageProps) {
  const src = resolveSiteImage(imageUrl || HERO_IMAGE || SECTION_IMAGES[0] || PRODUCT_IMAGE, 0);
  return (
    <section className="relative min-h-[82vh] overflow-hidden">
      <div className="absolute inset-0">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-hero" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/20" />
      </div>
      <div className="relative mx-auto flex min-h-[82vh] max-w-[var(--container-max,72rem)] flex-col justify-end px-4 pb-16 sm:px-6 lg:px-8">
        <h1 className="max-w-3xl text-4xl font-semibold text-white sm:text-5xl lg:text-6xl animate-[fadeUp_0.7s_ease_both]">{title}</h1>
        <p className="mt-4 max-w-xl text-lg text-white/80 animate-[fadeUp_0.85s_ease_both]">{subtitle}</p>
        <a href="#services" className="mt-8 inline-flex w-fit rounded-[var(--radius-md,0.75rem)] bg-white px-5 py-3 text-sm font-semibold text-black animate-[fadeUp_1s_ease_both]">
          {primaryCta}
        </a>
      </div>
    </section>
  );
}
`,

  HeroProduct: `"use client";

${img}

type HeroProductProps = {
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
  imageUrl?: string | null;
};

export function HeroProduct({
  title = "The product your team will actually love",
  subtitle = "Ship faster with a clear value proposition, crisp visuals, and trial-ready CTAs.",
  primaryCta = "Start free trial",
  secondaryCta = "Book a demo",
  imageUrl,
}: HeroProductProps) {
  const src = resolveSiteImage(imageUrl || PRODUCT_IMAGE || HERO_IMAGE || GALLERY_IMAGES[0], 0);
  return (
    <section className="bg-[var(--color-background)] py-16 lg:py-24">
      <div className="mx-auto grid max-w-[var(--container-max,72rem)] items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
          <p className="mt-5 text-lg text-[var(--color-foreground)]/70">{subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#pricing" className="rounded-[var(--radius-md,0.75rem)] bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-[var(--color-on-primary,white)]">{primaryCta}</a>
            <a href="#features" className="rounded-[var(--radius-md,0.75rem)] border border-[var(--color-foreground)]/15 px-5 py-3 text-sm font-semibold">{secondaryCta}</a>
          </div>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-xl,1.25rem)] border border-[var(--color-foreground)]/10 bg-[var(--color-surface,var(--color-background))] shadow-[var(--shadow-lg,0_24px_60px_rgba(0,0,0,0.12))]">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[var(--color-foreground)]/40">Product visual</div>
          )}
        </div>
      </div>
    </section>
  );
}
`,

  HeroFullBleed: `"use client";

${img}

type HeroFullBleedProps = {
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  imageUrl?: string | null;
};

export function HeroFullBleed({
  title = "Go further than you imagined",
  subtitle = "Full-bleed cinematic storytelling for brands that lead with atmosphere.",
  primaryCta = "Explore now",
  imageUrl,
}: HeroFullBleedProps) {
  const src = resolveSiteImage(imageUrl || HERO_IMAGE || PRODUCT_IMAGE || GALLERY_IMAGES[0], 0);
  return (
    <section className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-hero" />
        )}
        <div className="absolute inset-0 bg-black/45" />
      </div>
      <div className="relative mx-auto flex min-h-screen max-w-[var(--container-max,72rem)] items-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl text-white">
          <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">{title}</h1>
          <p className="mt-5 text-lg text-white/80">{subtitle}</p>
          <a href="#contact" className="mt-8 inline-flex rounded-[var(--radius-md,0.75rem)] bg-white px-6 py-3 text-sm font-semibold text-black">{primaryCta}</a>
        </div>
      </div>
    </section>
  );
}
`,
};
