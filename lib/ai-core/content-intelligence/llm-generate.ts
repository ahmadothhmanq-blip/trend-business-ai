import { getDefaultTextProvider } from "@/lib/ai/provider-config";
import { providerManager } from "@/lib/ai/provider-manager";
import type { BusinessIntelligenceProfile } from "@/lib/ai-core/business-intelligence/types";
import type { AgencyBrandKit } from "@/lib/ai-core/agency-brand-kit/types";
import type { DesignDNAPrinciples } from "@/lib/ai-core/design-dna/types";
import {
  generateAgencyContent,
  type AgencyContentPack,
} from "@/lib/ai-core/content-intelligence/generate";
import {
  stripContentCliches,
} from "@/lib/ai-core/content-intelligence/cliches";

function normalizePack(raw: Partial<AgencyContentPack>, fallback: AgencyContentPack): AgencyContentPack {
  return {
    hero: {
      eyebrow: stripContentCliches(raw.hero?.eyebrow || fallback.hero.eyebrow),
      headline: stripContentCliches(raw.hero?.headline || fallback.hero.headline),
      subheadline: stripContentCliches(raw.hero?.subheadline || fallback.hero.subheadline),
      ctaPrimary: raw.hero?.ctaPrimary || fallback.hero.ctaPrimary,
      ctaSecondary: raw.hero?.ctaSecondary || fallback.hero.ctaSecondary,
    },
    about: {
      title: raw.about?.title || fallback.about.title,
      mission: stripContentCliches(raw.about?.mission || fallback.about.mission),
      vision: stripContentCliches(raw.about?.vision || fallback.about.vision),
      story: stripContentCliches(raw.about?.story || fallback.about.story),
    },
    services: Array.isArray(raw.services) && raw.services.length >= 2
      ? raw.services.map((s) => ({
          title: stripContentCliches(String(s.title || "")),
          body: stripContentCliches(String(s.body || "")),
          cta: s.cta ? String(s.cta) : undefined,
        }))
      : fallback.services,
    features: Array.isArray(raw.features) && raw.features.length >= 2
      ? raw.features.map((f) => ({
          title: stripContentCliches(String(f.title || "")),
          body: stripContentCliches(String(f.body || "")),
        }))
      : fallback.features,
    testimonials: Array.isArray(raw.testimonials) && raw.testimonials.length >= 2
      ? raw.testimonials.map((t) => ({
          quote: stripContentCliches(String(t.quote || "")),
          name: String(t.name || "Client"),
          role: String(t.role || "Customer"),
        }))
      : fallback.testimonials,
    faq: Array.isArray(raw.faq) && raw.faq.length >= 2
      ? raw.faq.map((f) => ({
          q: stripContentCliches(String(f.q || "")),
          a: stripContentCliches(String(f.a || "")),
        }))
      : fallback.faq,
    cta: {
      title: stripContentCliches(raw.cta?.title || fallback.cta.title),
      body: stripContentCliches(raw.cta?.body || fallback.cta.body),
      button: raw.cta?.button || fallback.cta.button,
    },
    footer: {
      tagline: stripContentCliches(raw.footer?.tagline || fallback.footer.tagline),
      copyright: raw.footer?.copyright || fallback.footer.copyright,
    },
    seo: {
      title: stripContentCliches(raw.seo?.title || fallback.seo.title).slice(0, 60),
      description: stripContentCliches(raw.seo?.description || fallback.seo.description).slice(0, 160),
      keywords: Array.isArray(raw.seo?.keywords)
        ? raw.seo.keywords.map(String).slice(0, 12)
        : fallback.seo.keywords,
    },
    pageTitles: raw.pageTitles && typeof raw.pageTitles === "object"
      ? Object.fromEntries(
          Object.entries(raw.pageTitles).map(([k, v]) => [k, stripContentCliches(String(v))]),
        )
      : fallback.pageTitles,
  };
}

/**
 * LLM-driven marketing copy — replaces static content packs.
 * Falls back to structured agency content when LLM is unavailable.
 */
export async function generateAgencyContentLlm(params: {
  profile: BusinessIntelligenceProfile;
  brandKit: AgencyBrandKit;
  designDNA: DesignDNAPrinciples;
  language?: string;
  country?: string;
  prompt?: string;
  onProgress?: (message: string) => void;
}): Promise<AgencyContentPack> {
  const fallback = generateAgencyContent({
    profile: params.profile,
    brandKit: params.brandKit,
    designDNA: params.designDNA,
    language: params.language,
  });

  const resolved = providerManager.resolve(getDefaultTextProvider());
  if (!resolved) {
    params.onProgress?.("[content-intelligence] LLM unavailable — using structured fallback");
    return fallback;
  }

  params.onProgress?.("[content-intelligence] Generating bespoke marketing copy…");

  try {
    const result = await providerManager.generateJson<Partial<AgencyContentPack>>(
      {
        system: `You are an elite copywriter at a premium digital agency.
Write original, persuasive marketing copy. Never use clichés like "cutting-edge", "game-changer", "world-class", or "take your business to the next level".
Every sentence must be specific to this exact business. Sound human, confident, and commercially effective.
Respond with JSON only.`,
        prompt: `Business: ${params.profile.industry} — ${params.profile.subcategory}
Company: ${params.brandKit.companyName}
Tagline direction: ${params.brandKit.tagline}
Audience: ${params.profile.audience.join(", ")}
Tone: ${params.profile.tone}
Visual style: ${params.profile.visualStyle.join(", ")}
Design quality bar: ${params.designDNA.label}
Language: ${params.language ?? "en"}
Country/market: ${params.country ?? "global"}
Business goals: ${params.profile.designSystemHints.layoutApproach}
Sections needed: ${params.profile.recommendedSections.join(", ")}
Primary CTA: ${params.profile.primaryCta}
User brief: ${(params.prompt || "").slice(0, 500)}

Return JSON matching this shape (all fields required):
{
  "hero": { "eyebrow": "", "headline": "", "subheadline": "", "ctaPrimary": "", "ctaSecondary": "" },
  "about": { "title": "", "mission": "", "vision": "", "story": "" },
  "services": [{ "title": "", "body": "", "cta": "" }],
  "features": [{ "title": "", "body": "" }],
  "testimonials": [{ "quote": "", "name": "", "role": "" }],
  "faq": [{ "q": "", "a": "" }],
  "cta": { "title": "", "body": "", "button": "" },
  "footer": { "tagline": "", "copyright": "" },
  "seo": { "title": "", "description": "", "keywords": [] },
  "pageTitles": { "about": "", "services": "" }
}`,
        temperature: 0.75,
      },
      resolved,
    );

    const pack = normalizePack(result, fallback);
    params.onProgress?.(
      `[content-intelligence] Copy ready · "${pack.hero.headline.slice(0, 48)}…"`,
    );
    return pack;
  } catch {
    params.onProgress?.("[content-intelligence] LLM failed — using structured fallback");
    return fallback;
  }
}
