import {
  CLIENT_STREAM_RECOVERY_INTERVAL_MS,
  getClientStreamRecoveryPollMs,
} from "@/lib/ai/timeouts";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteGeneration } from "@/types/database";

export type WebsiteStreamRecoveryMessages = {
  connectionInterrupted: string;
  generationFailedResume: string;
  stillGenerating: string;
  stillGeneratingWithFiles: string;
  finalizing?: string;
};

const FINALIZING_HINTS = [
  "building product preview",
  "saving project",
  "final database save",
  "website saved",
  "done",
];

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function isGeneratedWebsiteProject(
  value: unknown,
): value is GeneratedWebsiteProject {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    Array.isArray((value as GeneratedWebsiteProject).files)
  );
}

export function isWebsiteGenerationFinalizingPhase(
  message: string | null | undefined,
): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return FINALIZING_HINTS.some((hint) => lower.includes(hint));
}

/** Fetch a single generation row (full blueprint). */
export async function fetchWebsiteGenerationDetail(
  generationId: string,
): Promise<WebsiteGeneration | null> {
  try {
    const response = await fetch(`/api/website-builder/${generationId}`);
    if (!response.ok) return null;
    const data = (await response.json()) as { generation?: WebsiteGeneration };
    return data.generation ?? null;
  } catch {
    return null;
  }
}

function completedGenerationResult(
  generation: WebsiteGeneration,
): { project: GeneratedWebsiteProject; generation: WebsiteGeneration } | null {
  if (generation.status !== "completed" || !generation.blueprint) return null;
  const project = isGeneratedWebsiteProject(generation.blueprint)
    ? generation.blueprint
    : null;
  if (!project) return null;
  return { project, generation };
}

/**
 * Recover a completed website when the SSE `complete` event was not delivered.
 * Polls the saved generation row — immediate fetch first, then retries.
 */
export async function tryRecoverCompletedWebsiteGeneration(
  generationId: string,
  options: {
    onStatus?: (message: string) => void;
    messages: WebsiteStreamRecoveryMessages;
    lastProgressMessage?: string | null;
    pollMs?: number;
    intervalMs?: number;
  },
): Promise<{ project: GeneratedWebsiteProject; generation: WebsiteGeneration } | null> {
  const pollMs = options.pollMs ?? getClientStreamRecoveryPollMs();
  const intervalMs = options.intervalMs ?? CLIENT_STREAM_RECOVERY_INTERVAL_MS;
  const deadline = Date.now() + pollMs;
  let attempt = 0;
  let statusAnnounced = false;

  while (Date.now() < deadline) {
    const generation = await fetchWebsiteGenerationDetail(generationId);
    if (generation) {
      const completed = completedGenerationResult(generation);
      if (completed) {
        return completed;
      }

      if (generation.status === "failed") {
        options.onStatus?.(
          generation.error_message || options.messages.generationFailedResume,
        );
        return null;
      }

      if (!statusAnnounced) {
        statusAnnounced = true;
        if (isWebsiteGenerationFinalizingPhase(options.lastProgressMessage)) {
          options.onStatus?.(
            options.messages.finalizing ??
              "Finalizing your website — fetching saved project…",
          );
        } else {
          options.onStatus?.(options.messages.connectionInterrupted);
        }
      }

      if (generation.status === "running") {
        const fileCount = Array.isArray(
          (generation.blueprint as { files?: unknown[] } | null)?.files,
        )
          ? (generation.blueprint as { files: unknown[] }).files.length
          : 0;
        options.onStatus?.(
          fileCount > 0
            ? options.messages.stillGeneratingWithFiles.replace(
                "{count}",
                String(fileCount),
              )
            : options.messages.stillGenerating,
        );
      }
    }

    attempt += 1;
    const delay =
      attempt === 1 && isWebsiteGenerationFinalizingPhase(options.lastProgressMessage)
        ? 600
        : intervalMs;
    await sleep(delay);
  }

  // Last-chance fetch after the poll window (save may have landed late).
  const finalGeneration = await fetchWebsiteGenerationDetail(generationId);
  if (finalGeneration) {
    return completedGenerationResult(finalGeneration);
  }

  return null;
}
