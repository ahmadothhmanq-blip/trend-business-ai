/**
 * Website Builder — publishing & performance services (Phase 7).
 */

import type { WebsiteCapabilityId } from "@/lib/website/builder/capabilities/types";
import {
  filterItemsByCapabilities,
  type WebsiteCapabilityService,
} from "@/lib/website/builder/capabilities/service";

export type PublishingChecklistItem = {
  id: string;
  label: string;
  description: string;
  required: boolean;
  alwaysVisible?: boolean;
  requiresAnyCapability?: WebsiteCapabilityId[];
};

export const PUBLISHING_CHECKLIST: PublishingChecklistItem[] = [
  {
    id: "quality",
    label: "Quality gates",
    description: "Pre-publish quality control passed",
    required: true,
    alwaysVisible: true,
  },
  {
    id: "seo",
    label: "SEO metadata",
    description: "Titles, descriptions, and sitemap ready",
    required: true,
    requiresAnyCapability: ["seo"],
  },
  {
    id: "ssl",
    label: "SSL",
    description: "HTTPS enabled on publish URL",
    required: true,
    alwaysVisible: true,
  },
  {
    id: "cdn",
    label: "CDN delivery",
    description: "Static assets served via platform CDN path",
    required: false,
    alwaysVisible: true,
  },
  {
    id: "backup",
    label: "Backup snapshot",
    description: "Server-side blueprint snapshot stored",
    required: false,
    alwaysVisible: true,
  },
  {
    id: "performance",
    label: "Performance",
    description: "Core Web Vitals heuristics within targets",
    required: false,
    alwaysVisible: true,
  },
  {
    id: "accessibility",
    label: "Accessibility",
    description: "Basic a11y checks on key pages",
    required: false,
    alwaysVisible: true,
  },
  {
    id: "payments",
    label: "Payment flows",
    description: "Checkout and billing routes validated",
    required: false,
    requiresAnyCapability: ["payments", "products"],
  },
];

export function resolvePublishingChecklist(
  service: WebsiteCapabilityService,
): PublishingChecklistItem[] {
  return filterItemsByCapabilities(PUBLISHING_CHECKLIST, service);
}

export type BuilderAccessibilityIssue = {
  id: string;
  severity: "error" | "warning";
  message: string;
};

export function runBuilderAccessibilityHeuristics(files: Array<{ path: string; content: string }>): BuilderAccessibilityIssue[] {
  const issues: BuilderAccessibilityIssue[] = [];
  const pageFiles = files.filter(
    (f) => f.path.endsWith(".tsx") && f.path.includes("page"),
  );

  for (const file of pageFiles) {
    if (!/<h1\b/i.test(file.content)) {
      issues.push({
        id: `a11y-h1-${file.path}`,
        severity: "warning",
        message: `Missing H1 on ${file.path}`,
      });
    }
    if (!/alt=/i.test(file.content) && /<img\b/i.test(file.content)) {
      issues.push({
        id: `a11y-alt-${file.path}`,
        severity: "warning",
        message: `Images may be missing alt text in ${file.path}`,
      });
    }
    if (!/lang=/i.test(file.content) && file.path === "app/layout.tsx") {
      issues.push({
        id: "a11y-lang",
        severity: "error",
        message: "Root layout should set lang attribute",
      });
    }
  }

  return issues;
}
