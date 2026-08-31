import { buildSlotsFromProfile } from "@/lib/ai-core/image-engine/profile-engine";
import { resolveImageProfile } from "@/lib/ai-core/image-engine/profiles";
import {
  contextFromPackage,
  runIndustryImageRulesEngine,
  type IndustryImageRulesReport,
} from "@/lib/ai-core/image-engine/rules";
import {
  emptySlotMap,
  IMAGE_SLOT_KINDS,
  type ImageSlotKind,
  type SiteImageSlotMap,
  roleToSlotKind,
} from "@/lib/ai-core/image-engine/slots";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import { isForbiddenStockUrlForIndustry } from "@/lib/ai-core/image-engine/stock";
import { buildSiteImageSlotInventory } from "@/lib/website/image-management/list-slots";
import {
  applyImageManagementOperation,
  type ManagedSiteImage,
} from "@/lib/website/image-management/operations";

const PLACEHOLDER_RE =
  /placehold\.co|via\.placeholder|picsum\.photos|dummyimage|lorem ipsum/i;

const SITE_IMAGES_PATH = "lib/site-images.ts";

export type ImageValidationContext = {
  industry?: string | null;
  templatePackageId?: string | null;
  routingIndustryId?: string | null;
  subcategory?: string | null;
  visualStyle?: string | null;
  /** When false (default), blank slots stay blank — no industry stock backfill. */
  allowStockBackfill?: boolean;
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

function resolveInventorySlot(
  img: ManagedSiteImage & { role?: string },
): ImageSlotKind {
  if (img.slot && (IMAGE_SLOT_KINDS as readonly string[]).includes(img.slot)) {
    return img.slot;
  }
  if (img.role?.trim()) {
    return roleToSlotKind(img.role.trim());
  }
  return "gallery";
}

function inventoryToSlotMap(images: ManagedSiteImage[]): SiteImageSlotMap {
  const map = emptySlotMap();
  for (const img of images) {
    if (!img.url) continue;
    const slot = resolveInventorySlot(img);
    map[slot].push({
      id: img.id,
      kind: slot,
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

function findSiteImagesFile(
  files: GeneratedProjectFile[],
): GeneratedProjectFile | undefined {
  return files.find(
    (f) =>
      f.path === SITE_IMAGES_PATH || f.path === "lib/site-images.js",
  );
}

function patchExportConst(source: string, name: string, value: string): string {
  const re = new RegExp(
    `export const ${name}(?::[^=]+)?\\s*=\\s*(?:"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*')`,
  );
  if (re.test(source)) {
    return source.replace(
      re,
      `export const ${name} = ${JSON.stringify(value)}`,
    );
  }
  return source;
}

function patchExportArray(source: string, name: string, values: string[]): string {
  const re = new RegExp(
    `export const ${name}\\s*=\\s*\\[[\\s\\S]*?\\] as const`,
  );
  const replacement = `export const ${name} = ${JSON.stringify(values)} as const`;
  if (re.test(source)) {
    return source.replace(re, replacement);
  }
  return source;
}

function clearSlotUrlInSource(
  source: string,
  slot: ImageSlotKind,
  index = 0,
): string {
  switch (slot) {
    case "hero":
      return patchExportConst(source, "HERO_IMAGE", "");
    case "products":
      return patchExportConst(source, "PRODUCT_IMAGE", "");
    case "features":
      return patchExportConst(source, "SERVICE_IMAGE", "");
    case "backgrounds":
      return patchExportConst(source, "BACKGROUND_IMAGE", "");
    case "about": {
      const next = patchExportConst(source, "ABOUT_IMAGE", "");
      return patchExportArray(next, "SECTION_IMAGES", []);
    }
    case "gallery": {
      const galleryMatch = source.match(
        /export const GALLERY_IMAGES = (\[[\s\S]*?\]) as const/,
      );
      const gallery = galleryMatch
        ? (JSON.parse(galleryMatch[1]!) as string[])
        : [];
      gallery[index] = "";
      return patchExportArray(source, "GALLERY_IMAGES", gallery);
    }
    case "team":
      return patchExportArray(source, "TEAM_IMAGES", []);
    case "testimonials":
      return patchExportArray(source, "TESTIMONIAL_IMAGES", []);
    default:
      return source;
  }
}

function clearInvalidUrlsInFiles(
  files: GeneratedProjectFile[],
  ctx: ImageValidationContext = {},
): { files: GeneratedProjectFile[]; repairs: number; issues: string[] } {
  const siteFile = findSiteImagesFile(files);
  if (!siteFile?.content) {
    return { files, repairs: 0, issues: [] };
  }

  const routingId =
    ctx.routingIndustryId ?? ctx.industry ?? "business";

  let content = siteFile.content;
  let repairs = 0;
  const issues: string[] = [];

  for (const img of buildSiteImageSlotInventory(files)) {
    if (!img.url) continue;
    const isPlaceholder = PLACEHOLDER_RE.test(img.url);
    const isCrossIndustry =
      !img.isUserOverride &&
      isForbiddenStockUrlForIndustry(img.url, routingId);
    if (!isPlaceholder && !isCrossIndustry) continue;

    issues.push(
      isPlaceholder
        ? `Placeholder rejected for ${img.id}`
        : `Cross-industry image rejected for ${img.id}`,
    );
    const index = Number.parseInt(img.id.split("-").pop() ?? "1", 10) - 1;
    content = clearSlotUrlInSource(content, img.slot, index);
    repairs += 1;
  }

  if (repairs === 0) {
    return { files, repairs: 0, issues };
  }

  const nextFiles = files.map((file) =>
    file.path === siteFile.path ? { ...file, content } : file,
  );
  return { files: nextFiles, repairs, issues };
}

function buildRulesReport(
  files: GeneratedProjectFile[],
  profileCtx: ReturnType<typeof contextFromPackage>,
): IndustryImageRulesReport {
  const userOverrides = buildSiteImageSlotInventory(files).filter(
    (img) => img.isUserOverride,
  );
  const slotMap = inventoryToSlotMap(buildSiteImageSlotInventory(files));
  return runIndustryImageRulesEngine({
    slots: slotMap,
    ctx: profileCtx,
    userOverrides: userOverrides.map((img) => ({
      url: img.url!,
      alt: img.alt,
      isUserOverride: true,
      provider: img.provider,
    })),
  });
}

/**
 * Validate project images before preview/export/render.
 * By default blank slots remain blank — stock backfill is opt-in via allowStockBackfill.
 */
export function validateAndRepairProjectImages(
  files: GeneratedProjectFile[],
  ctx: ImageValidationContext = {},
): ImageValidationResult {
  const allowStockBackfill = ctx.allowStockBackfill ?? false;
  const profileCtx = contextFromPackage(ctx.templatePackageId ?? "", {
    industry: ctx.industry,
    routingIndustryId: ctx.routingIndustryId,
    subcategory: ctx.subcategory,
    visualStyle: ctx.visualStyle,
  });
  const industry = profileCtx.industry ?? "corporate";
  const profile = resolveImageProfile(profileCtx).profile;

  if (!allowStockBackfill) {
    const cleared = clearInvalidUrlsInFiles(files, ctx);
    const current = cleared.files;
    const issues = [...cleared.issues];
    const rulesResult = buildRulesReport(current, profileCtx);

    for (const rejection of rulesResult.rejected) {
      if (rejection.url) {
        issues.push(`${rejection.category}: ${rejection.detail}`);
      }
    }

    const finalUrls = collectImageUrls(current);
    const finalUnique = new Set(finalUrls);
    const noPlaceholders = !finalUrls.some((url) => PLACEHOLDER_RE.test(url));
    const rulesReport: IndustryImageRulesReport = {
      ...rulesResult,
      passed: noPlaceholders,
      summary: noPlaceholders
        ? `Image validation passed with ${finalUnique.size} filled slot(s); blank slots preserved.`
        : rulesResult.summary,
    };

    return {
      passed: noPlaceholders,
      repairs: cleared.repairs,
      duplicatesRemoved: 0,
      industryId: profile.id,
      issues,
      files: current,
      slotCount: buildSiteImageSlotInventory(current).length,
      uniqueUrlCount: finalUnique.size,
      rulesReport,
    };
  }

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
