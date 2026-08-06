"use client";

import { useState } from "react";
import { SlotImage } from "@/lib/website/template-v2/slots";
import type { ServicesContent } from "@/lib/website/template-v2/variants/content-types";
import { SectionVariantShell } from "@/lib/website/template-v2/variants/shell";
import { VariantCtaRow, VariantHeader } from "@/lib/website/template-v2/variants/sections/_shared";
import type { ServicesVariantId, VariantDefinition } from "@/lib/website/template-v2/variants/types";

const DEFAULT_SERVICES = [
  { title: "Strategy consulting", description: "Board-level advisory for transformation.", icon: "◆", price: "From $5k" },
  { title: "Implementation", description: "End-to-end deployment with your team.", icon: "◇", price: "Custom" },
  { title: "Managed services", description: "Ongoing optimization and support.", icon: "○", price: "Monthly" },
  { title: "Training", description: "Upskill your organization at scale.", icon: "△", price: "Per seat" },
];

export const SERVICES_VARIANT_REGISTRY: VariantDefinition<"services">[] = [
  { id: "card-grid", sectionKind: "services", label: "Card Grid", description: "Uniform service cards in responsive grid.", composition: "grid", hierarchy: "Equal service cards", rhythm: "Even grid spacing", visualIdentity: "Professional catalog", imageSlots: [], responsiveStrategy: "2-col mobile, 4-col desktop", isDefault: true },
  { id: "tabbed-list", sectionKind: "services", label: "Tabbed List", description: "Category tabs with filtered service list.", composition: "inline", hierarchy: "Tabs → list panel", rhythm: "Tab switch rhythm", visualIdentity: "Organized catalog", imageSlots: [], responsiveStrategy: "Scrollable tabs on mobile" },
  { id: "process-rail", sectionKind: "services", label: "Process Rail", description: "Horizontal process steps with connectors.", composition: "rail", hierarchy: "Step nodes connected", rhythm: "Linear process flow", visualIdentity: "Journey map", imageSlots: [], responsiveStrategy: "Vertical steps on mobile" },
  { id: "pricing-teaser", sectionKind: "services", label: "Pricing Teaser", description: "Service cards with price hints.", composition: "grid", hierarchy: "Title + price badge", rhythm: "Price-forward cards", visualIdentity: "Commercial clarity", imageSlots: [], responsiveStrategy: "Stack cards" },
  { id: "icon-rows", sectionKind: "services", label: "Icon Rows", description: "Full-width rows with icon, title, description.", composition: "stacked", hierarchy: "Row list with icons", rhythm: "Consistent row height", visualIdentity: "Clean service list", imageSlots: [], responsiveStrategy: "Rows stack naturally" },
  { id: "featured-spotlight", sectionKind: "services", label: "Featured Spotlight", description: "One hero service + supporting grid.", composition: "asymmetric", hierarchy: "Featured + grid", rhythm: "1 large + 3 small", visualIdentity: "Signature service", imageSlots: ["features"], responsiveStrategy: "Featured first on mobile" },
  { id: "category-columns", sectionKind: "services", label: "Category Columns", description: "Multi-column grouped by category.", composition: "grid", hierarchy: "Category headers + items", rhythm: "Column groups", visualIdentity: "Structured menu", imageSlots: [], responsiveStrategy: "Columns stack" },
  { id: "minimal-list", sectionKind: "services", label: "Minimal List", description: "Borderless minimal text list.", composition: "minimal", hierarchy: "Title + dash + description", rhythm: "Tight list rhythm", visualIdentity: "Understated luxury", imageSlots: [], responsiveStrategy: "Full-width list" },
];

export const SERVICES_DEFAULT_VARIANT: ServicesVariantId = "card-grid";

function ServicesCardGrid(p: ServicesContent) {
  const id = p.id ?? "services";
  const items = p.items ?? DEFAULT_SERVICES;
  return (
    <SectionVariantShell sectionKind="services" variantId="card-grid" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} df-section-alt`}>
      <div className={p.ui.container}>
        <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title ?? "Our services"} subtitle={p.subtitle} align="center" />
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" role="list">
          {items.map((item) => (
            <li key={item.title} className={`${p.ui.card} p-6`}>
              <span aria-hidden className="text-[var(--color-accent)]">{item.icon}</span>
              <h3 className={`${p.ui.fontBody} mt-4 font-semibold`}>{item.title}</h3>
              <p className={`${p.ui.fontBody} mt-2 text-sm text-[var(--color-muted)]`}>{item.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </SectionVariantShell>
  );
}

function ServicesTabbedList(p: ServicesContent) {
  const id = p.id ?? "services";
  const categories = p.categories ?? [{ name: "Advisory", items: DEFAULT_SERVICES.slice(0, 2) }, { name: "Delivery", items: DEFAULT_SERVICES.slice(2) }];
  const [active, setActive] = useState(0);
  return (
    <SectionVariantShell sectionKind="services" variantId="tabbed-list" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section}`}>
      <div className={p.ui.container}>
        <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} />
        <div className="mt-8 flex gap-2 overflow-x-auto border-b border-[var(--border-subtle)]" role="tablist">
          {categories.map((cat, i) => (
            <button key={cat.name} role="tab" aria-selected={active === i} onClick={() => setActive(i)} className={`${p.ui.fontBody} shrink-0 border-b-2 px-4 py-3 text-sm font-medium ${active === i ? "border-[var(--color-accent)] text-[var(--color-foreground)]" : "border-transparent text-[var(--color-muted)]"}`}>
              {cat.name}
            </button>
          ))}
        </div>
        <ul className="mt-6 space-y-4" role="list">
          {categories[active]?.items.map((item) => (
            <li key={item.title} className={`${p.ui.card} flex justify-between gap-4 p-5`}>
              <div><h3 className="font-semibold">{item.title}</h3><p className="text-sm text-[var(--color-muted)]">{item.description}</p></div>
            </li>
          ))}
        </ul>
      </div>
    </SectionVariantShell>
  );
}

function ServicesProcessRail(p: ServicesContent) {
  const id = p.id ?? "services";
  const items = p.items ?? DEFAULT_SERVICES;
  return (
    <SectionVariantShell sectionKind="services" variantId="process-rail" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} df-section-alt`}>
      <div className={p.ui.container}>
        <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} align="center" />
        <ol className="mt-12 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          {items.map((item, i) => (
            <li key={item.title} className="relative flex-1 text-center">
              {i < items.length - 1 ? <span className="absolute end-0 top-5 hidden h-px w-full bg-[var(--border-subtle)] md:block" aria-hidden /> : null}
              <span className={`${p.ui.metric} inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent)] text-sm text-white`}>{i + 1}</span>
              <h3 className={`${p.ui.fontBody} mt-4 font-semibold`}>{item.title}</h3>
              <p className={`${p.ui.fontBody} mt-2 text-sm text-[var(--color-muted)]`}>{item.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </SectionVariantShell>
  );
}

function ServicesPricingTeaser(p: ServicesContent) {
  const id = p.id ?? "services";
  const items = p.items ?? DEFAULT_SERVICES;
  return (
    <SectionVariantShell sectionKind="services" variantId="pricing-teaser" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section}`}>
      <div className={p.ui.container}>
        <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} />
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.title} className={`${p.ui.card} flex items-start justify-between gap-4 p-6`}>
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-[var(--color-muted)]">{item.description}</p>
              </div>
              <span className={`${p.ui.eyebrow} shrink-0`}>{item.price}</span>
            </div>
          ))}
        </div>
      </div>
    </SectionVariantShell>
  );
}

function ServicesIconRows(p: ServicesContent) {
  const id = p.id ?? "services";
  const items = p.items ?? DEFAULT_SERVICES;
  return (
    <SectionVariantShell sectionKind="services" variantId="icon-rows" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} df-section-alt`}>
      <div className={`${p.ui.container} max-w-3xl`}>
        <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} />
        <ul className="mt-8 divide-y divide-[var(--border-subtle)]" role="list">
          {items.map((item) => (
            <li key={item.title} className="flex gap-5 py-6">
              <span className="text-2xl text-[var(--color-accent)]" aria-hidden>{item.icon}</span>
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-[var(--color-muted)]">{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </SectionVariantShell>
  );
}

function ServicesFeaturedSpotlight(p: ServicesContent) {
  const id = p.id ?? "services";
  const items = p.items ?? DEFAULT_SERVICES;
  const [featured, ...rest] = items;
  return (
    <SectionVariantShell sectionKind="services" variantId="featured-spotlight" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section}`}>
      <div className={p.ui.container}>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className={`${p.ui.card} df-card-featured overflow-hidden`}>
            <SlotImage slot="features" alt="" className="aspect-video w-full object-cover opacity-60" />
            <div className="p-8">
              <h3 className={p.ui.headlineSm}>{featured?.title}</h3>
              <p className={`${p.ui.body} mt-3 text-white/85`}>{featured?.description}</p>
              <VariantCtaRow ui={p.ui} primary="Learn more" className="mt-6" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {rest.map((item) => (
              <div key={item.title} className={`${p.ui.card} p-5`}>
                <h3 className="text-sm font-semibold">{item.title}</h3>
                <p className="mt-1 text-xs text-[var(--color-muted)]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionVariantShell>
  );
}

function ServicesCategoryColumns(p: ServicesContent) {
  const id = p.id ?? "services";
  const categories = p.categories ?? [{ name: "Consulting", items: DEFAULT_SERVICES.slice(0, 2) }, { name: "Operations", items: DEFAULT_SERVICES.slice(2) }];
  return (
    <SectionVariantShell sectionKind="services" variantId="category-columns" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} df-section-alt`}>
      <div className={p.ui.container}>
        <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} align="center" />
        <div className="mt-12 grid gap-10 md:grid-cols-2">
          {categories.map((cat) => (
            <div key={cat.name}>
              <h3 className={`${p.ui.eyebrow} mb-4`}>{cat.name}</h3>
              <ul className="space-y-3" role="list">
                {cat.items.map((item) => (
                  <li key={item.title} className="border-b border-[var(--border-subtle)] pb-3">
                    <span className="font-medium">{item.title}</span>
                    <p className="text-sm text-[var(--color-muted)]">{item.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </SectionVariantShell>
  );
}

function ServicesMinimalList(p: ServicesContent) {
  const id = p.id ?? "services";
  const items = p.items ?? DEFAULT_SERVICES;
  return (
    <SectionVariantShell sectionKind="services" variantId="minimal-list" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section}`}>
      <div className={`${p.ui.container} max-w-2xl`}>
        <h2 id={`${id}-title`} className={p.ui.headlineSm}>{p.title ?? "Services"}</h2>
        <ul className="mt-10 space-y-6" role="list">
          {items.map((item) => (
            <li key={item.title} className="flex items-baseline justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
              <span className="font-medium">{item.title}</span>
              <span className="text-sm text-[var(--color-muted)]">{item.description}</span>
            </li>
          ))}
        </ul>
      </div>
    </SectionVariantShell>
  );
}

const SERVICES_RENDERERS: Record<ServicesVariantId, (p: ServicesContent) => React.JSX.Element> = {
  "card-grid": ServicesCardGrid,
  "tabbed-list": ServicesTabbedList,
  "process-rail": ServicesProcessRail,
  "pricing-teaser": ServicesPricingTeaser,
  "icon-rows": ServicesIconRows,
  "featured-spotlight": ServicesFeaturedSpotlight,
  "category-columns": ServicesCategoryColumns,
  "minimal-list": ServicesMinimalList,
};

export function renderServicesVariant(variantId: ServicesVariantId, props: ServicesContent) {
  return SERVICES_RENDERERS[variantId](props);
}
