"use client";

import type { FooterContent } from "@/lib/website/template-v2/variants/content-types";
import { SectionVariantShell } from "@/lib/website/template-v2/variants/shell";
import type { FooterVariantId, VariantDefinition } from "@/lib/website/template-v2/variants/types";

const DEFAULT_COLUMNS = [
  { title: "Product", links: [{ label: "Features", href: "#features" }, { label: "Pricing", href: "#pricing" }, { label: "FAQ", href: "#faq" }] },
  { title: "Company", links: [{ label: "About", href: "#about" }, { label: "Contact", href: "#contact" }, { label: "Careers", href: "#" }] },
  { title: "Legal", links: [{ label: "Privacy", href: "#" }, { label: "Terms", href: "#" }] },
];

export const FOOTER_VARIANT_REGISTRY: VariantDefinition<"footer">[] = [
  { id: "four-column", sectionKind: "footer", label: "Four Column", description: "Brand + three link columns.", composition: "grid", hierarchy: "Brand col + 3 link cols", rhythm: "4-column grid", visualIdentity: "Standard footer", imageSlots: [], responsiveStrategy: "Columns stack", isDefault: true },
  { id: "minimal-centered", sectionKind: "footer", label: "Minimal Centered", description: "Centered brand and links.", composition: "centered", hierarchy: "Centered minimal", rhythm: "Compact center", visualIdentity: "Minimal footer", imageSlots: [], responsiveStrategy: "Centered stack" },
  { id: "mega-sitemap", sectionKind: "footer", label: "Mega Sitemap", description: "Large multi-column sitemap.", composition: "grid", hierarchy: "5+ link columns", rhythm: "Dense sitemap", visualIdentity: "Enterprise sitemap", imageSlots: [], responsiveStrategy: "Multi-col to stack" },
  { id: "newsletter-band", sectionKind: "footer", label: "Newsletter Band", description: "Newsletter signup above link columns.", composition: "band", hierarchy: "Newsletter band + links", rhythm: "Band then grid", visualIdentity: "Engagement footer", imageSlots: [], responsiveStrategy: "Band full-width" },
  { id: "compact-inline", sectionKind: "footer", label: "Compact Inline", description: "Single row inline links.", composition: "inline", hierarchy: "One-line footer", rhythm: "Horizontal inline", visualIdentity: "Compact footer", imageSlots: [], responsiveStrategy: "Wrap links" },
];

export const FOOTER_DEFAULT_VARIANT: FooterVariantId = "four-column";

function FooterFourColumn(p: FooterContent) {
  const id = p.id ?? "footer";
  const columns = p.columns ?? DEFAULT_COLUMNS;
  return (
    <SectionVariantShell sectionKind="footer" variantId="four-column" componentId={p.componentId} id={id} className="df-footer">
      <div className={p.ui.container}>
        <div className="df-footer-grid lg:grid-cols-4">
          <div className="df-footer-col">
            <p className={`${p.ui.fontBody} text-lg font-semibold`}>{p.brandName ?? "Brand"}</p>
            {p.tagline ? <p className={`${p.ui.fontBody} mt-2 text-sm text-[var(--color-muted)]`}>{p.tagline}</p> : null}
          </div>
          {columns.map((col) => (
            <nav key={col.title} className="df-footer-col" aria-label={col.title}>
              <p className={`${p.ui.eyebrow} mb-3 text-[0.65rem]`}>{col.title}</p>
              <ul className="space-y-2" role="list">
                {col.links.map((link) => (
                  <li key={link.label}><a href={link.href} className="df-footer-link">{link.label}</a></li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <p className={`${p.ui.fontBody} mt-10 border-t border-[var(--border-subtle)] pt-6 text-xs text-[var(--color-muted)]`}>
          {p.copyright ?? `© ${new Date().getFullYear()} ${p.brandName ?? "Brand"}. All rights reserved.`}
        </p>
      </div>
    </SectionVariantShell>
  );
}

function FooterMinimalCentered(p: FooterContent) {
  const id = p.id ?? "footer";
  const links = p.links ?? [{ label: "Privacy", href: "#" }, { label: "Terms", href: "#" }, { label: "Contact", href: "#contact" }];
  return (
    <SectionVariantShell sectionKind="footer" variantId="minimal-centered" componentId={p.componentId} id={id} className="df-footer">
      <div className={`${p.ui.container} text-center`}>
        <p className={`${p.ui.fontBody} text-lg font-semibold`}>{p.brandName ?? "Brand"}</p>
        {p.tagline ? <p className="mt-2 text-sm text-[var(--color-muted)]">{p.tagline}</p> : null}
        <nav className="mt-6 flex flex-wrap justify-center gap-4" aria-label="Footer">
          {links.map((link) => <a key={link.label} href={link.href} className="df-footer-link">{link.label}</a>)}
        </nav>
        <p className="mt-8 text-xs text-[var(--color-muted)]">{p.copyright ?? `© ${new Date().getFullYear()}`}</p>
      </div>
    </SectionVariantShell>
  );
}

function FooterMegaSitemap(p: FooterContent) {
  const id = p.id ?? "footer";
  const columns = p.columns ?? [...DEFAULT_COLUMNS, { title: "Resources", links: [{ label: "Blog", href: "#" }, { label: "Docs", href: "#" }, { label: "Support", href: "#" }] }, { title: "Social", links: [{ label: "LinkedIn", href: "#" }, { label: "Twitter", href: "#" }] }];
  return (
    <SectionVariantShell sectionKind="footer" variantId="mega-sitemap" componentId={p.componentId} id={id} className="df-footer bg-[var(--color-surface)]">
      <div className={p.ui.container}>
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className={`${p.ui.eyebrow} mb-4 text-[0.65rem]`}>{col.title}</p>
              <ul className="space-y-2" role="list">
                {col.links.map((link) => <li key={link.label}><a href={link.href} className="df-footer-link">{link.label}</a></li>)}
              </ul>
            </nav>
          ))}
        </div>
        <p className="mt-12 text-xs text-[var(--color-muted)]">{p.copyright ?? `© ${new Date().getFullYear()} ${p.brandName ?? "Brand"}`}</p>
      </div>
    </SectionVariantShell>
  );
}

function FooterNewsletterBand(p: FooterContent) {
  const id = p.id ?? "footer";
  const columns = p.columns ?? DEFAULT_COLUMNS;
  return (
    <SectionVariantShell sectionKind="footer" variantId="newsletter-band" componentId={p.componentId} id={id} className="df-footer">
      <div className="border-b border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--color-primary)_5%,var(--color-background))] py-10">
        <div className={`${p.ui.container} flex flex-col items-center justify-between gap-4 md:flex-row`}>
          <p className={`${p.ui.headlineSm} text-xl`}>{p.newsletterLabel ?? "Subscribe to our newsletter"}</p>
          <form className="flex w-full max-w-md gap-2" onSubmit={(e) => e.preventDefault()} noValidate>
            <label htmlFor={`${id}-newsletter`} className="sr-only">Email</label>
            <input id={`${id}-newsletter`} type="email" placeholder="Email address" className={`df-input flex-1 ${p.ui.focusRing}`} />
            <button type="submit" className={`${p.ui.btnPrimary} ${p.ui.focusRing} shrink-0`}>Subscribe</button>
          </form>
        </div>
      </div>
      <div className={p.ui.container}>
        <div className="df-footer-grid pt-10 lg:grid-cols-4">
          <div className="df-footer-col">
            <p className={`${p.ui.fontBody} text-lg font-semibold`}>{p.brandName ?? "Brand"}</p>
          </div>
          {columns.map((col) => (
            <nav key={col.title} className="df-footer-col" aria-label={col.title}>
              <p className={`${p.ui.eyebrow} mb-3 text-[0.65rem]`}>{col.title}</p>
              <ul className="space-y-2" role="list">
                {col.links.map((link) => (
                  <li key={link.label}><a href={link.href} className="df-footer-link">{link.label}</a></li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <p className={`${p.ui.fontBody} mt-10 border-t border-[var(--border-subtle)] pt-6 text-xs text-[var(--color-muted)]`}>
          {p.copyright ?? `© ${new Date().getFullYear()} ${p.brandName ?? "Brand"}. All rights reserved.`}
        </p>
      </div>
    </SectionVariantShell>
  );
}

function FooterCompactInline(p: FooterContent) {
  const id = p.id ?? "footer";
  const links = p.links ?? [{ label: "About", href: "#about" }, { label: "Pricing", href: "#pricing" }, { label: "Contact", href: "#contact" }, { label: "Privacy", href: "#" }];
  return (
    <SectionVariantShell sectionKind="footer" variantId="compact-inline" componentId={p.componentId} id={id} className="border-t border-[var(--border-subtle)] py-6">
      <div className={`${p.ui.container} flex flex-col items-center justify-between gap-4 sm:flex-row`}>
        <p className={`${p.ui.fontBody} text-sm font-semibold`}>{p.brandName ?? "Brand"}</p>
        <nav className="flex flex-wrap gap-4" aria-label="Footer">
          {links.map((link) => <a key={link.label} href={link.href} className="df-footer-link text-xs">{link.label}</a>)}
        </nav>
        <p className="text-xs text-[var(--color-muted)]">{p.copyright ?? `© ${new Date().getFullYear()}`}</p>
      </div>
    </SectionVariantShell>
  );
}

const FOOTER_RENDERERS: Record<FooterVariantId, (p: FooterContent) => React.JSX.Element> = {
  "four-column": FooterFourColumn,
  "minimal-centered": FooterMinimalCentered,
  "mega-sitemap": FooterMegaSitemap,
  "newsletter-band": FooterNewsletterBand,
  "compact-inline": FooterCompactInline,
};

export function renderFooterVariant(variantId: FooterVariantId, props: FooterContent) {
  return FOOTER_RENDERERS[variantId](props);
}
