import { issue } from "@/lib/website/template-renderer-contract/errors";
import type { WbTemplateRendererIssue } from "@/lib/website/template-renderer-contract/errors";
import type { WbTemplateRendererPackageInput } from "@/lib/website/template-renderer-contract/types";

export function validatePackageReferences(
  pkg: WbTemplateRendererPackageInput,
): WbTemplateRendererIssue[] {
  const issues: WbTemplateRendererIssue[] = [];
  const layoutIds = new Set(Object.keys(pkg.layouts));
  const regionIds = new Set(Object.keys(pkg.regions));
  const pageIds = new Set(Object.keys(pkg.pages));

  if (!pageIds.has(pkg.entry.defaultPageId)) {
    issues.push(
      issue(
        "output.invalid_reference",
        `entry.defaultPageId "${pkg.entry.defaultPageId}" does not exist in package.pages`,
        "package.entry.defaultPageId",
      ),
    );
  }

  if (!layoutIds.has(pkg.entry.defaultLayoutId)) {
    issues.push(
      issue(
        "output.invalid_reference",
        `entry.defaultLayoutId "${pkg.entry.defaultLayoutId}" does not exist in package.layouts`,
        "package.entry.defaultLayoutId",
      ),
    );
  }

  for (const [layoutId, layout] of Object.entries(pkg.layouts)) {
    if (layout.id !== layoutId) {
      issues.push(
        issue(
          "output.invalid_reference",
          `layout key "${layoutId}" does not match layout.id "${layout.id}"`,
          `package.layouts.${layoutId}.id`,
        ),
      );
    }

    for (const regionId of layout.regionOrder) {
      if (!regionIds.has(regionId)) {
        issues.push(
          issue(
            "validation.layout_region_mismatch",
            `layout "${layoutId}" references unknown region "${regionId}"`,
            `package.layouts.${layoutId}.regionOrder`,
          ),
        );
      }
    }
  }

  for (const [regionId, region] of Object.entries(pkg.regions)) {
    if (region.id !== regionId) {
      issues.push(
        issue(
          "output.invalid_reference",
          `region key "${regionId}" does not match region.id "${region.id}"`,
          `package.regions.${regionId}.id`,
        ),
      );
    }
  }

  for (const [pageId, page] of Object.entries(pkg.pages)) {
    if (page.id !== pageId) {
      issues.push(
        issue(
          "output.invalid_reference",
          `page key "${pageId}" does not match page.id "${page.id}"`,
          `package.pages.${pageId}.id`,
        ),
      );
    }

    if (!layoutIds.has(page.layoutId)) {
      issues.push(
        issue(
          "validation.page_layout_mismatch",
          `page "${pageId}" references unknown layout "${page.layoutId}"`,
          `package.pages.${pageId}.layoutId`,
        ),
      );
      continue;
    }

    const layout = pkg.layouts[page.layoutId];
    const layoutRegionOrder = new Set(layout.regionOrder);

    for (const regionId of page.regionIds) {
      if (!regionIds.has(regionId)) {
        issues.push(
          issue(
            "validation.page_region_mismatch",
            `page "${pageId}" references unknown region "${regionId}"`,
            `package.pages.${pageId}.regionIds`,
          ),
        );
      } else if (!layoutRegionOrder.has(regionId)) {
        issues.push(
          issue(
            "validation.page_region_mismatch",
            `page "${pageId}" region "${regionId}" is not declared in layout "${page.layoutId}"`,
            `package.pages.${pageId}.regionIds`,
          ),
        );
      }
    }
  }

  for (const [regionId] of Object.entries(pkg.placementRules.regionOverrides ?? {})) {
    if (!regionIds.has(regionId)) {
      issues.push(
        issue(
          "validation.placement_override_unknown_region",
          `placementRules.regionOverrides references unknown region "${regionId}"`,
          `package.placementRules.regionOverrides.${regionId}`,
        ),
      );
    }
  }

  for (const constraint of pkg.placementRules.constraints ?? []) {
    if (constraint.when.region && !regionIds.has(constraint.when.region)) {
      issues.push(
        issue(
          "validation.constraint_unknown_region",
          `placement constraint "${constraint.id}" references unknown region "${constraint.when.region}"`,
          "package.placementRules.constraints",
        ),
      );
    }
    if (constraint.when.page && !pageIds.has(constraint.when.page)) {
      issues.push(
        issue(
          "validation.constraint_unknown_page",
          `placement constraint "${constraint.id}" references unknown page "${constraint.when.page}"`,
          "package.placementRules.constraints",
        ),
      );
    }
  }

  return issues;
}
