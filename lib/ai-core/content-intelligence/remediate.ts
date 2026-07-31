import type { AgencyContentPack } from "@/lib/ai-core/content-intelligence/generate";
import { stripContentCliches } from "@/lib/ai-core/content-intelligence/cliches";
import type { ContentPolicy } from "@/lib/ai-core/content-intelligence/types";

function remediateText(text: string): string {
  return stripContentCliches(text);
}

/**
 * Auto-remediate agency content: strip clichés and align primary CTA when safe.
 */
export function remediateAgencyContent(
  content: AgencyContentPack,
  policy: ContentPolicy,
): { content: AgencyContentPack; changes: string[] } {
  const changes: string[] = [];

  const hero = {
    ...content.hero,
    eyebrow: remediateText(content.hero.eyebrow),
    headline: remediateText(content.hero.headline),
    subheadline: remediateText(content.hero.subheadline),
    ctaPrimary: policy.primaryCta || content.hero.ctaPrimary,
  };
  if (hero.headline !== content.hero.headline) changes.push("hero.headline");
  if (hero.ctaPrimary !== content.hero.ctaPrimary) changes.push("hero.ctaPrimary");

  const remediated: AgencyContentPack = {
    ...content,
    hero,
    about: {
      ...content.about,
      mission: remediateText(content.about.mission),
      vision: remediateText(content.about.vision),
      story: remediateText(content.about.story),
    },
    services: content.services.map((s) => ({
      ...s,
      title: remediateText(s.title),
      body: remediateText(s.body),
    })),
    features: content.features.map((f) => ({
      ...f,
      title: remediateText(f.title),
      body: remediateText(f.body),
    })),
    testimonials: content.testimonials.map((t) => ({
      ...t,
      quote: remediateText(t.quote),
    })),
    faq: content.faq.map((f) => ({
      q: remediateText(f.q),
      a: remediateText(f.a),
    })),
    cta: {
      ...content.cta,
      title: remediateText(content.cta.title),
      body: remediateText(content.cta.body),
    },
    footer: {
      ...content.footer,
      tagline: remediateText(content.footer.tagline),
    },
    seo: {
      ...content.seo,
      title: remediateText(content.seo.title).slice(0, 60),
      description: remediateText(content.seo.description).slice(0, 160),
    },
  };

  return { content: remediated, changes };
}
