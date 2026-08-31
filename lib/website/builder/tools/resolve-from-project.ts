import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { GeneratedWebsiteProject } from "@/lib/website/types/generation";
import { createCapabilityService } from "@/lib/website/builder/capabilities/service";
import { resolveBuilderToolbar } from "@/lib/website/builder/tools/resolve";

export function resolveBuilderToolbarFromProject(
  project: GeneratedWebsiteProject,
  files?: GeneratedProjectFile[],
) {
  const service = createCapabilityService(project, files);
  return resolveBuilderToolbar(service);
}
