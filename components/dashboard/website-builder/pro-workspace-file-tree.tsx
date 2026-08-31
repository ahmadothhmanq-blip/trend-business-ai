"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, FileCode2, Folder } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { WorkspaceFileRef } from "@/lib/website/workspace/file-contracts";
import {
  buildFileTree,
  filterFileTree,
  type FileTreeNode,
} from "@/lib/website/workspace/file-tree";

type ProWorkspaceFileTreeProps = {
  files: WorkspaceFileRef[];
  selectedPath: string;
  onSelect: (path: string) => void;
};

function TreeNode({
  node,
  depth,
  selectedPath,
  onSelect,
  defaultOpen,
}: {
  node: FileTreeNode;
  depth: number;
  selectedPath: string;
  onSelect: (path: string) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? depth < 2);

  if (node.type === "file") {
    const active = selectedPath === node.path;
    return (
      <button
        type="button"
        onClick={() => onSelect(node.path)}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors",
          active
            ? "bg-cyan-400/15 text-cyan-200 ring-1 ring-cyan-400/25"
            : "text-white/60 hover:bg-white/5 hover:text-white/85",
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <FileCode2 className="size-3.5 shrink-0 opacity-70" />
        <span className="truncate">{node.name}</span>
        {node.language ? (
          <span className="ml-auto text-[10px] text-white/30">{node.language}</span>
        ) : null}
      </button>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-xs font-medium text-white/55 hover:bg-white/5 hover:text-white/80"
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
      >
        {open ? (
          <ChevronDown className="size-3.5 shrink-0" />
        ) : (
          <ChevronRight className="size-3.5 shrink-0" />
        )}
        <Folder className="size-3.5 shrink-0 text-premium-gold/70" />
        <span className="truncate">{node.name}</span>
      </button>
      {open
        ? (node.children ?? []).map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
            />
          ))
        : null}
    </div>
  );
}

export function ProWorkspaceFileTree({
  files,
  selectedPath,
  onSelect,
}: ProWorkspaceFileTreeProps) {
  const [search, setSearch] = useState("");
  const tree = useMemo(() => buildFileTree(files), [files]);
  const filtered = useMemo(
    () => filterFileTree(tree, search),
    [tree, search],
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search files…"
        className="mb-2 h-9 rounded-xl border-white/10 bg-black/30 text-xs text-white"
      />
      <div className="min-h-0 flex-1 space-y-0.5 overflow-auto">
        {filtered.map((node) => (
          <TreeNode
            key={node.path}
            node={node}
            depth={0}
            selectedPath={selectedPath}
            onSelect={onSelect}
            defaultOpen
          />
        ))}
      </div>
    </div>
  );
}
