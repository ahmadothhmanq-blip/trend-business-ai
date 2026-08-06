"use client";

import type { FeaturesContent } from "@/lib/website/template-v2/variants/content-types";
import { SectionVariantShell } from "@/lib/website/template-v2/variants/shell";
import { VariantHeader } from "@/lib/website/template-v2/variants/sections/_shared";
import type { FeaturesVariantId, VariantDefinition } from "@/lib/website/template-v2/variants/types";

const DEFAULT_ITEMS = [
  { title: "Unified workspace", description: "One source of truth for teams, data, and decisions.", icon: "01" },
  { title: "Smart automation", description: "Workflows that adapt to how your business actually operates.", icon: "02" },
  { title: "Enterprise security", description: "SOC 2, SSO, and audit trails built in from day one.", icon: "03" },
  { title: "Real-time insights", description: "Dashboards that surface what matters before you ask.", icon: "04" },
];

export const FEATURES_VARIANT_REGISTRY: VariantDefinition<"features">[] = [
  { id: "icon-grid", sectionKind: "features", label: "Icon Grid", description: "Uniform 3-column icon card grid.", composition: "grid", hierarchy: "Section header, equal cards", rhythm: "Even card spacing", visualIdentity: "Clean capability grid", imageSlots: [], responsiveStrategy: "1→2→3 columns", isDefault: true },
  { id: "bento-mosaic", sectionKind: "features", label: "Bento Mosaic", description: "Asymmetric bento box with featured large cell.", composition: "bento", hierarchy: "Featured cell + supporting tiles", rhythm: "Broken grid rhythm", visualIdentity: "Modern product bento", imageSlots: ["features"], responsiveStrategy: "Stack bento cells" },
  { id: "alternating-rows", sectionKind: "features", label: "Alternating Rows", description: "Zigzag rows alternating copy and visual.", composition: "split", hierarchy: "Row pairs flip direction", rhythm: "Alternating vertical cadence", visualIdentity: "Narrative walkthrough", imageSlots: ["features"], responsiveStrategy: "Always stack image below" },
  { id: "numbered-steps", sectionKind: "features", label: "Numbered Steps", description: "Sequential numbered feature steps.", composition: "stacked", hierarchy: "Large step numbers, title, body", rhythm: "Vertical step sequence", visualIdentity: "Process clarity", imageSlots: [], responsiveStrategy: "Full-width steps" },
  { id: "masonry-cards", sectionKind: "features", label: "Masonry Cards", description: "Varied-height cards in masonry layout.", composition: "mosaic", hierarchy: "Mixed card heights", rhythm: "Organic vertical flow", visualIdentity: "Editorial variety", imageSlots: [], responsiveStrategy: "Single column masonry" },
  { id: "comparison-columns", sectionKind: "features", label: "Comparison Columns", description: "Side-by-side before/after or us/them columns.", composition: "grid", hierarchy: "Two contrasting columns", rhythm: "Parallel comparison", visualIdentity: "Decisive contrast", imageSlots: [], responsiveStrategy: "Stack columns" },
  { id: "sticky-headline", sectionKind: "features", label: "Sticky Headline", description: "Pinned section header with scrolling feature list.", composition: "split", hierarchy: "Sticky left, scroll right", rhythm: "Fixed + flowing", visualIdentity: "Editorial scroll", imageSlots: [], responsiveStrategy: "Header unsticks on mobile" },
  { id: "horizontal-scroll", sectionKind: "features", label: "Horizontal Scroll", description: "Horizontally scrollable feature cards.", composition: "carousel", hierarchy: "Header + card rail", rhythm: "Horizontal snap scroll", visualIdentity: "App-like discovery", imageSlots: [], responsiveStrategy: "Native horizontal scroll" },
  { id: "tiered-lanes", sectionKind: "features", label: "Tiered Lanes", description: "Three horizontal lanes by capability tier.", composition: "grid", hierarchy: "Tier labels with feature lanes", rhythm: "Three-band horizontal", visualIdentity: "Structured tiers", imageSlots: [], responsiveStrategy: "Lanes stack vertically" },
  { id: "spotlight-list", sectionKind: "features", label: "Spotlight List", description: "Single featured item with supporting list.", composition: "asymmetric", hierarchy: "Large spotlight + compact list", rhythm: "1:2 width ratio", visualIdentity: "Hero feature focus", imageSlots: ["features"], responsiveStrategy: "Spotlight full-width first" },
];

export const FEATURES_DEFAULT_VARIANT: FeaturesVariantId = "icon-grid";

function FeaturesIconGrid(p: FeaturesContent) {
  const id = p.id ?? "features";
  const items = p.items ?? DEFAULT_ITEMS;
  return (
    <SectionVariantShell sectionKind="features" variantId="icon-grid" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} df-section-alt`}>
      <div className={p.ui.container}>
        <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title ?? "Everything you need"} subtitle={p.subtitle} align="center" />
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" role="list">
          {items.map((item) => (
            <li key={item.title} className={`${p.ui.card} p-6`}>
              <span className={`${p.ui.fontBody} text-xs font-bold text-[var(--color-accent)]`}>{item.icon ?? "•"}</span>
              <h3 className={`${p.ui.fontBody} mt-4 text-base font-semibold`}>{item.title}</h3>
              <p className={`${p.ui.fontBody} mt-2 text-sm text-[var(--color-muted)]`}>{item.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </SectionVariantShell>
  );
}

function FeaturesBentoMosaic(p: FeaturesContent) {
  const id = p.id ?? "features";
  const items = p.items ?? DEFAULT_ITEMS;
  return (
    <SectionVariantShell sectionKind="features" variantId="bento-mosaic" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} bg-[var(--color-background)]`}>
      <div className={p.ui.container}>
        <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} />
        <div className="mt-10 grid gap-4 md:grid-cols-4 md:grid-rows-2">
          <div className={`${p.ui.card} df-card-featured md:col-span-2 md:row-span-2 p-8`}>
            <h3 className={p.ui.headlineSm}>{items[0]?.title}</h3>
            <p className={`${p.ui.body} mt-4 text-white/85`}>{items[0]?.description}</p>
          </div>
          {items.slice(1).map((item) => (
            <div key={item.title} className={`${p.ui.card} p-5`}>
              <h3 className={`${p.ui.fontBody} font-semibold`}>{item.title}</h3>
              <p className={`${p.ui.fontBody} mt-2 text-sm text-[var(--color-muted)]`}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionVariantShell>
  );
}

function FeaturesAlternatingRows(p: FeaturesContent) {
  const id = p.id ?? "features";
  const items = p.items ?? DEFAULT_ITEMS.slice(0, 3);
  return (
    <SectionVariantShell sectionKind="features" variantId="alternating-rows" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section}`}>
      <div className={p.ui.container}>
        <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} align="center" />
        <div className="mt-14 space-y-20">
          {items.map((item, i) => (
            <div key={item.title} className={`grid items-center gap-10 lg:grid-cols-2 ${i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}>
              <div className={`${p.ui.card} flex aspect-[4/3] items-center justify-center bg-[color-mix(in_srgb,var(--color-accent)_8%,var(--color-surface))]`}>
                <span className={`${p.ui.metric}`}>{item.icon ?? String(i + 1).padStart(2, "0")}</span>
              </div>
              <div>
                <h3 className={p.ui.headlineSm}>{item.title}</h3>
                <p className={`${p.ui.body} mt-4`}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionVariantShell>
  );
}

function FeaturesNumberedSteps(p: FeaturesContent) {
  const id = p.id ?? "features";
  const items = p.items ?? DEFAULT_ITEMS;
  return (
    <SectionVariantShell sectionKind="features" variantId="numbered-steps" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} df-section-alt`}>
      <div className={`${p.ui.container} max-w-3xl`}>
        <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} />
        <ol className="mt-10 space-y-8">
          {items.map((item, i) => (
            <li key={item.title} className="flex gap-6 border-b border-[var(--border-subtle)] pb-8">
              <span className={`${p.ui.metric} text-[var(--color-accent)]`}>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className={`${p.ui.fontBody} text-lg font-semibold`}>{item.title}</h3>
                <p className={`${p.ui.body} mt-2 text-base`}>{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </SectionVariantShell>
  );
}

function FeaturesMasonryCards(p: FeaturesContent) {
  const id = p.id ?? "features";
  const items = p.items ?? DEFAULT_ITEMS;
  const heights = ["min-h-[10rem]", "min-h-[14rem]", "min-h-[12rem]", "min-h-[16rem]"];
  return (
    <SectionVariantShell sectionKind="features" variantId="masonry-cards" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section}`}>
      <div className={p.ui.container}>
        <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} />
        <div className="mt-10 columns-1 gap-5 sm:columns-2">
          {items.map((item, i) => (
            <div key={item.title} className={`${p.ui.card} ${heights[i % heights.length]} mb-5 break-inside-avoid p-6`}>
              <h3 className={`${p.ui.fontBody} font-semibold`}>{item.title}</h3>
              <p className={`${p.ui.fontBody} mt-3 text-sm text-[var(--color-muted)]`}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionVariantShell>
  );
}

function FeaturesComparisonColumns(p: FeaturesContent) {
  const id = p.id ?? "features";
  const items = p.items ?? DEFAULT_ITEMS;
  const mid = Math.ceil(items.length / 2);
  return (
    <SectionVariantShell sectionKind="features" variantId="comparison-columns" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} df-section-alt`}>
      <div className={p.ui.container}>
        <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} align="center" />
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className={`${p.ui.card} border-dashed p-6 opacity-70`}>
            <p className={`${p.ui.eyebrow} mb-4`}>Without us</p>
            <ul className="space-y-3">{items.slice(0, mid).map((i) => <li key={i.title} className="text-sm text-[var(--color-muted)] line-through">{i.title}</li>)}</ul>
          </div>
          <div className={`${p.ui.card} df-card-featured p-6`}>
            <p className={`${p.ui.eyebrow} mb-4 text-white/80`}>With us</p>
            <ul className="space-y-3">{items.slice(mid).map((i) => <li key={i.title} className="text-sm">{i.title} — {i.description}</li>)}</ul>
          </div>
        </div>
      </div>
    </SectionVariantShell>
  );
}

function FeaturesStickyHeadline(p: FeaturesContent) {
  const id = p.id ?? "features";
  const items = p.items ?? DEFAULT_ITEMS;
  return (
    <SectionVariantShell sectionKind="features" variantId="sticky-headline" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section}`}>
      <div className={`${p.ui.container} grid gap-12 lg:grid-cols-[1fr_1.4fr]`}>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} className="mb-0" />
        </div>
        <ul className="space-y-5" role="list">
          {items.map((item) => (
            <li key={item.title} className={`${p.ui.card} p-6`}>
              <h3 className={`${p.ui.fontBody} font-semibold`}>{item.title}</h3>
              <p className={`${p.ui.fontBody} mt-2 text-sm text-[var(--color-muted)]`}>{item.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </SectionVariantShell>
  );
}

function FeaturesHorizontalScroll(p: FeaturesContent) {
  const id = p.id ?? "features";
  const items = p.items ?? DEFAULT_ITEMS;
  return (
    <SectionVariantShell sectionKind="features" variantId="horizontal-scroll" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} df-section-alt`}>
      <div className={p.ui.container}>
        <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} />
        <div className="-mx-4 mt-10 flex gap-4 overflow-x-auto px-4 pb-4 snap-x snap-mandatory">
          {items.map((item) => (
            <div key={item.title} className={`${p.ui.card} min-w-[16rem] flex-shrink-0 snap-start p-6 sm:min-w-[18rem]`}>
              <h3 className={`${p.ui.fontBody} font-semibold`}>{item.title}</h3>
              <p className={`${p.ui.fontBody} mt-2 text-sm text-[var(--color-muted)]`}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionVariantShell>
  );
}

function FeaturesTieredLanes(p: FeaturesContent) {
  const id = p.id ?? "features";
  const items = p.items ?? DEFAULT_ITEMS;
  const tiers = ["Core", "Advanced", "Enterprise"];
  return (
    <SectionVariantShell sectionKind="features" variantId="tiered-lanes" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section}`}>
      <div className={p.ui.container}>
        <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} align="center" />
        <div className="mt-12 space-y-6">
          {tiers.map((tier, ti) => (
            <div key={tier} className="grid gap-4 border-t border-[var(--border-subtle)] pt-6 lg:grid-cols-[8rem_1fr]">
              <p className={`${p.ui.eyebrow}`}>{tier}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {items.filter((_, i) => i % 3 === ti).map((item) => (
                  <div key={item.title} className={`${p.ui.card} p-4`}>
                    <h3 className={`${p.ui.fontBody} text-sm font-semibold`}>{item.title}</h3>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionVariantShell>
  );
}

function FeaturesSpotlightList(p: FeaturesContent) {
  const id = p.id ?? "features";
  const items = p.items ?? DEFAULT_ITEMS;
  const [spotlight, ...rest] = items;
  return (
    <SectionVariantShell sectionKind="features" variantId="spotlight-list" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} df-section-glow`}>
      <div className={p.ui.container}>
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className={`${p.ui.card} df-card-featured p-8 sm:p-10`}>
            <h3 className={p.ui.headlineSm}>{spotlight?.title}</h3>
            <p className={`${p.ui.body} mt-4 text-white/85`}>{spotlight?.description}</p>
          </div>
          <ul className="space-y-3" role="list">
            {rest.map((item) => (
              <li key={item.title} className={`${p.ui.card} flex items-start gap-3 p-4`}>
                <span className="text-[var(--color-accent)]" aria-hidden>→</span>
                <div>
                  <h3 className={`${p.ui.fontBody} text-sm font-semibold`}>{item.title}</h3>
                  <p className={`${p.ui.fontBody} text-xs text-[var(--color-muted)]`}>{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionVariantShell>
  );
}

const FEATURES_RENDERERS: Record<FeaturesVariantId, (p: FeaturesContent) => React.JSX.Element> = {
  "icon-grid": FeaturesIconGrid,
  "bento-mosaic": FeaturesBentoMosaic,
  "alternating-rows": FeaturesAlternatingRows,
  "numbered-steps": FeaturesNumberedSteps,
  "masonry-cards": FeaturesMasonryCards,
  "comparison-columns": FeaturesComparisonColumns,
  "sticky-headline": FeaturesStickyHeadline,
  "horizontal-scroll": FeaturesHorizontalScroll,
  "tiered-lanes": FeaturesTieredLanes,
  "spotlight-list": FeaturesSpotlightList,
};

export function renderFeaturesVariant(variantId: FeaturesVariantId, props: FeaturesContent) {
  return FEATURES_RENDERERS[variantId](props);
}
