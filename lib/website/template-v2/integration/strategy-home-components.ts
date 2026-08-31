import { getIndustryDesignPreset } from "@/lib/ai-core/design-renderer/presets";
import type { DesignRendererComponentId } from "@/lib/ai-core/design-renderer/types";
import { isIndustryId } from "@/lib/ai-core/templates/industries";
import type { IndustryId } from "@/lib/ai-core/templates/types";
import {
  resolveComponentIdForStrategySection,
  type CompositionMode,
} from "@/lib/ai-core/website-builder/excellence";
import type { WebsiteCapabilityService } from "@/lib/website/builder/capabilities/service";
import { isStrategySectionAllowedByCapabilities } from "@/lib/website/template-v2/integration/strategy-section-order";
import type { WebsiteStrategy } from "@/lib/website/types/layers";

const NAV_IDS = new Set<string>(["SiteHeader", "NavbarModern", "NavMinimal"]);

function resolveHomePageName(strategy: WebsiteStrategy | undefined): string {
  const home = strategy?.pages?.find(
    (page) => page.path === "/" || /^home$/i.test(page.name.trim()),
  );
  return home?.name ?? strategy?.pages?.[0]?.name ?? "Home";
}

function uniqueOrdered(
  ids: DesignRendererComponentId[],
): DesignRendererComponentId[] {
  const seen = new Set<string>();
  const result: DesignRendererComponentId[] = [];
  for (const id of ids) {
    const key = String(id);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(id);
  }
  return result;
}

export function resolveStructureFirstHomeComponents(params: {
  strategy: WebsiteStrategy | undefined;
  industryId?: string;
  capabilityService?: WebsiteCapabilityService | null;
  compositionMode?: string;
}): DesignRendererComponentId[] {
  const homePageName = resolveHomePageName(params.strategy);
  const industryId =
    params.industryId && isIndustryId(params.industryId)
      ? (params.industryId as IndustryId)
      : undefined;
  const ctx = {
    industryId: params.industryId,
    compositionMode: params.compositionMode as CompositionMode | undefined,
  };
  const capabilityService = params.capabilityService ?? null;
  const ordered: DesignRendererComponentId[] = [];

  for (const section of params.strategy?.sectionPlan ?? []) {
    if (section.page !== homePageName) continue;
    if (!isStrategySectionAllowedByCapabilities(section.name, capabilityService)) {
      continue;
    }
    ordered.push(resolveComponentIdForStrategySection(section.name, ctx));
  }

  if (!ordered.length) {
    const home = params.strategy?.pages?.find(
      (page) => page.path === "/" || page.name === homePageName,
    );
    for (const key of home?.keySections ?? []) {
      if (!isStrategySectionAllowedByCapabilities(key, capabilityService)) {
        continue;
      }
      ordered.push(resolveComponentIdForStrategySection(key, ctx));
    }
  }

  if (!ordered.length && industryId) {
    const preset = getIndustryDesignPreset(industryId);
    for (const section of preset?.homeSections ?? []) {
      ordered.push(section.componentId);
    }
  }

  const nav =
    ordered.find((id) => NAV_IDS.has(String(id))) ?? ("SiteHeader" as const);
  const body = ordered.filter(
    (id) => !NAV_IDS.has(String(id)) && id !== "SiteFooter",
  );
  return uniqueOrdered([nav, ...body, "SiteFooter"]);
}
