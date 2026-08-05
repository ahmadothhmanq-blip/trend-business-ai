import { buildSlotsFromProfile } from "@/lib/ai-core/image-engine/profile-engine";
import { resolveImageProfile } from "@/lib/ai-core/image-engine/profiles";
import {
  contextFromPackage,
  runIndustryImageRulesEngine,
  type IndustryImageRulesReport,
} from "@/lib/ai-core/image-engine/rules";
import {
  IMAGE_SLOT_KINDS,
  type SiteImageSlotMap,
} from "@/lib/ai-core/image-engine/slots";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import { buildSiteImageSlotInventory } from "@/lib/website/image-management/list-slots";
import {
  applyImageManagementOperation,
  type ManagedSiteImage,
} from "@/lib/website/image-management/operations";

const PLACEHOLDER_RE =
  /placehold\.co|via\.placeholder|picsum\.photos|dummyimage|lorem ipsum/i;

export type ImageValidationContext = {
  industry?: string | null;
  templatePackageId?: string | null;
  routingIndustryId?: string | null;
  subcategory?: string | null;
  visualStyle?: string | null;
};

export type ImageValidationResult = {
  passed: boolean;
  repairs: number;
  duplicatesRemoved: number;
  industryId: string;
  issues: string[];
  files: GeneratedProjectFile[];
  slotCount: number;
  uniqueUrlCount: number;
  rulesReport: IndustryImageRulesReport;
};

function inventoryToSlotMap(images: ManagedSiteImage[]): SiteImageSlotMap {
  const map: SiteImageSlotMap = {
    hero: [],
    gallery: [],
    about: [],
    features: [],
    team: [],
    products: [],
    testimonials: [],
    backgrounds: [],
    cta: [],
  };
  for (const img of images) {
    if (!img.url) continue;
    map[img.slot].push({
      id: img.id,
      kind: img.slot,
      url: img.url,
      alt: img.alt,
      industryId: undefined,
      provider: img.provider,
      isUserOverride: img.isUserOverride,
      sourceTier: img.isUserOverride ? "user" : undefined,
    });
  }
  return map;
}

function collectImageUrls(files: GeneratedProjectFile[]): string[] {
  return buildSiteImageSlotInventory(files)
    .map((img) => img.url)
    .filter((url): url is string => Boolean(url));
}

/**
 * Validate and auto-repair project images before preview/export/render.
 * Uses the Industry Image Rules Engine for industry-correct imagery.
 */
export function validateAndRepairProjectImages(
  files: GeneratedProjectFile[],
  ctx: ImageValidationContext = {},
): ImageValidationResult {
  const profileCtx = contextFromPackage(ctx.templatePackageId ?? "", {
    industry: ctx.industry,
    routingIndustryId: ctx.routingIndustryId,
    subcategory: ctx.subcategory,
    visualStyle: ctx.visualStyle,
  });
  const industry = profileCtx.industry ?? "corporate";

  let current = [...files];
  const issues: string[] = [];
  let repairs = 0;

  const inventory = buildSiteImageSlotInventory(current);
  if (!inventory.length) {
    const { slots } = buildSlotsFromProfile(profileCtx, {
      projectSeed: ctx.templatePackageId ?? industry,
    });
    for (const kind of IMAGE_SLOT_KINDS) {
      for (const slot of slots[kind]) {
        const result = applyImageManagementOperation(current, {
          action: "replace",
          imageId: slot.id,
          slot: kind,
          url: slot.url,
          alt: slot.alt,
        });
        if (result.ok) {
          current = result.files;
          repairs += 1;
        }
      }
    }
    issues.push("Generated missing lib/site-images.ts slot inventory");
  }

  const userOverrides = buildSiteImageSlotInventory(current).filter(
    (img) => img.isUserOverride,
  );

  const slotMap = inventoryToSlotMap(buildSiteImageSlotInventory(current));
  const rulesResult = runIndustryImageRulesEngine({
    slots: slotMap,
    ctx: profileCtx,
    userOverrides: userOverrides.map((img) => ({
      url: img.url!,
      alt: img.alt,
      isUserOverride: true,
      provider: img.provider,
    })),
  });

  repairs += rulesResult.replaced;

  for (const rejection of rulesResult.rejected) {
    if (rejection.url) {
      issues.push(`${rejection.category}: ${rejection.detail}`);
    }
  }

  for (const kind of IMAGE_SLOT_KINDS) {
    for (const slot of rulesResult.slots[kind]) {
      const existing = buildSiteImageSlotInventory(current).find(
        (img) => img.id === slot.id,
      );
      if (existing?.url === slot.url && existing?.isUserOverride) continue;
      if (existing?.url === slot.url) continue;

      const result = applyImageManagementOperation(current, {
        action: "replace",
        imageId: slot.id,
        slot: kind,
        url: slot.url,
        alt: slot.alt,
      });
      if (result.ok) current = result.files;
    }
  }

  const urls = collectImageUrls(current);
  const unique = new Set(urls);
  const duplicatesRemoved = urls.length - unique.size;

  if (duplicatesRemoved > 0) {
    issues.push(`Removed ${duplicatesRemoved} duplicate image URL(s)`);
    const seen = new Set<string>();
    for (const img of buildSiteImageSlotInventory(current)) {
      if (!img.url || img.isUserOverride) {
        if (img.url) seen.add(img.url);
        continue;
      }
      if (seen.has(img.url)) {
        const fresh = rulesResult.slots[img.slot][0];
        if (fresh) {
          const result = applyImageManagementOperation(current, {
            action: "replace",
            imageId: img.id,
            slot: img.slot,
            url: fresh.url,
            alt: fresh.alt,
          });
          if (result.ok) {
            current = result.files;
            repairs += 1;
          }
        }
      } else {
        seen.add(img.url);
      }
    }
  }

  for (const img of buildSiteImageSlotInventory(current)) {
    if (img.isUserOverride) continue;
    if (!img.url || PLACEHOLDER_RE.test(img.url)) {
      issues.push(`Placeholder rejected for ${img.id}`);
      const replacement = rulesResult.slots[img.slot][0];
      if (replacement) {
        const result = applyImageManagementOperation(current, {
          action: "replace",
          imageId: img.id,
          slot: img.slot,
          url: replacement.url,
          alt: replacement.alt,
        });
        if (result.ok) {
          current = result.files;
          repairs += 1;
        }
      }
    }
  }

  const finalUrls = collectImageUrls(current);
  const finalUnique = new Set(finalUrls);
  const profile = resolveImageProfile(profileCtx).profile;

  const rulesReport: IndustryImageRulesReport = {
    ...rulesResult,
    passed:
      rulesResult.passed &&
      finalUrls.length > 0 &&
      !finalUrls.some((u) => PLACEHOLDER_RE.test(u)),
    summary: rulesResult.summary,
  };

  return {
    passed: rulesReport.passed,
    repairs,
    duplicatesRemoved,
    industryId: profile.id,
    issues,
    files: current,
    slotCount: buildSiteImageSlotInventory(current).length,
    uniqueUrlCount: finalUnique.size,
    rulesReport,
  };
}

export function summarizeRulesReport(report: IndustryImageRulesReport): string {
  const lines = [
    `Industry: ${report.detected.industryLabel} (${report.detected.industryId})`,
    `Profile: ${report.profileId}`,
    `Subcategory: ${report.detected.subcategory ?? "—"}`,
    `Visual style: ${report.detected.visualStyle}`,
    `Selected: ${report.selected.length} | Rejected: ${report.rejected.length} | Replaced: ${report.replaced}`,
    `Sources: user=${report.sourceCounts.user} ai=${report.sourceCounts.ai} library=${report.sourceCounts.library} stock=${report.sourceCounts.stock}`,
    report.summary,
  ];
  return lines.join("\n");
}
