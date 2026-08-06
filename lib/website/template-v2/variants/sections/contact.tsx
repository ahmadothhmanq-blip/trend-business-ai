"use client";

import { useId, useState } from "react";
import type { ContactContent } from "@/lib/website/template-v2/variants/content-types";
import { SectionVariantShell } from "@/lib/website/template-v2/variants/shell";
import { VariantHeader } from "@/lib/website/template-v2/variants/sections/_shared";
import type { ContactVariantId, VariantDefinition } from "@/lib/website/template-v2/variants/types";

export const CONTACT_VARIANT_REGISTRY: VariantDefinition<"contact">[] = [
  { id: "split-form", sectionKind: "contact", label: "Split Form", description: "Contact info left, form right.", composition: "split", hierarchy: "Info + form split", rhythm: "50/50 split", visualIdentity: "Professional contact", imageSlots: [], responsiveStrategy: "Stack form below", isDefault: true },
  { id: "centered-minimal", sectionKind: "contact", label: "Centered Minimal", description: "Centered minimal contact form.", composition: "centered", hierarchy: "Centered narrow form", rhythm: "Focused center", visualIdentity: "Minimal contact", imageSlots: [], responsiveStrategy: "Narrow centered" },
  { id: "map-sidebar", sectionKind: "contact", label: "Map Sidebar", description: "Map placeholder with sidebar form.", composition: "split", hierarchy: "Map + sidebar", rhythm: "Visual + form", visualIdentity: "Location-forward", imageSlots: ["backgrounds"], responsiveStrategy: "Map above form" },
  { id: "cards-grid", sectionKind: "contact", label: "Cards Grid", description: "Contact method cards + form below.", composition: "grid", hierarchy: "3 cards + form", rhythm: "Cards then form", visualIdentity: "Multi-channel", imageSlots: [], responsiveStrategy: "Cards stack" },
  { id: "stacked-inline", sectionKind: "contact", label: "Stacked Inline", description: "Inline horizontal form fields.", composition: "inline", hierarchy: "Single-row inline form", rhythm: "Compact inline", visualIdentity: "Quick contact", imageSlots: [], responsiveStrategy: "Fields stack" },
  { id: "dark-panel", sectionKind: "contact", label: "Dark Panel", description: "Dark panel with light form.", composition: "centered", hierarchy: "Dark container focal", rhythm: "Contained dark panel", visualIdentity: "Premium dark", imageSlots: [], responsiveStrategy: "Panel full-width mobile" },
];

export const CONTACT_DEFAULT_VARIANT: ContactVariantId = "split-form";

function ContactFormFields({ ui, formId, submitLabel, onSubmit }: { ui: ContactContent["ui"]; formId: string; submitLabel: string; onSubmit: () => void }) {
  return (
    <div className="df-form-group">
      <div className="df-field">
        <label htmlFor={`${formId}-name`} className="df-label">Name</label>
        <input id={`${formId}-name`} name="name" type="text" required autoComplete="name" className={`df-input ${ui.focusRing}`} />
      </div>
      <div className="df-field">
        <label htmlFor={`${formId}-email`} className="df-label">Email</label>
        <input id={`${formId}-email`} name="email" type="email" required autoComplete="email" className={`df-input ${ui.focusRing}`} />
      </div>
      <div className="df-field">
        <label htmlFor={`${formId}-message`} className="df-label">Message</label>
        <textarea id={`${formId}-message`} name="message" rows={4} required className={`df-textarea ${ui.focusRing}`} />
      </div>
      <button type="submit" className={`${ui.btnPrimary} ${ui.focusRing}`}>{submitLabel}</button>
    </div>
  );
}

function ContactSplitForm(p: ContactContent) {
  const id = p.id ?? "contact";
  const formId = useId();
  const [submitted, setSubmitted] = useState(false);
  return (
    <SectionVariantShell sectionKind="contact" variantId="split-form" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} df-section-glow`}>
      <div className={p.ui.container}>
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title ?? "Contact us"} subtitle={p.subtitle} className="mb-0" />
            <address className={`${p.ui.fontBody} mt-8 space-y-3 text-sm not-italic`}>
              <p><strong>Email:</strong> <a href={`mailto:${p.email}`}>{p.email ?? "hello@company.com"}</a></p>
              <p><strong>Phone:</strong> {p.phone ?? "+1 (555) 123-4567"}</p>
              <p><strong>Office:</strong> {p.address ?? "100 Market Street"}</p>
            </address>
          </div>
          <form className={`${p.ui.card} p-6 sm:p-8`} onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} noValidate>
            {submitted ? <p className={p.ui.body} role="status">Thank you — we&apos;ll be in touch shortly.</p> : <ContactFormFields ui={p.ui} formId={formId} submitLabel={p.submitLabel ?? "Send message"} onSubmit={() => setSubmitted(true)} />}
          </form>
        </div>
      </div>
    </SectionVariantShell>
  );
}

function ContactCenteredMinimal(p: ContactContent) {
  const id = p.id ?? "contact";
  const formId = useId();
  return (
    <SectionVariantShell sectionKind="contact" variantId="centered-minimal" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} df-section-alt`}>
      <div className={`${p.ui.container} mx-auto max-w-md`}>
        <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} align="center" />
        <form className="mt-8" onSubmit={(e) => e.preventDefault()} noValidate>
          <ContactFormFields ui={p.ui} formId={formId} submitLabel={p.submitLabel ?? "Send"} onSubmit={() => {}} />
        </form>
      </div>
    </SectionVariantShell>
  );
}

function ContactMapSidebar(p: ContactContent) {
  const id = p.id ?? "contact";
  const formId = useId();
  return (
    <SectionVariantShell sectionKind="contact" variantId="map-sidebar" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section}`}>
      <div className={`${p.ui.container} grid gap-0 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] lg:grid-cols-[1.2fr_0.8fr]`}>
        <div className="min-h-[16rem] bg-[color-mix(in_srgb,var(--color-primary)_12%,var(--color-surface))] p-8" aria-label="Map placeholder">
          <p className={`${p.ui.eyebrow}`}>Visit us</p>
          <p className={`${p.ui.fontBody} mt-2 text-sm`}>{p.address}</p>
        </div>
        <form className="bg-[var(--color-surface)] p-8" onSubmit={(e) => e.preventDefault()} noValidate>
          <h2 id={`${id}-title`} className={`${p.ui.headlineSm} text-xl`}>{p.title ?? "Get in touch"}</h2>
          <div className="mt-6"><ContactFormFields ui={p.ui} formId={formId} submitLabel={p.submitLabel ?? "Send"} onSubmit={() => {}} /></div>
        </form>
      </div>
    </SectionVariantShell>
  );
}

function ContactCardsGrid(p: ContactContent) {
  const id = p.id ?? "contact";
  const formId = useId();
  const channels = [
    { label: "Email", value: p.email ?? "hello@company.com", href: `mailto:${p.email ?? "hello@company.com"}` },
    { label: "Phone", value: p.phone ?? "+1 (555) 123-4567", href: `tel:${(p.phone ?? "").replace(/\s/g, "")}` },
    { label: "Office", value: p.address ?? "100 Market St", href: undefined },
  ];
  return (
    <SectionVariantShell sectionKind="contact" variantId="cards-grid" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} df-section-alt`}>
      <div className={p.ui.container}>
        <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} align="center" />
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {channels.map((ch) => (
            <div key={ch.label} className={`${p.ui.card} p-5 text-center`}>
              <p className={`${p.ui.eyebrow} text-[0.6rem]`}>{ch.label}</p>
              {ch.href ? <a href={ch.href} className={`${p.ui.fontBody} mt-2 block text-sm`}>{ch.value}</a> : <p className="mt-2 text-sm">{ch.value}</p>}
            </div>
          ))}
        </div>
        <form className={`${p.ui.card} mx-auto mt-8 max-w-xl p-6`} onSubmit={(e) => e.preventDefault()} noValidate>
          <ContactFormFields ui={p.ui} formId={formId} submitLabel={p.submitLabel ?? "Send message"} onSubmit={() => {}} />
        </form>
      </div>
    </SectionVariantShell>
  );
}

function ContactStackedInline(p: ContactContent) {
  const id = p.id ?? "contact";
  const formId = useId();
  return (
    <SectionVariantShell sectionKind="contact" variantId="stacked-inline" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section}`}>
      <div className={p.ui.container}>
        <h2 id={`${id}-title`} className={p.ui.headlineSm}>{p.title ?? "Quick message"}</h2>
        <form className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-end" onSubmit={(e) => e.preventDefault()} noValidate>
          <input id={`${formId}-name`} name="name" type="text" placeholder="Name" className={`df-input flex-1 ${p.ui.focusRing}`} aria-label="Name" />
          <input id={`${formId}-email`} name="email" type="email" placeholder="Email" className={`df-input flex-1 ${p.ui.focusRing}`} aria-label="Email" />
          <button type="submit" className={`${p.ui.btnPrimary} ${p.ui.focusRing} shrink-0`}>{p.submitLabel ?? "Send"}</button>
        </form>
      </div>
    </SectionVariantShell>
  );
}

function ContactDarkPanel(p: ContactContent) {
  const id = p.id ?? "contact";
  const formId = useId();
  return (
    <SectionVariantShell sectionKind="contact" variantId="dark-panel" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section}`}>
      <div className={p.ui.container}>
        <div className={`${p.ui.card} df-card-featured mx-auto max-w-2xl p-10`}>
          <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} align="center" className="mb-0 [&_*]:text-white" />
          <form className="mt-8" onSubmit={(e) => e.preventDefault()} noValidate>
            <ContactFormFields ui={p.ui} formId={formId} submitLabel={p.submitLabel ?? "Send message"} onSubmit={() => {}} />
          </form>
        </div>
      </div>
    </SectionVariantShell>
  );
}

const CONTACT_RENDERERS: Record<ContactVariantId, (p: ContactContent) => React.JSX.Element> = {
  "split-form": ContactSplitForm,
  "centered-minimal": ContactCenteredMinimal,
  "map-sidebar": ContactMapSidebar,
  "cards-grid": ContactCardsGrid,
  "stacked-inline": ContactStackedInline,
  "dark-panel": ContactDarkPanel,
};

export function renderContactVariant(variantId: ContactVariantId, props: ContactContent) {
  return CONTACT_RENDERERS[variantId](props);
}
