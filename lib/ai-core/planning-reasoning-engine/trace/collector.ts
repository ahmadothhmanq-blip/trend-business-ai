import type { ArchitectureValidationTraceEntry } from "@/lib/ai-core/architecture-validation/types";
import type {
  DecisionTraceEntry,
  PlanningPhaseId,
  PlanningReasoningTrace,
} from "@/lib/ai-core/planning-reasoning-engine/types";
import {
  PLANNING_REASONING_ENGINE_ID,
  PLANNING_REASONING_ENGINE_VERSION,
} from "@/lib/ai-core/planning-reasoning-engine/types";

let entryCounter = 0;

function nextEntryId(): string {
  entryCounter += 1;
  return `pre-${Date.now()}-${entryCounter}`;
}

export class PlanningTraceCollector {
  private entries: DecisionTraceEntry[] = [];
  private phases: PlanningPhaseId[] = [];
  private currentPhase: PlanningPhaseId | null = null;
  private phaseStartedAt = 0;

  beginPhase(phase: PlanningPhaseId): void {
    if (this.currentPhase && this.currentPhase !== phase) {
      this.record({
        phase: this.currentPhase,
        ruleId: "phase-complete",
        category: "planning",
        passed: true,
        severity: "info",
        message: `Phase ${this.currentPhase} completed`,
        durationMs: Date.now() - this.phaseStartedAt,
      });
    }
    if (!this.phases.includes(phase)) {
      this.phases.push(phase);
    }
    this.currentPhase = phase;
    this.phaseStartedAt = Date.now();
  }

  record(
    partial: Omit<DecisionTraceEntry, "id" | "timestamp" | "phase"> & {
      phase?: PlanningPhaseId;
    },
  ): DecisionTraceEntry {
    const entry: DecisionTraceEntry = {
      id: nextEntryId(),
      timestamp: new Date().toISOString(),
      ...partial,
      phase: partial.phase ?? this.currentPhase ?? "master-plan-lock",
    };
    this.entries.push(entry);
    return entry;
  }

  mergeArchitectureValidationTrace(
    trace: ArchitectureValidationTraceEntry[],
    phase: PlanningPhaseId = "architecture-validation",
  ): void {
    for (const item of trace) {
      this.record({
        phase,
        ruleId: item.ruleId,
        category: item.category,
        passed: item.passed,
        severity: item.severity === "error" ? "error" : item.passed ? "info" : "warning",
        message: item.message,
        knowledgeEntryId: item.knowledgeEntryId,
      });
    }
  }

  mergeReasoningChain(
    chain: string[],
    phase: PlanningPhaseId,
    rulePrefix: string,
  ): void {
    for (let i = 0; i < chain.length; i += 1) {
      this.record({
        phase,
        ruleId: `${rulePrefix}-${i + 1}`,
        category: phase === "template-routing" ? "routing" : "planning",
        passed: true,
        severity: "info",
        message: chain[i]!,
      });
    }
  }

  toTrace(promptHash: string): PlanningReasoningTrace {
    const errors = this.entries.filter((e) => e.severity === "error").length;
    const warnings = this.entries.filter((e) => e.severity === "warning").length;
    const summary =
      errors > 0
        ? `Planning completed with ${errors} error(s) and ${warnings} warning(s) across ${this.phases.length} phase(s).`
        : warnings > 0
          ? `Planning completed with ${warnings} warning(s) across ${this.phases.length} phase(s).`
          : `Planning completed successfully across ${this.phases.length} phase(s).`;

    return {
      version: "1",
      engineId: PLANNING_REASONING_ENGINE_ID,
      engineVersion: PLANNING_REASONING_ENGINE_VERSION,
      createdAt: new Date().toISOString(),
      promptHash,
      phases: [...this.phases],
      entries: [...this.entries],
      summary,
    };
  }

  getEntries(): DecisionTraceEntry[] {
    return [...this.entries];
  }
}
