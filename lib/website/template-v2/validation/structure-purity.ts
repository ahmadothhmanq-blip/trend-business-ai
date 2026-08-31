import type { WebsiteCapabilityId } from "@/lib/website/builder/capabilities/types";
import type { GeneratedWebsiteProject } from "@/lib/website/types/generation";
import type { WebsiteStrategy } from "@/lib/website/types/layers";

export type StructureSnapshot = {
  strategy: WebsiteStrategy | undefined;
  pages: string[];
  sectionPlan: Array<{ id: string; page: string; name: string }>;
  sitemap: string[];
  capabilityIds: WebsiteCapabilityId[];
};

export class StructurePurityViolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StructurePurityViolationError";
  }
}

function normalizeSectionPlan(
  strategy: WebsiteStrategy | undefined,
): StructureSnapshot["sectionPlan"] {
  return (strategy?.sectionPlan ?? []).map((section) => ({
    id: section.id,
    page: section.page,
    name: section.name,
  }));
}

export function captureStructureSnapshot(
  project: GeneratedWebsiteProject,
  capabilityIds: WebsiteCapabilityId[] = [],
): StructureSnapshot {
  return {
    strategy: project.strategy
      ? structuredClone(project.strategy)
      : undefined,
    pages: [...(project.pages ?? [])],
    sectionPlan: normalizeSectionPlan(project.strategy),
    sitemap: [...(project.strategy?.sitemap ?? [])],
    capabilityIds: [...capabilityIds].sort(),
  };
}

function arraysEqual<T>(left: T[], right: T[]): boolean {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

function sectionPlansEqual(
  left: StructureSnapshot["sectionPlan"],
  right: StructureSnapshot["sectionPlan"],
): boolean {
  if (left.length !== right.length) return false;
  return left.every(
    (section, index) =>
      section.id === right[index]?.id &&
      section.page === right[index]?.page &&
      section.name === right[index]?.name,
  );
}

export function assertStructurePreserved(
  before: StructureSnapshot,
  after: StructureSnapshot,
): void {
  if (!arraysEqual(before.pages, after.pages)) {
    throw new StructurePurityViolationError(
      `Pages changed: ${JSON.stringify(before.pages)} → ${JSON.stringify(after.pages)}`,
    );
  }
  if (!sectionPlansEqual(before.sectionPlan, after.sectionPlan)) {
    throw new StructurePurityViolationError(
      "Strategy sectionPlan changed after template apply.",
    );
  }
  if (!arraysEqual(before.sitemap, after.sitemap)) {
    throw new StructurePurityViolationError(
      `Navigation sitemap changed: ${JSON.stringify(before.sitemap)} → ${JSON.stringify(after.sitemap)}`,
    );
  }
  if (!arraysEqual(before.capabilityIds, after.capabilityIds)) {
    throw new StructurePurityViolationError(
      `Capabilities changed: ${JSON.stringify(before.capabilityIds)} → ${JSON.stringify(after.capabilityIds)}`,
    );
  }
}
