import type { TemplateArchitectureVersion } from "@/lib/website/template-v2/constants";

/** Optional project settings fields introduced by Template Architecture V2. */
export type TemplateV2ProjectSettings = {
  templateArchitectureVersion?: TemplateArchitectureVersion;
  templatePresentationHash?: string;
  templateComposerId?: string;
};

export function readTemplateArchitectureFromSettings(
  settings: Record<string, unknown> | null | undefined,
): TemplateArchitectureVersion | undefined {
  const value = settings?.templateArchitectureVersion;
  if (value === "v1" || value === "v2") return value;
  return undefined;
}
