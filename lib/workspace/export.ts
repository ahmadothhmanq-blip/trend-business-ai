import type { WorkspaceOutput } from "@/lib/workspace/types";
import type { WorkspaceProject } from "@/lib/workspace/project";
import type { WorkspaceType } from "@/lib/workspace/types";

export function workspaceOutputToMarkdown(output: WorkspaceOutput) {
  const lines = [
    `# ${output.title}`,
    "",
    output.summary,
    "",
    ...output.sections.flatMap((section) => [
      `## ${section.heading}`,
      "",
      section.content,
      "",
    ]),
    "## Deliverables",
    "",
    ...output.deliverables.map((item) => `- ${item}`),
  ];

  return lines.join("\n");
}

export function downloadWorkspaceProject(
  project: WorkspaceProject,
  format: "markdown" | "json",
) {
  const filenameBase = project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const content =
    format === "json"
      ? JSON.stringify(project.output, null, 2)
      : workspaceOutputToMarkdown(project.output);

  const blob = new Blob([content], {
    type: format === "json" ? "application/json" : "text/markdown;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filenameBase}.${format === "json" ? "json" : "md"}`;
  link.click();
  URL.revokeObjectURL(url);
}

export function getWorkspaceApiEndpoint(workspaceType: WorkspaceType) {
  return `/api/workspaces/${workspaceType}`;
}

export async function copyWorkspaceSummary(project: WorkspaceProject) {
  const text = [
    project.title,
    "",
    project.output.summary,
    "",
    ...project.output.deliverables.map((item) => `- ${item}`),
  ].join("\n");

  await navigator.clipboard.writeText(text);
}
