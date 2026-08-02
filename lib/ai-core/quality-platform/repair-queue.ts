import { buildQualityImproveInstruction } from "@/plugins/website/layers/quality";
import { buildSemanticRepairInstruction } from "@/lib/ai-core/semantic-content-quality";
import { buildVisualDesignRepairInstruction } from "@/lib/ai-core/visual-design-quality";
import {
  collapseOverlappingMessages,
  dedupeRepairInstructions,
  issueFingerprint,
} from "@/lib/ai-core/quality-platform/heuristics";
import type {
  UnifiedRepairQueueItem,
  UnifiedQualityIssueSource,
} from "@/lib/ai-core/quality-platform/types";
import type { QualityReport } from "@/lib/website/types/layers";
import type { SemanticContentQualityReport } from "@/lib/ai-core/semantic-content-quality";
import type { VisualDesignQualityReport } from "@/lib/ai-core/visual-design-quality";

function queueItem(params: {
  source: UnifiedQualityIssueSource;
  title: string;
  instruction: string;
  priority: UnifiedRepairQueueItem["priority"];
}): UnifiedRepairQueueItem {
  return {
    id: `${params.source}-${issueFingerprint(params.title)}`,
    priority: params.priority,
    source: params.source,
    title: params.title,
    instruction: params.instruction,
    dedupeKey: issueFingerprint(params.instruction),
  };
}

export function buildUnifiedRepairQueue(params: {
  structural?: QualityReport;
  semantic?: SemanticContentQualityReport;
  visual?: VisualDesignQualityReport;
  language?: string;
}): { items: UnifiedRepairQueueItem[]; instruction: string; dedupedCount: number } {
  const rawInstructions: string[] = [];
  const items: UnifiedRepairQueueItem[] = [];

  if (params.structural?.issues.length || params.structural?.weakSections.length) {
    const instruction = buildQualityImproveInstruction(
      params.structural,
      params.language,
    );
    if (instruction.trim()) {
      rawInstructions.push(instruction);
      items.push(
        queueItem({
          source: "structural",
          title: "Structural quality improvements",
          instruction,
          priority: params.structural.passed ? "medium" : "high",
        }),
      );
    }
  }

  if (params.semantic?.issues.length) {
    const instruction = buildSemanticRepairInstruction(params.semantic);
    if (instruction.trim()) {
      rawInstructions.push(instruction);
      items.push(
        queueItem({
          source: "semantic",
          title: "Semantic content quality",
          instruction,
          priority: params.semantic.passed ? "medium" : "high",
        }),
      );
    }
  }

  if (params.visual?.issues.length) {
    const instruction = buildVisualDesignRepairInstruction(params.visual);
    if (instruction.trim()) {
      rawInstructions.push(instruction);
      items.push(
        queueItem({
          source: "visual",
          title: "Visual design & UX",
          instruction,
          priority: "medium",
        }),
      );
    }
  }

  const dedupedInstructions = dedupeRepairInstructions(rawInstructions);
  const instruction = dedupedInstructions.join("\n\n");

  const dedupedItems: UnifiedRepairQueueItem[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.dedupeKey)) continue;
    seen.add(item.dedupeKey);
    dedupedItems.push(item);
  }

  return {
    items: dedupedItems,
    instruction,
    dedupedCount: Math.max(0, rawInstructions.length - dedupedInstructions.length),
  };
}

export function mergeWeakSections(
  structural?: QualityReport,
  semantic?: SemanticContentQualityReport,
  visual?: VisualDesignQualityReport,
): string[] {
  return collapseOverlappingMessages([
    ...(structural?.weakSections ?? []),
    ...(semantic?.weakSections ?? []),
    ...(visual?.weakSections ?? []),
  ]).slice(0, 20);
}
