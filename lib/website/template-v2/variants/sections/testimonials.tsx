"use client";

import { resolveSlotImageStrict } from "@/lib/website/template-v2/slots";
import type { TestimonialsContent } from "@/lib/website/template-v2/variants/content-types";
import { SectionVariantShell } from "@/lib/website/template-v2/variants/shell";
import { VariantHeader } from "@/lib/website/template-v2/variants/sections/_shared";
import type { TestimonialsVariantId, VariantDefinition } from "@/lib/website/template-v2/variants/types";

const DEFAULT_ITEMS = [
  { quote: "Transformed how our teams collaborate — reporting time cut in half.", name: "Elena Vasquez", role: "CRO", company: "Meridian", rating: 5 },
  { quote: "Implementation was seamless. Board-ready dashboards in six weeks.", name: "James Okonkwo", role: "VP Ops", company: "Northbridge", rating: 5 },
  { quote: "Best investment this year. ROI visible in Q1.", name: "Sophie Laurent", role: "MD", company: "Atlas", rating: 5 },
];

export const TESTIMONIALS_VARIANT_REGISTRY: VariantDefinition<"testimonials">[] = [
  { id: "grid-cards", sectionKind: "testimonials", label: "Grid Cards", description: "3-column testimonial card grid.", composition: "grid", hierarchy: "Equal quote cards", rhythm: "Even 3-up grid", visualIdentity: "Social proof grid", imageSlots: ["testimonials"], responsiveStrategy: "1→2→3 cols", isDefault: true },
  { id: "featured-quote", sectionKind: "testimonials", label: "Featured Quote", description: "Single large featured quote.", composition: "centered", hierarchy: "One dominant quote", rhythm: "Centered focal", visualIdentity: "Hero testimonial", imageSlots: ["testimonials"], responsiveStrategy: "Full-width quote" },
  { id: "logo-wall", sectionKind: "testimonials", label: "Logo Wall", description: "Client logos with one quote above.", composition: "grid", hierarchy: "Quote + logo grid", rhythm: "Quote then logos", visualIdentity: "Trust badges", imageSlots: [], responsiveStrategy: "Logo wrap" },
  { id: "carousel-strip", sectionKind: "testimonials", label: "Carousel Strip", description: "Horizontal scrolling quote cards.", composition: "carousel", hierarchy: "Scrollable cards", rhythm: "Horizontal snap", visualIdentity: "Review rail", imageSlots: ["testimonials"], responsiveStrategy: "Scroll rail" },
  { id: "split-spotlight", sectionKind: "testimonials", label: "Split Spotlight", description: "Large quote left, avatar grid right.", composition: "split", hierarchy: "Quote + avatar grid", rhythm: "50/50 split", visualIdentity: "Personal spotlight", imageSlots: ["testimonials"], responsiveStrategy: "Stack split" },
  { id: "masonry-quotes", sectionKind: "testimonials", label: "Masonry Quotes", description: "Varied-height quote masonry.", composition: "mosaic", hierarchy: "Mixed card heights", rhythm: "Organic masonry", visualIdentity: "Editorial quotes", imageSlots: [], responsiveStrategy: "Column masonry" },
  { id: "video-style", sectionKind: "testimonials", label: "Video Style", description: "Video-frame cards with quote overlay.", composition: "grid", hierarchy: "Frame + overlay quote", rhythm: "Media-forward cards", visualIdentity: "Video testimonials", imageSlots: ["testimonials"], responsiveStrategy: "Stack frames" },
  { id: "minimal-list", sectionKind: "testimonials", label: "Minimal List", description: "Simple quote list with attribution.", composition: "minimal", hierarchy: "Quote + name lines", rhythm: "Tight list", visualIdentity: "Understated proof", imageSlots: [], responsiveStrategy: "Full-width list" },
];

export const TESTIMONIALS_DEFAULT_VARIANT: TestimonialsVariantId = "grid-cards";

function TestimonialsGridCards(p: TestimonialsContent) {
  const id = p.id ?? "testimonials";
  const items = p.items ?? DEFAULT_ITEMS;
  return (
    <SectionVariantShell sectionKind="testimonials" variantId="grid-cards" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} df-section-alt`}>
      <div className={p.ui.container}>
        <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title ?? "Testimonials"} subtitle={p.subtitle} align="center" />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <figure key={item.name} className={`${p.ui.card} p-7`}>
              <span className="df-quote-mark" aria-hidden>&ldquo;</span>
              <blockquote className={`${p.ui.body} mt-2 text-base`}>{item.quote}</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-[var(--border-subtle)] pt-4">
                {resolveSlotImageStrict("testimonials", i, item.imageUrl) ? (
                  <img src={resolveSlotImageStrict("testimonials", i, item.imageUrl)} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : null}
                <div>
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-[var(--color-muted)]">{item.role}{item.company ? ` · ${item.company}` : ""}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </SectionVariantShell>
  );
}

function TestimonialsFeaturedQuote(p: TestimonialsContent) {
  const id = p.id ?? "testimonials";
  const item = (p.items ?? DEFAULT_ITEMS)[0]!;
  return (
    <SectionVariantShell sectionKind="testimonials" variantId="featured-quote" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} df-section-glow`}>
      <div className={`${p.ui.container} max-w-3xl text-center`}>
        <span className="df-quote-mark text-6xl" aria-hidden>&ldquo;</span>
        <blockquote id={`${id}-title`} className={`${p.ui.headline} mt-4 text-2xl sm:text-3xl`}>{item.quote}</blockquote>
        <cite className={`${p.ui.eyebrow} mt-8 block not-italic`}>{item.name} — {item.role}</cite>
      </div>
    </SectionVariantShell>
  );
}

function TestimonialsLogoWall(p: TestimonialsContent) {
  const id = p.id ?? "testimonials";
  const logos = p.logos ?? ["Meridian", "Northbridge", "Atlas", "Summit", "Pulse", "Volt"];
  const quote = (p.items ?? DEFAULT_ITEMS)[0]?.quote;
  return (
    <SectionVariantShell sectionKind="testimonials" variantId="logo-wall" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section}`}>
      <div className={p.ui.container}>
        {quote ? <blockquote className={`${p.ui.headlineSm} mx-auto max-w-2xl text-center`}>{quote}</blockquote> : null}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 opacity-60">
          {logos.map((logo) => <span key={logo} className={`${p.ui.fontBody} text-sm font-semibold tracking-widest uppercase`}>{logo}</span>)}
        </div>
      </div>
    </SectionVariantShell>
  );
}

function TestimonialsCarouselStrip(p: TestimonialsContent) {
  const id = p.id ?? "testimonials";
  const items = p.items ?? DEFAULT_ITEMS;
  return (
    <SectionVariantShell sectionKind="testimonials" variantId="carousel-strip" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} df-section-alt`}>
      <div className={p.ui.container}>
        <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} />
        <div className="-mx-4 mt-8 flex gap-4 overflow-x-auto px-4 pb-4 snap-x">
          {items.map((item) => (
            <figure key={item.name} className={`${p.ui.card} min-w-[18rem] flex-shrink-0 snap-start p-6`}>
              <blockquote className="text-sm">{item.quote}</blockquote>
              <figcaption className="mt-4 text-xs font-semibold">{item.name}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </SectionVariantShell>
  );
}

function TestimonialsSplitSpotlight(p: TestimonialsContent) {
  const id = p.id ?? "testimonials";
  const items = p.items ?? DEFAULT_ITEMS;
  const featured = items[0]!;
  return (
    <SectionVariantShell sectionKind="testimonials" variantId="split-spotlight" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section}`}>
      <div className={`${p.ui.container} grid gap-10 lg:grid-cols-2`}>
        <blockquote className={`${p.ui.headlineSm}`}>{featured.quote}</blockquote>
        <div className="grid grid-cols-2 gap-3">
          {items.map((item, i) => (
            <div key={item.name} className={`${p.ui.card} p-4 text-center`}>
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)] text-sm font-bold">
                {resolveSlotImageStrict("testimonials", i, item.imageUrl) ? (
                  <img src={resolveSlotImageStrict("testimonials", i, item.imageUrl)} alt="" className="h-full w-full rounded-full object-cover" />
                ) : item.name.charAt(0)}
              </span>
              <p className="mt-2 text-xs font-semibold">{item.name}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionVariantShell>
  );
}

function TestimonialsMasonryQuotes(p: TestimonialsContent) {
  const id = p.id ?? "testimonials";
  const items = p.items ?? DEFAULT_ITEMS;
  return (
    <SectionVariantShell sectionKind="testimonials" variantId="masonry-quotes" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} df-section-alt`}>
      <div className={p.ui.container}>
        <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} />
        <div className="mt-10 columns-1 gap-4 sm:columns-2">
          {items.map((item) => (
            <figure key={item.name} className={`${p.ui.card} mb-4 break-inside-avoid p-6`}>
              <blockquote className="text-sm">{item.quote}</blockquote>
              <figcaption className="mt-3 text-xs font-medium">{item.name}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </SectionVariantShell>
  );
}

function TestimonialsVideoStyle(p: TestimonialsContent) {
  const id = p.id ?? "testimonials";
  const items = p.items ?? DEFAULT_ITEMS;
  return (
    <SectionVariantShell sectionKind="testimonials" variantId="video-style" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section}`}>
      <div className={p.ui.container}>
        <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} align="center" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {items.map((item, i) => (
            <figure key={item.name} className={`${p.ui.card} relative overflow-hidden`}>
              <div className="aspect-video bg-[color-mix(in_srgb,var(--color-primary)_15%,var(--color-surface))]">
                {resolveSlotImageStrict("testimonials", i, item.imageUrl) ? (
                  <img src={resolveSlotImageStrict("testimonials", i, item.imageUrl)} alt="" className="h-full w-full object-cover opacity-80" />
                ) : null}
              </div>
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                <p className="text-sm">&ldquo;{item.quote.slice(0, 80)}…&rdquo;</p>
                <p className="mt-2 text-xs font-semibold">{item.name}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </SectionVariantShell>
  );
}

function TestimonialsMinimalList(p: TestimonialsContent) {
  const id = p.id ?? "testimonials";
  const items = p.items ?? DEFAULT_ITEMS;
  return (
    <SectionVariantShell sectionKind="testimonials" variantId="minimal-list" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} df-section-alt`}>
      <div className={`${p.ui.container} max-w-2xl`}>
        <h2 id={`${id}-title`} className={p.ui.headlineSm}>{p.title ?? "What clients say"}</h2>
        <ul className="mt-10 space-y-8" role="list">
          {items.map((item) => (
            <li key={item.name} className="border-b border-[var(--border-subtle)] pb-8">
              <blockquote className="text-base italic text-[var(--color-muted)]">&ldquo;{item.quote}&rdquo;</blockquote>
              <p className="mt-3 text-sm font-semibold">{item.name}, {item.role}</p>
            </li>
          ))}
        </ul>
      </div>
    </SectionVariantShell>
  );
}

const TESTIMONIALS_RENDERERS: Record<TestimonialsVariantId, (p: TestimonialsContent) => React.JSX.Element> = {
  "grid-cards": TestimonialsGridCards,
  "featured-quote": TestimonialsFeaturedQuote,
  "logo-wall": TestimonialsLogoWall,
  "carousel-strip": TestimonialsCarouselStrip,
  "split-spotlight": TestimonialsSplitSpotlight,
  "masonry-quotes": TestimonialsMasonryQuotes,
  "video-style": TestimonialsVideoStyle,
  "minimal-list": TestimonialsMinimalList,
};

export function renderTestimonialsVariant(variantId: TestimonialsVariantId, props: TestimonialsContent) {
  return TESTIMONIALS_RENDERERS[variantId](props);
}
