"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Clock,
  FileText,
  Folder,
  FolderOpen,
  Plus,
  Search,
  Star,
  History,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ContentEditor } from "@/components/dashboard/content-studio/content-editor";
import { ContentTemplatesPanel } from "@/components/dashboard/content-studio/content-templates-panel";
import type { ContentDocument, ContentProject, ContentVersion } from "@/types/content";

type BrandOption = { id: string; brand_name: string };

type Props = {
  initialDocuments?: ContentDocument[];
  initialProjects?: ContentProject[];
};

export function ContentPlatformWorkspace({ initialDocuments = [], initialProjects = [] }: Props) {
  const [documents, setDocuments] = useState<ContentDocument[]>(initialDocuments);
  const [projects, setProjects] = useState<ContentProject[]>(initialProjects);
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "favorites" | "recent">("all");
  const [activeDoc, setActiveDoc] = useState<ContentDocument | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");
  const [brandId, setBrandId] = useState<string | null>(null);
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const refreshDocuments = useCallback(async () => {
    const params = new URLSearchParams({ limit: "50" });
    if (search.trim()) params.set("search", search.trim());
    if (filter === "favorites") params.set("favorite", "true");
    if (filter === "recent") params.set("recent", "true");
    if (selectedProjectId) params.set("projectId", selectedProjectId);

    const res = await fetch(`/api/content-studio/documents?${params}`);
    const data = await res.json();
    setDocuments(data.documents ?? []);
  }, [search, filter, selectedProjectId]);

  const refreshProjects = useCallback(async () => {
    const res = await fetch("/api/content-studio/projects");
    const data = await res.json();
    setProjects(data.projects ?? []);
  }, []);

  useEffect(() => {
    void refreshDocuments();
  }, [refreshDocuments]);

  useEffect(() => {
    void refreshProjects();
    void fetch("/api/content-studio/projects")
      .then(() => refreshProjects());
    void fetch("/api/brand-identity?limit=20")
      .then((r) => r.json())
      .then((d) => {
        const list = (d.generations ?? []).map((g: { id: string; brand_name: string }) => ({
          id: g.id,
          brand_name: g.brand_name,
        }));
        setBrands(list);
      })
      .catch(() => {});
  }, [refreshProjects]);

  const openDocument = async (doc: ContentDocument) => {
    setActiveDoc(doc);
    setTitle(doc.title);
    setBody(doc.body);
    setStatus(doc.status);
    setBrandId(doc.brand_identity_id);
    setShowTemplates(false);

    const res = await fetch(`/api/content-studio/versions?documentId=${doc.id}&limit=10`);
    const data = await res.json();
    setVersions(data.versions ?? []);
  };

  const createDocument = async (projectId?: string | null) => {
    const res = await fetch("/api/content-studio/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Untitled Document",
        body: "",
        projectId: projectId ?? selectedProjectId ?? undefined,
        status: "draft",
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Failed to create document");
      return;
    }
    await refreshDocuments();
    void openDocument(data.document);
  };

  const createFolder = async () => {
    const name = window.prompt("Folder name");
    if (!name?.trim()) return;
    const res = await fetch("/api/content-studio/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), isFolder: true, parentId: selectedProjectId }),
    });
    if (!res.ok) {
      toast.error("Failed to create folder");
      return;
    }
    await refreshProjects();
  };

  const createProject = async () => {
    const name = window.prompt("Project name");
    if (!name?.trim()) return;
    const res = await fetch("/api/content-studio/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), isFolder: false }),
    });
    if (!res.ok) {
      toast.error("Failed to create project");
      return;
    }
    await refreshProjects();
  };

  const autosave = async (payload: { title: string; body: string }) => {
    if (!activeDoc) return;
    await fetch(`/api/content-studio/documents/${activeDoc.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: payload.title,
        body: payload.body,
        autosave: true,
        brandIdentityId: brandId,
        status,
      }),
    });
  };

  const toggleFavorite = async (doc: ContentDocument) => {
    await fetch(`/api/content-studio/documents/${doc.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_favorite: !doc.is_favorite }),
    });
    await refreshDocuments();
  };

  const restoreVersion = async (versionId: string) => {
    if (!activeDoc) return;
    const res = await fetch("/api/content-studio/versions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "restore", documentId: activeDoc.id, versionId }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Restore failed");
      return;
    }
    void openDocument(data.document);
    toast.success("Version restored");
  };

  const folders = useMemo(
    () => projects.filter((p) => p.is_folder),
    [projects],
  );
  const projectList = useMemo(
    () => projects.filter((p) => !p.is_folder),
    [projects],
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <div className="flex gap-2">
          <Button size="sm" className="flex-1 rounded-lg" onClick={() => void createDocument()}>
            <Plus className="mr-1 size-4" /> New Doc
          </Button>
          <Button size="sm" variant="outline" className="rounded-lg border-white/10" onClick={() => void createProject()}>
            Project
          </Button>
          <Button size="sm" variant="outline" className="rounded-lg border-white/10" onClick={() => void createFolder()}>
            <Folder className="size-4" />
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents…"
            className="rounded-lg border-white/10 bg-white/5 pl-9 text-sm text-white"
          />
        </div>

        <div className="flex gap-1">
          {(["all", "favorites", "recent"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "flex-1 rounded-lg px-2 py-1.5 text-xs capitalize",
                filter === f ? "bg-premium-gold/15 text-premium-gold-light" : "text-white/40 hover:bg-white/5",
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/40">Projects</p>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setSelectedProjectId(null)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm",
                !selectedProjectId ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5",
              )}
            >
              <FolderOpen className="size-4" /> All Documents
            </button>
            {projectList.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedProjectId(p.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm",
                  selectedProjectId === p.id ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5",
                )}
              >
                <FileText className="size-4" style={{ color: p.color }} /> {p.name}
              </button>
            ))}
          </div>
        </div>

        {folders.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/40">Folders</p>
            <div className="space-y-1">
              {folders.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedProjectId(f.id)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-white/50 hover:bg-white/5"
                >
                  <Folder className="size-4" /> {f.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/40">Documents</p>
          <div className="max-h-[320px] space-y-1 overflow-y-auto">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className={cn(
                  "group flex items-center gap-1 rounded-lg px-2 py-1.5",
                  activeDoc?.id === doc.id ? "bg-premium-gold/10" : "hover:bg-white/5",
                )}
              >
                <button
                  type="button"
                  onClick={() => void openDocument(doc)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm text-white/70"
                >
                  <FileText className="size-4 shrink-0 text-white/40" />
                  <span className="truncate">{doc.title}</span>
                </button>
                <button
                  type="button"
                  onClick={() => void toggleFavorite(doc)}
                  className="opacity-0 group-hover:opacity-100"
                >
                  <Star className={cn("size-3.5", doc.is_favorite ? "fill-premium-gold text-premium-gold" : "text-white/30")} />
                </button>
              </div>
            ))}
            {documents.length === 0 && (
              <p className="px-2 py-4 text-center text-xs text-white/30">No documents yet</p>
            )}
          </div>
        </div>
      </aside>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={showTemplates ? "default" : "outline"}
            className="rounded-lg border-white/10"
            onClick={() => setShowTemplates((v) => !v)}
          >
            Templates
          </Button>
          {activeDoc && (
            <Button
              size="sm"
              variant={showHistory ? "default" : "outline"}
              className="rounded-lg border-white/10"
              onClick={() => setShowHistory((v) => !v)}
            >
              <History className="mr-1 size-4" /> History
            </Button>
          )}
          {brands.length > 0 && (
            <select
              value={brandId ?? ""}
              onChange={(e) => setBrandId(e.target.value || null)}
              className="h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white/70"
            >
              <option value="">No brand voice</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.brand_name}</option>
              ))}
            </select>
          )}
        </div>

        {showTemplates && (
          <ContentTemplatesPanel
            onSelect={async ({ prompt, contentTool, contentType }) => {
              if (!activeDoc) await createDocument();
              setBody(prompt);
              setShowTemplates(false);
              toast.success(`Template loaded — use AI Studio to generate (${contentTool}/${contentType})`);
            }}
          />
        )}

        {showHistory && activeDoc && (
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <p className="mb-3 text-sm font-medium text-white">Version History</p>
            <div className="space-y-2">
              {versions.map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-lg border border-white/[0.06] px-3 py-2">
                  <div>
                    <p className="text-sm text-white/80">v{v.version_number} — {v.change_summary}</p>
                    <p className="text-xs text-white/40">
                      <Clock className="mr-1 inline size-3" />
                      {new Date(v.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="rounded-lg border-white/10 text-xs" onClick={() => void restoreVersion(v.id)}>
                    Restore
                  </Button>
                </div>
              ))}
              {versions.length === 0 && <p className="text-sm text-white/40">No versions yet</p>}
            </div>
          </div>
        )}

        {activeDoc ? (
          <ContentEditor
            documentId={activeDoc.id}
            title={title}
            body={body}
            status={status}
            brandIdentityId={brandId}
            onTitleChange={setTitle}
            onBodyChange={setBody}
            onStatusChange={setStatus}
            onAutosave={autosave}
          />
        ) : (
          <div className="flex min-h-[480px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
            <FileText className="size-12 text-white/20" />
            <p className="mt-4 text-white/50">Select or create a document to start writing</p>
            <Button className="mt-4 rounded-xl" onClick={() => void createDocument()}>
              <Plus className="mr-2 size-4" /> New Document
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
