import type { WbTemplateListItem } from "@/lib/website/template-engine/types";

export type BuilderTemplateCatalogResponse = {
  ok: boolean;
  count?: number;
  templates?: WbTemplateListItem[];
  error?: string;
};

export async function fetchBuilderTemplateCatalog(): Promise<WbTemplateListItem[]> {
  const response = await fetch("/api/website-builder/template-engine", {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | BuilderTemplateCatalogResponse
    | null;

  if (!response.ok || !payload?.ok || !payload.templates) {
    return [];
  }

  return payload.templates;
}
