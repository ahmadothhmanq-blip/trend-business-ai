export type OutputTab =
  | "preview"
  | "code"
  | "canvas"
  | "analytics"
  | "experiments"
  | "seo"
  | "review"
  | "deploy"
  | "intelligence";

export type WorkspaceProject = {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  favorite: boolean;
  language: string;
  projectId: string | null;
  generatedProject: import("@/plugins/website/types").GeneratedWebsiteProject;
  updatedAt: string;
};

export type GenerateProjectResponse =
  | {
      project: import("@/plugins/website/types").GeneratedWebsiteProject;
      generation: import("@/types/database").WebsiteGeneration;
    }
  | { error: string };
