/**
 * Website Builder → AI Core ProductEngineAdapter (Phase 1).
 *
 * Reuses existing website plugin layers; does not rewrite Website Builder UI
 * or delivery (preview / ZIP / publish stay on existing routes).
 */

import type { ProductEngineAdapter } from "@/lib/ai-core/adapter";
import type {
  CoreAssetManifest,
  CoreBrief,
  CoreBusinessProfile,
  CoreDesignSystem,
  CoreLayerArtifacts,
  CoreProductStrategy,
  CoreQualityReport,
} from "@/lib/ai-core/layers/types";
import { registerProductEngineAdapter } from "@/lib/ai-core/registry";
import { getTemplateSelectionFromBrief } from "@/lib/ai-core/templates/apply";
import {
  generateDesignSystem,
  mergeCoreDesignWithAiDecisions,
} from "@/lib/ai-core/design-system";
import {
  applyPremiumDesignToCore,
  buildPremiumDesignSystem,
} from "@/lib/ai-core/design-system/premium";
import { renderWebsiteDesign } from "@/lib/ai-core/design-renderer";
import type {
  DesignRenderPlan,
  DesignRendererComponentId,
} from "@/lib/ai-core/design-renderer";
import { isIndustryId } from "@/lib/ai-core/templates/industries";
import type { IndustryId, TemplateSelection } from "@/lib/ai-core/templates/types";
import {
  buildSeoPackageFromStrategy,
  checkSeoReadiness,
  injectSeoArtifacts,
  withSeoReadiness,
} from "@/lib/ai-core/seo";
import { runPerformanceChecks } from "@/lib/ai-core/performance";
import { buildAutoQualityReport } from "@/lib/ai-core/quality";
import {
  runWebsiteOptimizer,
  shouldApplyOptimizerFixes,
} from "@/lib/ai-core/optimizer";
import { applyBrandIdentityToDesignSystem } from "@/lib/ai-core/brand-identity/apply";
import type { BrandIdentityBrief } from "@/lib/ai-core/brand-identity/types";
import { suggestWebsiteImprovements } from "@/lib/ai-core/website-editor";
import {
  applyDesignPlanToDesignSystem,
  applyDesignPlanToStrategy,
} from "@/lib/ai-core/design-plan/apply";
import {
  assertDesignPlanApproved,
  runDesignPlanningPhaseWithBrand,
} from "@/lib/ai-core/design-plan/engine";
import type { VisualDesignPlan } from "@/lib/ai-core/design-plan/types";
import { analyzeBusinessIdea } from "@/plugins/website/layers/business-idea";
import { buildDesignSystem } from "@/plugins/website/layers/design-engine";
import { buildWebsiteStrategy } from "@/plugins/website/layers/strategy";
import { uploadWebsiteAsset } from "@/lib/website/assets-storage";
import {
  generateWebsite as generateWebsiteFiles,
  runWebsiteQualityLayer,
} from "@/plugins/website/generate";
import { planWebsite } from "@/plugins/website/plan";
import type {
  AssetManifest,
  DesignSystem,
  GeneratedWebsiteProject,
  QualityReport,
  WebsiteGenerationInput,
  WebsitePlanResult,
  WebsiteProjectAnalysis,
  WebsiteStrategy,
} from "@/plugins/website/types";
export const WEBSITE_BUILDER_PRODUCT_ID = "website-builder";

const INPUT_META_KEY = "websiteGenerationInput";
const DESIGN_RENDER_KEY = "designRenderPlan";

type PremiumTemplateSectionPlan = {
  label: string;
  componentId: DesignRendererComponentId;
  contentGoal?: string;
  assetRole?: "hero" | "product" | "service" | "section" | "background";
};

type PremiumTemplatePlan = {
  designStyle?: string;
  websiteGoal?: string;
  ctaHierarchy?: string[];
  recommendedComponents?: DesignRendererComponentId[];
  sections: PremiumTemplateSectionPlan[];
};

function extractPremiumTemplatePlan(
  template?: TemplateSelection | null,
): PremiumTemplatePlan | null {
  const raw = template?.designConfiguration?.premiumTemplate;
  if (!raw || typeof raw !== "object") return null;
  const plan = raw as Record<string, unknown>;
  const sections = Array.isArray(plan.sections) ? plan.sections : [];
  const mapped: PremiumTemplateSectionPlan[] = [];
  for (const row of sections) {
    if (!row || typeof row !== "object") continue;
    const s = row as Record<string, unknown>;
    if (typeof s.componentId !== "string" || typeof s.label !== "string") {
      continue;
    }
    const entry: PremiumTemplateSectionPlan = {
      label: s.label,
      componentId: s.componentId as DesignRendererComponentId,
    };
    if (typeof s.contentGoal === "string") entry.contentGoal = s.contentGoal;
    if (
      s.assetRole === "hero" ||
      s.assetRole === "product" ||
      s.assetRole === "service" ||
      s.assetRole === "section" ||
      s.assetRole === "background"
    ) {
      entry.assetRole = s.assetRole;
    }
    mapped.push(entry);
  }
  if (!mapped.length) return null;
  return {
    designStyle:
      typeof plan.designStyle === "string" ? plan.designStyle : undefined,
    websiteGoal:
      typeof plan.websiteGoal === "string" ? plan.websiteGoal : undefined,
    ctaHierarchy: (() => {
      const strategy = plan.contentStrategy;
      if (!strategy || typeof strategy !== "object") return undefined;
      const hierarchy = (strategy as { ctaHierarchy?: unknown }).ctaHierarchy;
      return Array.isArray(hierarchy)
        ? hierarchy.filter((v): v is string => typeof v === "string")
        : undefined;
    })(),
    recommendedComponents: Array.isArray(plan.recommendedComponents)
      ? (plan.recommendedComponents as DesignRendererComponentId[])
      : undefined,
    sections: mapped,
  };
}

/** Map Design Plan kind hints → Professional Components Library ids. */
function componentIdFromPlanKind(
  kindHint: string,
  heroTreatment?: string,
): DesignRendererComponentId {
  const k = kindHint.toLowerCase();
  const hero = (heroTreatment || "").toLowerCase();
  if (k === "hero") {
    if (/interactive/.test(hero)) return "HeroInteractive";
    if (/cinematic-hero|cinematic/.test(hero)) return "HeroCinematic";
    if (/full-image|full.?image/.test(hero)) return "HeroFullImage";
    if (/vehicle|showroom|luxury-vehicle|product-showcase-hero/.test(hero)) {
      return /vehicle|showroom|luxury-vehicle/.test(hero)
        ? "HeroLuxuryShowcase"
        : "HeroProduct";
    }
    if (/appetite|image-led|image.?focus/.test(hero)) return "HeroImage";
    if (/split-hero|editorial-split|trust-split|property|split/.test(hero)) {
      return "HeroSplit";
    }
    if (/product|frame|saas|split-product/.test(hero)) return "HeroProduct";
    if (/luxury|flagship|manifesto|noir|editorial-flagship/.test(hero)) {
      return "HeroLuxury";
    }
    if (/immersive|overlay|full-bleed|video/.test(hero)) {
      return /video/.test(hero) ? "HeroVideo" : "HeroFullBleed";
    }
    return "HeroCinematic";
  }
  if (k === "feature-story" || k === "feature-storytelling") {
    return "FeatureStorytelling";
  }
  if (k === "interactive-product") return "ProductInteractive";
  if (k === "case-studies") return "CaseStudies";
  if (k === "brand-trust") return "BrandTrust";
  if (k === "timeline") return "TimelineSection";
  if (k === "comparison") return "ComparisonSection";
  if (k === "video") return "VideoSection";
  if (k === "gallery-experience") return "GalleryExperience";
  if (k === "product-showcase") return "ProductInteractive";
  if (k === "services") return "ServicesGrid";
  if (k === "features") return "FeatureStorytelling";
  if (k === "gallery") return "GalleryExperience";
  if (k === "testimonials") return "BrandTrust";
  if (k === "pricing") return "PricingTable";
  if (k === "team") return "TeamSection";
  if (k === "faq") return "FaqAccordion";
  if (k === "booking") return "BookingCta";
  if (k === "contact") return "ContactCta";
  if (k === "maps") return "MapsSection";
  if (k === "cta") return "CtaBand";
  return "FeatureStorytelling";
}

/**
 * AI Design Renderer Engine — rewrite strategy/design into premium industry UI plan.
 * Mutates artifacts in place so assets + generation use real components.
 */
function applyDesignRenderer(
  brief: CoreBrief,
  artifacts: CoreLayerArtifacts,
  ctx: { progress: { emit: (message: string) => void } },
): DesignRenderPlan | null {
  if (!artifacts.strategy || !artifacts.designSystem) return null;

  const template = getTemplateSelectionFromBrief(brief);
  const intel = template?.industryIntelligence;
  const industryRaw =
    template?.industryId ||
    (typeof brief.metadata?.industryId === "string"
      ? brief.metadata.industryId
      : "") ||
    artifacts.businessProfile?.industry ||
    "";
  const industryId: IndustryId | string = isIndustryId(String(industryRaw))
    ? String(industryRaw)
    : String(industryRaw);

  ctx.progress.emit("Selecting professional components…");
  const premiumPlan = extractPremiumTemplatePlan(template);
  const designPlan =
    artifacts.designPlan ||
    (brief.metadata?.designPlan as VisualDesignPlan | undefined);
  const planSections = designPlan?.sectionStructure?.map((s) => s.label);
  const rendered = renderWebsiteDesign({
    industryId,
    industryLabel:
      template?.label ||
      intel?.designStyle ||
      artifacts.businessProfile?.industry,
    strategy: artifacts.strategy,
    designSystem: artifacts.designSystem,
    websiteSections:
      planSections?.length
        ? planSections
        : premiumPlan?.sections.map((s) => s.label) ??
          intel?.requiredSections ??
          template?.sections ??
          artifacts.strategy.contentStructure,
    designStyle:
      designPlan?.visualIdentity ||
      premiumPlan?.designStyle ||
      intel?.designStyle ||
      artifacts.designSystem.style,
    ctaTypes:
      premiumPlan?.ctaHierarchy ??
      intel?.ctaTypes ??
      artifacts.strategy.ctas,
    businessType:
      artifacts.businessProfile?.industry ||
      template?.label ||
      String(industryId),
    targetAudience: artifacts.businessProfile?.targetAudience,
    websiteGoal:
      premiumPlan?.websiteGoal ||
      (typeof brief.metadata?.websiteGoal === "string"
        ? brief.metadata.websiteGoal
        : undefined),
    businessGoals: artifacts.businessProfile?.businessGoals,
    positioning: artifacts.strategy.positioning,
    brandName: artifacts.businessProfile?.projectName,
    stylePreset: artifacts.designSystem.stylePreset,
    premiumHeroStyle:
      designPlan?.websiteStyle.heroTreatment ||
      artifacts.designSystem.premium?.layout?.heroStyle,
    premiumSectionLayout:
      designPlan?.websiteStyle.sectionLayout ||
      artifacts.designSystem.premium?.layout?.sectionLayout,
    premiumHomeSections:
      designPlan?.sectionStructure?.map((s) => ({
        name: s.label,
        componentId: componentIdFromPlanKind(
          s.kindHint,
          designPlan.websiteStyle.heroTreatment,
        ),
        goal: s.purpose,
        contentNotes: `Design plan · ${s.kindHint} · ${designPlan.visualIdentity}`,
        assetRole:
          s.assetRole === "gallery" ? "section" : s.assetRole,
      })) ??
      premiumPlan?.sections.map((s) => ({
        name: s.label,
        componentId: s.componentId,
        goal: s.contentGoal,
        contentNotes: `Premium template · ${s.label}`,
        assetRole: s.assetRole,
      })),
    premiumRecommendedComponents: premiumPlan?.recommendedComponents,
  });

  artifacts.strategy = rendered.strategy;
  artifacts.designSystem = rendered.designSystem;
  brief.metadata = {
    ...(brief.metadata ?? {}),
    [DESIGN_RENDER_KEY]: rendered.plan,
    industryId: rendered.plan.industryId,
    professionalComponents: {
      palette: rendered.plan.componentPalette,
      paths: rendered.plan.componentPaths,
      hero: rendered.plan.visualStyle.heroTreatment,
      goal: rendered.plan.visualStyle.uiPatterns.find((p) =>
        p.startsWith("goal-"),
      ),
    },
  };

  ctx.progress.emit(
    `[components] ${rendered.plan.industryLabel} · ${rendered.plan.visualStyle.heroTreatment} · ${rendered.plan.componentPalette.length} components`,
  );

  return rendered.plan;
}

export function websiteInputToBrief(
  input: WebsiteGenerationInput,
): CoreBrief {
  return {
    prompt: input.prompt,
    productId: WEBSITE_BUILDER_PRODUCT_ID,
    language: input.language,
    theme: input.theme,
    features: input.features,
    metadata: {
      [INPUT_META_KEY]: input,
      ...(input.templateId
        ? {
            templateId: input.templateId,
            premiumTemplateId: input.templateId,
          }
        : {}),
      ...(input.marketplaceTemplateId
        ? { marketplaceTemplateId: input.marketplaceTemplateId }
        : {}),
      ...(input.templateStyle
        ? {
            preferredStyle: input.templateStyle,
            brandStyle: input.templateStyle,
            templateStyle: input.templateStyle,
          }
        : {}),
      ...(input.designPreset ? { designPreset: input.designPreset } : {}),
      ...(input.templateIntelligenceId
        ? { templateIntelligenceId: input.templateIntelligenceId }
        : {}),
      ...(input.templateIntelligenceCategory
        ? { templateIntelligenceCategory: input.templateIntelligenceCategory }
        : {}),
      ...(input.brandIdentityId
        ? { brandIdentityId: input.brandIdentityId }
        : {}),
      ...(input.locale ? { locale: input.locale } : {}),
      ...(input.formEmailTo ? { formEmailTo: input.formEmailTo } : {}),
      ...(input.formWebhookUrl
        ? { formWebhookUrl: input.formWebhookUrl }
        : {}),
      ...(input.industryId ? { industryId: input.industryId } : {}),
      ...(input.components?.length
        ? { preferredComponents: input.components }
        : {}),
      ...(input.designSystem
        ? { designSystemHints: input.designSystem }
        : {}),
    },
  };
}

function getWebsiteInput(brief: CoreBrief): WebsiteGenerationInput {
  const raw = brief.metadata?.[INPUT_META_KEY];
  if (!raw || typeof raw !== "object") {
    throw new Error(
      "Website Builder adapter requires websiteGenerationInput in brief.metadata.",
    );
  }
  return raw as WebsiteGenerationInput;
}

/**
 * Fresh adapter instance per run (holds analysis/plan session state).
 */
export function createWebsiteBuilderAdapter(): ProductEngineAdapter<
  GeneratedWebsiteProject,
  GeneratedWebsiteProject
> {
  let analysis: WebsiteProjectAnalysis | undefined;
  let plan: WebsitePlanResult | undefined;
  let project: GeneratedWebsiteProject | undefined;

  return {
    productId: WEBSITE_BUILDER_PRODUCT_ID,
    label: "Website Builder",
    layers: {
      idea: true,
      strategy: true,
      design: true,
      assets: true,
      generation: true,
      quality: true,
      seo: true,
      performance: true,
      finalize: true,
    },

    async runIdea(brief, ctx) {
      const input = getWebsiteInput(brief);
      const template = getTemplateSelectionFromBrief(brief);
      const intel = template?.industryIntelligence;
      analysis = await analyzeBusinessIdea(input, ctx);
      if (template) {
        const premiumPages = (
          brief.metadata?.premiumPageStructure as
            | Array<{ name: string }>
            | undefined
        )?.map((p) => p.name);
        const recommendedPages =
          premiumPages?.length
            ? premiumPages
            : intel?.recommendedPages?.length
              ? intel.recommendedPages
              : template.suggestedPages;
        const requiredSections = Array.from(
          new Set([
            ...(intel?.requiredSections ?? []),
            ...analysis.businessProfile.requiredSections,
            ...template.sections,
          ]),
        );
        // Prefer Premium Template / industry sitemap when AI returns a thin page list.
        const pages =
          analysis.pages.length >= recommendedPages.length
            ? analysis.pages
            : recommendedPages;
        analysis = {
          ...analysis,
          pages,
          features: Array.from(
            new Set([
              ...analysis.features,
              ...template.requiredFeatures,
            ]),
          ),
          isEcommerce:
            analysis.isEcommerce || template.industryId === "ecommerce",
          isSaas: analysis.isSaas || template.industryId === "saas",
          businessProfile: {
            ...analysis.businessProfile,
            industry: template.label || analysis.businessProfile.industry,
            requiredSections,
            tone:
              intel?.contentStyle ||
              analysis.businessProfile.tone ||
              template.contentTone,
          },
        };
      }
      return analysis.businessProfile as CoreBusinessProfile;
    },

    async runStrategy(brief, profile, ctx) {
      const input = getWebsiteInput(brief);
      const template = getTemplateSelectionFromBrief(brief);
      const intel = template?.industryIntelligence;
      if (!analysis) {
        analysis = {
          projectName: profile.projectName,
          projectType: input.projectType,
          pages: intel?.recommendedPages ?? [],
          features: input.features,
          designSystem: [],
          technologies: [],
          databaseProvider: "none",
          requiresAuth: false,
          requiresDatabase: false,
          requiresDashboard: false,
          isEcommerce: false,
          isSaas: false,
          businessProfile: profile as WebsiteProjectAnalysis["businessProfile"],
        };
      }
      if (intel) {
        analysis = {
          ...analysis,
          pages:
            analysis.pages.length >= intel.recommendedPages.length
              ? analysis.pages
              : intel.recommendedPages,
          businessProfile: {
            ...analysis.businessProfile,
            industry: template?.label || analysis.businessProfile.industry,
            requiredSections: Array.from(
              new Set([
                ...intel.requiredSections,
                ...analysis.businessProfile.requiredSections,
              ]),
            ),
            tone: intel.contentStyle || analysis.businessProfile.tone,
          },
        };
      }
      const strategy = await buildWebsiteStrategy(input, analysis, ctx);
      if (intel?.ctaTypes?.length && (!strategy.ctas || strategy.ctas.length < 2)) {
        strategy.ctas = intel.ctaTypes.slice(0, 4);
      }

      // Premium Templates System — apply full page structure + content strategy.
      const premiumConfigured = brief.metadata?.premiumTemplateSelection as
        | {
            pageStructure?: Array<{
              name: string;
              path: string;
              purpose: string;
              keySections: string[];
              primaryCta?: string;
            }>;
            contentStrategy?: {
              brandVoice?: string;
              messagingPillars?: string[];
              proofPoints?: string[];
              seoTopics?: string[];
              ctaHierarchy?: string[];
            };
            conversionPath?: string[];
            sections?: Array<{ label: string }>;
          }
        | undefined;

      if (premiumConfigured?.pageStructure?.length) {
        const byName = new Map(
          (strategy.pages ?? []).map((p) => [p.name.toLowerCase(), p]),
        );
        strategy.pages = premiumConfigured.pageStructure.map((page) => {
          const prior = byName.get(page.name.toLowerCase());
          return {
            name: page.name,
            path: page.path || prior?.path || `/${page.name.toLowerCase().replace(/\s+/g, "-")}`,
            purpose: page.purpose || prior?.purpose || page.name,
            keySections:
              page.keySections?.length > 0
                ? page.keySections
                : prior?.keySections ?? [],
            primaryCta: page.primaryCta || prior?.primaryCta,
          };
        });
        strategy.sitemap = strategy.pages.map((p) => p.path);
      }

      if (premiumConfigured?.contentStrategy) {
        const cs = premiumConfigured.contentStrategy;
        strategy.contentStrategy = {
          ...strategy.contentStrategy,
          brandVoice:
            cs.brandVoice || strategy.contentStrategy.brandVoice,
          messagingPillars:
            cs.messagingPillars?.length
              ? cs.messagingPillars
              : strategy.contentStrategy.messagingPillars,
          proofPoints:
            cs.proofPoints?.length
              ? cs.proofPoints
              : strategy.contentStrategy.proofPoints,
          seoTopics:
            cs.seoTopics?.length
              ? cs.seoTopics
              : strategy.contentStrategy.seoTopics,
        };
        if (cs.ctaHierarchy?.length) {
          strategy.ctas = cs.ctaHierarchy.slice(0, 4);
        }
      }

      if (premiumConfigured?.conversionPath?.length) {
        strategy.conversionFunnel = premiumConfigured.conversionPath;
      }

      if (
        premiumConfigured?.sections?.length &&
        (!strategy.contentStructure ||
          strategy.contentStructure.length < premiumConfigured.sections.length)
      ) {
        strategy.contentStructure = premiumConfigured.sections.map(
          (s) => s.label,
        );
      }

      // Industry marketing copy — headlines/CTAs/services closer to real sites.
      const { enrichStrategyWithIndustryCopy } = await import(
        "@/lib/ai-core/content/industry-copy"
      );
      const enriched = enrichStrategyWithIndustryCopy(
        strategy,
        profile ?? analysis?.businessProfile,
        template?.industryId ||
          (typeof brief.metadata?.industryId === "string"
            ? brief.metadata.industryId
            : profile?.industry || analysis?.businessProfile?.industry),
      );

      return enriched as CoreProductStrategy;
    },

    async runDesign(brief, profile, strategy, ctx, prior) {
      const input = getWebsiteInput(brief);
      const template = getTemplateSelectionFromBrief(brief);
      if (!analysis) {
        throw new Error(
          "Website Builder adapter: design requires prior idea analysis.",
        );
      }
      // Keep profile in sync if Core priorArtifacts supplied it
      analysis = {
        ...analysis,
        businessProfile: profile as WebsiteProjectAnalysis["businessProfile"],
      };

      // Design Planning Phase — Brand Identity → Design Intelligence → approved plan.
      const { plan: rawPlan, brandIdentity } = runDesignPlanningPhaseWithBrand({
        profile,
        strategy: strategy as CoreProductStrategy,
        industryId: template?.industryId || profile.industry,
        theme: input.theme,
        designStyle: template?.industryIntelligence?.designStyle,
        preferredStyle: template?.designPreset || input.theme,
        prompt: brief.prompt || input.prompt,
        onProgress: (message) => ctx.progress.emit(message),
      });
      const designPlan = assertDesignPlanApproved(rawPlan);

      const designIntel = designPlan.intelligence;
      let plannedStrategy = applyDesignPlanToStrategy(
        strategy as CoreProductStrategy,
        designPlan,
      );
      if (prior) {
        prior.brandIdentity = brandIdentity;
        prior.designPlan = designPlan;
        prior.strategy = plannedStrategy;
      }

      brief.metadata = {
        ...(brief.metadata ?? {}),
        brandIdentity,
        designPlan,
        designIntelligence: designIntel,
      };

      const designInput = template
        ? {
            ...input,
            theme:
              input.theme ||
              designPlan.websiteStyle.enginePreset ||
              designIntel.enginePreset ||
              template.designPreset,
          }
        : {
            ...input,
            theme:
              input.theme ||
              designPlan.websiteStyle.enginePreset ||
              designIntel.enginePreset,
          };
      const design = await buildDesignSystem(
        designInput,
        analysis,
        plannedStrategy as WebsiteStrategy,
        ctx,
      );
      if (template) {
        design.stylePreset = template.designPreset;
        design.layoutStyle = template.layoutStyle;
        design.industryPattern = template.industryPattern;
        if (template.industryIntelligence?.designStyle) {
          design.style = template.industryIntelligence.designStyle;
        }
      }
      // Lock early tokens to the approved plan (unique premium identity).
      design.stylePreset =
        designPlan.websiteStyle.enginePreset || design.stylePreset;
      design.layoutStyle =
        designPlan.websiteStyle.layoutStyle || design.layoutStyle;
      design.style = designPlan.visualIdentity || designIntel.visualStyle || design.style;
      design.colors = {
        ...design.colors,
        primary: designPlan.colorSystem.primary,
        secondary: designPlan.colorSystem.secondary,
        accent: designPlan.colorSystem.accent,
        neutral: designPlan.colorSystem.neutral,
        surface: designPlan.colorSystem.surface,
        background: designPlan.colorSystem.background,
        foreground: designPlan.colorSystem.foreground,
      };
      design.typography = {
        ...design.typography,
        headingFont: designPlan.typographySystem.headingFont,
        bodyFont: designPlan.typographySystem.bodyFont,
        notes: designPlan.typographySystem.direction,
      };
      design.layoutRules = Array.from(
        new Set([
          ...(design.layoutRules ?? []),
          ...designPlan.artDirection,
          ...designPlan.sectionStructure.map((s) => `Section: ${s.label}`),
          ...designPlan.antiPatterns,
        ]),
      ).slice(0, 18);

      // AI Design System Engine: business + template → DeepSeek → apply.
      ctx.progress.emit("Generating design system from approved design plan…");
      const websiteGenerationId =
        input.parentGenerationId &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          input.parentGenerationId,
        )
          ? input.parentGenerationId
          : undefined;
      const { design: aiDesign } = await generateDesignSystem({
        strategy: plannedStrategy,
        profile,
        preferredPreset:
          designPlan.websiteStyle.enginePreset ||
          template?.designPreset ||
          design.stylePreset,
        templateSelection: template,
        industryPattern: design.industryPattern,
        layoutStyle:
          designPlan.websiteStyle.layoutStyle || design.layoutStyle,
        brief,
        userId: input.userId,
        websiteGenerationId,
        persist: Boolean(input.userId),
      });
      const merged = mergeCoreDesignWithAiDecisions(
        design as CoreDesignSystem,
        aiDesign,
      );

      // Premium Design System Engine — seeded by approved plan identity.
      ctx.progress.emit("Building premium design system from design plan…");
      const intel = template?.industryIntelligence;
      const premium = buildPremiumDesignSystem({
        preferredStyle:
          designPlan.websiteStyle.premiumStyleId ||
          designIntel.premiumStyleId ||
          intel?.designStyle ||
          input.theme ||
          template?.designPreset ||
          merged.stylePreset,
        industryId:
          template?.industryId ||
          designIntel.industryKey ||
          profile.industry,
        industryLabel: template?.label || profile.industry,
        designStyle: designPlan.visualIdentity || designIntel.visualStyle || intel?.designStyle,
        brandTone: profile.tone || intel?.contentStyle,
        layoutStyle:
          designPlan.websiteStyle.layoutStyle ||
          designIntel.layoutStyle ||
          template?.layoutStyle ||
          merged.layoutStyle,
        layoutVariationId:
          designPlan.websiteStyle.layoutVariationId ||
          designIntel.layoutVariationId,
        heroTreatment:
          designPlan.websiteStyle.heroTreatment || designIntel.heroTreatment,
        sectionLayout:
          designPlan.websiteStyle.sectionLayout || designIntel.sectionLayout,
        seedPrimary: designPlan.colorSystem.primary || merged.colors.primary,
        seedSecondary:
          designPlan.colorSystem.secondary || merged.colors.secondary,
        seedAccent: designPlan.colorSystem.accent || merged.colors.accent,
      });
      let premiumDesign = applyPremiumDesignToCore(merged, premium);
      // Preserve concrete component palette from AI / templates when present.
      if (merged.componentPalette?.length) {
        premiumDesign.componentPalette = merged.componentPalette;
        if (premiumDesign.componentStyle) {
          premiumDesign.componentStyle = {
            ...premiumDesign.componentStyle,
            palette: merged.componentPalette,
          };
        }
      }
      // Final lock: approved Visual Design Plan, then Brand Identity tokens.
      premiumDesign = applyDesignPlanToDesignSystem(premiumDesign, designPlan);
      const brand =
        brandIdentity ||
        designPlan.brandIdentity ||
        (brief.metadata?.brandIdentity as BrandIdentityBrief | undefined);
      if (brand) {
        premiumDesign = applyBrandIdentityToDesignSystem(premiumDesign, brand);
        ctx.progress.emit(
          `[brand-identity] Applied ${brand.presetId} · ${brand.typography.pairing} · ${brand.colors.primary}`,
        );
      }
      ctx.progress.emit(
        `[design-plan] ${designPlan.websiteStyle.layoutVariationId || designIntel.layoutVariationId} · ${designPlan.visualIdentity} · ${designPlan.websiteStyle.heroTreatment} · ${designPlan.typographySystem.displayFont}`,
      );
      brief.metadata = {
        ...(brief.metadata ?? {}),
        brandIdentity: brand || brandIdentity,
        designPlan,
        designIntelligence: designIntel,
        premiumDesignSystem: premium,
      };
      return premiumDesign;
    },

    async runAssets(brief, artifacts, ctx) {
      const input = getWebsiteInput(brief);
      if (!analysis || !artifacts.strategy || !artifacts.designSystem) {
        throw new Error(
          "Website Builder adapter: assets require idea/strategy/design artifacts.",
        );
      }

      const instruction = input.continueInstruction?.toLowerCase() ?? "";
      if (
        input.mode === "continue" &&
        input.previousAssetManifest?.items?.length &&
        !instruction.includes("[assets]")
      ) {
        return input.previousAssetManifest as CoreAssetManifest;
      }

      // Design Renderer first so asset roles follow approved design plan sections.
      applyDesignRenderer(brief, artifacts, ctx);

      // AI Image Engine: design-plan image requirements → prompts → providers → assets.
      const template = getTemplateSelectionFromBrief(brief);
      const { runAiImageEngine } = await import(
        "@/lib/ai-core/image-engine"
      );
      const generationKey =
        input.parentGenerationId ?? `draft-${Date.now()}`;
      const designPlan =
        artifacts.designPlan ||
        (brief.metadata?.designPlan as
          | VisualDesignPlan
          | undefined);
      const brandIdentity =
        artifacts.brandIdentity ||
        designPlan?.brandIdentity ||
        (brief.metadata?.brandIdentity as BrandIdentityBrief | undefined);
      const planImageStyle =
        designPlan?.imageRequirements?.[0]?.style ||
        brandIdentity?.imageDirection ||
        designPlan?.intelligence?.imageStyle;

      ctx.progress.emit(
        "Advanced AI Assets Engine: brand + design art direction → premium visuals…",
      );

      const manifest = await runAiImageEngine({
        strategy: artifacts.strategy!,
        designSystem: artifacts.designSystem!,
        profile: analysis.businessProfile,
        templateSelection: template,
        brandIdentity,
        preferredStyle: planImageStyle,
        designPlanImageRequirements: designPlan?.imageRequirements?.map(
          (r) => `${r.role}: ${r.purpose}. ${r.style}. ${r.notes}`,
        ),
        maxImages: 14,
        userId: input.userId,
        generationKey,
        persist: Boolean(input.userId),
        onProgress: (message) => ctx.progress.emit(message),
        upload:
          input.userId
            ? async ({ assetId, bytes, contentType }) => {
                const uploaded = await uploadWebsiteAsset({
                  userId: input.userId!,
                  generationKey,
                  assetId,
                  bytes,
                  contentType,
                });
                return uploaded
                  ? {
                      publicUrl: uploaded.publicUrl,
                      storagePath: uploaded.storagePath,
                    }
                  : null;
              }
            : undefined,
      });

      if (manifest.qualityReport) {
        brief.metadata = {
          ...(brief.metadata ?? {}),
          assetQualityReport: manifest.qualityReport,
          videoAssetPackage: manifest.videoPackage,
        };
        ctx.progress.emit(`[assets-quality] ${manifest.qualityReport.summary}`);
      }

      return manifest;
    },

    async runGeneration(brief, artifacts, ctx) {
      const input = getWebsiteInput(brief);
      if (
        !analysis ||
        !artifacts.strategy ||
        !artifacts.designSystem ||
        !artifacts.assetManifest
      ) {
        throw new Error(
          "Website Builder adapter: generation requires full upstream artifacts.",
        );
      }

      // Never write website code without an approved Design Planning Phase plan.
      const designPlan = assertDesignPlanApproved(
        artifacts.designPlan ||
          (brief.metadata?.designPlan as VisualDesignPlan | undefined),
      );
      artifacts.designPlan = designPlan;
      ctx.progress.emit(
        `Generating website from approved design plan: ${designPlan.visualIdentity}`,
      );

      const renderPlan =
        applyDesignRenderer(brief, artifacts, ctx) ??
        (brief.metadata?.[DESIGN_RENDER_KEY] as DesignRenderPlan | undefined);

      // Keep analysis pages aligned with rendered industry sitemap.
      if (
        artifacts.strategy.pages?.length &&
        analysis.pages.length < artifacts.strategy.pages.length
      ) {
        analysis = {
          ...analysis,
          pages: artifacts.strategy.pages.map((p) => p.name),
          businessProfile: {
            ...analysis.businessProfile,
            requiredSections: Array.from(
              new Set([
                ...analysis.businessProfile.requiredSections,
                ...artifacts.strategy.sectionPlan.map((s) => s.name),
              ]),
            ),
          },
        };
      }

      plan = await planWebsite(input, analysis, ctx, {
        strategy: artifacts.strategy as WebsiteStrategy,
        designSystem: artifacts.designSystem as DesignSystem,
        designRenderComponentPaths: renderPlan?.componentPaths,
      });

      project = await generateWebsiteFiles(input, analysis, plan, ctx, {
        assetManifest: artifacts.assetManifest as AssetManifest,
        skipAssetGeneration: true,
        skipQuality: true,
      });

      return project;
    },

    async runQuality(brief, artifacts, generation, ctx) {
      const input = getWebsiteInput(brief);
      if (!analysis || !plan) {
        throw new Error(
          "Website Builder adapter: quality requires analysis and plan.",
        );
      }
      const assetManifest =
        (artifacts.assetManifest as AssetManifest | undefined) ??
        generation.assetManifest;
      if (!assetManifest) {
        throw new Error(
          "Website Builder adapter: quality requires assetManifest.",
        );
      }

      const qualityResult = await runWebsiteQualityLayer({
        input,
        analysis,
        plan,
        files: generation.files,
        assetManifest,
        ctx,
      });

      // Phase 8: Auto Quality Engine — sections + design consistency on top of plugin check.
      const autoReport = buildAutoQualityReport({
        baseReport: qualityResult.qualityReport as CoreQualityReport,
        files: qualityResult.files,
        strategy: artifacts.strategy,
        designSystem: artifacts.designSystem,
        assetManifest,
        profile: artifacts.businessProfile ?? analysis.businessProfile,
        improveApplied: qualityResult.qualityReport.improveApplied,
        improveNotes: qualityResult.qualityReport.improveNotes,
      });

      project = {
        ...generation,
        files: qualityResult.files,
        qualityReport: autoReport as QualityReport,
        businessProfile: analysis.businessProfile,
        strategy: plan.strategy,
        designSystem: plan.designSystem,
        assetManifest,
      };

      return autoReport;
    },

    async runSeo(brief, artifacts, generation) {
      if (!artifacts.strategy) {
        throw new Error(
          "Website Builder adapter: SEO requires strategy artifact.",
        );
      }
      const input = getWebsiteInput(brief);
      const template = getTemplateSelectionFromBrief(brief);
      const premiumCfg = template?.designConfiguration?.premiumTemplate as
        | {
            seoTopics?: string[];
            keywords?: string[];
            contentStrategy?: { seoTopics?: string[] };
          }
        | undefined;
      const premiumConfigured = brief.metadata?.premiumTemplateSelection as
        | {
            configured?: {
              contentStrategy?: { seoTopics?: string[] };
              keywords?: string[];
            };
          }
        | undefined;
      const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
      const heroImageUrl =
        artifacts.assetManifest?.items.find(
          (a) =>
            a.role === "hero" &&
            a.url &&
            !a.url.startsWith("data:image/svg"),
        )?.url ?? null;
      const pkg = buildSeoPackageFromStrategy({
        strategy: artifacts.strategy,
        profile: artifacts.businessProfile ?? analysis?.businessProfile,
        language: input.language || brief.language,
        siteUrl: siteUrl || undefined,
        industryId:
          template?.industryId ||
          (typeof brief.metadata?.industryId === "string"
            ? brief.metadata.industryId
            : undefined) ||
          artifacts.businessProfile?.industry,
        premiumSeoTopics:
          premiumConfigured?.configured?.contentStrategy?.seoTopics ??
          premiumCfg?.contentStrategy?.seoTopics ??
          premiumCfg?.seoTopics ??
          artifacts.strategy.contentStrategy?.seoTopics,
        premiumKeywords:
          premiumConfigured?.configured?.keywords ?? premiumCfg?.keywords,
        heroImageUrl,
      });
      const files = project?.files ?? generation.files;
      const readiness = checkSeoReadiness({
        files,
        strategy: artifacts.strategy,
        seoPackage: pkg,
      });
      const seoPackage = withSeoReadiness(pkg, readiness);
      const nextFiles = injectSeoArtifacts(files, seoPackage);

      project = {
        ...(project ?? generation),
        files: nextFiles,
        seo: seoPackage.keywords,
        seoPackage,
      };

      return seoPackage;
    },

    async runPerformance(_brief, artifacts, generation) {
      const files = project?.files ?? generation.files;
      const report = runPerformanceChecks({
        files,
        assetManifest:
          artifacts.assetManifest ??
          project?.assetManifest ??
          generation.assetManifest,
      });

      project = {
        ...(project ?? generation),
        performanceReport: report,
      };

      return report;
    },

    async finalize(brief, artifacts, generation, ctx) {
      const input = getWebsiteInput(brief);
      const designPlan =
        artifacts.designPlan ||
        (brief.metadata?.designPlan as
          | VisualDesignPlan
          | undefined);

      let base: GeneratedWebsiteProject = {
        ...(project ?? generation),
        businessProfile:
          (artifacts.businessProfile as GeneratedWebsiteProject["businessProfile"]) ??
          project?.businessProfile ??
          generation.businessProfile,
        strategy:
          (artifacts.strategy as WebsiteStrategy | undefined) ??
          project?.strategy ??
          generation.strategy,
        designSystem:
          (artifacts.designSystem as DesignSystem | undefined) ??
          project?.designSystem ??
          generation.designSystem,
        designPlan: designPlan ?? project?.designPlan ?? generation.designPlan,
        assetManifest:
          (artifacts.assetManifest as AssetManifest | undefined) ??
          project?.assetManifest ??
          generation.assetManifest,
        qualityReport:
          (artifacts.qualityReport as QualityReport | undefined) ??
          project?.qualityReport ??
          generation.qualityReport,
        seoPackage:
          (artifacts.seoPackage as GeneratedWebsiteProject["seoPackage"]) ??
          project?.seoPackage ??
          generation.seoPackage,
        performanceReport:
          (artifacts.performanceReport as GeneratedWebsiteProject["performanceReport"]) ??
          project?.performanceReport ??
          generation.performanceReport,
        seo:
          artifacts.seoPackage?.keywords ??
          project?.seo ??
          generation.seo,
      };

      // AI Conversion Optimization Engine — goal + industry CRO recommendations.
      const { runConversionOptimization, mergeConversionIntoOptimizerReport } =
        await import("@/lib/ai-core/conversion");
      // AI SEO + Performance Engine — technical SEO, CWV/mobile quality report.
      const {
        runSeoPerformanceEngine,
        mergeSeoPerformanceIntoOptimizerReport,
      } = await import("@/lib/ai-core/seo-performance");
      const template = getTemplateSelectionFromBrief(brief);
      const premiumCfg = template?.designConfiguration?.premiumTemplate as
        | {
            websiteGoal?: string;
            seoTopics?: string[];
            keywords?: string[];
            contentStrategy?: { seoTopics?: string[] };
          }
        | undefined;
      const industryId =
        template?.industryId ||
        (typeof brief.metadata?.industryId === "string"
          ? brief.metadata.industryId
          : undefined) ||
        artifacts.businessProfile?.industry;
      const conversionReport = runConversionOptimization({
        files: base.files,
        strategy: artifacts.strategy,
        profile: artifacts.businessProfile ?? analysis?.businessProfile,
        industryId,
        explicitGoal:
          typeof brief.metadata?.websiteGoal === "string"
            ? brief.metadata.websiteGoal
            : premiumCfg?.websiteGoal,
        websiteGoal:
          typeof brief.metadata?.websiteGoal === "string"
            ? brief.metadata.websiteGoal
            : premiumCfg?.websiteGoal,
        onProgress: (message) => ctx.progress.emit(message),
      });

      const seoPerformanceReport = runSeoPerformanceEngine({
        files: base.files,
        strategy: artifacts.strategy,
        profile: artifacts.businessProfile ?? analysis?.businessProfile,
        industryId,
        seoPackage: base.seoPackage ?? artifacts.seoPackage,
        performanceReport:
          base.performanceReport ?? artifacts.performanceReport,
        assetManifest: base.assetManifest ?? artifacts.assetManifest,
        premiumSeoTopics:
          premiumCfg?.contentStrategy?.seoTopics ??
          premiumCfg?.seoTopics ??
          artifacts.strategy?.contentStrategy?.seoTopics,
        premiumKeywords: premiumCfg?.keywords,
        conversionScore: conversionReport.score,
        onProgress: (message) => ctx.progress.emit(message),
      });

      // AI Design Critic — post-generation visual / premium-feel review.
      const { runDesignCritic, mergeDesignCriticIntoOptimizerReport } =
        await import("@/lib/ai-core/design-critic");
      const designCriticReport = runDesignCritic({
        files: base.files,
        onProgress: (message) => ctx.progress.emit(message),
      });

      // AI Website Optimizer Engine — audit + score; apply fixes on Improve with AI.
      const applyFixes = shouldApplyOptimizerFixes({
        optimizeWithAi: input.optimizeWithAi,
        continueInstruction: input.continueInstruction,
        mode: input.mode,
      });
      const websiteGenerationId =
        input.parentGenerationId &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          input.parentGenerationId,
        )
          ? input.parentGenerationId
          : undefined;

      try {
        const optimized = await runWebsiteOptimizer({
          files: base.files,
          strategy: artifacts.strategy,
          designSystem: artifacts.designSystem,
          profile: artifacts.businessProfile ?? analysis?.businessProfile,
          qualityReport: artifacts.qualityReport,
          seoPackage: artifacts.seoPackage,
          performanceReport: artifacts.performanceReport,
          applyFixes,
          seedImproveThemes: [
            ...conversionReport.improveThemes,
            ...seoPerformanceReport.improveThemes,
            ...designCriticReport.improveThemes,
          ],
          userInstruction: input.continueInstruction,
          userId: input.userId,
          websiteGenerationId,
          parentGenerationId: websiteGenerationId,
          persist: Boolean(input.userId),
          onProgress: (message) => ctx.progress.emit(message),
        });

        let mergedReport = mergeConversionIntoOptimizerReport(
          optimized.report,
          conversionReport,
        );
        mergedReport = mergeSeoPerformanceIntoOptimizerReport(
          mergedReport,
          seoPerformanceReport,
        );
        mergedReport = mergeDesignCriticIntoOptimizerReport(
          mergedReport,
          designCriticReport,
        );

        base = {
          ...base,
          files: optimized.files,
          optimizationReport: mergedReport,
          conversionReport,
          seoPerformanceReport,
          designCriticReport,
          qualityReport: {
            passed: base.qualityReport?.passed ?? mergedReport.publishReady,
            dimensions: base.qualityReport?.dimensions ?? [],
            weakSections: Array.from(
              new Set([
                ...(base.qualityReport?.weakSections ?? []),
                ...designCriticReport.weakSections,
              ]),
            ),
            issues: base.qualityReport?.issues ?? [],
            score: mergedReport.scores.overall,
            publishReady: mergedReport.publishReady,
            seoReadinessScore: seoPerformanceReport.scores.seo,
            performanceScore: seoPerformanceReport.scores.performance,
            improveApplied:
              Boolean(base.qualityReport?.improveApplied) ||
              optimized.filesChanged,
            improveNotes: [
              ...(base.qualityReport?.improveNotes ?? []),
              conversionReport.summary,
              seoPerformanceReport.summary,
              designCriticReport.summary,
              ...(mergedReport.appliedFixes.length
                ? mergedReport.appliedFixes
                : [mergedReport.summary]),
            ],
          } as QualityReport,
        };
      } catch (error) {
        console.error("Website Optimizer finalize failed", error);
        ctx.progress.emit("Optimizer skipped — delivering current build.");
        base = {
          ...base,
          conversionReport,
          seoPerformanceReport,
          designCriticReport,
        };
      }

      // Website Editor Intelligence — improvement suggestions after generation.
      try {
        const editorSuggestions = suggestWebsiteImprovements({
          files: base.files,
          project: base,
        });
        base = { ...base, editorSuggestions };
        ctx.progress.emit(
          `[website-editor] ${editorSuggestions.suggestions.length} improvement suggestions ready`,
        );
      } catch (error) {
        console.error("Website Editor suggestions failed", error);
      }

      // Final Website Quality Intelligence — unified pre-publish review + scores.
      try {
        const { buildFinalWebsiteQualityReport, finalActionsToOptimizeThemes } =
          await import("@/lib/ai-core/final-quality");
        const finalQualityReport = buildFinalWebsiteQualityReport({
          files: base.files,
          designCritic: base.designCriticReport,
          conversion: base.conversionReport,
          seoPerformance: base.seoPerformanceReport,
          optimization: base.optimizationReport,
          seoPackage: base.seoPackage ?? artifacts.seoPackage,
          performanceReport:
            base.performanceReport ?? artifacts.performanceReport,
          editorSuggestions: base.editorSuggestions,
          onProgress: (message) => ctx.progress.emit(message),
        });

        // Auto-apply path: seed high-priority themes when Improve with AI is on
        // and critical blockers remain (optimizer already ran above when applyFixes).
        if (
          applyFixes &&
          !finalQualityReport.publishReady &&
          finalQualityReport.actions.some((a) => a.priority === "high")
        ) {
          const themes = finalActionsToOptimizeThemes(finalQualityReport.actions);
          ctx.progress.emit(
            `[final-quality] ${themes.length} improvement themes queued for next optimize pass`,
          );
          brief.metadata = {
            ...(brief.metadata ?? {}),
            finalQualityImproveThemes: themes,
          };
        }

        // Merge Final Quality actions into editor suggestions for Apply UI.
        const mergedSuggestions = base.editorSuggestions
          ? {
              ...base.editorSuggestions,
              suggestions: [
                ...finalQualityReport.actions.slice(0, 6).map((a, idx) => ({
                  id: `final-q-${idx + 1}`,
                  category:
                    a.kind === "improve-seo"
                      ? ("seo" as const)
                      : a.kind === "improve-conversion"
                        ? ("conversion" as const)
                        : a.kind === "rewrite-content"
                          ? ("content" as const)
                          : a.kind === "add-section"
                            ? ("missing-section" as const)
                            : ("design" as const),
                  title: a.title,
                  description: a.description,
                  command: a.command,
                  priority: a.priority,
                  actions: a.editorActions,
                })),
                ...(base.editorSuggestions.suggestions ?? []),
              ].slice(0, 14),
              summary: `${finalQualityReport.summary} · ${base.editorSuggestions.summary}`,
            }
          : base.editorSuggestions;

        base = {
          ...base,
          finalQualityReport,
          editorSuggestions: mergedSuggestions,
          qualityReport: {
            ...(base.qualityReport ?? {
              passed: finalQualityReport.publishReady,
              dimensions: [],
              weakSections: [],
              issues: [],
              improveApplied: false,
            }),
            score: finalQualityReport.scores.overall,
            publishReady: finalQualityReport.publishReady,
            seoReadinessScore: finalQualityReport.scores.seo,
            performanceScore: finalQualityReport.scores.performance,
            improveNotes: [
              ...(base.qualityReport?.improveNotes ?? []),
              finalQualityReport.summary,
              ...finalQualityReport.actions
                .filter((a) => a.priority === "high")
                .slice(0, 4)
                .map((a) => a.command),
            ],
          } as QualityReport,
        };
        ctx.progress.emit(`[final-quality] ${finalQualityReport.summary}`);
      } catch (error) {
        console.error("Final Quality Intelligence failed", error);
        ctx.progress.emit("Final quality review skipped — delivering current build.");
      }

      // Design Platform: locale/RTL + performance + form client + brand kit tokens
      try {
        const {
          resolveLocaleFromLanguage,
          applyLocaleToWebsiteFiles,
          applyPerformancePatches,
          runWebsitePerformanceUpgrade,
          buildFormSubmitClientSnippet,
          brandKitFromIdentityRow,
          applyBrandKitToDesignSystem,
          applyBrandKitTokensToFiles,
        } = await import("@/lib/ai-core/website-design-platform");

        const locale = resolveLocaleFromLanguage(
          input.locale || input.language || brief.language,
        );
        let files = applyLocaleToWebsiteFiles(base.files || [], locale);
        files = applyPerformancePatches(files);

        // Inject form submit helper when generation id known (may be set later on save)
        const genId =
          typeof brief.metadata?.generationId === "string"
            ? brief.metadata.generationId
            : "GENERATION_ID";
        if (!files.some((f) => f.path === "lib/website-forms.ts")) {
          files = [
            ...files,
            {
              path: "lib/website-forms.ts",
              content: buildFormSubmitClientSnippet(genId),
              language: "typescript",
            },
          ];
        }

        // Brand kit from explicit brandIdentityId metadata
        const brandId =
          input.brandIdentityId ||
          (typeof brief.metadata?.brandIdentityId === "string"
            ? brief.metadata.brandIdentityId
            : null);
        if (brandId && input.userId) {
          try {
            const { createClient } = await import("@/lib/supabase/server");
            const supabase = await createClient();
            const { data: brandRow } = await supabase
              .from("brand_identity_generations")
              .select("id, brand_name, blueprint")
              .eq("id", brandId)
              .eq("user_id", input.userId)
              .maybeSingle();
            if (brandRow) {
              const kit = brandKitFromIdentityRow(brandRow);
              if (kit) {
                files = applyBrandKitTokensToFiles(files, kit);
                base = {
                  ...base,
                  designSystem: applyBrandKitToDesignSystem(
                    base.designSystem,
                    kit,
                  ),
                };
                ctx.progress.emit(
                  `[brand-kit] Applied ${kit.name} colors & typography`,
                );
              }
            }
          } catch (brandErr) {
            console.error("Brand kit apply failed", brandErr);
          }
        }

        const perf = runWebsitePerformanceUpgrade(files);
        base = {
          ...base,
          files,
          settings: {
            ...base.settings,
            locale: locale.localeCode,
            dir: locale.dir,
            formEmailTo: input.formEmailTo,
            formWebhookUrl: input.formWebhookUrl,
            performanceScore: String(perf.score),
          } as GeneratedWebsiteProject["settings"],
        };
        ctx.progress.emit(
          `[design-platform] locale=${locale.htmlLang} dir=${locale.dir} · performance ${perf.score}/100`,
        );
      } catch (error) {
        console.error("Design Platform finalize failed", error);
      }

      project = base;
      return base;
    },
  };
}

/** Registry entry for discovery (not used for concurrent runs — create fresh instances). */
const websiteBuilderAdapterDefinition = createWebsiteBuilderAdapter();
registerProductEngineAdapter(websiteBuilderAdapterDefinition);

export function priorArtifactsFromWebsiteInput(
  input: WebsiteGenerationInput,
): Partial<CoreLayerArtifacts> | undefined {
  if (
    !input.previousBusinessProfile &&
    !input.previousStrategy &&
    !input.previousDesignSystem &&
    !input.previousAssetManifest
  ) {
    return undefined;
  }
  return {
    businessProfile: input.previousBusinessProfile as
      | CoreBusinessProfile
      | undefined,
    strategy: input.previousStrategy as CoreProductStrategy | undefined,
    designSystem: input.previousDesignSystem as CoreDesignSystem | undefined,
    assetManifest: input.previousAssetManifest as CoreAssetManifest | undefined,
  };
}
