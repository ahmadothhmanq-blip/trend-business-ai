"use client";

import { SlotImage } from "@/lib/website/template-v2/slots";
import type { AboutContent } from "@/lib/website/template-v2/variants/content-types";
import { SectionVariantShell } from "@/lib/website/template-v2/variants/shell";
import { VariantCtaRow, VariantHeader, VariantMetricStrip } from "@/lib/website/template-v2/variants/sections/_shared";
import type { AboutVariantId, VariantDefinition } from "@/lib/website/template-v2/variants/types";

export const ABOUT_VARIANT_REGISTRY: VariantDefinition<"about">[] = [
  { id: "split-narrative", sectionKind: "about", label: "Split Narrative", description: "Classic split copy and image with highlights.", composition: "split", hierarchy: "Copy left, image right", rhythm: "Balanced 50/50", visualIdentity: "Trust narrative", imageSlots: ["about"], responsiveStrategy: "Stack on mobile", isDefault: true },
  { id: "overlap-portrait", sectionKind: "about", label: "Overlap Portrait", description: "Portrait image overlapping text block.", composition: "asymmetric", hierarchy: "Overlapping portrait accent", rhythm: "Negative space overlap", visualIdentity: "Editorial portrait", imageSlots: ["about"], responsiveStrategy: "Overlap removes on mobile" },
  { id: "timeline-story", sectionKind: "about", label: "Timeline Story", description: "Vertical timeline of company milestones.", composition: "stacked", hierarchy: "Timeline nodes with dates", rhythm: "Vertical chronology", visualIdentity: "Heritage story", imageSlots: [], responsiveStrategy: "Single column timeline" },
  { id: "mission-pillars", sectionKind: "about", label: "Mission Pillars", description: "Mission statement with three pillar cards.", composition: "grid", hierarchy: "Mission + 3 pillars", rhythm: "Header then 3-up grid", visualIdentity: "Values-driven", imageSlots: [], responsiveStrategy: "Pillars stack" },
  { id: "full-bleed-quote", sectionKind: "about", label: "Full Bleed Quote", description: "Large pull quote over subtle background image.", composition: "immersive", hierarchy: "Quote dominates, attribution below", rhythm: "Cinematic quote block", visualIdentity: "Manifesto moment", imageSlots: ["about", "backgrounds"], responsiveStrategy: "Quote scales with clamp" },
  { id: "editorial-columns", sectionKind: "about", label: "Editorial Columns", description: "Multi-column editorial text layout.", composition: "editorial", hierarchy: "2-3 column prose", rhythm: "Newspaper columns", visualIdentity: "Long-form editorial", imageSlots: [], responsiveStrategy: "Columns collapse to one" },
  { id: "stats-sidebar", sectionKind: "about", label: "Stats Sidebar", description: "Narrative with sticky stats sidebar.", composition: "split", hierarchy: "Copy + stats rail", rhythm: "Sidebar metrics anchor", visualIdentity: "Data-backed story", imageSlots: ["about"], responsiveStrategy: "Stats below copy on mobile" },
  { id: "image-duo", sectionKind: "about", label: "Image Duo", description: "Two offset images framing central copy.", composition: "asymmetric", hierarchy: "Dual images + center text", rhythm: "Triptych composition", visualIdentity: "Gallery framing", imageSlots: ["about", "gallery"], responsiveStrategy: "Images stack above/below" },
];

export const ABOUT_DEFAULT_VARIANT: AboutVariantId = "split-narrative";

function AboutSplitNarrative(p: AboutContent) {
  const id = p.id ?? "about";
  return (
    <SectionVariantShell sectionKind="about" variantId="split-narrative" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} bg-[var(--color-background)]`}>
      <div className={`${p.ui.container} grid items-center gap-12 lg:grid-cols-2`}>
        <div>
          <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} className="mb-0" />
          <p className={`${p.ui.body} mt-6`}>{p.body}</p>
          {p.highlights?.length ? (
            <ul className="mt-6 grid gap-2 sm:grid-cols-2" role="list">
              {p.highlights.map((h) => <li key={h} className={`${p.ui.card} px-3 py-2 text-sm`}>{h}</li>)}
            </ul>
          ) : null}
          {p.primaryCta ? <VariantCtaRow ui={p.ui} primary={p.primaryCta} primaryHref={p.primaryCtaHref} className="mt-8" /> : null}
        </div>
        <SlotImage slot="about" preferred={p.imageUrl} alt="" className={`${p.ui.card} aspect-[4/3] w-full object-cover`} />
      </div>
    </SectionVariantShell>
  );
}

function AboutOverlapPortrait(p: AboutContent) {
  const id = p.id ?? "about";
  return (
    <SectionVariantShell sectionKind="about" variantId="overlap-portrait" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} df-section-alt`}>
      <div className={`${p.ui.container} relative grid gap-8 lg:grid-cols-12`}>
        <div className="lg:col-span-5 lg:col-start-8 lg:row-start-1">
          <SlotImage slot="about" preferred={p.imageUrl} alt="" className={`${p.ui.card} aspect-[3/4] w-full object-cover lg:-mt-12`} />
        </div>
        <div className="lg:col-span-7 lg:row-start-1 lg:pt-16">
          <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} />
          <p className={`${p.ui.body} mt-4`}>{p.body}</p>
        </div>
      </div>
    </SectionVariantShell>
  );
}

function AboutTimelineStory(p: AboutContent) {
  const id = p.id ?? "about";
  const milestones = p.highlights ?? ["Founded with a vision", "Expanded globally", "Industry recognition", "Next chapter"];
  return (
    <SectionVariantShell sectionKind="about" variantId="timeline-story" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section}`}>
      <div className={`${p.ui.container} max-w-2xl`}>
        <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} />
        <ol className="relative mt-10 border-s-2 border-[var(--border-accent)] ps-8">
          {milestones.map((m, i) => (
            <li key={m} className="relative mb-8">
              <span className="absolute -start-[2.35rem] flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-accent)] text-xs font-bold text-white">{i + 1}</span>
              <p className={`${p.ui.fontBody} font-medium`}>{m}</p>
            </li>
          ))}
        </ol>
      </div>
    </SectionVariantShell>
  );
}

function AboutMissionPillars(p: AboutContent) {
  const id = p.id ?? "about";
  const pillars = (p.highlights ?? ["Integrity", "Innovation", "Impact"]).slice(0, 3);
  return (
    <SectionVariantShell sectionKind="about" variantId="mission-pillars" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} df-section-alt`}>
      <div className={p.ui.container}>
        <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle ?? p.body} align="center" />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {pillars.map((pillar) => (
            <div key={pillar} className={`${p.ui.card} p-8 text-center`}>
              <div className="df-accent-line mx-auto mb-6" aria-hidden />
              <h3 className={`${p.ui.headlineSm} text-xl`}>{pillar}</h3>
            </div>
          ))}
        </div>
      </div>
    </SectionVariantShell>
  );
}

function AboutFullBleedQuote(p: AboutContent) {
  const id = p.id ?? "about";
  return (
    <SectionVariantShell sectionKind="about" variantId="full-bleed-quote" componentId={p.componentId} id={id} title={p.title} className="relative min-h-[28rem]">
      <SlotImage slot="backgrounds" preferred={p.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" containerClassName="absolute inset-0" />
      <div className={`${p.ui.container} relative flex min-h-[28rem] flex-col justify-center py-20 text-center`}>
        <blockquote className={`${p.ui.headline} mx-auto max-w-4xl`}>
          <p id={`${id}-title`}>&ldquo;{p.quote ?? p.body ?? p.title}&rdquo;</p>
        </blockquote>
        {p.eyebrow ? <cite className={`${p.ui.eyebrow} mt-8 not-italic`}>{p.eyebrow}</cite> : null}
      </div>
    </SectionVariantShell>
  );
}

function AboutEditorialColumns(p: AboutContent) {
  const id = p.id ?? "about";
  const paragraphs = (p.body ?? "").split(". ").filter(Boolean);
  return (
    <SectionVariantShell sectionKind="about" variantId="editorial-columns" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section}`}>
      <div className={p.ui.container}>
        <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} />
        <div className="mt-8 columns-1 gap-8 text-[var(--color-muted)] md:columns-2 lg:columns-3">
          {paragraphs.map((para) => <p key={para} className={`${p.ui.body} mb-4 break-inside-avoid`}>{para}.</p>)}
        </div>
      </div>
    </SectionVariantShell>
  );
}

function AboutStatsSidebar(p: AboutContent) {
  const id = p.id ?? "about";
  const stats = p.stats ?? [{ value: "25+", label: "Years" }, { value: "500+", label: "Clients" }, { value: "40", label: "Countries" }];
  return (
    <SectionVariantShell sectionKind="about" variantId="stats-sidebar" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section} df-section-alt`}>
      <div className={`${p.ui.container} grid gap-12 lg:grid-cols-[1fr_16rem]`}>
        <div>
          <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} className="mb-0" />
          <p className={`${p.ui.body} mt-4`}>{p.body}</p>
        </div>
        <VariantMetricStrip ui={p.ui} metrics={stats} className="lg:sticky lg:top-24" />
      </div>
    </SectionVariantShell>
  );
}

function AboutImageDuo(p: AboutContent) {
  const id = p.id ?? "about";
  return (
    <SectionVariantShell sectionKind="about" variantId="image-duo" componentId={p.componentId} id={id} title={p.title} className={`${p.ui.section}`}>
      <div className={p.ui.container}>
        <div className="grid items-center gap-8 lg:grid-cols-3">
          <SlotImage slot="about" preferred={p.imageUrl} alt="" className={`${p.ui.card} aspect-square w-full object-cover`} />
          <div className="text-center">
            <VariantHeader ui={p.ui} id={id} eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} align="center" className="mb-0" />
            <p className={`${p.ui.body} mx-auto mt-4`}>{p.body}</p>
          </div>
          <SlotImage slot="gallery" index={0} preferred={p.imageUrlSecondary} alt="" className={`${p.ui.card} aspect-square w-full object-cover`} />
        </div>
      </div>
    </SectionVariantShell>
  );
}

const ABOUT_RENDERERS: Record<AboutVariantId, (p: AboutContent) => React.JSX.Element> = {
  "split-narrative": AboutSplitNarrative,
  "overlap-portrait": AboutOverlapPortrait,
  "timeline-story": AboutTimelineStory,
  "mission-pillars": AboutMissionPillars,
  "full-bleed-quote": AboutFullBleedQuote,
  "editorial-columns": AboutEditorialColumns,
  "stats-sidebar": AboutStatsSidebar,
  "image-duo": AboutImageDuo,
};

export function renderAboutVariant(variantId: AboutVariantId, props: AboutContent) {
  return ABOUT_RENDERERS[variantId](props);
}
