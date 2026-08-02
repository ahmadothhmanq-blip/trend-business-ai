/**
 * TBGE Assembly Engine — Sprint 3 deterministic runtime.
 */

import { createGeneratorRegistry } from "@/lib/tbge/assembly/registry";
import { runAssemblyRuntime } from "@/lib/tbge/assembly/runtime";
import type {
  AssemblyContext,
  AssemblyEngine,
  AssemblyEngineDeps,
  AssemblyResult,
} from "@/lib/tbge/assembly/types";
import { isSpecLocked } from "@/lib/tbge/spec/lock";
import { assertValidGenerationSpec } from "@/lib/tbge/spec/validator";

export function createAssemblyEngine(deps: AssemblyEngineDeps = {}): AssemblyEngine {
  const registry = deps.registry ?? createGeneratorRegistry(deps.adapter?.getAssemblyGenerators?.() ?? []);

  return {
    async assemble(
      spec: AssemblyContext["spec"],
      ctx: AssemblyContext = { spec },
    ): Promise<AssemblyResult> {
      assertValidGenerationSpec(spec);
      if (!isSpecLocked(spec)) {
        throw new Error("AssemblyEngine requires a locked GenerationSpec");
      }

      return runAssemblyRuntime(
        { registry },
        spec,
        {
          concurrency: deps.concurrency,
          onProgress: ctx.onProgress,
          transformArtifacts: deps.adapter?.transformAssemblyArtifacts,
        },
      );
    },
  };
}

/** Default singleton for DI container registration. */
export const defaultAssemblyEngine = createAssemblyEngine();

/** @deprecated Use defaultAssemblyEngine */
export const assemblyEngineSkeleton = defaultAssemblyEngine;
