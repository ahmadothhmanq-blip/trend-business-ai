"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dashboardInputClass } from "@/components/dashboard/ui/dashboard-styles";

type KB = { id: string; name: string; document_count: number; indexing_status: string };

export function KnowledgeManager() {
  const [bases, setBases] = useState<KB[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [name, setName] = useState("");
  const [docTitle, setDocTitle] = useState("");
  const [docContent, setDocContent] = useState("");

  const load = () => void fetch("/api/ai-agents/knowledge").then((r) => r.json()).then((d) => {
    setBases(d.knowledgeBases ?? []);
    if (!selectedId && d.knowledgeBases?.[0]) setSelectedId(d.knowledgeBases[0].id);
  }).catch(() => undefined);

  useEffect(() => { load(); }, []);

  const createKb = async () => {
    if (!name.trim()) return;
    const res = await fetch("/api/ai-agents/knowledge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    if (!res.ok) return toast.error("Failed");
    setName(""); load(); toast.success("Knowledge base created");
  };

  const addDoc = async () => {
    if (!selectedId || !docTitle.trim() || !docContent.trim()) return toast.error("Fill all fields");
    const res = await fetch("/api/ai-agents/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ knowledgeBaseId: selectedId, title: docTitle, content: docContent }),
    });
    if (!res.ok) return toast.error("Failed");
    setDocTitle(""); setDocContent(""); load(); toast.success("Document added");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New knowledge base" className={dashboardInputClass} />
        <Button onClick={() => void createKb()}>Create KB</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {bases.map((b) => (
          <button key={b.id} type="button" onClick={() => setSelectedId(b.id)}
            className={`rounded-lg border p-3 text-left ${selectedId === b.id ? "border-premium-gold/40 bg-premium-gold/5" : "border-white/5"}`}>
            <p className="text-sm font-medium text-white">{b.name}</p>
            <p className="text-xs text-white/40">{b.document_count} docs · {b.indexing_status}</p>
          </button>
        ))}
      </div>
      {selectedId ? (
        <div className="space-y-2 rounded-xl border border-white/[0.08] p-4">
          <p className="text-xs uppercase text-white/40">Add document (embeddings-ready)</p>
          <Input value={docTitle} onChange={(e) => setDocTitle(e.target.value)} placeholder="Title" className={dashboardInputClass} />
          <textarea value={docContent} onChange={(e) => setDocContent(e.target.value)} rows={4} placeholder="Content" className={dashboardInputClass} />
          <Button onClick={() => void addDoc()}>Add Document</Button>
        </div>
      ) : null}
    </div>
  );
}
