import { z } from "zod";
import * as jsonLd from "@/lib/seo/json-ld";
import { REF_FAQ, MARKETING_PRODUCTS } from "@/lib/constants/marketing-content";
import { getPublishedBlogPosts } from "@/lib/seo/content/blog";
import { SITE_NAME, SITE_ORGANIZATION } from "@/lib/seo/site";
import { clampScore, gradeFromScore } from "@/lib/ai-search/utils";
import type {
  SchemaValidationIssue,
  SchemaValidationResult,
} from "@/types/ai-search";

const SCHEMA_TYPES = [
  "Organization",
  "Product",
  "SoftwareApplication",
  "FAQ",
  "Article",
  "Breadcrumb",
  "WebSite",
  "SearchAction",
  "HowTo",
  "Review",
] as const;

export const schemaValidateBodySchema = z.object({
  jsonLd: z.unknown().optional(),
  pageType: z
    .enum([
      "home",
      "product",
      "article",
      "faq",
      "howto",
      "generic",
    ])
    .optional(),
  path: z.string().max(300).optional(),
});

export type SchemaValidateBody = z.infer<typeof schemaValidateBodySchema>;

function hasBuilder(type: (typeof SCHEMA_TYPES)[number]): boolean {
  switch (type) {
    case "Organization":
      return typeof jsonLd.organizationJsonLd === "function";
    case "Product":
      return typeof jsonLd.productJsonLd === "function";
    case "SoftwareApplication":
      return typeof jsonLd.softwareApplicationJsonLd === "function";
    case "FAQ":
      return typeof jsonLd.faqPageJsonLd === "function";
    case "Article":
      return typeof jsonLd.articleJsonLd === "function";
    case "Breadcrumb":
      return typeof jsonLd.breadcrumbJsonLd === "function";
    case "WebSite":
      return typeof jsonLd.websiteJsonLd === "function";
    case "SearchAction":
      return typeof jsonLd.websiteJsonLd === "function";
    case "HowTo":
      return typeof jsonLd.howToJsonLd === "function";
    case "Review":
      return typeof (jsonLd as { reviewJsonLd?: unknown }).reviewJsonLd === "function";
    default:
      return false;
  }
}

function usedOnSite(type: (typeof SCHEMA_TYPES)[number]): boolean {
  switch (type) {
    case "Organization":
    case "WebSite":
    case "SearchAction":
    case "SoftwareApplication":
      return true;
    case "FAQ":
      return REF_FAQ.length > 0;
    case "Product":
      return MARKETING_PRODUCTS.length > 0;
    case "Article":
      return getPublishedBlogPosts().length > 0;
    case "Breadcrumb":
      return true;
    case "HowTo":
      return false;
    case "Review":
      return false;
    default:
      return false;
  }
}

function collectNodes(payload: unknown): Array<Record<string, unknown>> {
  if (!payload || typeof payload !== "object") return [];
  const obj = payload as Record<string, unknown>;
  if (Array.isArray(obj["@graph"])) {
    return obj["@graph"].filter((n) => n && typeof n === "object") as Array<Record<string, unknown>>;
  }
  if (Array.isArray(payload)) {
    return payload.filter((n) => n && typeof n === "object") as Array<Record<string, unknown>>;
  }
  return [obj];
}

function validateNode(node: Record<string, unknown>): SchemaValidationIssue[] {
  const issues: SchemaValidationIssue[] = [];
  const typeRaw = node["@type"];
  const type = Array.isArray(typeRaw) ? String(typeRaw[0] ?? "") : String(typeRaw ?? "");

  if (!type) {
    issues.push({
      type: "Unknown",
      severity: "critical",
      field: "@type",
      message: "JSON-LD node is missing @type.",
      recommendation: "Set @type to a supported schema.org type.",
    });
    return issues;
  }

  const requireFields = (fields: string[]) => {
    for (const field of fields) {
      if (node[field] === undefined || node[field] === null || node[field] === "") {
        issues.push({
          type,
          severity: "warning",
          field,
          message: `${type} is missing required field “${field}”.`,
          recommendation: `Provide a valid “${field}” value for ${type}.`,
        });
      }
    }
  };

  switch (type) {
    case "Organization":
      requireFields(["name", "url"]);
      break;
    case "WebSite":
      requireFields(["name", "url"]);
      break;
    case "SoftwareApplication":
      requireFields(["name", "applicationCategory"]);
      break;
    case "Product":
      requireFields(["name", "description"]);
      break;
    case "FAQPage":
      if (!Array.isArray(node.mainEntity) || node.mainEntity.length === 0) {
        issues.push({
          type,
          severity: "critical",
          field: "mainEntity",
          message: "FAQPage has no questions.",
          recommendation: "Include Question entities with acceptedAnswer text.",
        });
      }
      break;
    case "Article":
      requireFields(["headline", "description"]);
      break;
    case "BreadcrumbList":
      if (!Array.isArray(node.itemListElement) || node.itemListElement.length < 2) {
        issues.push({
          type,
          severity: "warning",
          field: "itemListElement",
          message: "BreadcrumbList should include at least two items.",
          recommendation: "Emit Home → Section → Page breadcrumb nodes.",
        });
      }
      break;
    case "HowTo":
      if (!Array.isArray(node.step) || node.step.length < 2) {
        issues.push({
          type,
          severity: "warning",
          field: "step",
          message: "HowTo needs at least two steps.",
          recommendation: "Add HowToStep entries with name and text.",
        });
      }
      break;
    case "Review":
      requireFields(["reviewBody", "author"]);
      break;
    default:
      issues.push({
        type,
        severity: "info",
        message: `Unrecognized or unvalidated type “${type}”.`,
        recommendation: "Prefer supported types listed in the Schema Validator.",
      });
  }

  return issues;
}

export function validateSchema(input: SchemaValidateBody = {}): SchemaValidationResult {
  const platformCoverage = SCHEMA_TYPES.map((type) => {
    const available = hasBuilder(type);
    const used = usedOnSite(type);
    let status: "pass" | "warn" | "fail" = "pass";
    let detail = "Builder available and in use.";
    if (!available) {
      status = "fail";
      detail = "No reusable JSON-LD builder in lib/seo/json-ld.";
    } else if (!used) {
      status = "warn";
      detail = "Builder exists but not detected on primary public surfaces yet.";
    }
    return { type, available, usedOnSite: used, status, detail };
  });

  const pageIssues: SchemaValidationIssue[] = [];
  if (input.jsonLd !== undefined) {
    const nodes = collectNodes(input.jsonLd);
    if (!nodes.length) {
      pageIssues.push({
        type: "Payload",
        severity: "critical",
        message: "No JSON-LD nodes found in payload.",
        recommendation: "Submit a schema.org object, array, or @graph document.",
      });
    } else {
      for (const node of nodes) pageIssues.push(...validateNode(node));
    }
  }

  if (input.pageType === "faq" && !input.jsonLd) {
    pageIssues.push({
      type: "FAQ",
      severity: "info",
      message: "FAQ pages should emit FAQPage JSON-LD.",
      recommendation: "Use faqPageJsonLd with real Q&A pairs.",
    });
  }
  if (input.pageType === "product" && !input.jsonLd) {
    pageIssues.push({
      type: "Product",
      severity: "info",
      message: "Product pages should emit Product or SoftwareApplication schema.",
      recommendation: "Use productJsonLd or softwareApplicationJsonLd.",
    });
  }

  const errors = pageIssues.filter((i) => i.severity === "critical").map((i) => i.message);
  const warnings = [
    ...pageIssues.filter((i) => i.severity === "warning").map((i) => i.message),
    ...platformCoverage.filter((c) => c.status === "warn").map((c) => `${c.type}: ${c.detail}`),
  ];

  const coverageScore =
    platformCoverage.reduce((sum, item) => {
      if (item.status === "pass") return sum + 100;
      if (item.status === "warn") return sum + 55;
      return sum + 10;
    }, 0) / platformCoverage.length;

  const pagePenalty = Math.min(40, errors.length * 12 + warnings.length * 3);
  const score = clampScore(coverageScore - pagePenalty);

  const recommendations: string[] = [];
  for (const item of platformCoverage) {
    if (item.status === "fail") recommendations.push(`Implement ${item.type} JSON-LD builder and emit it where relevant.`);
    if (item.status === "warn") recommendations.push(`Ship ${item.type} schema on qualifying public pages.`);
  }
  if (!SITE_ORGANIZATION.sameAs.length) {
    recommendations.push("Add organization sameAs social profiles to strengthen Organization schema.");
  }
  recommendations.push(`Keep ${SITE_NAME} Organization + WebSite + SearchAction on every indexable layout.`);

  return {
    score,
    grade: gradeFromScore(score),
    platformCoverage,
    pageIssues,
    warnings: warnings.slice(0, 20),
    errors: errors.slice(0, 20),
    recommendations: recommendations.slice(0, 12),
  };
}
