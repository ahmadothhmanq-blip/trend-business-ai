import { runWebsiteQualityBenchmark } from "@/lib/website/quality-benchmark";
import {
  createVersion,
  getCurrentVersion,
  getSession,
} from "@/lib/website/review-studio/versions/version-manager";
import { compareVersions } from "@/lib/website/review-studio/compare/comparison-engine";
import { applyImprovementToFiles } from "@/lib/website/review-studio/execution/patches";
import type {
  ApplyImprovementInput,
  ApplyImprovementResult,
  StudioImprovement,
  TargetedImprovementExecutor,
} from "@/lib/website/review-studio/types";
import type { GeneratedProjectFile } from "@/lib/ai/types";

function cloneFiles(files: GeneratedProjectFile[]): GeneratedProjectFile[] {
  return files.map((f) => ({ ...f, content: f.content }));
}

/**
 * Execution Engine — apply only selected improvements.
 * Never regenerates the whole website unless explicitly requested.
 */
export async function applySelectedImprovements(input: {
  request: ApplyImprovementInput;
  executor?: TargetedImprovementExecutor;
}): Promise<ApplyImprovementResult> {
  const session = getSession(input.request.sessionId);
  if (!session) {
    return { ok: false, errors: [`Session not found: ${input.request.sessionId}`] };
  }

  const current = getCurrentVersion(input.request.sessionId);
  if (!current) {
    return { ok: false, errors: ["No current version in session"] };
  }

  const improvements = session.improvements.filter((i) =>
    input.request.improvementIds.includes(i.id),
  );
  if (improvements.length === 0) {
    return { ok: false, errors: ["No matching improvements found"] };
  }

  if (
    !input.request.allowFullRegeneration &&
    improvements.some((i) => i.patchType === "targeted-regen") &&
    !input.executor
  ) {
  const regenOnly = improvements.filter((i) => i.patchType === "targeted-regen");
    if (regenOnly.length === improvements.length) {
      return {
        ok: false,
        errors: [
          "Targeted improvements require an executor callback. Provide executor or use deterministic improvements only.",
        ],
      };
    }
  }

  let files = cloneFiles(current.files);
  const appliedChanges: string[] = [];
  const appliedIds: string[] = [];
  const appliedTitles: string[] = [];

  for (const improvement of improvements) {
    if (improvement.patchType === "deterministic") {
      const result = applyImprovementToFiles(improvement, files);
      files = result.files;
      appliedChanges.push(`${improvement.title}: ${result.change}`);
      appliedIds.push(improvement.id);
      appliedTitles.push(improvement.title);
    } else if (input.executor && improvement.instruction) {
      const targetFiles = files.filter((f) =>
        improvement.targetFiles.length === 0
          ? true
          : improvement.targetFiles.some((t) => f.path.includes(t)),
      );
      const updated = await input.executor({
        instruction: improvement.instruction,
        targetFiles,
        allFiles: files,
        improvement,
      });
      files = mergeFileUpdates(files, updated);
      appliedChanges.push(`${improvement.title}: targeted improvement applied`);
      appliedIds.push(improvement.id);
      appliedTitles.push(improvement.title);
    }
  }

  if (appliedIds.length === 0) {
    return { ok: false, errors: ["No improvements could be applied"] };
  }

  const benchmark = await runWebsiteQualityBenchmark({ files, mode: "standard" });
  if (!benchmark.ok) {
    return { ok: false, errors: benchmark.errors };
  }

  const newVersion = createVersion({
    sessionId: input.request.sessionId,
    files,
    appliedImprovements: appliedIds,
    improvementTitles: appliedTitles,
    qualityScores: benchmark.report.scores,
    parentVersionId: current.id,
  });

  const comparison = compareVersions(current, newVersion);

  return {
    ok: true,
    version: newVersion,
    comparison,
    appliedChanges,
    files,
  };
}

function mergeFileUpdates(
  original: GeneratedProjectFile[],
  updates: GeneratedProjectFile[],
): GeneratedProjectFile[] {
  const updateMap = new Map(updates.map((f) => [f.path, f]));
  return original.map((f) => updateMap.get(f.path) ?? f);
}

export function listAvailableImprovements(
  sessionId: string,
): StudioImprovement[] {
  return getSession(sessionId)?.improvements ?? [];
}
