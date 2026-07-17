"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Code2, Copy, Download, FolderTree, RefreshCw, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-card";
import { cn } from "@/lib/utils";

type FileEntry = { path: string; content: string; language?: string };

export function ProjectFilePreview({
  title,
  subtitle,
  files,
  downloadName,
  onBack,
  onRegenerate,
  onContinue,
}: {
  title: string;
  subtitle: string;
  files: FileEntry[];
  downloadName: string;
  onBack: () => void;
  onRegenerate?: () => void;
  /** Natural-language AI edit (D-016). */
  onContinue?: () => void;
}) {
  const [activeFile, setActiveFile] = useState(0);

  const grouped = useMemo(() => {
    const g: Record<string, FileEntry[]> = {};
    for (const f of files) {
      const folder = f.path.split("/").slice(0, -1).join("/") || ".";
      if (!g[folder]) g[folder] = [];
      g[folder].push(f);
    }
    return Object.entries(g).sort(([a], [b]) => a.localeCompare(b));
  }, [files]);

  if (files.length === 0) {
    return (
      <DashboardPanel className="py-16 text-center">
        <Sparkles className="mx-auto size-10 text-white/20" />
        <p className="mt-4 text-white/50">No generated files to preview</p>
        <Button variant="outline" className="mt-4 rounded-xl border-white/10 text-white/60" onClick={onBack}>
          Back
        </Button>
      </DashboardPanel>
    );
  }

  const currentFile = files[activeFile];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-xs" onClick={onBack} className="text-white/40 hover:text-white">
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h3 className="font-bold text-white">{title}</h3>
          <p className="text-xs text-white/40">{subtitle}</p>
        </div>
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          {onRegenerate ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-lg border-white/10 text-xs text-white/60 hover:border-white/20"
              onClick={onRegenerate}
            >
              <RefreshCw className="size-3" />
              Regenerate
            </Button>
          ) : null}
          {onContinue ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-lg border-premium-gold/20 text-xs text-premium-gold-light hover:border-premium-gold/40"
              onClick={onContinue}
            >
              <Wand2 className="size-3" />
              Improve with AI
            </Button>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-lg border-white/10 text-xs text-white/60 hover:border-premium-gold/25 hover:text-premium-gold-light"
            onClick={async () => {
              const JSZip = (await import("jszip")).default; const zip = new JSZip();
              for (const f of files) zip.file(f.path, f.content);
              const blob = await zip.generateAsync({ type: "blob" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${downloadName.replace(/\s+/g, "-").toLowerCase()}.zip`;
              a.click();
              URL.revokeObjectURL(url);
              toast.success("Project downloaded");
            }}
          >
            <Download className="size-3" />
            Download ZIP
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <DashboardPanel className="max-h-[600px] overflow-y-auto">
          <div className="mb-2 flex items-center gap-2 px-1 text-xs font-semibold text-white/50">
            <FolderTree className="size-3.5" />
            File Tree
          </div>
          {grouped.map(([folder, folderFiles]) => (
            <div key={folder} className="mb-2">
              <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-white/30">{folder}</p>
              {folderFiles.map((file) => {
                const idx = files.indexOf(file);
                return (
                  <button
                    key={file.path}
                    onClick={() => setActiveFile(idx)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                      idx === activeFile
                        ? "bg-premium-gold/10 text-premium-gold-light"
                        : "text-white/50 hover:bg-white/5 hover:text-white/70",
                    )}
                  >
                    <Code2 className="size-3 shrink-0" />
                    <span className="truncate">{file.path.split("/").pop()}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </DashboardPanel>

        <DashboardPanel className="max-h-[600px] overflow-auto">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-white/60">{currentFile?.path}</p>
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-white/30 hover:text-white"
              onClick={() => {
                if (currentFile) {
                  navigator.clipboard.writeText(currentFile.content);
                  toast.success("Copied to clipboard");
                }
              }}
            >
              <Copy className="size-3" />
            </Button>
          </div>
          <pre className="overflow-x-auto rounded-lg bg-black/30 p-4 text-[11px] leading-relaxed text-white/70">
            <code>{currentFile?.content ?? ""}</code>
          </pre>
        </DashboardPanel>
      </div>
    </div>
  );
}
