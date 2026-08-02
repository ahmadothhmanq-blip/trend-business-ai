/**
 * Assembly Engine contracts.
 */

import type { TbgeProductAdapter } from "@/lib/tbge/adapters/types";
import type { GeneratorRegistry } from "@/lib/tbge/assembly/generators/types";
import type { GenerationSpec } from "@/lib/tbge/spec/types";
import type { TbgeArtifactFile } from "@/lib/tbge/kernel/types";

export type AssemblyStats = {
  tasksRun: number;
  wavesCompleted: number;
  durationMs: number;
  deterministicRatio: number;
};

export type AssemblyResult = {
  files: TbgeArtifactFile[];
  stats: AssemblyStats;
};

export type AssemblyContext = {
  spec: GenerationSpec;
  onProgress?: (message: string) => void;
};

export type AssemblyEngineDeps = {
  registry?: GeneratorRegistry;
  adapter?: TbgeProductAdapter;
  concurrency?: number;
};

export type AssemblyEngine = {
  assemble(
    spec: GenerationSpec,
    ctx?: AssemblyContext,
  ): Promise<AssemblyResult>;
};
