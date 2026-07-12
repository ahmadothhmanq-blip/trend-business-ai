import type { WorkspaceOutput } from "@/lib/workspace/types";

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
