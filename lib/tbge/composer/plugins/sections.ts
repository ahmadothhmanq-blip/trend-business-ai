/**
 * Built-in section composer plugins.
 */

import type { SectionComposerContext, SectionComposerPlugin } from "@/lib/tbge/composer/plugins/types";
import { slugifySectionId } from "@/lib/tbge/composer/variants";

type SectionContentLike = {
  headline?: string;
  subheadline?: string;
  body?: string;
  cta?: string;
  items?: string[];
};

function sectionContentFor(ctx: SectionComposerContext): SectionContentLike | undefined {
  const pageContent = ctx.spec.content?.pages?.[ctx.page.path];
  return pageContent?.sections.find(
    (section) => section.type.toLowerCase() === ctx.sectionName.toLowerCase(),
  );
}

function createSectionPlugin(input: {
  id: string;
  keywords: string[];
  priority: number;
  buildProps: (ctx: SectionComposerContext, content?: SectionContentLike) => Record<string, unknown>;
}): SectionComposerPlugin {
  return {
    id: input.id,
    priority: input.priority,
    match(sectionName) {
      const key = sectionName.trim().toLowerCase();
      return input.keywords.some((word) => key.includes(word));
    },
    compose(ctx) {
      return {
        id: slugifySectionId(ctx.sectionName, ctx.sectionIndex),
        type: ctx.variant.componentType,
        label: ctx.sectionName,
        variant: ctx.variant,
        layout: ctx.layout,
        order: ctx.sectionIndex,
        props: input.buildProps(ctx, sectionContentFor(ctx)),
      };
    },
  };
}

export const heroSectionPlugin = createSectionPlugin({
  id: "section-hero",
  keywords: ["hero", "banner"],
  priority: 100,
  buildProps(ctx, content) {
    return {
      headline: content?.headline ?? ctx.page.name,
      subheadline: content?.subheadline ?? ctx.page.purpose,
      body: content?.body ?? ctx.spec.business.offer,
      cta: content?.cta ?? ctx.page.primaryCta ?? ctx.spec.content?.ctas?.[0] ?? "Get Started",
      align: ctx.industryPattern.id === "gaming" ? "center" : "start",
    };
  },
});

export const featuresSectionPlugin = createSectionPlugin({
  id: "section-features",
  keywords: ["feature", "game", "catalog", "service", "product"],
  priority: 90,
  buildProps(ctx, content) {
    return {
      headline: content?.headline ?? ctx.sectionName,
      items:
        content?.items ??
        ctx.spec.business.goals.slice(0, 4).map((goal) => ({
          title: goal,
          description: ctx.spec.business.offer,
        })),
      columns: ctx.layout.grid.columns >= 12 ? 3 : 2,
    };
  },
});

export const contactSectionPlugin = createSectionPlugin({
  id: "section-contact",
  keywords: ["contact", "reach", "inquiry"],
  priority: 80,
  buildProps(ctx, content) {
    return {
      headline: content?.headline ?? "Contact Us",
      body: content?.body ?? ctx.spec.business.offer,
      cta: content?.cta ?? ctx.page.primaryCta ?? "Contact",
      fields: ["name", "email", "message"],
    };
  },
});

export const ctaSectionPlugin = createSectionPlugin({
  id: "section-cta",
  keywords: ["cta", "call-to-action", "signup"],
  priority: 70,
  buildProps(ctx, content) {
    return {
      headline: content?.headline ?? ctx.spec.business.name,
      subheadline: content?.subheadline ?? ctx.spec.business.offer,
      cta: content?.cta ?? ctx.spec.content?.ctas?.[0] ?? "Learn More",
    };
  },
});

export const defaultSectionPlugin: SectionComposerPlugin = {
  id: "section-default",
  priority: 0,
  match() {
    return true;
  },
  compose(ctx) {
    const content = sectionContentFor(ctx);
    return {
      id: slugifySectionId(ctx.sectionName, ctx.sectionIndex),
      type: ctx.variant.componentType,
      label: ctx.sectionName,
      variant: ctx.variant,
      layout: ctx.layout,
      order: ctx.sectionIndex,
      props: {
        headline: content?.headline ?? ctx.sectionName,
        body: content?.body ?? ctx.page.purpose,
        items: content?.items ?? [],
      },
    };
  },
};

export const BUILTIN_SECTION_PLUGINS = [
  heroSectionPlugin,
  featuresSectionPlugin,
  contactSectionPlugin,
  ctaSectionPlugin,
  defaultSectionPlugin,
];
