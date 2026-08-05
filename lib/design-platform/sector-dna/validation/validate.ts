import type { TbdpSectorDnaProfile } from "@/lib/design-platform/sector-dna/core/types";
import {
  tbdpExperienceProfileDefinitionSchema,
  tbdpSectorDnaSchema,
} from "@/lib/design-platform/sector-dna/schema/metadata";
import { tbdpAiSelectionRequestSchema } from "@/lib/design-platform/sector-dna/schema/ai-selection";

export type TbdpSectorDnaValidationResult =
  | { ok: true; data: TbdpSectorDnaProfile }
  | { ok: false; errors: string[] };

export function validateSectorDna(profile: unknown): TbdpSectorDnaValidationResult {
  const result = tbdpSectorDnaSchema.safeParse(profile);
  if (result.success) {
    return { ok: true, data: result.data as TbdpSectorDnaProfile };
  }
  return {
    ok: false,
    errors: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
  };
}

export function validateExperienceProfile(profile: unknown) {
  return tbdpExperienceProfileDefinitionSchema.safeParse(profile);
}

export function validateAiSelectionRequest(request: unknown) {
  return tbdpAiSelectionRequestSchema.safeParse(request);
}

export function assertSectorDnaCatalog(profiles: TbdpSectorDnaProfile[]): void {
  const ids = new Set<string>();
  for (const profile of profiles) {
    const result = validateSectorDna(profile);
    if (!result.ok) {
      throw new Error(`Invalid sector DNA "${(profile as TbdpSectorDnaProfile).id}": ${result.errors.join("; ")}`);
    }
    if (ids.has(profile.id)) {
      throw new Error(`Duplicate sector DNA id: ${profile.id}`);
    }
    ids.add(profile.id);
  }
}
