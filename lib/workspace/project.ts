import type { WorkspaceGeneration } from "@/types/database";
import type { WorkspaceOutput } from "@/lib/workspace/types";

export type WorkspaceProject = {
  id: string;
  title: string;
  brief: string;
  template: string;
  language: string;
  theme: string;
  features: string[];
  createdAt: string;
  favorite: boolean;
  output: WorkspaceOutput;
};

export function formatWorkspaceDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function toWorkspaceProject(generation: WorkspaceGeneration): WorkspaceProject {
  return {
    id: generation.id,
    title: generation.title,
    brief: generation.brief,
    template: generation.template ?? "",
    language: generation.language,
    theme: generation.theme,
    features: generation.features,
    createdAt: formatWorkspaceDate(generation.created_at),
    favorite: Boolean(generation.is_favorite),
    output: generation.output,
  };
}
