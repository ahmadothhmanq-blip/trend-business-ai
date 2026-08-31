/**
 * App Builder project repair pipeline.
 * Deterministic mode (aiFileCount === 0): scaffold → hardener → validation only.
 * LLM repair is allowed only when aiFileCount > 0.
 */

import type { PlannedFile } from "@/lib/ai/planner";
import {
  inferCategoryFromPath,
  normalizeCategory,
  sortFilesByDependency,
} from "@/lib/ai/planner";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import {
  findRequiredRootFileIssues,
  getWebAppRequirementGroups,
  validateWebAppProject,
} from "@/lib/ai/webapp-requirements";
import {
  applyDeterministicScaffoldGaps,
  isDeterministicScaffoldRepairTarget,
} from "@/lib/ai/webapp-scaffold-gaps";
import type { WebAppScaffoldOptions } from "@/lib/ai/webapp-scaffold";
import { findWebAppReadinessIssues } from "@/lib/ai/webapp-readiness";
import {
  collectRepairValidationIssues,
  formatDeterministicRepairAbort,
  isDeterministicRepairMode,
} from "@/lib/ai/webapp-repair-policy";
import {
  filterUiRepairTargets,
  findMissingUiJsxImportIssues,
  findUiBarrelContractIssues,
  isUiLocallyRepairableIssue,
  isUiLocallyRepairableTarget,
} from "@/lib/ai/webapp-ui-contract";
import { hardenGeneratedWebApp, findWebAppTypeScriptContractIssues } from "@/lib/ai/webapp-harden";
import {
  getActiveAppBuilderPipelineProfiler,
  timedHardener,
  timedValidation,
} from "@/lib/webapp/pipeline-profiler";
import {
  recordRemainingLlmRepairReasons,
  recordUiRepairSkipped,
} from "@/lib/webapp/ui-repair-metrics";
import type {
  WebAppAnalysis,
} from "@/plugins/webapp/types";
import type { ProjectCapabilityFlags } from "@/lib/ai/validator";

export const WEBAPP_PROJECT_VALIDATION_ROUNDS = 2;

export type WebAppLlmRepairFileFn = (args: {
  targetPath: string;
  filePlan: PlannedFile;
  filePlans: PlannedFile[];
  existingFilesWithoutTarget: GeneratedProjectFile[];
  projectIssues: string;
}) => Promise<GeneratedProjectFile>;

export type ValidateAndRepairWebAppArgs = {
  aiFileCount: number;
  analysis: WebAppAnalysis;
  /** Retained for call-site context; repair uses flags + tables + scaffoldOptions. */
  plan?: unknown;
  filePlans: PlannedFile[];
  files: GeneratedProjectFile[];
  flags: ProjectCapabilityFlags;
  tablesForValidation: string[];
  scaffoldOptions: WebAppScaffoldOptions;
  /** Invoked only when aiFileCount > 0 and a non-scaffold target remains. */
  repairFileWithLlm?: WebAppLlmRepairFileFn;
};

function collectRoundIssues(
  validationIssues: string[],
  uiContractIssues: string[],
  tsContractIssues: string[],
  rootFileIssues: string[],
  readinessIssues: string[],
): string[] {
  return collectRepairValidationIssues({
    validationIssues,
    uiContractIssues: uiContractIssues.filter(
      (issue) => !isUiLocallyRepairableIssue(issue),
    ),
    tsContractIssues: tsContractIssues.filter(
      (issue) => !isUiLocallyRepairableIssue(issue),
    ),
    rootFileIssues,
    readinessIssues,
  });
}

/**
 * Validate and repair a generated webapp project.
 * When aiFileCount === 0, never builds LLM targets or calls repairFileWithLlm.
 */
export async function validateAndRepairWebAppProject(
  args: ValidateAndRepairWebAppArgs,
): Promise<GeneratedProjectFile[]> {
  const {
    aiFileCount,
    analysis,
    filePlans: initialFilePlans,
    files,
    flags,
    tablesForValidation,
    scaffoldOptions,
    repairFileWithLlm,
  } = args;

  let currentFiles = [...files];
  const filePlans = [...initialFilePlans];
  const planByPath = new Map(filePlans.map((entry) => [entry.path, entry]));
  const deterministicMode = isDeterministicRepairMode(aiFileCount);

  for (let round = 0; round < WEBAPP_PROJECT_VALIDATION_ROUNDS; round += 1) {
    const gapFill = applyDeterministicScaffoldGaps(currentFiles, scaffoldOptions);
    currentFiles = gapFill.files;
    if (gapFill.injectedPaths.length > 0) {
      recordUiRepairSkipped(
        gapFill.injectedPaths.map(
          (path) => `deterministic-scaffold-inject:${path}`,
        ),
      );
      for (const path of gapFill.injectedPaths) {
        if (planByPath.has(path)) continue;
        const requirement = getWebAppRequirementGroups(
          flags,
          tablesForValidation,
        ).find((entry) => entry.preferred === path || entry.anyOf.includes(path));
        if (!requirement) continue;
        const planned: PlannedFile = {
          path: requirement.preferred,
          purpose: requirement.purpose,
          language: requirement.language,
          category: normalizeCategory(
            requirement.category || inferCategoryFromPath(requirement.preferred),
          ),
        };
        planByPath.set(path, planned);
        filePlans.push(planned);
      }
    }
    if (gapFill.replacedPaths.length > 0) {
      recordUiRepairSkipped(
        gapFill.replacedPaths.map(
          (path) => `deterministic-scaffold-resync:${path}`,
        ),
      );
    }

    currentFiles = timedHardener(() => hardenGeneratedWebApp(currentFiles));
    const validation = timedValidation(() =>
      validateWebAppProject(currentFiles, flags, tablesForValidation),
    );
    let uiContractIssues = timedValidation(() => [
      ...findUiBarrelContractIssues(currentFiles),
      ...findMissingUiJsxImportIssues(currentFiles),
    ]);
    if (uiContractIssues.length > 0) {
      const skipped = [...uiContractIssues];
      currentFiles = timedHardener(() => hardenGeneratedWebApp(currentFiles));
      uiContractIssues = timedValidation(() => [
        ...findUiBarrelContractIssues(currentFiles),
        ...findMissingUiJsxImportIssues(currentFiles),
      ]);
      if (uiContractIssues.length === 0) {
        recordUiRepairSkipped(skipped);
      }
    }
    const tsContractIssues = timedValidation(() =>
      findWebAppTypeScriptContractIssues(currentFiles),
    );
    const rootFileIssues = timedValidation(() =>
      findRequiredRootFileIssues(currentFiles),
    );
    const readinessIssues = timedValidation(() =>
      findWebAppReadinessIssues(currentFiles, {
        requiresAuth: Boolean(analysis.requiresAuth),
        requiresDatabase: Boolean(analysis.requiresDatabase),
      }),
    );

    if (
      validation.valid &&
      uiContractIssues.length === 0 &&
      tsContractIssues.length === 0 &&
      rootFileIssues.length === 0 &&
      readinessIssues.length === 0
    ) {
      return currentFiles;
    }

    const profiler = getActiveAppBuilderPipelineProfiler();
    profiler?.markRepairRound();

    // Deterministic mode: scaffold → hardener → validation only. Never LLM.
    if (deterministicMode) {
      currentFiles = timedHardener(() => hardenGeneratedWebApp(currentFiles));
      continue;
    }

    const targets = new Set(validation.filesToRegenerate);
    for (const issue of uiContractIssues) {
      if (isUiLocallyRepairableIssue(issue)) continue;
      if (issue.startsWith("components/ui.tsx:")) {
        targets.add("components/ui.tsx");
      }
    }
    for (const issue of tsContractIssues) {
      const match = issue.match(/^([^:]+):/);
      if (match?.[1]) targets.add(match[1]);
    }
    for (const issue of rootFileIssues) {
      const match = issue.match(/^Missing required root file: (.+)$/);
      if (match?.[1]) targets.add(match[1]);
    }
    for (const issue of readinessIssues) {
      const match = issue.match(/^(?:Missing trust-critical file: )?([^:]+):/);
      if (match?.[1] && !match[1].includes(" ")) targets.add(match[1]);
      const missing = issue.match(/^Missing trust-critical file: (.+)$/);
      if (missing?.[1]) targets.add(missing[1]);
    }
    const roundIssues = collectRoundIssues(
      validation.issues,
      uiContractIssues,
      tsContractIssues,
      rootFileIssues,
      readinessIssues,
    );
    const requirementByPath = new Map(
      getWebAppRequirementGroups(flags, tablesForValidation).map(
        (entry) => [entry.preferred, entry],
      ),
    );

    for (const missingPath of roundIssues
      .filter(
        (issue) =>
          issue.startsWith("Missing required production file:") ||
          issue.startsWith("Missing required root file:"),
      )
      .map((issue) =>
        issue
          .replace("Missing required production file: ", "")
          .replace("Missing required root file: ", ""),
      )) {
      if (isUiLocallyRepairableTarget(missingPath)) continue;
      targets.add(missingPath);
      if (!planByPath.has(missingPath)) {
        const requirement = requirementByPath.get(missingPath);
        if (requirement) {
          const planned: PlannedFile = {
            path: requirement.preferred,
            purpose: requirement.purpose,
            language: requirement.language,
            category: normalizeCategory(
              requirement.category || inferCategoryFromPath(requirement.preferred),
            ),
          };
          planByPath.set(missingPath, planned);
          filePlans.push(planned);
        }
      }
    }

    const secondGap = applyDeterministicScaffoldGaps(currentFiles, scaffoldOptions);
    currentFiles = secondGap.files;
    if (secondGap.injectedPaths.length > 0) {
      recordUiRepairSkipped(
        secondGap.injectedPaths.map(
          (path) => `deterministic-scaffold-inject:${path}`,
        ),
      );
    }
    if (secondGap.replacedPaths.length > 0) {
      recordUiRepairSkipped(
        secondGap.replacedPaths.map(
          (path) => `deterministic-scaffold-resync:${path}`,
        ),
      );
    }
    for (const path of [...secondGap.injectedPaths, ...secondGap.replacedPaths]) {
      targets.delete(path);
    }

    const { llmTargets, skippedUiIssues } = filterUiRepairTargets(
      targets,
      [...uiContractIssues, ...tsContractIssues],
    );
    if (skippedUiIssues.length > 0) {
      recordUiRepairSkipped(skippedUiIssues);
    }
    targets.clear();
    for (const path of llmTargets) {
      if (
        isDeterministicScaffoldRepairTarget(path, secondGap.scaffoldPaths) ||
        isUiLocallyRepairableTarget(path)
      ) {
        continue;
      }
      targets.add(path);
    }

    if (targets.size === 0) {
      currentFiles = timedHardener(() => hardenGeneratedWebApp(currentFiles));
      continue;
    }

    if (!repairFileWithLlm) {
      throw new Error(
        "LLM repair required but repairFileWithLlm was not provided.",
      );
    }

    const regenerated = new Map(currentFiles.map((file) => [file.path, file]));
    const llmRepairReasons: string[] = [];
    const skippedScaffoldOrUi: string[] = [];

    for (const targetPath of targets) {
      if (
        isDeterministicScaffoldRepairTarget(targetPath, secondGap.scaffoldPaths) ||
        isUiLocallyRepairableTarget(targetPath)
      ) {
        skippedScaffoldOrUi.push(targetPath);
        continue;
      }

      const filePlan = planByPath.get(targetPath);
      if (!filePlan) continue;

      const projectIssues = validation.issues
        .concat(uiContractIssues.filter((issue) => !isUiLocallyRepairableIssue(issue)))
        .concat(tsContractIssues.filter((issue) => !isUiLocallyRepairableIssue(issue)))
        .concat(rootFileIssues)
        .filter(
          (issue) =>
            issue.startsWith(`${targetPath}:`) || issue.includes(targetPath),
        )
        .join("\n");

      llmRepairReasons.push(
        projectIssues || `Regenerate business/application file: ${targetPath}`,
      );

      const existingWithoutTarget = currentFiles.filter(
        (file) => file.path !== targetPath,
      );

      const repairStarted = Date.now();
      const repaired = await repairFileWithLlm({
        targetPath,
        filePlan,
        filePlans: sortFilesByDependency([...planByPath.values()]),
        existingFilesWithoutTarget: existingWithoutTarget,
        projectIssues,
      });
      profiler?.addRepairLlmMs(Date.now() - repairStarted, 1);
      regenerated.set(targetPath, repaired);
    }

    if (skippedScaffoldOrUi.length > 0) {
      recordUiRepairSkipped(skippedScaffoldOrUi);
    }
    recordRemainingLlmRepairReasons(llmRepairReasons);

    const nonPlannedFiles = currentFiles.filter(
      (file) => !planByPath.has(file.path),
    );

    currentFiles = [
      ...sortFilesByDependency([...planByPath.values()])
        .map((entry) => regenerated.get(entry.path))
        .filter((file): file is GeneratedProjectFile => Boolean(file)),
      ...nonPlannedFiles,
    ];
  }

  currentFiles = timedHardener(() => hardenGeneratedWebApp(currentFiles));
  const finalValidation = timedValidation(() =>
    validateWebAppProject(currentFiles, flags, tablesForValidation),
  );
  const finalTsIssues = timedValidation(() =>
    findWebAppTypeScriptContractIssues(currentFiles),
  );
  const finalRootIssues = timedValidation(() =>
    findRequiredRootFileIssues(currentFiles),
  );
  const finalReadinessIssues = timedValidation(() =>
    findWebAppReadinessIssues(currentFiles, {
      requiresAuth: Boolean(analysis.requiresAuth),
      requiresDatabase: Boolean(analysis.requiresDatabase),
    }),
  );

  const finalIssues = collectRepairValidationIssues({
    validationIssues: finalValidation.issues,
    tsContractIssues: finalTsIssues,
    rootFileIssues: finalRootIssues,
    readinessIssues: finalReadinessIssues,
  });

  if (finalIssues.length > 0) {
    if (deterministicMode) {
      throw formatDeterministicRepairAbort(finalIssues);
    }
    throw new Error(
      `Generated web app failed production validation:\n${finalIssues.join("\n")}`,
    );
  }

  return currentFiles;
}
