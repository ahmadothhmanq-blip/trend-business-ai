/**
 * Website Director validation (Phase 2).
 * Rejects incomplete or illegal plans. No HTML/CSS checks — planning tokens only.
 */

import { WEBSITE_ASSET_KINDS } from "@/lib/ai-core/website-builder/domain/contracts";
import { assertValidProject } from "@/lib/ai-core/website-builder/domain/validation";
import type {
  DirectorAssetRequirement,
  DirectorFormRequirement,
  DirectorIntegrationRequirement,
  DirectorNavItem,
  DirectorPageSectionType,
  DirectorPlannedPage,
  DirectorSeoStrategy,
  DirectorSitemapNode,
  DirectorSuggestedTheme,
  DirectorWebsitePlan,
  WebsiteDirectorInput,
  WebsiteDirectorLlmDraft,
  WebsiteDirectorType,
  WebsiteInformationArchitecture,
} from "@/lib/ai-core/website-builder/director/contracts";
import {
  DIRECTOR_FORM_KINDS,
  DIRECTOR_INTEGRATION_KINDS,
  DIRECTOR_PAGE_SECTION_TYPES,
  WEBSITE_DIRECTOR_TYPES,
} from "@/lib/ai-core/website-builder/director/contracts";
import { WebsiteDirectorError } from "@/lib/ai-core/website-builder/director/errors";

const HEX_RE = /^#[0-9a-f]{6}$/i;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PATH_RE = /^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*)?(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/;
const LOCALE_RE = /^[a-z]{2}(?:-[A-Z]{2})?$/;
const FONT_RE = /^[A-Za-z][A-Za-z0-9\- ]{1,60}$/;

const TYPE_REQUIRED_SLUGS: Record<WebsiteDirectorType, string[]> = {
  company: ["home", "about", "services", "contact"],
  saas: ["home", "features", "pricing", "contact"],
  ecommerce: ["home", "products", "contact"],
  restaurant: ["home", "menu", "contact"],
  portfolio: ["home", "work", "contact"],
  agency: ["home", "services", "contact"],
  healthcare: ["home", "services", "contact"],
  education: ["home", "programs", "contact"],
  "real-estate": ["home", "listings", "contact"],
  blog: ["home", "articles", "contact"],
  "landing-page": ["home"],
};

export type DraftEvaluation =
  | { ok: true; draft: WebsiteDirectorLlmDraft }
  | { ok: false; code: "incomplete_plan" | "invalid_plan" | "malformed_response"; reason: string };

function fail(
  code: "incomplete_plan" | "invalid_plan" | "malformed_response",
  reason: string,
): DraftEvaluation {
  return { ok: false, code, reason };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value: unknown, min = 3): value is string {
  return typeof value === "string" && value.trim().length >= min;
}

function isWebsiteDirectorType(value: unknown): value is WebsiteDirectorType {
  return typeof value === "string" && (WEBSITE_DIRECTOR_TYPES as readonly string[]).includes(value);
}

function isSectionType(value: unknown): value is DirectorPageSectionType {
  return typeof value === "string" && (DIRECTOR_PAGE_SECTION_TYPES as readonly string[]).includes(value);
}

export function assertWebsiteDirectorInput(
  input: WebsiteDirectorInput,
): asserts input is WebsiteDirectorInput & { language: string } {
  assertValidProject(input.project);
  if (!input.prompt?.trim() || input.prompt.trim().length < 12) {
    throw new WebsiteDirectorError("Director prompt must be at least 12 characters.", "invalid_input");
  }
  const language = input.language ?? input.project.language;
  if (!LOCALE_RE.test(language)) {
    throw new WebsiteDirectorError("Director language must look like en or ar.", "invalid_input");
  }
  if (input.project.domainState !== "draft" && input.project.domainState !== "planning") {
    throw new WebsiteDirectorError(
      "Website Director can only run while the project is draft or planning.",
      "invalid_state",
    );
  }
  input.language = language;
}

function evaluateSeo(seo: unknown): DraftEvaluation | DirectorSeoStrategy {
  if (!isRecord(seo)) return fail("incomplete_plan", "SEO strategy is missing.");
  if (!Array.isArray(seo.primaryKeywords) || seo.primaryKeywords.length < 3) {
    return fail("incomplete_plan", "SEO strategy needs at least 3 primary keywords.");
  }
  if (seo.primaryKeywords.some((keyword) => !isNonEmptyString(keyword))) {
    return fail("invalid_plan", "SEO keywords must be non-empty strings.");
  }
  if (!isNonEmptyString(seo.titleTemplate, 10) || seo.titleTemplate.trim().length > 70) {
    return fail("invalid_plan", "SEO title template must be 10–70 characters.");
  }
  if (!isNonEmptyString(seo.metaDescriptionTemplate, 50) || seo.metaDescriptionTemplate.trim().length > 160) {
    return fail("invalid_plan", "SEO meta description template must be 50–160 characters.");
  }
  if (typeof seo.locale !== "string" || !LOCALE_RE.test(seo.locale)) {
    return fail("invalid_plan", "SEO locale is invalid.");
  }
  return {
    primaryKeywords: seo.primaryKeywords.map((keyword) => String(keyword).trim()),
    titleTemplate: seo.titleTemplate.trim(),
    metaDescriptionTemplate: seo.metaDescriptionTemplate.trim(),
    locale: seo.locale,
  };
}

function evaluateTheme(theme: unknown): DraftEvaluation | DirectorSuggestedTheme {
  if (!isRecord(theme) || !isRecord(theme.colors) || !isRecord(theme.fonts)) {
    return fail("incomplete_plan", "Suggested theme is missing.");
  }
  if (!isNonEmptyString(theme.name)) return fail("incomplete_plan", "Theme name is required.");
  const colors = {
    background: String(theme.colors.background ?? ""),
    foreground: String(theme.colors.foreground ?? ""),
    accent: String(theme.colors.accent ?? ""),
    muted: String(theme.colors.muted ?? ""),
  };
  for (const [key, value] of Object.entries(colors)) {
    if (!HEX_RE.test(value)) return fail("invalid_plan", `Theme color ${key} must be #RRGGBB.`);
  }
  if (colors.background.toLowerCase() === colors.foreground.toLowerCase()) {
    return fail("invalid_plan", "Theme background and foreground must differ.");
  }
  const fonts = { sans: String(theme.fonts.sans ?? ""), display: String(theme.fonts.display ?? "") };
  if (!FONT_RE.test(fonts.sans) || !FONT_RE.test(fonts.display)) {
    return fail("invalid_plan", "Theme fonts must be professional named families.");
  }
  if (!Number.isInteger(theme.radiusPx) || Number(theme.radiusPx) < 0 || Number(theme.radiusPx) > 24) {
    return fail("invalid_plan", "Theme radius must be an integer 0–24.");
  }
  return { name: theme.name.trim(), colors, fonts, radiusPx: Number(theme.radiusPx) };
}

function evaluatePages(pages: unknown): DraftEvaluation | DirectorPlannedPage[] {
  if (!Array.isArray(pages) || pages.length < 1) {
    return fail("incomplete_plan", "Required pages are missing.");
  }
  const result: DirectorPlannedPage[] = [];
  const slugs = new Set<string>();
  for (const page of pages) {
    if (!isRecord(page)) return fail("malformed_response", "A required page is not an object.");
    if (!isNonEmptyString(page.slug, 2) || !SLUG_RE.test(page.slug)) {
      return fail("invalid_plan", "Page slug must be lowercase kebab-case.");
    }
    if (slugs.has(page.slug)) return fail("invalid_plan", "Page slugs must be unique.");
    slugs.add(page.slug);
    if (!isNonEmptyString(page.name, 2) || !isNonEmptyString(page.purpose, 8)) {
      return fail("incomplete_plan", `Page "${page.slug}" is missing name or purpose.`);
    }
    if (typeof page.isHomepage !== "boolean") {
      return fail("incomplete_plan", `Page "${page.slug}" is missing isHomepage.`);
    }
    if (!Array.isArray(page.sections) || page.sections.length < 2) {
      return fail("incomplete_plan", `Page "${page.slug}" needs at least two sections.`);
    }
    const sections: DirectorPlannedPage["sections"] = [];
    for (const section of page.sections) {
      if (!isRecord(section) || !isSectionType(section.type) || !isNonEmptyString(section.purpose, 8)) {
        return fail("invalid_plan", `Page "${page.slug}" has an invalid section.`);
      }
      sections.push({ type: section.type, purpose: section.purpose.trim() });
    }
    result.push({
      slug: page.slug,
      name: page.name.trim(),
      purpose: page.purpose.trim(),
      isHomepage: page.isHomepage,
      sections,
    });
  }
  const homepages = result.filter((page) => page.isHomepage);
  if (homepages.length !== 1) return fail("invalid_plan", "A plan must have exactly one homepage.");
  if (homepages[0].slug !== "home") return fail("invalid_plan", "Homepage slug must be home.");
  return result;
}

function evaluateSitemap(nodes: unknown, pages: DirectorPlannedPage[]): DraftEvaluation | DirectorSitemapNode[] {
  if (!Array.isArray(nodes) || nodes.length !== pages.length) {
    return fail("incomplete_plan", "Sitemap must include every required page.");
  }
  const pageSlugs = new Set(pages.map((page) => page.slug));
  const result: DirectorSitemapNode[] = [];
  const seen = new Set<string>();
  for (const node of nodes) {
    if (!isRecord(node)) return fail("malformed_response", "A sitemap node is not an object.");
    if (!pageSlugs.has(String(node.slug))) return fail("invalid_plan", "Sitemap references an unknown page.");
    if (seen.has(String(node.slug))) return fail("invalid_plan", "Sitemap slugs must be unique.");
    seen.add(String(node.slug));
    if (!isNonEmptyString(node.title, 2) || typeof node.path !== "string" || !PATH_RE.test(node.path)) {
      return fail("invalid_plan", "Sitemap node title/path is invalid.");
    }
    const parentSlug = node.parentSlug == null ? null : String(node.parentSlug);
    if (parentSlug && !pageSlugs.has(parentSlug)) {
      return fail("invalid_plan", "Sitemap parentSlug is unknown.");
    }
    result.push({
      slug: String(node.slug),
      title: node.title.trim(),
      path: node.path,
      parentSlug,
    });
  }
  const home = pages.find((page) => page.isHomepage);
  const homeNode = result.find((node) => node.slug === home?.slug);
  if (!homeNode || homeNode.path !== "/" || homeNode.parentSlug) {
    return fail("invalid_plan", "Homepage sitemap path must be / with no parent.");
  }
  return result;
}

function evaluateNavigation(
  items: unknown,
  pages: DirectorPlannedPage[],
  seen = new Set<string>(),
  allowEmpty = false,
): DraftEvaluation | DirectorNavItem[] {
  if (!Array.isArray(items) || (items.length < 1 && !allowEmpty)) {
    return fail("incomplete_plan", "Navigation is missing.");
  }
  const pageSlugs = new Set(pages.map((page) => page.slug));
  const result: DirectorNavItem[] = [];
  const orders = new Set<number>();
  for (const item of items) {
    if (!isRecord(item)) return fail("malformed_response", "A navigation item is not an object.");
    if (!pageSlugs.has(String(item.pageSlug))) {
      return fail("invalid_plan", "Navigation references an unknown page.");
    }
    if (seen.has(String(item.pageSlug))) return fail("invalid_plan", "Navigation contains a duplicate page.");
    seen.add(String(item.pageSlug));
    if (!isNonEmptyString(item.label, 2)) {
      return fail("invalid_plan", "Navigation label/order is invalid.");
    }
    const order = item.order;
    if (typeof order !== "number" || !Number.isInteger(order) || order < 0 || orders.has(order)) {
      return fail("invalid_plan", "Navigation label/order is invalid.");
    }
    orders.add(order);
    const childrenEval = Array.isArray(item.children)
      ? evaluateNavigation(item.children, pages, seen, true)
      : ([] as DirectorNavItem[]);
    if (!Array.isArray(childrenEval)) return childrenEval;
    result.push({
      label: String(item.label).trim(),
      pageSlug: String(item.pageSlug),
      order,
      children: childrenEval,
    });
  }
  return result;
}

function evaluateContent(
  rows: unknown,
  pages: DirectorPlannedPage[],
): DraftEvaluation | WebsiteInformationArchitecture["contentRequirements"] {
  if (!Array.isArray(rows) || rows.length < pages.length) {
    return fail("incomplete_plan", "Content requirements must cover every page.");
  }
  const pageSlugs = new Set(pages.map((page) => page.slug));
  const covered = new Set<string>();
  const result: WebsiteInformationArchitecture["contentRequirements"] = [];
  for (const row of rows) {
    if (!isRecord(row) || !pageSlugs.has(String(row.pageSlug))) {
      return fail("invalid_plan", "Content requirement references an unknown page.");
    }
    if (!isNonEmptyString(row.tone, 3) || !Array.isArray(row.mustInclude) || row.mustInclude.length < 1) {
      return fail("incomplete_plan", "Content requirement is incomplete.");
    }
    covered.add(String(row.pageSlug));
    result.push({
      pageSlug: String(row.pageSlug),
      tone: row.tone.trim(),
      mustInclude: row.mustInclude.map((item) => String(item).trim()).filter(Boolean),
    });
  }
  if (covered.size !== pages.length) return fail("incomplete_plan", "Every page needs content requirements.");
  return result;
}

function evaluateAssets(rows: unknown): DraftEvaluation | DirectorAssetRequirement[] {
  if (!Array.isArray(rows) || rows.length < 2) {
    return fail("incomplete_plan", "Asset requirements must include at least logo and one image.");
  }
  const result: DirectorAssetRequirement[] = [];
  for (const row of rows) {
    if (!isRecord(row)) return fail("malformed_response", "An asset requirement is not an object.");
    if (!(WEBSITE_ASSET_KINDS as readonly string[]).includes(String(row.kind))) {
      return fail("invalid_plan", "Asset kind must be image, logo, icon, or og.");
    }
    if (!isNonEmptyString(row.purpose, 4) || !isNonEmptyString(row.description, 8)) {
      return fail("incomplete_plan", "Asset requirement is incomplete.");
    }
    result.push({
      kind: row.kind as DirectorAssetRequirement["kind"],
      purpose: row.purpose.trim(),
      description: row.description.trim(),
    });
  }
  if (!result.some((row) => row.kind === "logo") || !result.some((row) => row.kind === "image")) {
    return fail("incomplete_plan", "Assets must include a logo and at least one image.");
  }
  return result;
}

function evaluateForms(rows: unknown): DraftEvaluation | DirectorFormRequirement[] {
  if (!Array.isArray(rows) || rows.length < 1) return fail("incomplete_plan", "At least one form is required.");
  const result: DirectorFormRequirement[] = [];
  for (const row of rows) {
    if (!isRecord(row)) return fail("malformed_response", "A form requirement is not an object.");
    if (!(DIRECTOR_FORM_KINDS as readonly string[]).includes(String(row.kind))) {
      return fail("invalid_plan", "Unknown form kind.");
    }
    if (!isNonEmptyString(row.name, 2) || !isNonEmptyString(row.purpose, 8) || !Array.isArray(row.fields) || row.fields.length < 2) {
      return fail("incomplete_plan", "Form requirement is incomplete.");
    }
    result.push({
      kind: row.kind as DirectorFormRequirement["kind"],
      name: row.name.trim(),
      purpose: row.purpose.trim(),
      fields: row.fields.map((field) => String(field).trim()).filter(Boolean),
    });
  }
  return result;
}

function evaluateIntegrations(rows: unknown): DraftEvaluation | DirectorIntegrationRequirement[] {
  if (!Array.isArray(rows)) return fail("incomplete_plan", "Integrations array is required (may be empty only for landing-page).");
  const result: DirectorIntegrationRequirement[] = [];
  for (const row of rows) {
    if (!isRecord(row)) return fail("malformed_response", "An integration is not an object.");
    if (!(DIRECTOR_INTEGRATION_KINDS as readonly string[]).includes(String(row.kind))) {
      return fail("invalid_plan", "Unknown integration kind.");
    }
    if (!isNonEmptyString(row.name, 2) || !isNonEmptyString(row.purpose, 8) || typeof row.required !== "boolean") {
      return fail("incomplete_plan", "Integration requirement is incomplete.");
    }
    result.push({
      kind: row.kind as DirectorIntegrationRequirement["kind"],
      name: row.name.trim(),
      purpose: row.purpose.trim(),
      required: row.required,
    });
  }
  return result;
}

function assertTypeArchitecture(type: WebsiteDirectorType, pages: DirectorPlannedPage[], ia: WebsiteInformationArchitecture): DraftEvaluation | null {
  const slugs = new Set(pages.map((page) => page.slug));
  for (const required of TYPE_REQUIRED_SLUGS[type]) {
    if (!slugs.has(required)) {
      return fail("incomplete_plan", `${type} plans require a "${required}" page.`);
    }
  }
  if (type === "landing-page" && pages.length !== 1) {
    return fail("invalid_plan", "Landing page plans must contain exactly one page.");
  }
  if (type === "ecommerce" && !ia.integrations.some((row) => row.kind === "payments")) {
    return fail("incomplete_plan", "Ecommerce plans require a payments integration requirement.");
  }
  if (type === "restaurant" && !ia.forms.some((row) => row.kind === "reservation") && !pages.some((page) => page.sections.some((section) => section.type === "booking"))) {
    return fail("incomplete_plan", "Restaurant plans require a reservation form or booking section.");
  }
  if (type === "saas" && !ia.forms.some((row) => row.kind === "demo" || row.kind === "lead")) {
    return fail("incomplete_plan", "SaaS plans require a demo or lead form.");
  }
  return null;
}

export function evaluateWebsiteDirectorDraft(raw: unknown): DraftEvaluation {
  if (!isRecord(raw)) return fail("malformed_response", "Director response is not a JSON object.");
  if (!isRecord(raw.intent) || !isRecord(raw.business) || !isRecord(raw.strategy) || !isRecord(raw.informationArchitecture)) {
    return fail("incomplete_plan", "Director response is missing a pipeline stage.");
  }

  const intent = raw.intent;
  const business = raw.business;
  const strategy = raw.strategy;
  const iaRaw = raw.informationArchitecture;

  if (!isWebsiteDirectorType(intent.websiteType) || !isNonEmptyString(intent.promptSummary, 12)) {
    return fail("incomplete_plan", "Intent analysis is incomplete or websiteType is unsupported.");
  }
  if (
    !isNonEmptyString(business.businessCategory, 3) ||
    !isNonEmptyString(business.targetAudience, 8) ||
    !isNonEmptyString(business.brandSummary, 12) ||
    !isNonEmptyString(business.uniqueValue, 8)
  ) {
    return fail("incomplete_plan", "Business analysis is incomplete.");
  }
  if (!Array.isArray(strategy.goals) || strategy.goals.filter((goal) => isNonEmptyString(goal, 8)).length < 2) {
    return fail("incomplete_plan", "Strategy needs at least two goals.");
  }
  if (!isNonEmptyString(strategy.conversionFocus, 8)) {
    return fail("incomplete_plan", "Strategy conversion focus is missing.");
  }

  const seo = evaluateSeo(strategy.seoStrategy);
  if ("ok" in seo) return seo;
  const theme = evaluateTheme(strategy.suggestedTheme);
  if ("ok" in theme) return theme;
  const pages = evaluatePages(iaRaw.requiredPages);
  if ("ok" in pages) return pages;
  const sitemap = evaluateSitemap(iaRaw.sitemap, pages);
  if ("ok" in sitemap) return sitemap;
  const navigation = evaluateNavigation(iaRaw.navigation, pages);
  if ("ok" in navigation) return navigation;
  const contentRequirements = evaluateContent(iaRaw.contentRequirements, pages);
  if ("ok" in contentRequirements) return contentRequirements;
  const assetRequirements = evaluateAssets(iaRaw.assetRequirements);
  if ("ok" in assetRequirements) return assetRequirements;
  const forms = evaluateForms(iaRaw.forms);
  if ("ok" in forms) return forms;
  const integrations = evaluateIntegrations(iaRaw.integrations);
  if ("ok" in integrations) return integrations;

  const ia: WebsiteInformationArchitecture = {
    sitemap,
    navigation,
    requiredPages: pages,
    contentRequirements,
    assetRequirements,
    forms,
    integrations,
  };
  const typeRule = assertTypeArchitecture(intent.websiteType, pages, ia);
  if (typeRule) return typeRule;

  return {
    ok: true,
    draft: {
      intent: {
        websiteType: intent.websiteType,
        promptSummary: intent.promptSummary.trim(),
      },
      business: {
        businessCategory: business.businessCategory.trim(),
        targetAudience: business.targetAudience.trim(),
        brandSummary: business.brandSummary.trim(),
        uniqueValue: business.uniqueValue.trim(),
      },
      strategy: {
        goals: strategy.goals.map((goal) => String(goal).trim()),
        conversionFocus: strategy.conversionFocus.trim(),
        seoStrategy: seo,
        suggestedTheme: theme,
      },
      informationArchitecture: ia,
    },
  };
}

export function assertDirectorWebsitePlan(plan: DirectorWebsitePlan): void {
  const evaluation = evaluateWebsiteDirectorDraft({
    intent: plan.intent,
    business: plan.business,
    strategy: plan.strategy,
    informationArchitecture: plan.informationArchitecture,
  });
  if (!evaluation.ok) {
    throw new WebsiteDirectorError(evaluation.reason, evaluation.code);
  }
  if (plan.websiteType !== plan.intent.websiteType) {
    throw new WebsiteDirectorError("Plan websiteType must match intent analysis.", "invalid_plan");
  }
  if (plan.requiredPages.length !== plan.informationArchitecture.requiredPages.length) {
    throw new WebsiteDirectorError("Plan pages must match information architecture.", "invalid_plan");
  }
}
