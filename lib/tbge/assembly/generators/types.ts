/**
 * TBGE generator plugin contracts — deterministic, spec-only input.
 */

import type { TbgeArtifactFile } from "@/lib/tbge/kernel/types";
import type { FileGraphNode, GenerationSpec, GeneratorId } from "@/lib/tbge/spec/types";

export type GeneratorContext = {
  /** Read-only GenerationSpec — sole input to generators. */
  spec: GenerationSpec;
  node: FileGraphNode;
  /** Artifacts produced by dependency nodes, keyed by path. */
  artifacts: ReadonlyMap<string, TbgeArtifactFile>;
};

export type GeneratorOutput = TbgeArtifactFile;

export type GeneratorPlugin = {
  id: GeneratorId;
  label: string;
  generate(ctx: GeneratorContext): GeneratorOutput | Promise<GeneratorOutput>;
};

export type GeneratorRegistry = {
  register(plugin: GeneratorPlugin, options?: { override?: boolean }): void;
  resolve(id: GeneratorId): GeneratorPlugin | undefined;
  has(id: GeneratorId): boolean;
  list(): GeneratorPlugin[];
};
