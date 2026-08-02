/**
 * TBGE Assembly runtime — dependency graph execution with parallel waves.
 */

import { artifactsToMap, createArtifactStore } from "@/lib/tbge/assembly/artifact-pipeline";
import { validateDependencyGraph } from "@/lib/tbge/assembly/dependency-graph";
import type { GeneratorRegistry } from "@/lib/tbge/assembly/generators/types";
import { DEFAULT_ASSEMBLY_CONCURRENCY, mapParallel } from "@/lib/tbge/assembly/parallel";
import type { AssemblyResult, AssemblyStats } from "@/lib/tbge/assembly/types";
import { validateAssemblyOutput, validateNodeDependencies } from "@/lib/tbge/assembly/validate";
import type { TbgeArtifactFile } from "@/lib/tbge/kernel/types";
import type { FileGraphNode, GenerationSpec } from "@/lib/tbge/spec/types";

export type AssemblyRuntimeOptions = {
  concurrency?: number;
  onProgress?: (message: string) => void;
  transformArtifacts?: (
    files: TbgeArtifactFile[],
    spec: GenerationSpec,
  ) => TbgeArtifactFile[];
};

export type AssemblyRuntimeDeps = {
  registry: GeneratorRegistry;
};

export async function runAssemblyRuntime(
  deps: AssemblyRuntimeDeps,
  spec: GenerationSpec,
  options: AssemblyRuntimeOptions = {},
): Promise<AssemblyResult> {
  const started = performance.now();
  const store = createArtifactStore();
  const graph = validateDependencyGraph(spec.fileGraph);

  if (!graph.valid) {
    throw new Error(`Invalid file graph: ${graph.errors.join("; ")}`);
  }

  let tasksRun = 0;
  let wavesCompleted = 0;
  const concurrency = options.concurrency ?? DEFAULT_ASSEMBLY_CONCURRENCY;

  for (const level of graph.levels) {
    options.onProgress?.(
      `[tbge:assembly] level ${wavesCompleted + 1}/${graph.levels.length} (${level.length} tasks)`,
    );

    await mapParallel(
      level,
      async (node) => {
        if (node.generator === "custom-llm") {
          throw new Error("LLM generators are not permitted in the Assembly Engine");
        }

        const plugin = deps.registry.resolve(node.generator);
        if (!plugin) {
          throw new Error(`No generator registered for id: ${node.generator}`);
        }

        validateNodeDependencies(node, artifactsToMap(store.values()));

        const artifact = await plugin.generate({
          spec,
          node,
          artifacts: artifactsToMap(store.values()),
        });

        if (artifact.path !== node.path) {
          throw new Error(
            `Generator ${node.generator} returned path "${artifact.path}" but expected "${node.path}"`,
          );
        }

        store.set(artifact);
        tasksRun += 1;
      },
      concurrency,
    );

    wavesCompleted += 1;
  }

  let files = store.values();
  if (options.transformArtifacts) {
    files = options.transformArtifacts(files, spec);
  }

  const validation = validateAssemblyOutput(spec, files);
  if (!validation.valid) {
    throw new Error(`Assembly validation failed: ${validation.errors.join("; ")}`);
  }

  const durationMs = performance.now() - started;
  const stats: AssemblyStats = {
    tasksRun,
    wavesCompleted,
    durationMs,
    deterministicRatio: 1,
  };

  return { files, stats };
}

export function countRunnableNodes(nodes: FileGraphNode[]): number {
  return nodes.filter((node) => !node.optional).length;
}
