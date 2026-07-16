import type { WorkspaceProject } from "@/lib/workspace/project";
import type { WorkspaceType } from "@/lib/workspace/types";
import { workspaceOutputToMarkdown } from "@/lib/workspace/markdown";

export { workspaceOutputToMarkdown } from "@/lib/workspace/markdown";

function filenameBase(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "export";
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export type WorkspaceExportFormat = "markdown" | "json" | "pdf" | "docx";

export function downloadWorkspaceProject(
  project: WorkspaceProject,
  format: WorkspaceExportFormat,
) {
  const base = filenameBase(project.title);

  if (format === "json") {
    const blob = new Blob([JSON.stringify(project.output, null, 2)], {
      type: "application/json",
    });
    triggerDownload(blob, `${base}.json`);
    return;
  }

  if (format === "markdown") {
    const blob = new Blob([workspaceOutputToMarkdown(project.output)], {
      type: "text/markdown;charset=utf-8",
    });
    triggerDownload(blob, `${base}.md`);
    return;
  }

  if (format === "pdf") {
    void downloadWorkspacePdf(project);
    return;
  }

  void downloadWorkspaceDocx(project);
}

export async function downloadWorkspacePdf(project: WorkspaceProject) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
  let y = margin;

  const writeBlock = (text: string, fontSize: number, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, pageWidth);
    for (const line of lines) {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += fontSize + 4;
    }
  };

  writeBlock(project.output.title, 16, true);
  y += 6;
  writeBlock(project.output.summary, 11);
  y += 10;

  for (const section of project.output.sections) {
    writeBlock(section.heading, 13, true);
    writeBlock(section.content, 11);
    y += 8;
  }

  if (project.output.deliverables.length) {
    writeBlock("Deliverables", 13, true);
    for (const item of project.output.deliverables) {
      writeBlock(`• ${item}`, 11);
    }
  }

  const meta: string[] = [];
  if (project.output.tokenUsage?.totalTokens) {
    meta.push(`Tokens: ${project.output.tokenUsage.totalTokens}`);
  }
  if (project.output.generationTimeMs) {
    meta.push(`Time: ${(project.output.generationTimeMs / 1000).toFixed(1)}s`);
  }
  if (meta.length) {
    y += 8;
    writeBlock(meta.join(" · "), 9);
  }

  doc.save(`${filenameBase(project.title)}.pdf`);
}

async function buildDocxBlob(markdown: string, title: string) {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  const escapeXml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const paragraphs = markdown
    .split(/\n+/)
    .filter(Boolean)
    .map((line) => {
      const isHeading = line.startsWith("#");
      const text = line.replace(/^#+\s*/, "");
      return `
        <w:p>
          <w:pPr>${isHeading ? "<w:pStyle w:val=\"Heading1\"/>" : ""}</w:pPr>
          <w:r>
            <w:rPr>${isHeading ? "<w:b/>" : ""}</w:rPr>
            <w:t xml:space="preserve">${escapeXml(text)}</w:t>
          </w:r>
        </w:p>`;
    })
    .join("");

  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`,
  );

  zip.folder("_rels")?.file(
    ".rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
  );

  zip.folder("word")?.file(
    "document.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:rPr><w:b/></w:rPr><w:t>${escapeXml(title)}</w:t></w:r>
    </w:p>
    ${paragraphs}
  </w:body>
</w:document>`,
  );

  return zip.generateAsync({ type: "blob" });
}

export async function downloadWorkspaceDocx(project: WorkspaceProject) {
  const markdown = workspaceOutputToMarkdown(project.output);
  const blob = await buildDocxBlob(markdown, project.output.title);
  triggerDownload(blob, `${filenameBase(project.title)}.docx`);
}

export function getWorkspaceApiEndpoint(workspaceType: WorkspaceType) {
  return `/api/workspaces/${workspaceType}`;
}

export function getWorkspaceStreamEndpoint(workspaceType: WorkspaceType) {
  return `/api/workspaces/${workspaceType}/stream`;
}

export async function copyWorkspaceSummary(project: WorkspaceProject) {
  const text = [
    project.title,
    "",
    project.output.summary,
    "",
    ...project.output.sections.flatMap((section) => [
      section.heading,
      section.content,
      "",
    ]),
    ...project.output.deliverables.map((item) => `- ${item}`),
  ].join("\n");

  await navigator.clipboard.writeText(text);
}

export { formatGenerationMeta } from "@/lib/workspace/export-meta";
