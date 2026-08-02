import type { PlannedFile } from "@/lib/ai/planner";
import {
  buildFileDependencyGraph,
  type WebsiteDependencyGraphOptions,
} from "@/lib/ai-core/file-generation/dependency-graph";
import {
  COMPONENTS_SECTIONS_PREFIX,
  COMPONENTS_WAVE_NAME,
} from "@/lib/ai-core/file-generation/constants";
import {
  fileGenerationFlags,
  resolveLlmConcurrencyCap,
} from "@/lib/ai-core/file-generation/flags";
import type {
  BuildWavePlanOptions,
  FileGenerationTask,
  FileGenerationWave,
  FileGenerationWavePlan,
  FileTaskKind,
} from "@/lib/ai-core/file-generation/types";

function resolveWaveName(
  plannedFile: PlannedFile,
  depth: number,
  kind: FileTaskKind,
): string {
  if (kind === "scaffold") return "static-scaffold";
  switch (plannedFile.category) {
    case "layout":
    case "lib":
    case "types":
      return "foundation";
    case "hooks":
      return "hooks-api";
    case "components":
      return COMPONENTS_WAVE_NAME;
    case "pages":
      return "pages";
    case "api":
      return "hooks-api";
    default:
      return depth <= 1 ? "foundation" : "configs-tail";
  }
}

const WAVE_EXECUTION_ORDER = [
  "static-scaffold",
  "foundation",
  COMPONENTS_WAVE_NAME,
  "hooks-api",
  "pages",
  "configs-tail",
] as const;

function waveIndexForName(name: string): number {
  const index = WAVE_EXECUTION_ORDER.indexOf(
    name as (typeof WAVE_EXECUTION_ORDER)[number],
  );
  return index === -1 ? WAVE_EXECUTION_ORDER.length : index;
}

function resolveContextPolicy(
  plannedFile: PlannedFile,
  strictSerialContext: boolean,
): "snapshot" | "strict-serial" {
  if (strictSerialContext) return "strict-serial";
  if (plannedFile.path.startsWith(COMPONENTS_SECTIONS_PREFIX)) {
    return "snapshot";
  }
  return "strict-serial";
}

function checkpointForWave(name: string, hasLlmTask: boolean): FileGenerationWave["checkpoint"] {
  if (name === "static-scaffold") return "none";
  if (hasLlmTask) return "per-task";
  return "end";
}

function resolveWaveConcurrency(
  waveName: string,
  profile: string,
  adapter: BuildWavePlanOptions["adapter"],
): number {
  if (waveName !== COMPONENTS_WAVE_NAME) {
    return 1;
  }
  const profileCap = adapter.waveConcurrencyForProfile(profile, waveName);
  const globalCap = resolveLlmConcurrencyCap();
  return Math.min(profileCap, globalCap);
}

/**
 * Assign each planned file to a wave using longest-path depth + task kind.
 */
export function buildFileGenerationWavePlan(
  options: BuildWavePlanOptions,
  graphOptions: WebsiteDependencyGraphOptions = {},
): FileGenerationWavePlan {
  const {
    filePlans,
    adapter,
    kindContext,
    strictSerialContext = fileGenerationFlags.strictSerialContext,
    maxGlobalConcurrency = resolveLlmConcurrencyCap(),
  } = options;

  const graph = buildFileDependencyGraph(filePlans, {
    composeHomePage: kindContext.composeHomePage,
    extraEdges: adapter.buildDependencyEdges(filePlans, kindContext),
  });

  const taskByPath = new Map<string, FileGenerationTask>();

  for (const plannedFile of filePlans) {
    const kind = adapter.resolveTaskKind(plannedFile, kindContext);
    const depth = graph.depthByPath.get(plannedFile.path) ?? 0;
    const waveName = resolveWaveName(plannedFile, depth, kind);
    const dependsOn = graph.edges
      .filter((edge) => edge.to === plannedFile.path)
      .map((edge) => edge.from)
      .sort((a, b) => a.localeCompare(b));

    const task: FileGenerationTask = {
      id: plannedFile.path,
      path: plannedFile.path,
      waveId: `W${waveIndexForName(waveName)}-${waveName}`,
      kind,
      plannedFile,
      dependsOn,
      contextPolicy: resolveContextPolicy(plannedFile, strictSerialContext),
    };
    taskByPath.set(plannedFile.path, task);
  }

  const waveBuckets = new Map<string, FileGenerationTask[]>();
  for (const task of taskByPath.values()) {
    const bucket = waveBuckets.get(task.waveId) ?? [];
    bucket.push(task);
    waveBuckets.set(task.waveId, bucket);
  }

  const waves: FileGenerationWave[] = [...waveBuckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([waveId, tasks], index) => {
      const sortedTasks = [...tasks].sort((a, b) =>
        a.path.localeCompare(b.path),
      );
      const waveName = sortedTasks[0]?.waveId.split("-").slice(1).join("-") ?? "unknown";
      const hasLlmTask = sortedTasks.some((task) => task.kind === "llm");
      return {
        id: waveId,
        index,
        name: waveName,
        tasks: sortedTasks,
        maxConcurrency: resolveWaveConcurrency(
          waveName,
          kindContext.generationProfile,
          adapter,
        ),
        checkpoint: checkpointForWave(waveName, hasLlmTask),
      };
    });

  const executionOrder = filePlans.map((plannedFile) => {
    const task = taskByPath.get(plannedFile.path);
    if (!task) {
      throw new Error(`Wave planner missing task for ${plannedFile.path}`);
    }
    return task;
  });

  return {
    waves,
    executionOrder,
    strictSerialContext,
    maxGlobalConcurrency,
    taskByPath,
  };
}

/** Flatten wave plan tasks in deterministic serial order (matches category sort). */
export function flattenWavePlanTasks(wavePlan: FileGenerationWavePlan): FileGenerationTask[] {
  return wavePlan.waves.flatMap((wave) => wave.tasks);
}

/** Verify wave plan preserves original file plan order when executed serially. */
export function assertWavePlanCoversFiles(
  filePlans: PlannedFile[],
  wavePlan: FileGenerationWavePlan,
): void {
  if (filePlans.length !== wavePlan.executionOrder.length) {
    throw new Error(
      `Wave plan path count mismatch: ${filePlans.length} planned vs ${wavePlan.executionOrder.length} execution tasks`,
    );
  }

  for (let i = 0; i < filePlans.length; i += 1) {
    const plannedPath = filePlans[i]!.path;
    const taskPath = wavePlan.executionOrder[i]?.path;
    if (plannedPath !== taskPath) {
      throw new Error(
        `Wave execution order mismatch at index ${i}: expected ${plannedPath}, got ${taskPath ?? "none"}`,
      );
    }
  }
}
