import type { WebsiteCapabilityId } from "@/lib/website/builder/capabilities/types";
import type { WebsiteCapabilityService } from "@/lib/website/builder/capabilities/service";
import { createCapabilityService } from "@/lib/website/builder/capabilities/service";
import type { GeneratedWebsiteProject } from "@/lib/website/types/generation";
import type { WebsiteStrategy } from "@/lib/website/types/layers";
import type { SectionKind } from "@/lib/website/template-v2/variants/types";

const ALWAYS_REQUIRED: SectionKind[] = ["hero", "cta", "footer"];

const SECTION_NAME_PATTERNS: Array<{ kind: SectionKind; pattern: RegExp }> = [
  { kind: "hero", pattern: /\bhero\b/i },
  { kind: "features", pattern: /\bfeatures?\b|\bcapabilit/i },
  { kind: "about", pattern: /\babout\b|\bstory\b|\bmission\b|\bwho we are\b/i },
  { kind: "services", pattern: /\bservices?\b|\bofferings?\b|\bmenu\b|\btasting\b/i },
  { kind: "portfolio", pattern: /\bportfolio\b|\bwork\b|\bgallery\b|\bprojects?\b|\bcollection\b/i },
  { kind: "pricing", pattern: /\bpricing\b|\bplans?\b|\bpackages?\b|\btiers?\b/i },
  { kind: "testimonials", pattern: /\btestimonials?\b|\breviews?\b|\bproof\b|\bclients?\b/i },
  { kind: "cta", pattern: /\bcta\b|\bcall to action\b|\bget started\b|\bbook now\b/i },
  { kind: "contact", pattern: /\bcontact\b|\binquir/i },
  { kind: "footer", pattern: /\bfooter\b/i },
];

const KIND_CAPABILITY: Partial<Record<SectionKind, WebsiteCapabilityId>> = {
  pricing: "pricing",
  portfolio: "portfolio",
  testimonials: "testimonials",
  contact: "forms",
};

export function mapSectionNameToKind(name: string): SectionKind | null {
  const normalized = name.trim();
  if (!normalized) return null;
  for (const { kind, pattern } of SECTION_NAME_PATTERNS) {
    if (pattern.test(normalized)) return kind;
  }
  return null;
}

function dedupeSections(sections: SectionKind[]): SectionKind[] {
  const seen = new Set<SectionKind>();
  const result: SectionKind[] = [];
  for (const section of sections) {
    if (!seen.has(section)) {
      seen.add(section);
      result.push(section);
    }
  }
  for (const required of ALWAYS_REQUIRED) {
    if (!seen.has(required)) {
      result.push(required);
    }
  }
  return result;
}

function kindsFromRequiredSections(required: string[] | undefined): SectionKind[] {
  if (!required?.length) return [];
  const kinds: SectionKind[] = [];
  for (const label of required) {
    const kind = mapSectionNameToKind(label);
    if (kind) kinds.push(kind);
  }
  return kinds;
}

function isKindAllowedByCapabilities(
  kind: SectionKind,
  capabilityService: WebsiteCapabilityService | null,
): boolean {
  if (!capabilityService) return true;
  const capabilityId = KIND_CAPABILITY[kind];
  if (!capabilityId) return true;
  return capabilityService.hasCapability(capabilityId);
}

export function isStrategySectionAllowedByCapabilities(
  sectionName: string,
  capabilityService: WebsiteCapabilityService | null,
): boolean {
  const kind = mapSectionNameToKind(sectionName);
  if (!kind) return true;
  return isKindAllowedByCapabilities(kind, capabilityService);
}

export function resolveSectionOrderFromStrategy(
  strategy: WebsiteStrategy | undefined,
  options?: {
    capabilityService?: WebsiteCapabilityService | null;
    requiredSections?: string[];
  },
): SectionKind[] {
  const capabilityService = options?.capabilityService ?? null;
  const ordered: SectionKind[] = [];

  for (const section of strategy?.sectionPlan ?? []) {
    const kind = mapSectionNameToKind(section.name);
    if (!kind) continue;
    if (!isKindAllowedByCapabilities(kind, capabilityService)) continue;
    ordered.push(kind);
  }

  if (!ordered.length) {
    ordered.push(
      ...kindsFromRequiredSections(
        options?.requiredSections ??
          strategy?.pages?.[0]?.keySections ??
          [],
      ),
    );
  }

  return dedupeSections(ordered);
}

export function resolveSectionOrderFromProject(
  project: GeneratedWebsiteProject,
  capabilityService?: WebsiteCapabilityService | null,
): SectionKind[] {
  const service =
    capabilityService ??
    createCapabilityService(project, project.files ?? undefined);
  return resolveSectionOrderFromStrategy(project.strategy, {
    capabilityService: service,
    requiredSections: project.businessProfile?.requiredSections,
  });
}
