import type { WebsiteGeneration } from "@/types/database";

function hasBlueprintFiles(blueprint: unknown): boolean {
  return (
    Boolean(blueprint) &&
    typeof blueprint === "object" &&
    Array.isArray((blueprint as { files?: unknown }).files) &&
    (blueprint as { files: unknown[] }).files.length > 0
  );
}

/** GET /api/website-builder/:id when the generation finished with a usable blueprint. */
export async function fetchCompletedWebsiteGeneration(
  generationId: string,
): Promise<WebsiteGeneration | null> {
  try {
    const response = await fetch(`/api/website-builder/${generationId}`);
    if (!response.ok) return null;
    const data = (await response.json()) as { generation?: WebsiteGeneration };
    const generation = data.generation;
    if (!generation || generation.status !== "completed") return null;
    if (!hasBlueprintFiles(generation.blueprint)) return null;
    return generation;
  } catch {
    return null;
  }
}
