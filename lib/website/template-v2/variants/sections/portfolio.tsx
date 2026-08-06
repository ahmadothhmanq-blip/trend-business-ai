"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";
import type { PortfolioContent } from "@/lib/website/template-v2/variants/content-types";
import { SectionVariantShell } from "@/lib/website/template-v2/variants/shell";
import { VariantHeader } from "@/lib/website/template-v2/variants/sections/_shared";
import type { PortfolioVariantId, VariantDefinition } from "@/lib/website/template-v2/variants/types";

const DEFAULT_ITEMS = [
  { title: "Meridian Rebrand", category: "Brand", description: "Full identity system for a global advisory firm." },
  { title: "Atlas Platform", category: "Product", description: "Enterprise dashboard redesign." },
  { title: "Northwind Campaign", category: "Marketing", description: "Multi-channel launch campaign." },
  { title: "Summit Estate", category: "Real Estate", description: "Luxury property marketing suite." },
  { title: "Pulse Health", category: "Healthcare", description: "Patient portal experience." },
  { title: "Volt Studio", category: "Creative", description: "Agency portfolio site." },
];

export const PORTFOLIO_VARIANT_REGISTRY: VariantDefinition<"portfolio">[] = [
  { id: "masonry-grid", sectionKind: "portfolio", label: "Masonry Grid", description: "Pinterest-style masonry image grid.", composition: "mosaic", hierarchy: "Varied tile heights", rhythm: "Organic flow", visualIdentity: "Gallery wall", imageSlots: ["gallery"], responsiveStrategy: "1-2 column masonry", isDefault: true },
  { id: "carousel-strip", sectionKind: "portfolio", label: "Carousel Strip", description: "Horizontal scrolling project strip.", composition: "carousel", hierarchy: "Wide cards in rail", rhythm: "Horizontal discovery", visualIdentity: "Showreel strip", imageSlots: ["gallery"], responsiveStrategy: "Snap scroll" },
  { id: "case-studies", sectionKind: "portfolio", label: "Case Studies", description: "Large case study cards with metadata.", composition: "stacked", hierarchy: "Image + title + category + desc", rhythm: "Vertical case blocks", visualIdentity: "Agency case studies", imageSlots: ["gallery"], responsiveStrategy: "Full-width cards" },
  { id: "editorial-reel", sectionKind: "portfolio", label: "Editorial Reel", description: "Numbered editorial project list.", composition: "editorial", hierarchy: "Index numbers + titles", rhythm: "Editorial index", visualIdentity: "Magazine index", imageSlots: ["gallery"], responsiveStrategy: "List stacks" },
  { id: "filter-grid", sectionKind: "portfolio", label: "Filter Grid", description: "Category filter chips above grid.", composition: "grid", hierarchy: "Filters + filtered grid", rhythm: "Filter then grid", visualIdentity: "Curated collection", imageSlots: ["gallery"], responsiveStrategy: "Filter wraps" },
  { id: "full-bleed-showcase", sectionKind: "portfolio", label: "Full Bleed Showcase", description: "Edge-to-edge alternating showcases.", composition: "immersive", hierarchy: "Full-bleed image bands", rhythm: "Alternating bands", visualIdentity: "Immersive gallery", imageSlots: ["gallery"], responsiveStrategy: "Full width images" },
  { id: "split-feature", sectionKind: "portfolio", label: "Split Feature", description: "Featured project split with list.", composition: "split", hierarchy: "Large feature + compact list", rhythm: "1:1 split", visualIdentity: "Featured work", imageSlots: ["gallery"], responsiveStrategy: "Feature first" },
  { id: "minimal-index", sectionKind: "portfolio", label: "Minimal Index", description: "Text-only project index with hover reveal.", composition: "minimal", hierarchy: "Title list with categories", rhythm: "Tight index lines", visualIdentity: "Swiss index", imageSlots: [], responsiveStrategy: "Full-width lines" },
];

export const PORTFOLIO_DEFAULT_VARIANT: PortfolioVariantId = "masonry-grid";

function PortfolioMasonryGrid(p: PortfolioContent) {
  const id = p.id ?? "portfolio";
  const items = p.items ?? DEFAULT_ITEMS;
  const heights = ["aspect-[4/5]", "aspect-square", "aspect-[3/4]", "aspect-[5/4]"];
  return (
    <SectionVariantShell sectionKind="portfolio" variantId="masonry-grid" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} df-section-alt`}>
      <div className={p.ui.container}>
        <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title ?? "Selected work"} subtitle={p.subtitle} />
        <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {items.map((item, i) => (
            <figure key={item.title} className={`${p.ui.card} mb-4 break-inside-avoid overflow-hidden`}>
              <SlotImage slot="gallery" index={i} preferred={item.imageUrl} alt={item.title} className={`${heights[i % heights.length]} w-full object-cover`} />
              <figcaption className="p-4">
                <p className={`${p.ui.eyebrow} text-[0.6rem]`}>{item.category}</p>
                <h3 className={`${p.ui.fontBody} font-semibold`}>{item.title}</h3>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </SectionVariantShell>
  );
}

function PortfolioCarouselStrip(p: PortfolioContent) {
  const id = p.id ?? "portfolio";
  const items = p.items ?? DEFAULT_ITEMS;
  return (
    <SectionVariantShell sectionKind="portfolio" variantId="carousel-strip" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section}`}>
      <div className={p.ui.container}>
        <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} />
        <div className="-mx-4 mt-8 flex gap-4 overflow-x-auto px-4 pb-4 snap-x">
          {items.map((item, i) => (
            <figure key={item.title} className={`${p.ui.card} min-w-[18rem] flex-shrink-0 snap-start overflow-hidden sm:min-w-[22rem]`}>
              <SlotImage slot="gallery" index={i} preferred={item.imageUrl} alt={item.title} className="aspect-[16/10] w-full object-cover" />
              <figcaption className="p-4"><h3 className="font-semibold">{item.title}</h3></figcaption>
            </figure>
          ))}
        </div>
      </div>
    </SectionVariantShell>
  );
}

function PortfolioCaseStudies(p: PortfolioContent) {
  const id = p.id ?? "portfolio";
  const items = p.items ?? DEFAULT_ITEMS.slice(0, 4);
  return (
    <SectionVariantShell sectionKind="portfolio" variantId="case-studies" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} df-section-alt`}>
      <div className={p.ui.container}>
        <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} />
        <div className="mt-12 space-y-16">
          {items.map((item, i) => (
            <article key={item.title} className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <SlotImage slot="gallery" index={i} preferred={item.imageUrl} alt={item.title} className={`${p.ui.card} aspect-[4/3] w-full object-cover`} />
              <div>
                <p className={p.ui.eyebrow}>{item.category}</p>
                <h3 className={`${p.ui.headlineSm} mt-2`}>{item.title}</h3>
                <p className={`${p.ui.body} mt-4`}>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </SectionVariantShell>
  );
}

function PortfolioEditorialReel(p: PortfolioContent) {
  const id = p.id ?? "portfolio";
  const items = p.items ?? DEFAULT_ITEMS;
  return (
    <SectionVariantShell sectionKind="portfolio" variantId="editorial-reel" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section}`}>
      <div className={`${p.ui.container} max-w-3xl`}>
        <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} />
        <ol className="mt-10 divide-y divide-[var(--border-subtle)]">
          {items.map((item, i) => (
            <li key={item.title} className="flex items-baseline gap-6 py-5">
              <span className={`${p.ui.metric} text-[var(--color-accent)]`}>{String(i + 1).padStart(2, "0")}</span>
              <div className="flex-1">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-[var(--color-muted)]">{item.category}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </SectionVariantShell>
  );
}

function PortfolioFilterGrid(p: PortfolioContent) {
  const id = p.id ?? "portfolio";
  const items = p.items ?? DEFAULT_ITEMS;
  const cats = [...new Set(items.map((i) => i.category).filter(Boolean))] as string[];
  return (
    <SectionVariantShell sectionKind="portfolio" variantId="filter-grid" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} df-section-alt`}>
      <div className={p.ui.container}>
        <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} align="center" />
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {cats.map((cat) => <span key={cat} className={`${p.ui.card} px-4 py-2 text-xs font-medium`}>{cat}</span>)}
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <figure key={item.title} className={`${p.ui.card} overflow-hidden`}>
              <SlotImage slot="gallery" index={i} preferred={item.imageUrl} alt={item.title} className="aspect-square w-full object-cover" />
              <figcaption className="p-4"><h3 className="text-sm font-semibold">{item.title}</h3></figcaption>
            </figure>
          ))}
        </div>
      </div>
    </SectionVariantShell>
  );
}

function PortfolioFullBleedShowcase(p: PortfolioContent) {
  const id = p.id ?? "portfolio";
  const items = p.items ?? DEFAULT_ITEMS.slice(0, 3);
  return (
    <SectionVariantShell sectionKind="portfolio" variantId="full-bleed-showcase" componentId={p.componentId} id={id} title={p.title} className="space-y-1">
      {items.map((item, i) => (
        <figure key={item.title} className="relative">
          <SlotImage slot="gallery" index={i} preferred={item.imageUrl} alt={item.title} className="aspect-[21/9] w-full object-cover" />
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-8 text-white">
            <p className="text-xs uppercase tracking-widest opacity-80">{item.category}</p>
            <h3 className={`${p.ui.headlineSm} mt-1 text-white`}>{item.title}</h3>
          </figcaption>
        </figure>
      ))}
    </SectionVariantShell>
  );
}

function PortfolioSplitFeature(p: PortfolioContent) {
  const id = p.id ?? "portfolio";
  const items = p.items ?? DEFAULT_ITEMS;
  const [featured, ...rest] = items;
  return (
    <SectionVariantShell sectionKind="portfolio" variantId="split-feature" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section}`}>
      <div className={p.ui.container}>
        <div className="grid gap-8 lg:grid-cols-2">
          <figure className={`${p.ui.card} overflow-hidden`}>
            <SlotImage slot="gallery" preferred={featured?.imageUrl} alt={featured?.title ?? ""} className="aspect-[4/3] w-full object-cover" />
            <figcaption className="p-6">
              <h3 className={p.ui.headlineSm}>{featured?.title}</h3>
              <p className={`${p.ui.body} mt-2`}>{featured?.description}</p>
            </figcaption>
          </figure>
          <ul className="space-y-3" role="list">
            {rest.map((item, i) => (
              <li key={item.title} className={`${p.ui.card} flex items-center gap-4 p-4`}>
                <SlotImage slot="gallery" index={i + 1} preferred={item.imageUrl} alt="" className="h-14 w-14 rounded object-cover" />
                <div><h3 className="text-sm font-semibold">{item.title}</h3><p className="text-xs text-[var(--color-muted)]">{item.category}</p></div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionVariantShell>
  );
}

function PortfolioMinimalIndex(p: PortfolioContent) {
  const id = p.id ?? "portfolio";
  const items = p.items ?? DEFAULT_ITEMS;
  return (
    <SectionVariantShell sectionKind="portfolio" variantId="minimal-index" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} df-section-alt`}>
      <div className={`${p.ui.container} max-w-2xl`}>
        <h2 id={`${id}-title`} className={p.ui.headlineSm}>{p.title ?? "Work"}</h2>
        <ul className="mt-10 divide-y divide-[var(--border-subtle)]" role="list">
          {items.map((item) => (
            <li key={item.title} className="flex items-center justify-between py-5 transition-colors hover:text-[var(--color-accent)]">
              <span className="text-lg font-medium">{item.title}</span>
              <span className={`${p.ui.eyebrow} text-[0.6rem]`}>{item.category}</span>
            </li>
          ))}
        </ul>
      </div>
    </SectionVariantShell>
  );
}

const PORTFOLIO_RENDERERS: Record<PortfolioVariantId, (p: PortfolioContent) => React.JSX.Element> = {
  "masonry-grid": PortfolioMasonryGrid,
  "carousel-strip": PortfolioCarouselStrip,
  "case-studies": PortfolioCaseStudies,
  "editorial-reel": PortfolioEditorialReel,
  "filter-grid": PortfolioFilterGrid,
  "full-bleed-showcase": PortfolioFullBleedShowcase,
  "split-feature": PortfolioSplitFeature,
  "minimal-index": PortfolioMinimalIndex,
};

export function renderPortfolioVariant(variantId: PortfolioVariantId, props: PortfolioContent) {
  return PORTFOLIO_RENDERERS[variantId](props);
}
