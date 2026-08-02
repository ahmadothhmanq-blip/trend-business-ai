/**
 * TBGE Product Adapter — extension interface for per-product profiles.
 * Sprint 1: contracts only; not wired to Website Builder.
 */

import type { GenerationSpec, TbgeProductId } from "@/lib/tbge/spec/types";
import type { TbgeBrief } from "@/lib/tbge/kernel/types";
import type { GeneratorPlugin } from "@/lib/tbge/assembly/generators/types";
import type { TbgeArtifactFile } from "@/lib/tbge/kernel/types";

export type AssemblyProfile = {
  /** Generator IDs enabled for this product profile. */
  generators: string[];
  /** Default file graph template name (resolved in future sprints). */
  fileGraphTemplate: string;
};

export type PlanningDirective = {
  id: string;
  instruction: string;
};

export type TbgeProductAdapter = {
  productId: TbgeProductId;
  label: string;
  assemblyProfile: AssemblyProfile;
  planningDirectives: PlanningDirective[];
  /** Validate and extend a base spec for this product (Sprint 1: identity pass-through). */
  extendSpec(spec: GenerationSpec): GenerationSpec;
  /** Optional brief normalization before planning (Sprint 1: noop). */
  normalizeBrief?(brief: TbgeBrief): TbgeBrief;
  /** Optional product-specific generator plugins (override built-ins). */
  getAssemblyGenerators?(): GeneratorPlugin[];
  /** Optional deterministic post-assembly artifact transform. */
  transformAssemblyArtifacts?(
    files: TbgeArtifactFile[],
    spec: GenerationSpec,
  ): TbgeArtifactFile[];
};

export function createPassthroughProductAdapter(
  adapter: Pick<TbgeProductAdapter, "productId" | "label" | "assemblyProfile" | "planningDirectives">,
): TbgeProductAdapter {
  return {
    ...adapter,
    extendSpec: (spec) => spec,
    normalizeBrief: (brief) => brief,
  };
}
