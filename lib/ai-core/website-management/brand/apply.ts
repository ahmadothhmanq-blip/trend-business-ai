/**
 * Phase 5 — Brand management re-apply anytime.
 */

import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { BrandManagementState } from "@/lib/ai-core/website-management/types";
import {
  applyBrandKitTokensToFiles,
  applyBrandKitToDesignSystem,
} from "@/lib/ai-core/website-design-platform/brand-kit";
import type { BrandKitAttachment } from "@/lib/ai-core/website-design-platform/types";

export function applyBrandManagement(params: {
  project: GeneratedWebsiteProject;
  brand: BrandManagementState;
}): {
  project: GeneratedWebsiteProject;
  notes: string[];
} {
  const notes: string[] = [];
  const kit: BrandKitAttachment = {
    brandIdentityId: params.brand.brandIdentityId || "manual",
    name: params.brand.businessName,
    primary: params.brand.primary,
    secondary: params.brand.secondary,
    accent: params.brand.accent,
    logoUrl: params.brand.logoUrl,
    displayFont: params.brand.displayFont,
    bodyFont: params.brand.bodyFont,
  };

  let files = applyBrandKitTokensToFiles(params.project.files || [], kit);
  notes.push("Theme tokens updated from brand kit");

  // Replace brand name in header/footer/common strings
  const name = params.brand.businessName.trim();
  if (name) {
    files = files.map((f) => {
      if (!/\.(tsx|ts|jsx|js)$/.test(f.path)) return f;
      let content = f.content;
      // brandName="..." props
      content = content.replace(
        /brandName=\{?["'][^"']*["']\}?/g,
        `brandName=${JSON.stringify(name)}`,
      );
      content = content.replace(
        /brandName:\s*["'][^"']*["']/g,
        `brandName: ${JSON.stringify(name)}`,
      );
      return content === f.content ? f : { ...f, content };
    });
    notes.push(`Business name applied: ${name}`);
  }

  if (params.brand.logoUrl) {
    files = replaceLogoReferences(files, params.brand.logoUrl);
    notes.push("Logo references updated");
  }

  const designSystem = applyBrandKitToDesignSystem(
    params.project.designSystem,
    kit,
  );

  return {
    project: {
      ...params.project,
      files,
      designSystem,
      title: name || params.project.title,
      colorPalette: [
        kit.primary || params.project.colorPalette?.[0] || "#111",
        kit.secondary || params.project.colorPalette?.[1] || "#666",
        kit.accent || params.project.colorPalette?.[2] || "#C9A227",
      ].filter(Boolean) as string[],
      typography: [
        kit.displayFont || params.project.typography?.[0] || "Georgia",
        kit.bodyFont || params.project.typography?.[1] || "system-ui",
      ],
      settings: {
        ...params.project.settings,
        businessName: name,
        brandIdentityId: kit.brandIdentityId,
      } as GeneratedWebsiteProject["settings"],
    },
    notes,
  };
}

function replaceLogoReferences(
  files: GeneratedProjectFile[],
  logoUrl: string,
): GeneratedProjectFile[] {
  return files.map((f) => {
    if (!/\.(tsx|ts|jsx|js)$/.test(f.path)) return f;
    let content = f.content;
    content = content.replace(
      /src=\{?["']\/(?:logo|brand)[^"']*["']\}?/gi,
      `src=${JSON.stringify(logoUrl)}`,
    );
    content = content.replace(
      /logoUrl=\{?["'][^"']*["']\}?/g,
      `logoUrl=${JSON.stringify(logoUrl)}`,
    );
    return content === f.content ? f : { ...f, content };
  });
}
