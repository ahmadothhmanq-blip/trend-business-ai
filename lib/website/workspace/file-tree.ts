import type { WorkspaceFileRef } from "@/lib/website/workspace/file-contracts";

export type FileTreeNode = {
  name: string;
  /** Folder path segment or full file path */
  path: string;
  type: "folder" | "file";
  children?: FileTreeNode[];
  language?: string;
};

export function buildFileTree(files: readonly WorkspaceFileRef[]): FileTreeNode[] {
  const root: FileTreeNode[] = [];
  const sorted = [...files].sort((a, b) => a.path.localeCompare(b.path));

  for (const file of sorted) {
    const parts = file.path.split("/").filter(Boolean);
    let level = root;
    let currentPath = "";

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]!;
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isFile = i === parts.length - 1;

      if (isFile) {
        level.push({
          name: part,
          path: file.path,
          type: "file",
          language: file.language,
        });
        continue;
      }

      let folder = level.find((n) => n.type === "folder" && n.name === part);
      if (!folder) {
        folder = { name: part, path: currentPath, type: "folder", children: [] };
        level.push(folder);
      }
      level = folder.children!;
    }
  }

  return root;
}

export function filterFileTree(
  nodes: FileTreeNode[],
  query: string,
): FileTreeNode[] {
  const q = query.trim().toLowerCase();
  if (!q) return nodes;

  const walk = (list: FileTreeNode[]): FileTreeNode[] =>
    list
      .map((node) => {
        if (node.type === "file") {
          return node.path.toLowerCase().includes(q) ? node : null;
        }
        const children = walk(node.children ?? []);
        if (children.length || node.name.toLowerCase().includes(q)) {
          return { ...node, children };
        }
        return null;
      })
      .filter((n): n is FileTreeNode => n !== null);

  return walk(nodes);
}
